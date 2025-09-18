"""
基础模型
定义所有模型的基类
提供通用字段和方法
"""

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, DateTime, Boolean, String, JSON
from sqlalchemy.sql import func
from datetime import datetime

# 创建基础模型类
Base = declarative_base()


class BaseModel(Base):
    """基础模型类，包含通用字段"""
    __abstract__ = True
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<{self.__class__.__name__}(id={self.id})>"
    
    def to_dict(self):
        """转换为字典"""
        result = {}
        for column in self.__table__.columns:
            value = getattr(self, column.name)
            if isinstance(value, datetime):
                result[column.name] = value.isoformat() if value else None
            else:
                result[column.name] = value
        return result
    
    def update_from_dict(self, data: dict):
        """从字典更新模型"""
        for key, value in data.items():
            if hasattr(self, key) and key not in ['id', 'created_at', 'updated_at']:
                setattr(self, key, value)
    
    @classmethod
    def from_dict(cls, data: dict):
        """从字典创建模型实例"""
        # 过滤掉不允许的字段
        allowed_fields = {column.name for column in cls.__table__.columns}
        filtered_data = {k: v for k, v in data.items() if k in allowed_fields}
        
        return cls(**filtered_data)
    
    def copy(self):
        """复制模型实例"""
        data = self.to_dict()
        # 移除ID和时间戳
        data.pop('id', None)
        data.pop('created_at', None)
        data.pop('updated_at', None)
        
        return self.__class__.from_dict(data)
    
    def is_new(self) -> bool:
        """检查是否是新建的实例"""
        return self.id is None
    
    def get_created_time_ago(self) -> str:
        """获取创建时间的相对描述"""
        if not self.created_at:
            return "未知时间"
        
        now = datetime.now()
        diff = now - self.created_at
        
        if diff.days > 0:
            return f"{diff.days}天前"
        elif diff.seconds >= 3600:
            hours = diff.seconds // 3600
            return f"{hours}小时前"
        elif diff.seconds >= 60:
            minutes = diff.seconds // 60
            return f"{minutes}分钟前"
        else:
            return "刚刚"
    
    def get_updated_time_ago(self) -> str:
        """获取更新时间的相对描述"""
        if not self.updated_at:
            return "未知时间"
        
        now = datetime.now()
        diff = now - self.updated_at
        
        if diff.days > 0:
            return f"{diff.days}天前"
        elif diff.seconds >= 3600:
            hours = diff.seconds // 3600
            return f"{hours}小时前"
        elif diff.seconds >= 60:
            minutes = diff.seconds // 60
            return f"{minutes}分钟前"
        else:
            return "刚刚"
    
    def is_recently_created(self, hours: int = 24) -> bool:
        """检查是否是最近创建的"""
        if not self.created_at:
            return False
        
        now = datetime.now()
        diff = now - self.created_at
        return diff.total_seconds() < hours * 3600
    
    def is_recently_updated(self, hours: int = 24) -> bool:
        """检查是否是最近更新的"""
        if not self.updated_at:
            return False
        
        now = datetime.now()
        diff = now - self.updated_at
        return diff.total_seconds() < hours * 3600

__all__ = [
    'Base',
    'BaseModel'
]