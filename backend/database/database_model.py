from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from contextlib import contextmanager
import sys
import os

from models import Base


# 默认数据库URL，路径在本目录下
DEFAULT_DATABASE_URL = "sqlite:///./chat.db"

# 创建数据库类
class Database:
    def __init__(self, database_url: str = None):
        self.database_url = database_url or DEFAULT_DATABASE_URL
        self.engine = None
        self.SessionLocal = None

    # 创建数据库引擎
    def create_engine(self):
        try:
            self.engine = create_engine(
                self.database_url,
                echo=True,  # 设置为True可以看到SQL语句
                pool_pre_ping=True,
                pool_recycle=300
            )
            self.SessionLocal = sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=self.engine
            )
            print(f"数据库引擎创建成功: {self.database_url}")
            return True
        except Exception as e:
            print(f"创建数据库引擎失败: {e}")
            return False

    # 创建所有数据表
    def create_tables(self):
        try:
            if not self.engine:
                if not self.create_engine():
                    return False
            
            # 导入所有模型以确保它们被注册
            from models import User, Conversation, Message, SystemPrompt

            # 创建所有表
            Base.metadata.create_all(bind=self.engine)
            print("所有数据表创建成功")
            return True
        except Exception as e:
            print(f"创建数据表失败: {e}")
            return False

    # 数据库会话的上下文管理器
    @contextmanager
    def get_session(self) -> Session:
        """获取数据库会话的上下文管理器"""
        if not self.SessionLocal:
            raise RuntimeError("数据库会话未初始化，请先调用create_engine()")
        
        session = self.SessionLocal()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    def get_session_direct(self) -> Session:
        """直接获取数据库会话（需要手动管理）"""
        if not self.SessionLocal:
            raise RuntimeError("数据库会话未初始化，请先调用create_engine()")
        
        return self.SessionLocal()

    def get_db(self) -> Session:
        """获取数据库会话"""
        if not self.SessionLocal:
            self.create_engine()
        return self.get_session_direct()

    def close(self):
        """关闭数据库连接"""
        if self.engine:
            self.engine.dispose()
            print("数据库连接已关闭")


db = Database()

# 全局函数，用于获取数据库会话
def get_db() -> Session:
    """获取数据库会话的全局函数"""
    return db.get_db()                  