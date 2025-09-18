"""
文件工具
提供文件操作功能
"""

import os
import shutil
import mimetypes
from typing import List, Optional, Tuple
from pathlib import Path
import logging
from PIL import Image
import hashlib
from datetime import datetime, timedelta
import re

logger = logging.getLogger(__name__)


class FileUtils:
    """文件工具类"""
    
    def __init__(self):
        # 支持的图片格式
        self.image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff'}
        
        # 支持的音频格式
        self.audio_extensions = {'.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.wma'}
        
        # 支持的视频格式
        self.video_extensions = {'.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'}
        
        # 支持的文件类型映射
        self.mime_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.bmp': 'image/bmp',
            '.webp': 'image/webp',
            '.tiff': 'image/tiff',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.ogg': 'audio/ogg',
            '.m4a': 'audio/mp4',
            '.aac': 'audio/aac',
            '.flac': 'audio/flac',
            '.wma': 'audio/x-ms-wma',
            '.mp4': 'video/mp4',
            '.avi': 'video/x-msvideo',
            '.mov': 'video/quicktime',
            '.wmv': 'video/x-ms-wmv',
            '.flv': 'video/x-flv',
            '.mkv': 'video/x-matroska',
            '.webm': 'video/webm'
        }
    
    def ensure_directory(self, directory_path: str) -> bool:
        """确保目录存在，如果不存在则创建"""
        try:
            Path(directory_path).mkdir(parents=True, exist_ok=True)
            return True
        except Exception as e:
            logger.error(f"创建目录失败: {e}")
            return False
    
    def get_file_extension(self, filename: str) -> str:
        """获取文件扩展名"""
        if not filename:
            return ""
        
        return Path(filename).suffix.lower()
    
    def is_valid_image_file(self, filename: str) -> bool:
        """检查是否是有效的图片文件"""
        extension = self.get_file_extension(filename)
        return extension in self.image_extensions
    
    def is_valid_audio_file(self, filename: str) -> bool:
        """检查是否是有效的音频文件"""
        extension = self.get_file_extension(filename)
        return extension in self.audio_extensions
    
    def is_valid_video_file(self, filename: str) -> bool:
        """检查是否是有效的视频文件"""
        extension = self.get_file_extension(filename)
        return extension in self.video_extensions
    
    def get_file_size(self, file_path: str) -> int:
        """获取文件大小（字节）"""
        try:
            if os.path.exists(file_path):
                return os.path.getsize(file_path)
            return 0
        except Exception as e:
            logger.error(f"获取文件大小失败: {e}")
            return 0
    
    def get_mime_type(self, filename: str) -> str:
        """获取文件的MIME类型"""
        extension = self.get_file_extension(filename)
        
        # 首先检查预定义的MIME类型
        if extension in self.mime_types:
            return self.mime_types[extension]
        
        # 使用mimetypes模块猜测
        mime_type, _ = mimetypes.guess_type(filename)
        return mime_type or 'application/octet-stream'
    
    def resize_image(
        self,
        input_path: str,
        output_path: str,
        max_width: int = 800,
        max_height: int = 600,
        quality: int = 85
    ) -> bool:
        """调整图片大小"""
        try:
            if not self.is_valid_image_file(input_path):
                logger.error(f"不支持的文件格式: {input_path}")
                return False
            
            with Image.open(input_path) as img:
                # 计算新的尺寸
                width, height = img.size
                
                if width <= max_width and height <= max_height:
                    # 图片已经足够小，直接复制
                    shutil.copy2(input_path, output_path)
                    return True
                
                # 计算缩放比例
                ratio = min(max_width / width, max_height / height)
                new_width = int(width * ratio)
                new_height = int(height * ratio)
                
                # 调整图片大小
                resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                
                # 保存调整后的图片
                resized_img.save(output_path, quality=quality, optimize=True)
                
                logger.info(f"图片调整大小成功: {input_path} -> {output_path}")
                return True
                
        except Exception as e:
            logger.error(f"调整图片大小失败: {e}")
            return False
    
    def cleanup_old_files(
        self,
        directory: str,
        days: int = 30,
        extensions: Optional[List[str]] = None
    ) -> int:
        """清理旧文件"""
        try:
            if not os.path.exists(directory):
                return 0
            
            cutoff_time = datetime.now() - timedelta(days=days)
            deleted_count = 0
            
            for filename in os.listdir(directory):
                file_path = os.path.join(directory, filename)
                
                # 检查文件扩展名
                if extensions and not any(filename.endswith(ext) for ext in extensions):
                    continue
                
                # 检查文件修改时间
                if os.path.isfile(file_path):
                    file_mtime = datetime.fromtimestamp(os.path.getmtime(file_path))
                    if file_mtime < cutoff_time:
                        try:
                            os.remove(file_path)
                            deleted_count += 1
                            logger.info(f"删除旧文件: {file_path}")
                        except Exception as e:
                            logger.error(f"删除文件失败: {file_path}, 错误: {e}")
            
            logger.info(f"清理完成，删除了 {deleted_count} 个旧文件")
            return deleted_count
            
        except Exception as e:
            logger.error(f"清理旧文件失败: {e}")
            return 0
    
    def get_directory_size(self, directory: str) -> int:
        """获取目录大小（字节）"""
        try:
            total_size = 0
            for dirpath, dirnames, filenames in os.walk(directory):
                for filename in filenames:
                    file_path = os.path.join(dirpath, filename)
                    if os.path.exists(file_path):
                        total_size += os.path.getsize(file_path)
            return total_size
        except Exception as e:
            logger.error(f"获取目录大小失败: {e}")
            return 0
    
    def list_files_by_extension(
        self,
        directory: str,
        extensions: List[str],
        recursive: bool = True
    ) -> List[str]:
        """按扩展名列出文件"""
        try:
            files = []
            
            if recursive:
                for root, dirs, filenames in os.walk(directory):
                    for filename in filenames:
                        if any(filename.lower().endswith(ext.lower()) for ext in extensions):
                            files.append(os.path.join(root, filename))
            else:
                for filename in os.listdir(directory):
                    if any(filename.lower().endswith(ext.lower()) for ext in extensions):
                        files.append(os.path.join(directory, filename))
            
            return files
            
        except Exception as e:
            logger.error(f"列出文件失败: {e}")
            return []
    
    def safe_filename(self, filename: str) -> str:
        """生成安全的文件名"""
        if not filename:
            return "unnamed"
        
        # 移除或替换危险字符
        safe_name = re.sub(r'[<>:"/\\|?*]', '_', filename)
        
        # 限制长度
        if len(safe_name) > 255:
            name, ext = os.path.splitext(safe_name)
            safe_name = name[:255-len(ext)] + ext
        
        return safe_name
    
    def copy_file(self, src: str, dst: str, overwrite: bool = False) -> bool:
        """复制文件"""
        try:
            if os.path.exists(dst) and not overwrite:
                logger.warning(f"目标文件已存在: {dst}")
                return False
            
            # 确保目标目录存在
            dst_dir = os.path.dirname(dst)
            if dst_dir:
                self.ensure_directory(dst_dir)
            
            shutil.copy2(src, dst)
            logger.info(f"文件复制成功: {src} -> {dst}")
            return True
            
        except Exception as e:
            logger.error(f"文件复制失败: {e}")
            return False
    
    def move_file(self, src: str, dst: str, overwrite: bool = False) -> bool:
        """移动文件"""
        try:
            if os.path.exists(dst) and not overwrite:
                logger.warning(f"目标文件已存在: {dst}")
                return False
            
            # 确保目标目录存在
            dst_dir = os.path.dirname(dst)
            if dst_dir:
                self.ensure_directory(dst_dir)
            
            shutil.move(src, dst)
            logger.info(f"文件移动成功: {src} -> {dst}")
            return True
            
        except Exception as e:
            logger.error(f"文件移动失败: {e}")
            return False
    
    def delete_file(self, file_path: str) -> bool:
        """删除文件"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"文件删除成功: {file_path}")
                return True
            else:
                logger.warning(f"文件不存在: {file_path}")
                return False
        except Exception as e:
            logger.error(f"文件删除失败: {e}")
            return False
    
    def get_file_hash(self, file_path: str, algorithm: str = 'md5') -> Optional[str]:
        """获取文件哈希值"""
        try:
            if not os.path.exists(file_path):
                return None
            
            hash_obj = hashlib.new(algorithm)
            
            with open(file_path, 'rb') as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_obj.update(chunk)
            
            return hash_obj.hexdigest()
            
        except Exception as e:
            logger.error(f"获取文件哈希值失败: {e}")
            return None
    
    def create_backup(self, file_path: str, backup_dir: str = None) -> Optional[str]:
        """创建文件备份"""
        try:
            if not os.path.exists(file_path):
                return None
            
            if not backup_dir:
                backup_dir = os.path.join(os.path.dirname(file_path), 'backup')
            
            self.ensure_directory(backup_dir)
            
            # 生成备份文件名
            filename = os.path.basename(file_path)
            name, ext = os.path.splitext(filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_filename = f"{name}_{timestamp}{ext}"
            backup_path = os.path.join(backup_dir, backup_filename)
            
            # 复制文件
            if self.copy_file(file_path, backup_path):
                return backup_path
            
            return None
            
        except Exception as e:
            logger.error(f"创建文件备份失败: {e}")
            return None
    
    def get_file_info(self, file_path: str) -> dict:
        """获取文件信息"""
        try:
            if not os.path.exists(file_path):
                return {}
            
            stat = os.stat(file_path)
            
            return {
                'path': file_path,
                'name': os.path.basename(file_path),
                'size': stat.st_size,
                'created': datetime.fromtimestamp(stat.st_ctime),
                'modified': datetime.fromtimestamp(stat.st_mtime),
                'accessed': datetime.fromtimestamp(stat.st_atime),
                'extension': self.get_file_extension(file_path),
                'mime_type': self.get_mime_type(file_path),
                'is_image': self.is_valid_image_file(file_path),
                'is_audio': self.is_valid_audio_file(file_path),
                'is_video': self.is_valid_video_file(file_path)
            }
            
        except Exception as e:
            logger.error(f"获取文件信息失败: {e}")
            return {}


# 便捷函数
def ensure_directory(directory_path: str) -> bool:
    """确保目录存在"""
    return FileUtils().ensure_directory(directory_path)


def get_file_extension(filename: str) -> str:
    """获取文件扩展名"""
    return FileUtils().get_file_extension(filename)


def is_valid_image_file(filename: str) -> bool:
    """检查是否是有效的图片文件"""
    return FileUtils().is_valid_image_file(filename)


def is_valid_audio_file(filename: str) -> bool:
    """检查是否是有效的音频文件"""
    return FileUtils().is_valid_audio_file(filename)


def get_file_size(file_path: str) -> int:
    """获取文件大小"""
    return FileUtils().get_file_size(file_path)


def get_mime_type(filename: str) -> str:
    """获取文件的MIME类型"""
    return FileUtils().get_mime_type(filename)


def safe_filename(filename: str) -> str:
    """生成安全的文件名"""
    return FileUtils().safe_filename(filename)
