"""
系统提示词服务
提供系统提示词相关的业务逻辑
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
import hashlib
import secrets
import logging

from database.database_model import get_db, db
from models.system_prompt import SystemPrompt

# 日志记录器
logger = logging.getLogger(__name__)

class SystemPromptService:
    """系统提示词服务类"""
    
    def __init__(self):
        self.system_prompt = SystemPrompt()
    
    def get_system_prompt(self, user_id: int) -> Optional[SystemPrompt]:
        """获取系统提示词"""
        with db.get_session() as session:
            try:
                system_prompt = session.query(SystemPrompt).filter(SystemPrompt.user_id == user_id).first()
                return system_prompt
            except Exception as e:
                logger.error(f"获取系统提示词失败: {e}")
                raise

    def create_system_prompt(self, user_id: int, system_prompt: str, name: str = "自定义提示词") -> Optional[SystemPrompt]:
        """创建系统提示词"""
        with db.get_session() as session:
            try:
                system_prompt_obj = SystemPrompt(user_id=user_id, content=system_prompt, name=name)
                session.add(system_prompt_obj)
                session.commit()
                session.refresh(system_prompt_obj)
                return system_prompt_obj
            except Exception as e:
                logger.error(f"创建系统提示词失败: {e}")
                raise

    def update_system_prompt(self, user_id: int, system_prompt: str, name: str = None) -> Optional[SystemPrompt]:
        """更新系统提示词"""
        with db.get_session() as session:
            try:
                prompt_obj = session.query(SystemPrompt).filter(SystemPrompt.user_id == user_id).first()
                if prompt_obj:
                    prompt_obj.content = system_prompt  # 使用content字段
                    if name:
                        prompt_obj.name = name
                    session.commit()
                    session.refresh(prompt_obj)
                return prompt_obj
            except Exception as e:
                logger.error(f"更新系统提示词失败: {e}")
                raise

    def delete_system_prompt(self, user_id: int) -> bool:
        """删除系统提示词"""
        with db.get_session() as session:
            try:
                system_prompt = session.query(SystemPrompt).filter(SystemPrompt.user_id == user_id).first()
                session.delete(system_prompt)
                session.commit()
                return True
            except Exception as e:
                logger.error(f"删除系统提示词失败: {e}")
                raise

    def activate_system_prompt(self, user_id: int) -> bool:
        """激活系统提示词"""
        with db.get_session() as session:
            try:
                system_prompt = session.query(SystemPrompt).filter(SystemPrompt.user_id == user_id).first()
                system_prompt.is_active = True
                session.commit()
                return True
            except Exception as e:
                logger.error(f"激活系统提示词失败: {e}")
                raise
    
    def deactivate_system_prompt(self, user_id: int) -> bool:
        """停用系统提示词"""
        with db.get_session() as session:
            try:
                system_prompt = session.query(SystemPrompt).filter(SystemPrompt.user_id == user_id).first()
                system_prompt.is_active = False
                session.commit()
                return True
            except Exception as e:
                logger.error(f"停用系统提示词失败: {e}")
                raise

    def get_active_system_prompt(self, user_id: int) -> Optional[SystemPrompt]:
        """获取激活的系统提示词，如果没有激活的则返回任意一个"""
        with db.get_session() as session:
            try:
                # 首先尝试获取激活的系统提示词
                system_prompt = session.query(SystemPrompt).filter(SystemPrompt.user_id == user_id, SystemPrompt.is_active == True).first()
                
                # 如果没有激活的，获取任意一个系统提示词
                if not system_prompt:
                    system_prompt = session.query(SystemPrompt).filter(SystemPrompt.user_id == user_id).first()
                
                if system_prompt:
                    # 分离对象，使其可以在会话外使用
                    session.expunge(system_prompt)
                return system_prompt
            except Exception as e:
                logger.error(f"获取系统提示词失败: {e}")
                raise

    def set_active_system_prompt(self, user_id: int, system_prompt_id: int) -> bool:
        """设置激活的系统提示词"""
        with db.get_session() as session:
            try:
                # 先停用所有系统提示词
                session.query(SystemPrompt).filter(SystemPrompt.user_id == user_id).update({SystemPrompt.is_active: False})
                
                # 激活指定的系统提示词
                system_prompt = session.query(SystemPrompt).filter(SystemPrompt.user_id == user_id, SystemPrompt.id == system_prompt_id).first()
                if system_prompt:
                    system_prompt.is_active = True
                    session.commit()
                    return True
                return False
            except Exception as e:
                logger.error(f"设置激活的系统提示词失败: {e}")
                raise

    def get_all_system_prompts(self, user_id: int) -> List[SystemPrompt]:
        """获取用户的所有系统提示词"""
        with db.get_session() as session:
            try:
                prompts = session.query(SystemPrompt).filter(SystemPrompt.user_id == user_id).order_by(SystemPrompt.created_at.desc()).all()
                
                # 分离所有对象，使其可以在会话外使用
                for prompt in prompts:
                    session.expunge(prompt)
                
                return prompts
            except Exception as e:
                logger.error(f"获取所有系统提示词失败: {e}")
                raise

    def delete_system_prompt(self, user_id: int, system_prompt_id: int) -> bool:
        """删除系统提示词"""
        with db.get_session() as session:
            try:
                system_prompt = session.query(SystemPrompt).filter(
                    SystemPrompt.user_id == user_id, 
                    SystemPrompt.id == system_prompt_id
                ).first()
                
                if system_prompt:
                    session.delete(system_prompt)
                    session.commit()
                    return True
                return False
            except Exception as e:
                logger.error(f"删除系统提示词失败: {e}")
                raise


# 创建服务实例
system_prompt_service = SystemPromptService()
