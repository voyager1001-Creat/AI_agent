"""
聊天服务
提供聊天相关的业务逻辑
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import logging

from models.conversation import Conversation, Message
from models.user import User
from database.database_model import get_db, db
from utils.logger_config import service_logger
from utils.text_utils import TextUtils
from utils.date_utils import DateUtils


# 日志记录器
logger = logging.getLogger(__name__)

class ChatService:
    """聊天服务类"""
    
    def __init__(self):
        self.text_utils = TextUtils()
    
    def generate_conversation_title(self, first_message: str) -> str:
        """根据第一条消息生成对话标题"""
        if not first_message or not first_message.strip():
            return "新对话"
        
        # 取前20个字符作为标题
        title = first_message.strip()[:20]
        if len(first_message.strip()) > 20:
            title += "..."
        
        return title
    
    async def create_conversation(
        self,
        user_id: int,
        system_prompt: Optional[str] = None
    ) -> Conversation:
        """创建新对话"""
        with db.get_session() as session:
            try:
                conversation = Conversation(
                    user_id=user_id,
                    system_prompt=system_prompt,
                    created_at=DateUtils.now(),
                    updated_at=DateUtils.now()
                )

                session.add(conversation)
                session.commit()
                session.refresh(conversation)
                
                # 在会话关闭前获取ID
                conversation_id = conversation.id
                service_logger.info(f"创建对话成功: {conversation_id}")
                
                # 分离对象，使其可以在会话外使用
                session.expunge(conversation)
                return conversation
            except Exception as e:
                session.rollback()
                service_logger.error(f"创建对话失败: {e}", exc_info=True)
                raise
        
    async def get_conversation(
        self,
        conversation_id: int,
        user_id: int
    ) -> Optional[Conversation]:
        with db.get_session() as session:
            try:
                conversation = session.query(Conversation).filter(
                    Conversation.id == conversation_id,
                    Conversation.user_id == user_id
                ).first()
                
                if conversation:
                    # 在会话关闭前分离对象，使其可以在会话外使用
                    session.expunge(conversation)
                
                return conversation
                
            except Exception as e:
                service_logger.error(f"获取对话失败: {e}", exc_info=True)
                raise
    
    async def list_conversations(
        self,
        user_id: int,
        limit: int = 20,
        offset: int = 0,
        order_by: str = 'updated_at',
        order: str = 'desc'
    ) -> List[Conversation]:
        """获取用户对话列表"""
        with db.get_session() as session:
            try:
                query = session.query(Conversation).filter(Conversation.user_id == user_id)
                
                # 排序
                if order_by == 'updated_at':
                    if order == 'desc':
                        query = query.order_by(Conversation.updated_at.desc())
                    else:
                        query = query.order_by(Conversation.updated_at.asc())
                elif order_by == 'created_at':
                    if order == 'desc':
                        query = query.order_by(Conversation.created_at.desc())
                    else:
                        query = query.order_by(Conversation.created_at.asc())
                
                # 分页
                conversations = query.offset(offset).limit(limit).all()
                
                # 在会话关闭前分离所有对象，使其可以在会话外使用
                for conv in conversations:
                    session.expunge(conv)
                
                return conversations
            except Exception as e:
                service_logger.error(f"获取对话列表失败: {e}", exc_info=True)
                raise
        
    async def update_conversation(
        self,
        conversation_id: int,
        user_id: int,
        **kwargs
    ) -> Optional[Conversation]:
        """更新对话"""
        try:
            db = get_db()
            
            conversation = await self.get_conversation(conversation_id, user_id)
            if not conversation:
                return None
            
            # 更新字段
            for key, value in kwargs.items():
                if hasattr(conversation, key):
                    setattr(conversation, key, value)
            
            conversation.updated_at = DateUtils.now()
            
            db.commit()
            db.refresh(conversation)
            
            logger.info(f"更新对话成功: {conversation_id}")
            return conversation
            
        except Exception as e:
            logger.error(f"更新对话失败: {e}")
            raise
        
    async def load_conversation_history(self, conversation_id: int, user_id: int) -> List[Message]:
        """加载对话历史消息"""
        try:
            db = get_db()
            messages = db.query(Message).filter(Message.conversation_id == conversation_id).all()
            return messages
        except Exception as e:
            logger.error(f"加载对话历史消息失败: {e}")
            raise

    async def delete_conversation(self, conversation_id: int, user_id: int) -> bool:
        """删除对话"""
        try:
            db = get_db()
            
            conversation = await self.get_conversation(conversation_id, user_id)
            if not conversation:
                return False
            
            # 删除相关消息
            db.query(Message).filter(Message.conversation_id == conversation_id).delete()
            
            # 删除对话
            db.delete(conversation)
            db.commit()
            
            logger.info(f"删除对话成功: {conversation_id}")
            return True
            
        except Exception as e:
            logger.error(f"删除对话失败: {e}")
            raise

    async def add_message(
        self,
        conversation_id: int,
        user_id: int,
        content: str,
        role: str = 'user',
        message_metadata: Optional[Dict[str, Any]] = None
    ) -> Message:
        """添加消息"""
        with db.get_session() as session:
            try:
                # 验证对话存在且属于用户
                conversation = session.query(Conversation).filter(
                    Conversation.id == conversation_id,
                    Conversation.user_id == user_id
                ).first()
                
                if not conversation:
                    raise ValueError("对话不存在或无权限访问")
                
                # 创建消息
                message = Message(
                    conversation_id=conversation_id,
                    role=role,
                    content=content,
                    message_metadata=message_metadata,  # 直接存储字典，SQLAlchemy会自动处理JSON转换
                    created_at=DateUtils.now()
                )
                
                session.add(message)
                
                # 更新对话的更新时间
                conversation.updated_at = DateUtils.now()
                
                session.commit()
                session.refresh(message)
                
                # 在会话关闭前获取ID
                message_id = message.id
                logger.info(f"添加消息成功: {message_id}")
                
                # 分离对象，使其可以在会话外使用
                session.expunge(message)
                return message
                
            except Exception as e:
                session.rollback()
                logger.error(f"添加消息失败: {e}")
                raise

    async def get_messages(
        self,
        conversation_id: int,
        user_id: int,
        limit: int = 50,
        offset: int = 0
    ) -> List[Message]:
        """获取对话消息"""
        with db.get_session() as session:
            try:
                # 验证对话存在且属于用户
                conversation = session.query(Conversation).filter(
                    Conversation.id == conversation_id,
                    Conversation.user_id == user_id
                ).first()
                if not conversation:
                    return []
                
                messages = session.query(Message).filter(
                    Message.conversation_id == conversation_id
                ).order_by(Message.created_at.asc()).offset(offset).limit(limit).all()
                
                # 在会话关闭前分离所有对象，使其可以在会话外使用
                for message in messages:
                    session.expunge(message)
                
                return messages
                
            except Exception as e:
                logger.error(f"获取消息失败: {e}")
                raise

    async def search_conversations(
        self,
        user_id: int,
        query: str,
        limit: int = 20,
        offset: int = 0
    ) -> List[Conversation]:
        """搜索对话"""
        with db.get_session() as session:
            try:
                # 搜索标题和消息内容
                conversations = session.query(Conversation).join(Message).filter(
                    Conversation.user_id == user_id,
                    (Message.content.contains(query))
                ).distinct().order_by(Conversation.updated_at.desc()).offset(offset).limit(limit).all()
                
                # 在会话关闭前分离所有对象，使其可以在会话外使用
                for conv in conversations:
                    session.expunge(conv)
                
                return conversations
                
            except Exception as e:
                logger.error(f"搜索对话失败: {e}")
                raise

    async def get_conversation_stats(self, user_id: int) -> Dict[str, Any]:
        """获取对话统计信息"""
        with db.get_session() as session:
            try:
                # 总对话数
                total_conversations = session.query(Conversation).filter(
                    Conversation.user_id == user_id
                ).count()
                
                # 总消息数
                total_messages = session.query(Message).join(Conversation).filter(
                    Conversation.user_id == user_id
                ).count()
                
                # 今日对话数
                today = DateUtils.today()
                today_conversations = session.query(Conversation).filter(
                    Conversation.user_id == user_id,
                    Conversation.created_at >= today
                ).count()
                
                # 今日消息数
                today_messages = session.query(Message).join(Conversation).filter(
                    Conversation.user_id == user_id,
                    Message.created_at >= today
                ).count()
                
                # 平均消息长度
                avg_message_length = session.query(session.func.avg(session.func.length(Message.content))).join(Conversation).filter(
                    Conversation.user_id == user_id
                ).scalar() or 0
                
                return {
                    'total_conversations': total_conversations,
                    'total_messages': total_messages,
                    'today_conversations': today_conversations,
                    'today_messages': today_messages,
                    'avg_message_length': round(avg_message_length, 2)
                }
                
            except Exception as e:
                logger.error(f"获取对话统计失败: {e}")
                raise

    async def export_conversation(
        self,
        conversation_id: int,
        user_id: int,
        format: str = 'json'
    ) -> str:
        """导出对话"""
        try:
            conversation = await self.get_conversation(conversation_id, user_id)
            if not conversation:
                raise ValueError("对话不存在或无权限访问")
            
            messages = await self.get_messages(conversation_id, user_id, limit=1000)
            
            if format == 'json':
                data = {
                    'conversation': {
                        'id': conversation.id,
                        'title': conversation.title,
                        'system_prompt': conversation.system_prompt,
                        'created_at': conversation.created_at.isoformat(),
                        'updated_at': conversation.updated_at.isoformat()
                    },
                    'messages': [
                        {
                            'role': msg.role,
                            'content': msg.content,
                            'created_at': msg.created_at.isoformat(),
                            'metadata': msg.message_metadata if msg.message_metadata else None
                        }
                        for msg in messages
                    ]
                }
                return json.dumps(data, ensure_ascii=False, indent=2)
            
            elif format == 'txt':
                lines = [f"对话: {conversation.title}"]
                lines.append(f"创建时间: {conversation.created_at}")
                lines.append(f"更新时间: {conversation.updated_at}")
                if conversation.system_prompt:
                    lines.append(f"系统提示: {conversation.system_prompt}")
                lines.append("")
                lines.append("消息记录:")
                lines.append("=" * 50)
                
                for msg in messages:
                    lines.append(f"[{msg.created_at.strftime('%Y-%m-%d %H:%M:%S')}] {msg.role}:")
                    lines.append(msg.content)
                    lines.append("")
                
                return "\n".join(lines)
            
            else:
                raise ValueError(f"不支持的导出格式: {format}")
                
        except Exception as e:
            logger.error(f"导出对话失败: {e}")
            raise


# 创建服务实例
chat_service = ChatService()