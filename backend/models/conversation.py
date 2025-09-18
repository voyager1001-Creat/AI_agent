from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

# 从__init__.py导入Base
from models import BaseModel

class Conversation(BaseModel):
    __tablename__ = 'conversations'
    
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    title = Column(String(200), nullable=True)
    system_prompt = Column(Text, nullable=True)
    
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Conversation(id={self.id})>"

class Message(BaseModel):
    __tablename__ = 'messages'

    conversation_id = Column(Integer, ForeignKey('conversations.id'), nullable=False)
    role = Column(String(20), nullable=False)  # 'user' 或 'assistant'
    content = Column(Text, nullable=False)
    content_type = Column(String(20), default='text')  # 'text', 'audio', 'image'
    message_metadata = Column(JSON, nullable=True)  # 存储消息的元数据
    
    conversation = relationship("Conversation", back_populates="messages")

    def __repr__(self):
        return f"<Message(id={self.id}, role='{self.role}', content_type='{self.content_type}')>"

