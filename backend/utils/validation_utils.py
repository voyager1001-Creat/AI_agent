"""
验证工具
提供数据验证功能
"""

import re
import logging
from typing import Any, Dict, List, Optional, Union
from datetime import datetime, date

logger = logging.getLogger(__name__)


class ValidationUtils:
    """验证工具类"""
    
    # 常用正则表达式
    PATTERNS = {
        'email': r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
        'phone': r'^1[3-9]\d{9}$',
        'id_card': r'^\d{17}[\dXx]$',
        'url': r'^https?://(?:[-\w.])+(?:[:\d]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?$',
        'ipv4': r'^(\d{1,3}\.){3}\d{1,3}$',
        'ipv6': r'^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$',
        'username': r'^[a-zA-Z0-9_\u4e00-\u9fa5]{3,20}$',
        'password': r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$',
        'credit_card': r'^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$',
    }
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """验证邮箱地址"""
        if not email or not isinstance(email, str):
            return False
        
        pattern = ValidationUtils.PATTERNS['email']
        return bool(re.match(pattern, email))
    
    @staticmethod
    def validate_phone(phone: str) -> bool:
        """验证手机号码"""
        if not phone or not isinstance(phone, str):
            return False
        
        pattern = ValidationUtils.PATTERNS['phone']
        return bool(re.match(pattern, phone))
    
    @staticmethod
    def validate_id_card(id_card: str) -> bool:
        """验证身份证号码"""
        if not id_card or not isinstance(id_card, str):
            return False
        
        pattern = ValidationUtils.PATTERNS['id_card']
        if not re.match(pattern, id_card):
            return False
        
        # 验证校验码
        try:
            weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
            check_codes = '10X98765432'
            
            # 前17位数字
            digits = [int(id_card[i]) for i in range(17)]
            
            # 计算校验码
            total = sum(digits[i] * weights[i] for i in range(17))
            check_code = check_codes[total % 11]
            
            # 验证最后一位
            return id_card[-1].upper() == check_code
        except Exception:
            return False
    
    @staticmethod
    def validate_url(url: str) -> bool:
        """验证URL"""
        if not url or not isinstance(url, str):
            return False
        
        pattern = ValidationUtils.PATTERNS['url']
        return bool(re.match(pattern, url))
    
    @staticmethod
    def validate_ipv4(ip: str) -> bool:
        """验证IPv4地址"""
        if not ip or not isinstance(ip, str):
            return False
        
        pattern = ValidationUtils.PATTERNS['ipv4']
        if not re.match(pattern, ip):
            return False
        
        # 验证每个段的值
        try:
            segments = ip.split('.')
            for segment in segments:
                value = int(segment)
                if value < 0 or value > 255:
                    return False
            return True
        except Exception:
            return False
    
    @staticmethod
    def validate_ipv6(ip: str) -> bool:
        """验证IPv6地址"""
        if not ip or not isinstance(ip, str):
            return False
        
        pattern = ValidationUtils.PATTERNS['ipv6']
        return bool(re.match(pattern, ip))
    
    @staticmethod
    def validate_username(username: str) -> bool:
        """验证用户名"""
        if not username or not isinstance(username, str):
            return False
        
        pattern = ValidationUtils.PATTERNS['username']
        return bool(re.match(pattern, username))
    
    @staticmethod
    def validate_password_strength(password: str) -> bool:
        """验证密码强度"""
        if not password or not isinstance(password, str):
            return False
        
        # 基本长度检查
        if len(password) < 8:
            return False
        
        # 复杂度检查
        has_lower = bool(re.search(r'[a-z]', password))
        has_upper = bool(re.search(r'[A-Z]', password))
        has_digit = bool(re.search(r'\d', password))
        has_special = bool(re.search(r'[@$!%*?&]', password))
        
        # 至少满足3个条件
        conditions_met = sum([has_lower, has_upper, has_digit, has_special])
        return conditions_met >= 3
    
    @staticmethod
    def validate_credit_card(card_number: str) -> bool:
        """验证信用卡号码（Luhn算法）"""
        if not card_number or not isinstance(card_number, str):
            return False
        
        # 移除空格和连字符
        card_number = re.sub(r'[\s-]', '', card_number)
        
        # 检查是否都是数字
        if not card_number.isdigit():
            return False
        
        # Luhn算法验证
        digits = [int(d) for d in card_number]
        odd_digits = digits[-1::-2]
        even_digits = digits[-2::-2]
        
        checksum = sum(odd_digits)
        for d in even_digits:
            checksum += sum(divmod(d * 2, 10))
        
        return checksum % 10 == 0
    
    @staticmethod
    def validate_file_size(file_size: int, max_size: int) -> bool:
        """验证文件大小"""
        if not isinstance(file_size, int) or file_size < 0:
            return False
        
        return file_size <= max_size
    
    @staticmethod
    def validate_file_type(filename: str, allowed_extensions: List[str]) -> bool:
        """验证文件类型"""
        if not filename or not isinstance(filename, str):
            return False
        
        if not allowed_extensions:
            return False
        
        # 获取文件扩展名
        extension = filename.lower().split('.')[-1] if '.' in filename else ''
        return extension in [ext.lower().lstrip('.') for ext in allowed_extensions]
    
    @staticmethod
    def validate_image_file(filename: str) -> bool:
        """验证图片文件"""
        allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff']
        return ValidationUtils.validate_file_type(filename, allowed_extensions)
    
    @staticmethod
    def validate_audio_file(filename: str) -> bool:
        """验证音频文件"""
        allowed_extensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma']
        return ValidationUtils.validate_file_type(filename, allowed_extensions)
    
    @staticmethod
    def validate_video_file(filename: str) -> bool:
        """验证视频文件"""
        allowed_extensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm']
        return ValidationUtils.validate_file_type(filename, allowed_extensions)
    
    @staticmethod
    def validate_date(date_str: str, format_str: str = '%Y-%m-%d') -> bool:
        """验证日期格式"""
        if not date_str or not isinstance(date_str, str):
            return False
        
        try:
            datetime.strptime(date_str, format_str)
            return True
        except ValueError:
            return False
    
    @staticmethod
    def validate_datetime(datetime_str: str, format_str: str = '%Y-%m-%d %H:%M:%S') -> bool:
        """验证日期时间格式"""
        if not datetime_str or not isinstance(datetime_str, str):
            return False
        
        try:
            datetime.strptime(datetime_str, format_str)
            return True
        except ValueError:
            return False
    
    @staticmethod
    def validate_range(value: Union[int, float], min_val: Union[int, float], max_val: Union[int, float]) -> bool:
        """验证数值范围"""
        if not isinstance(value, (int, float)):
            return False
        
        return min_val <= value <= max_val
    
    @staticmethod
    def validate_length(value: str, min_length: int, max_length: int) -> bool:
        """验证字符串长度"""
        if not isinstance(value, str):
            return False
        
        return min_length <= len(value) <= max_length
    
    @staticmethod
    def validate_required(value: Any) -> bool:
        """验证必填字段"""
        if value is None:
            return False
        
        if isinstance(value, str):
            return bool(value.strip())
        
        if isinstance(value, (list, tuple, dict)):
            return bool(value)
        
        return True
    
    @staticmethod
    def validate_form(data: Dict[str, Any], rules: Dict[str, Dict[str, Any]]) -> Dict[str, List[str]]:
        """验证表单数据"""
        errors = {}
        
        for field, rule in rules.items():
            field_errors = []
            value = data.get(field)
            
            # 必填验证
            if rule.get('required', False) and not ValidationUtils.validate_required(value):
                field_errors.append(f"{field} 是必填字段")
                continue
            
            # 如果字段为空且不是必填，跳过其他验证
            if not ValidationUtils.validate_required(value):
                continue
            
            # 类型验证
            if 'type' in rule:
                expected_type = rule['type']
                if expected_type == 'email' and not ValidationUtils.validate_email(value):
                    field_errors.append(f"{field} 格式不正确")
                elif expected_type == 'phone' and not ValidationUtils.validate_phone(value):
                    field_errors.append(f"{field} 格式不正确")
                elif expected_type == 'url' and not ValidationUtils.validate_url(value):
                    field_errors.append(f"{field} 格式不正确")
            
            # 长度验证
            if 'min_length' in rule or 'max_length' in rule:
                min_len = rule.get('min_length', 0)
                max_len = rule.get('max_length', float('inf'))
                if not ValidationUtils.validate_length(value, min_len, max_len):
                    field_errors.append(f"{field} 长度必须在 {min_len} 到 {max_len} 之间")
            
            # 范围验证
            if 'min' in rule or 'max' in rule:
                min_val = rule.get('min', float('-inf'))
                max_val = rule.get('max', float('inf'))
                if not ValidationUtils.validate_range(value, min_val, max_val):
                    field_errors.append(f"{field} 值必须在 {min_val} 到 {max_val} 之间")
            
            # 自定义验证
            if 'custom' in rule:
                custom_validator = rule['custom']
                if callable(custom_validator):
                    try:
                        if not custom_validator(value):
                            field_errors.append(rule.get('message', f"{field} 验证失败"))
                    except Exception as e:
                        field_errors.append(f"{field} 验证出错: {str(e)}")
            
            if field_errors:
                errors[field] = field_errors
        
        return errors
    
    @staticmethod
    def sanitize_input(value: str) -> str:
        """清理输入数据"""
        if not isinstance(value, str):
            return str(value)
        
        # 移除HTML标签
        value = re.sub(r'<[^>]+>', '', value)
        
        # 移除脚本标签
        value = re.sub(r'<script[^>]*>.*?</script>', '', value, flags=re.IGNORECASE | re.DOTALL)
        
        # 移除危险字符
        value = re.sub(r'[<>"\']', '', value)
        
        # 移除多余的空白字符
        value = re.sub(r'\s+', ' ', value).strip()
        
        return value
    
    @staticmethod
    def validate_json_schema(data: Any, schema: Dict[str, Any]) -> bool:
        """验证JSON数据是否符合模式"""
        try:
            # 这里可以实现更复杂的JSON模式验证
            # 暂时返回True
            return True
        except Exception as e:
            logger.error(f"JSON模式验证失败: {e}")
            return False


# 便捷函数
def validate_email(email: str) -> bool:
    """验证邮箱地址"""
    return ValidationUtils.validate_email(email)


def validate_phone(phone: str) -> bool:
    """验证手机号码"""
    return ValidationUtils.validate_phone(phone)


def validate_password_strength(password: str) -> bool:
    """验证密码强度"""
    return ValidationUtils.validate_password_strength(password)


def validate_username(username: str) -> bool:
    """验证用户名"""
    return ValidationUtils.validate_username(username)


def validate_file_type(filename: str, allowed_extensions: List[str]) -> bool:
    """验证文件类型"""
    return ValidationUtils.validate_file_type(filename, allowed_extensions)


def sanitize_input(value: str) -> str:
    """清理输入数据"""
    return ValidationUtils.sanitize_input(value)
