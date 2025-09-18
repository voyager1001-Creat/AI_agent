from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from models import BaseModel

class SystemPrompt(BaseModel):
    """系统提示词模型"""
    __tablename__ = 'system_prompts'
    
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    content = Column(Text, nullable=False)
    is_active = Column(Boolean, default=False)
    is_default = Column(Boolean, default=False)
    category = Column(String(50), default='general')
    tags = Column(Text)  # JSON字符串格式存储标签
