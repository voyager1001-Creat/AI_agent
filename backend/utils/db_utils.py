"""
数据库工具函数
提供统一的数据库会话管理
"""

from typing import Any, Callable, Optional, TypeVar, Generic
from contextlib import contextmanager
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from ..database.database_model import get_db
from .logger_config import database_logger

T = TypeVar('T')

class DatabaseManager:
    """数据库管理器"""
    
    @staticmethod
    @contextmanager
    def get_session():
        """获取数据库会话的上下文管理器"""
        db = get_db()
        try:
            yield db
            db.commit()
        except SQLAlchemyError as e:
            db.rollback()
            database_logger.error(f"数据库操作失败: {e}", exc_info=True)
            raise
        except Exception as e:
            db.rollback()
            database_logger.error(f"未知错误: {e}", exc_info=True)
            raise
        finally:
            db.close()
    
    @staticmethod
    def execute_query(func: Callable[[Session], T]) -> Optional[T]:
        """执行数据库查询"""
        with DatabaseManager.get_session() as db:
            try:
                return func(db)
            except Exception as e:
                database_logger.error(f"查询执行失败: {e}", exc_info=True)
                raise
    
    @staticmethod
    def execute_transaction(func: Callable[[Session], T]) -> Optional[T]:
        """执行数据库事务"""
        with DatabaseManager.get_session() as db:
            try:
                result = func(db)
                return result
            except Exception as e:
                database_logger.error(f"事务执行失败: {e}", exc_info=True)
                raise

# 便捷函数
def with_db_session(func: Callable[[Session], T]) -> Callable[[], Optional[T]]:
    """装饰器：为函数提供数据库会话"""
    def wrapper():
        return DatabaseManager.execute_query(func)
    return wrapper

def with_db_transaction(func: Callable[[Session], T]) -> Callable[[], Optional[T]]:
    """装饰器：为函数提供数据库事务"""
    def wrapper():
        return DatabaseManager.execute_transaction(func)
    return wrapper
