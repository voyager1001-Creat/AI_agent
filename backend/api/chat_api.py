"""
聊天API路由
提供聊天对话相关的API端点
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from core.agent import AIAgent
from core.services.chat_service import chat_service
from utils.logger_config import api_logger

router = APIRouter(prefix="/api/chat", tags=["聊天对话"])

# 请求/响应模型
class ChatMessage(BaseModel):
    """聊天消息模型"""
    content: str
    role: str = "user"  # user 或 assistant
    conversation_id: Optional[int] = None

class ChatRequest(BaseModel):
    """聊天请求模型"""
    message: str
    user_id: int = 1
    conversation_id: Optional[int] = None
    system_prompt: Optional[str] = None

class ChatResponse(BaseModel):
    """聊天响应模型"""
    success: bool
    message: str
    conversation_id: Optional[int] = None
    message_id: Optional[int] = None
    timestamp: str
    error: Optional[str] = None

class ConversationResponse(BaseModel):
    """对话响应模型"""
    id: int
    title: str
    user_id: int
    system_prompt: Optional[str]
    created_at: str
    updated_at: str
    message_count: int = 0

class MessageResponse(BaseModel):
    """消息响应模型"""
    id: int
    conversation_id: int
    role: str
    content: str
    created_at: str
    metadata: Optional[Dict[str, Any]] = None

@router.post("/send", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """
    发送聊天消息并获取AI回复
    
    Args:
        request: 聊天请求，包含消息内容和用户信息
        
    Returns:
        包含AI回复的响应
    """
    try:
        api_logger.info(f"收到聊天请求: 用户{request.user_id}, 消息: {request.message[:50]}...")
        
        # 如果没有指定对话ID，创建新对话
        if not request.conversation_id:
            conversation = await chat_service.create_conversation(
                user_id=request.user_id,
                system_prompt=request.system_prompt
            )
            conversation_id = conversation.id
            api_logger.info(f"创建新对话: {conversation_id}")
        else:
            conversation_id = request.conversation_id
            # 验证对话是否存在且属于用户
            conversation = await chat_service.get_conversation(conversation_id, request.user_id)
            if not conversation:
                raise HTTPException(status_code=404, detail="对话不存在或无权限访问")
        
        # 创建AI智能体
        agent = AIAgent(user_id=request.user_id)
        
        # 保存用户消息
        user_message = await chat_service.add_message(
            conversation_id=conversation_id,
            user_id=request.user_id,
            content=request.message,
            role="user"
        )
        
        # 如果是新对话且没有标题，根据第一条消息生成标题
        if not request.conversation_id:
            try:
                conversation = await chat_service.get_conversation(conversation_id, request.user_id)
                if conversation and not conversation.title:
                    title = chat_service.generate_conversation_title(request.message)
                    await chat_service.update_conversation(
                        conversation_id=conversation_id,
                        user_id=request.user_id,
                        title=title
                    )
            except Exception as e:
                api_logger.warning(f"更新对话标题失败: {e}")
                # 不影响主要流程，继续执行
        
        # 获取AI回复
        ai_response = agent.chat(request.message)
        
        # 保存AI回复
        assistant_message = await chat_service.add_message(
            conversation_id=conversation_id,
            user_id=request.user_id,
            content=ai_response,
            role="assistant"
        )
        
        api_logger.info(f"聊天完成: 对话{conversation_id}, 消息{assistant_message.id}")
        
        return ChatResponse(
            success=True,
            message=ai_response,
            conversation_id=conversation_id,
            message_id=assistant_message.id,
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        api_logger.error(f"聊天处理失败: {e}", exc_info=True)
        return ChatResponse(
            success=False,
            message="抱歉，处理您的消息时出现错误。",
            timestamp=datetime.now().isoformat(),
            error=str(e)
        )

@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    user_id: int = 1,
    limit: int = 20,
    offset: int = 0
):
    """
    获取用户的对话列表
    
    Args:
        user_id: 用户ID
        limit: 限制数量
        offset: 偏移量
        
    Returns:
        对话列表
    """
    try:
        conversations = await chat_service.list_conversations(
            user_id=user_id,
            limit=limit,
            offset=offset
        )
        
        result = []
        for conv in conversations:
            # 在会话关闭前提取所有需要的属性
            conv_id = conv.id
            conv_title = conv.title
            conv_user_id = conv.user_id
            conv_system_prompt = conv.system_prompt
            conv_created_at = conv.created_at
            conv_updated_at = conv.updated_at
            
            # 获取消息数量
            messages = await chat_service.get_messages(conv_id, user_id, limit=1000)
            
            result.append(ConversationResponse(
                id=conv_id,
                title=conv_title or f"对话 {conv_id}",
                user_id=conv_user_id,
                system_prompt=conv_system_prompt,
                created_at=conv_created_at.isoformat(),
                updated_at=conv_updated_at.isoformat(),
                message_count=len(messages)
            ))
        
        api_logger.info(f"获取对话列表成功: 用户{user_id}, 共{len(result)}个对话")
        return result
        
    except Exception as e:
        api_logger.error(f"获取对话列表失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"获取对话列表失败: {str(e)}")

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_conversation_messages(
    conversation_id: int,
    user_id: int = 1,
    limit: int = 50,
    offset: int = 0
):
    """
    获取对话的消息列表
    
    Args:
        conversation_id: 对话ID
        user_id: 用户ID
        limit: 限制数量
        offset: 偏移量
        
    Returns:
        消息列表
    """
    try:
        # 验证对话权限
        conversation = await chat_service.get_conversation(conversation_id, user_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="对话不存在或无权限访问")
        
        messages = await chat_service.get_messages(
            conversation_id=conversation_id,
            user_id=user_id,
            limit=limit,
            offset=offset
        )
        
        result = []
        for msg in messages:
            result.append(MessageResponse(
                id=msg.id,
                conversation_id=msg.conversation_id,
                role=msg.role,
                content=msg.content,
                created_at=msg.created_at.isoformat(),
                metadata=msg.message_metadata
            ))
        
        api_logger.info(f"获取消息列表成功: 对话{conversation_id}, 共{len(result)}条消息")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        api_logger.error(f"获取消息列表失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"获取消息列表失败: {str(e)}")

@router.get("/history")
async def get_chat_history(
    user_id: int = 1,
    limit: int = 50,
    conversation_id: Optional[int] = None
):
    """
    获取聊天历史消息
    
    Args:
        user_id: 用户ID
        limit: 限制数量
        conversation_id: 对话ID（可选）
        
    Returns:
        消息列表
    """
    try:
        if conversation_id:
            # 获取特定对话的消息
            conversation = await chat_service.get_conversation(conversation_id, user_id)
            if not conversation:
                raise HTTPException(status_code=404, detail="对话不存在或无权限访问")
            
            messages = await chat_service.get_messages(
                conversation_id=conversation_id,
                user_id=user_id,
                limit=limit
            )
        else:
            # 获取用户的所有消息（按时间排序）
            conversations = await chat_service.list_conversations(user_id=user_id, limit=100)
            all_messages = []
            
            for conv in conversations:
                conv_messages = await chat_service.get_messages(
                    conversation_id=conv.id,
                    user_id=user_id,
                    limit=limit
                )
                all_messages.extend(conv_messages)
            
            # 按时间排序并限制数量
            all_messages.sort(key=lambda x: x.created_at, reverse=True)
            messages = all_messages[:limit]
        
        result = []
        for msg in messages:
            result.append(MessageResponse(
                id=msg.id,
                conversation_id=msg.conversation_id,
                role=msg.role,
                content=msg.content,
                created_at=msg.created_at.isoformat(),
                metadata=msg.message_metadata
            ))
        
        api_logger.info(f"获取聊天历史成功: 用户{user_id}, 共{len(result)}条消息")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        api_logger.error(f"获取聊天历史失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"获取聊天历史失败: {str(e)}")

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: int, user_id: int = 1):
    """
    删除对话
    
    Args:
        conversation_id: 对话ID
        user_id: 用户ID
        
    Returns:
        删除结果
    """
    try:
        success = await chat_service.delete_conversation(conversation_id, user_id)
        
        if success:
            api_logger.info(f"删除对话成功: {conversation_id}")
            return {"success": True, "message": "对话删除成功"}
        else:
            raise HTTPException(status_code=404, detail="对话不存在或无权限访问")
            
    except HTTPException:
        raise
    except Exception as e:
        api_logger.error(f"删除对话失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"删除对话失败: {str(e)}")

@router.get("/stats")
async def get_chat_stats(user_id: int = 1):
    """
    获取聊天统计信息
    
    Args:
        user_id: 用户ID
        
    Returns:
        统计信息
    """
    try:
        stats = await chat_service.get_conversation_stats(user_id)
        api_logger.info(f"获取统计信息成功: 用户{user_id}")
        return {
            "success": True,
            "stats": stats,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        api_logger.error(f"获取统计信息失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"获取统计信息失败: {str(e)}")

@router.post("/conversations/{conversation_id}/export")
async def export_conversation(
    conversation_id: int,
    user_id: int = 1,
    format: str = "json"
):
    """
    导出对话
    
    Args:
        conversation_id: 对话ID
        user_id: 用户ID
        format: 导出格式 (json/txt)
        
    Returns:
        导出的对话内容
    """
    try:
        exported_content = await chat_service.export_conversation(
            conversation_id=conversation_id,
            user_id=user_id,
            format=format
        )
        
        api_logger.info(f"导出对话成功: {conversation_id}, 格式: {format}")
        return {
            "success": True,
            "content": exported_content,
            "format": format,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        api_logger.error(f"导出对话失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"导出对话失败: {str(e)}")
