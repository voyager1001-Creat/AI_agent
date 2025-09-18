# 从 base.py 导入 Base 和 BaseModel
from .base import Base, BaseModel

# 导入所有模型
from .user import User
from .conversation import Conversation, Message
from .system_prompt import SystemPrompt

# 删除重复的 Base 创建和元数据设置
# User.__table__.metadata = Base.metadata  # 删除这些行
# Conversation.__table__.metadata = Base.metadata
# Message.__table__.metadata = Base.metadata
# SystemPrompt.__table__.metadata = Base.metadata

__all__ = ['Base', 'BaseModel', 'User', 'Conversation', 'Message', 'SystemPrompt']
