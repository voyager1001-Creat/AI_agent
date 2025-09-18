"""
用户服务
提供用户相关的业务逻辑
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
import hashlib
import secrets
import logging

from models.user import User
from database.database_model import get_db
from utils.file_utils import FileUtils
from utils.validation_utils import ValidationUtils

logger = logging.getLogger(__name__)




class UserService:
    """用户服务类"""
    
    def __init__(self):
        self.file_utils = FileUtils()
        self.validation_utils = ValidationUtils()
    
    def hash_password(self, password: str) -> str:
        """哈希密码"""
        salt = secrets.token_hex(16)
        hash_obj = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return f"{salt}${hash_obj.hex()}"
    
    def verify_password(self, password: str, hashed_password: str) -> bool:
        """验证密码"""
        try:
            salt, hash_hex = hashed_password.split('$')
            hash_obj = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
            return hash_obj.hex() == hash_hex
        except Exception:
            return False
    
    def create_user(
        self,
        username: str,
        email: str,
        password: str,
        **kwargs
    ) -> User:
        """创建新用户"""
        try:
            db = get_db()
            
            # 检查用户名是否已存在
            if db.query(User).filter(User.username == username).first():
                raise ValueError("用户名已存在")
            
            # 检查邮箱是否已存在
            if db.query(User).filter(User.email == email).first():
                raise ValueError("邮箱已存在")
            
            # 验证密码强度
            if not self.validation_utils.validate_password_strength(password):
                raise ValueError("密码强度不足")
            
            # 创建用户
            user = User(
                username=username,
                email=email,
                hashed_password=self.hash_password(password),
                is_active=True,
                created_at=datetime.now(),
                **kwargs
            )
            
            db.add(user)
            db.commit()
            db.refresh(user)
            
            logger.info(f"创建用户成功: {username}")
            return user
            
        except Exception as e:
            logger.error(f"创建用户失败: {e}")
            raise
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """根据ID获取用户"""
        try:
            db = get_db()
            return db.query(User).filter(User.id == user_id).first()
        except Exception as e:
            logger.error(f"获取用户失败: {e}")
            raise
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        """根据用户名获取用户"""
        try:
            db = get_db()
            return db.query(User).filter(User.username == username).first()
        except Exception as e:
            logger.error(f"获取用户失败: {e}")
            raise
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """根据邮箱获取用户"""
        try:
            db = get_db()
            return db.query(User).filter(User.email == email).first()
        except Exception as e:
            logger.error(f"获取用户失败: {e}")
            raise
    
    def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """用户认证"""
        try:
            user = self.get_user_by_username(username)
            if not user:
                return None
            
            if not self.verify_password(password, user.hashed_password):
                return None
            
            if not user.is_active:
                return None
            
            return user
            
        except Exception as e:
            logger.error(f"用户认证失败: {e}")
            raise
    
    def update_user_profile(
        self,
        user_id: int,
        **kwargs
    ) -> Optional[User]:
        """更新用户资料"""
        try:
            db = get_db()
            user = self.get_user_by_id(user_id)
            if not user:
                return None
            
            # 更新允许的字段
            allowed_fields = ['username', 'email', 'full_name', 'bio', 'avatar_url', 'ai_avatar_url']
            for field, value in kwargs.items():
                if field in allowed_fields and hasattr(user, field):
                    setattr(user, field, value)
            
            user.updated_at = datetime.now()
            
            db.commit()
            db.refresh(user)
            
            logger.info(f"更新用户资料成功: {user_id}")
            return user
            
        except Exception as e:
            logger.error(f"更新用户资料失败: {e}")
            raise
    
    def change_password(
        self,
        user_id: int,
        current_password: str,
        new_password: str
    ) -> bool:
        """修改密码"""
        try:
            db = get_db()
            user = self.get_user_by_id(user_id)
            if not user:
                return False
            
            # 验证当前密码
            if not self.verify_password(current_password, user.hashed_password):
                return False
            
            # 验证新密码强度
            if not self.validation_utils.validate_password_strength(new_password):
                raise ValueError("新密码强度不足")
            
            # 更新密码
            user.hashed_password = self.hash_password(new_password)
            user.updated_at = datetime.now()
            
            db.commit()
            
            logger.info(f"修改密码成功: {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"修改密码失败: {e}")
            raise
    
    def reset_password(self, email: str) -> bool:
        """重置密码"""
        try:
            user = self.get_user_by_email(email)
            if not user:
                return False
            
            # 生成临时密码
            temp_password = secrets.token_urlsafe(8)
            user.hashed_password = self.hash_password(temp_password)
            user.updated_at = datetime.now()
            
            # 这里应该发送邮件给用户
            # TODO: 实现邮件发送功能
            
            db = get_db()
            db.commit()
            
            logger.info(f"重置密码成功: {email}")
            return True
            
        except Exception as e:
            logger.error(f"重置密码失败: {e}")
            raise
    
    def deactivate_user(self, user_id: int) -> bool:
        """停用用户"""
        try:
            db = get_db()
            user = self.get_user_by_id(user_id)
            if not user:
                return False
            
            user.is_active = False
            user.updated_at = datetime.now()
            
            db.commit()
            
            logger.info(f"停用用户成功: {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"停用用户失败: {e}")
            raise
    
    def activate_user(self, user_id: int) -> bool:
        """激活用户"""
        try:
            db = get_db()
            user = self.get_user_by_id(user_id)
            if not user:
                return False
            
            user.is_active = True
            user.updated_at = datetime.now()
            
            db.commit()
            
            logger.info(f"激活用户成功: {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"激活用户失败: {e}")
            raise
    
    def delete_user(self, user_id: int) -> bool:
        """删除用户"""
        try:
            db = get_db()
            user = self.get_user_by_id(user_id)
            if not user:
                return False
            
            # 删除用户头像文件
            if user.avatar_url:
                self.file_utils.delete_file(user.avatar_url)
            if user.ai_avatar_url:
                self.file_utils.delete_file(user.ai_avatar_url)
            
            # 删除用户
            db.delete(user)
            db.commit()
            
            logger.info(f"删除用户成功: {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"删除用户失败: {e}")
            raise
    
    def list_users(
        self,
        skip: int = 0,
        limit: int = 100,
        active_only: bool = True
    ) -> List[User]:
        """获取用户列表"""
        try:
            db = get_db()
            query = db.query(User)
            
            if active_only:
                query = query.filter(User.is_active == True)
            
            users = query.offset(skip).limit(limit).all()
            return users
            
        except Exception as e:
            logger.error(f"获取用户列表失败: {e}")
            raise
    
    def search_users(
        self,
        query: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[User]:
        """搜索用户"""
        try:
            db = get_db()
            users = db.query(User).filter(
                (User.username.contains(query)) |
                (User.email.contains(query)) |
                (User.full_name.contains(query))
            ).offset(skip).limit(limit).all()
            
            return users
            
        except Exception as e:
            logger.error(f"搜索用户失败: {e}")
            raise
    
    def get_user_stats(self, user_id: int) -> Dict[str, Any]:
        """获取用户统计信息"""
        try:
            db = get_db()
            user = self.get_user_by_id(user_id)
            if not user:
                return {}
            
            # 这里可以添加更多统计信息
            # 比如对话数量、记忆数量等
            
            stats = {
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'is_active': user.is_active,
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'updated_at': user.updated_at.isoformat() if user.updated_at else None,
                'has_avatar': bool(user.avatar_url),
                'has_ai_avatar': bool(user.ai_avatar_url),
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"获取用户统计失败: {e}")
            raise
    
    def update_user_avatar(
        self,
        user_id: int,
        avatar_url: str,
        avatar_type: str = 'user'
    ) -> bool:
        """更新用户头像"""
        try:
            db = get_db()
            user = self.get_user_by_id(user_id)
            if not user:
                return False
            
            if avatar_type == 'user':
                user.avatar_url = avatar_url
            elif avatar_type == 'ai':
                user.ai_avatar_url = avatar_url
            
            user.updated_at = datetime.now()
            
            db.commit()
            
            logger.info(f"更新用户头像成功: {user_id}, 类型: {avatar_type}")
            return True
            
        except Exception as e:
            logger.error(f"更新用户头像失败: {e}")
            raise


# 创建服务实例
user_service = UserService()
