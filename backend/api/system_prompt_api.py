"""
系统提示词API路由
提供系统提示词相关的API端点
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from core.services.system_prompt_service import system_prompt_service
from models.system_prompt import SystemPrompt
from utils.logger_config import api_logger

router = APIRouter(prefix="/api/system-prompt", tags=["系统提示词"])

# 请求/响应模型
class SystemPromptRequest(BaseModel):
    """系统提示词请求模型"""
    name: str
    system_prompt: str
    is_active: bool = False

class SystemPromptResponse(BaseModel):
    """系统提示词响应模型"""
    id: int
    name: str
    system_prompt: str
    is_active: bool
    created_at: str
    updated_at: str

class SystemPromptConfigResponse(BaseModel):
    """系统提示词配置响应模型"""
    system_prompt: SystemPromptResponse

@router.get("/active")
async def get_active_prompt():
    """
    获取当前激活的系统提示词
    
    Returns:
        当前激活的系统提示词配置
    """
    try:
        api_logger.info("获取激活的系统提示词")
        
        # 获取激活的系统提示词
        active_prompt = system_prompt_service.get_active_system_prompt(user_id=1)
        
        if not active_prompt:
            # 如果没有激活的系统提示词，返回默认配置
            return {
                "system_prompt": {
                    "id": 0,
                    "name": "默认提示词",
                    "system_prompt": "你是一个有用的AI助手。",
                    "is_active": False,
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                }
            }
        
        return {
            "system_prompt": {
                "id": active_prompt.id,
                "name": active_prompt.name,
                "system_prompt": active_prompt.content,
                "is_active": active_prompt.is_active,
                "created_at": active_prompt.created_at.isoformat() if active_prompt.created_at else datetime.now().isoformat(),
                "updated_at": active_prompt.updated_at.isoformat() if active_prompt.updated_at else datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        api_logger.error(f"获取激活的系统提示词失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"获取激活的系统提示词失败: {str(e)}")

@router.get("/", response_model=List[SystemPromptResponse])
async def get_system_prompts(user_id: int = 1):
    """
    获取所有系统提示词
    
    Args:
        user_id: 用户ID
        
    Returns:
        系统提示词列表
    """
    try:
        api_logger.info(f"获取用户{user_id}的系统提示词列表")
        
        # 获取所有系统提示词
        prompts = system_prompt_service.get_all_system_prompts(user_id=user_id)
        
        result = []
        for prompt in prompts:
            result.append(SystemPromptResponse(
                id=prompt.id,
                name=prompt.name,
                system_prompt=prompt.content,
                is_active=prompt.is_active,
                created_at=prompt.created_at.isoformat() if prompt.created_at else datetime.now().isoformat(),
                updated_at=prompt.updated_at.isoformat() if prompt.updated_at else datetime.now().isoformat()
            ))
        
        api_logger.info(f"获取系统提示词列表成功: 用户{user_id}, 共{len(result)}个提示词")
        return result
        
    except Exception as e:
        api_logger.error(f"获取系统提示词列表失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"获取系统提示词列表失败: {str(e)}")

@router.post("/")
async def create_system_prompt(request: SystemPromptRequest):
    """
    创建新的系统提示词
    
    Args:
        request: 系统提示词请求
        
    Returns:
        创建的系统提示词
    """
    try:
        api_logger.info(f"创建系统提示词: {request.name}")
        
        # 创建系统提示词
        system_prompt = system_prompt_service.create_system_prompt(
            user_id=1,
            system_prompt=request.system_prompt,
            name=request.name
        )
        
        if not system_prompt:
            raise HTTPException(status_code=500, detail="创建系统提示词失败")
        
        return {
            "system_prompt": {
                "id": system_prompt.id,
                "name": system_prompt.name,
                "system_prompt": system_prompt.content,
                "is_active": system_prompt.is_active,
                "created_at": system_prompt.created_at.isoformat() if system_prompt.created_at else datetime.now().isoformat(),
                "updated_at": system_prompt.updated_at.isoformat() if system_prompt.updated_at else datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        api_logger.error(f"创建系统提示词失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"创建系统提示词失败: {str(e)}")

@router.put("/{prompt_id}")
async def update_system_prompt(prompt_id: int, request: SystemPromptRequest):
    """
    更新系统提示词
    
    Args:
        prompt_id: 系统提示词ID
        request: 系统提示词请求
        
    Returns:
        更新后的系统提示词
    """
    try:
        api_logger.info(f"更新系统提示词: {prompt_id}")
        
        # 更新系统提示词
        system_prompt = system_prompt_service.update_system_prompt(
            user_id=1,
            system_prompt=request.system_prompt,
            name=request.name
        )
        
        if not system_prompt:
            raise HTTPException(status_code=404, detail="系统提示词不存在")
        
        return {
            "system_prompt": {
                "id": system_prompt.id,
                "name": system_prompt.name,
                "system_prompt": system_prompt.content,
                "is_active": system_prompt.is_active,
                "created_at": system_prompt.created_at.isoformat() if system_prompt.created_at else datetime.now().isoformat(),
                "updated_at": system_prompt.updated_at.isoformat() if system_prompt.updated_at else datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        api_logger.error(f"更新系统提示词失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"更新系统提示词失败: {str(e)}")

@router.delete("/{prompt_id}")
async def delete_system_prompt(prompt_id: int, user_id: int = 1):
    """
    删除系统提示词
    
    Args:
        prompt_id: 系统提示词ID
        user_id: 用户ID
        
    Returns:
        删除结果
    """
    try:
        api_logger.info(f"删除系统提示词: {prompt_id}, 用户: {user_id}")
        
        # 删除系统提示词
        success = system_prompt_service.delete_system_prompt(user_id=user_id, system_prompt_id=prompt_id)
        
        if success:
            api_logger.info(f"删除系统提示词成功: {prompt_id}")
            return {"success": True, "message": "系统提示词已删除"}
        else:
            raise HTTPException(status_code=404, detail="系统提示词不存在")
        
    except HTTPException:
        raise
    except Exception as e:
        api_logger.error(f"删除系统提示词失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"删除系统提示词失败: {str(e)}")

@router.post("/{prompt_id}/activate")
async def activate_system_prompt(prompt_id: int):
    """
    激活系统提示词
    
    Args:
        prompt_id: 系统提示词ID
        
    Returns:
        激活结果
    """
    try:
        api_logger.info(f"激活系统提示词: {prompt_id}")
        
        # 激活系统提示词
        success = system_prompt_service.set_active_system_prompt(user_id=1, system_prompt_id=prompt_id)
        
        if not success:
            raise HTTPException(status_code=500, detail="激活系统提示词失败")
        
        return {"success": True, "message": "系统提示词已激活"}
        
    except Exception as e:
        api_logger.error(f"激活系统提示词失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"激活系统提示词失败: {str(e)}")
