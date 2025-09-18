from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime

# 从__init__.py导入BaseModel
from models import BaseModel

class User(BaseModel):
    __tablename__ = 'users'
    
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"