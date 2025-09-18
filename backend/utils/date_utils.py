"""
日期时间工具函数
提供常用的日期时间处理功能
"""

from datetime import datetime, date, timedelta
from typing import Union, List, Optional
import pytz
import re


class DateUtils:
    """日期时间工具类"""
    
    # 常用时区
    TIMEZONES = {
        'UTC': pytz.UTC,
        'Asia/Shanghai': pytz.timezone('Asia/Shanghai'),
        'America/New_York': pytz.timezone('America/New_York'),
        'Europe/London': pytz.timezone('Europe/London'),
    }
    
    # 日期格式
    DATE_FORMATS = [
        '%Y-%m-%d',
        '%Y/%m/%d',
        '%Y.%m.%d',
        '%d-%m-%Y',
        '%d/%m/%Y',
        '%d.%m.%Y',
        '%Y年%m月%d日',
        '%m月%d日',
        '%d日',
    ]
    
    # 时间格式
    TIME_FORMATS = [
        '%H:%M:%S',
        '%H:%M',
        '%I:%M:%S %p',
        '%I:%M %p',
        '%H时%M分%S秒',
        '%H时%M分',
    ]
    
    # 完整日期时间格式
    DATETIME_FORMATS = [
        '%Y-%m-%d %H:%M:%S',
        '%Y-%m-%dT%H:%M:%S',
        '%Y-%m-%d %H:%M',
        '%Y/%m/%d %H:%M:%S',
        '%Y年%m月%d日 %H时%M分%S秒',
        '%Y年%m月%d日 %H时%M分',
    ]
    
    @staticmethod
    def now(timezone: str = 'UTC') -> datetime:
        """获取当前时间"""
        tz = DateUtils.TIMEZONES.get(timezone, pytz.UTC)
        return datetime.now(tz)
    
    @staticmethod
    def today(timezone: str = 'UTC') -> date:
        """获取当前日期"""
        return DateUtils.now(timezone).date()
    
    @staticmethod
    def parse_date(date_str: str, formats: Optional[List[str]] = None) -> Optional[date]:
        """解析日期字符串"""
        if formats is None:
            formats = DateUtils.DATE_FORMATS
        
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt).date()
            except ValueError:
                continue
        
        return None
    
    @staticmethod
    def parse_time(time_str: str, formats: Optional[List[str]] = None) -> Optional[datetime.time]:
        """解析时间字符串"""
        if formats is None:
            formats = DateUtils.TIME_FORMATS
        
        for fmt in formats:
            try:
                return datetime.strptime(time_str, fmt).time()
            except ValueError:
                continue
        
        return None
    
    @staticmethod
    def parse_datetime(datetime_str: str, formats: Optional[List[str]] = None) -> Optional[datetime]:
        """解析日期时间字符串"""
        if formats is None:
            formats = DateUtils.DATETIME_FORMATS
        
        for fmt in formats:
            try:
                return datetime.strptime(datetime_str, fmt)
            except ValueError:
                continue
        
        return None
    
    @staticmethod
    def format_date(dt: Union[datetime, date], format_str: str = '%Y-%m-%d') -> str:
        """格式化日期"""
        if isinstance(dt, datetime):
            dt = dt.date()
        return dt.strftime(format_str)
    
    @staticmethod
    def format_time(dt: Union[datetime, datetime.time], format_str: str = '%H:%M:%S') -> str:
        """格式化时间"""
        if isinstance(dt, datetime):
            dt = dt.time()
        return dt.strftime(format_str)
    
    @staticmethod
    def format_datetime(dt: datetime, format_str: str = '%Y-%m-%d %H:%M:%S') -> str:
        """格式化日期时间"""
        return dt.strftime(format_str)
    
    @staticmethod
    def add_days(dt: Union[datetime, date], days: int) -> Union[datetime, date]:
        """添加天数"""
        if isinstance(dt, date) and not isinstance(dt, datetime):
            return dt + timedelta(days=days)
        return dt + timedelta(days=days)
    
    @staticmethod
    def add_hours(dt: datetime, hours: int) -> datetime:
        """添加小时"""
        return dt + timedelta(hours=hours)
    
    @staticmethod
    def add_minutes(dt: datetime, minutes: int) -> datetime:
        """添加分钟"""
        return dt + timedelta(minutes=minutes)
    
    @staticmethod
    def add_seconds(dt: datetime, seconds: int) -> datetime:
        """添加秒数"""
        return dt + timedelta(seconds=seconds)
    
    @staticmethod
    def subtract_days(dt: Union[datetime, date], days: int) -> Union[datetime, date]:
        """减去天数"""
        return DateUtils.add_days(dt, -days)
    
    @staticmethod
    def subtract_hours(dt: datetime, hours: int) -> datetime:
        """减去小时"""
        return DateUtils.add_hours(dt, -hours)
    
    @staticmethod
    def subtract_minutes(dt: datetime, minutes: int) -> datetime:
        """减去分钟"""
        return DateUtils.add_minutes(dt, -minutes)
    
    @staticmethod
    def subtract_seconds(dt: datetime, seconds: int) -> datetime:
        """减去秒数"""
        return DateUtils.add_seconds(dt, -seconds)
    
    @staticmethod
    def get_date_range(start_date: date, end_date: date) -> List[date]:
        """获取日期范围"""
        dates = []
        current = start_date
        while current <= end_date:
            dates.append(current)
            current = DateUtils.add_days(current, 1)
        return dates
    
    @staticmethod
    def get_week_dates(target_date: Optional[date] = None) -> List[date]:
        """获取一周的日期"""
        if target_date is None:
            target_date = DateUtils.today()
        
        # 获取本周一
        monday = target_date - timedelta(days=target_date.weekday())
        return DateUtils.get_date_range(monday, DateUtils.add_days(monday, 6))
    
    @staticmethod
    def get_month_dates(target_date: Optional[date] = None) -> List[date]:
        """获取一个月的日期"""
        if target_date is None:
            target_date = DateUtils.today()
        
        # 获取本月第一天
        first_day = date(target_date.year, target_date.month, 1)
        
        # 获取下月第一天
        if target_date.month == 12:
            next_month = date(target_date.year + 1, 1, 1)
        else:
            next_month = date(target_date.year, target_date.month + 1, 1)
        
        # 获取本月最后一天
        last_day = DateUtils.subtract_days(next_month, 1)
        
        return DateUtils.get_date_range(first_day, last_day)
    
    @staticmethod
    def is_today(dt: Union[datetime, date]) -> bool:
        """判断是否是今天"""
        if isinstance(dt, datetime):
            dt = dt.date()
        return dt == DateUtils.today()
    
    @staticmethod
    def is_yesterday(dt: Union[datetime, date]) -> bool:
        """判断是否是昨天"""
        if isinstance(dt, datetime):
            dt = dt.date()
        return dt == DateUtils.subtract_days(DateUtils.today(), 1)
    
    @staticmethod
    def is_this_week(dt: Union[datetime, date]) -> bool:
        """判断是否是本周"""
        if isinstance(dt, datetime):
            dt = dt.date()
        week_dates = DateUtils.get_week_dates()
        return dt in week_dates
    
    @staticmethod
    def is_this_month(dt: Union[datetime, date]) -> bool:
        """判断是否是本月"""
        if isinstance(dt, datetime):
            dt = dt.date()
        today = DateUtils.today()
        return dt.year == today.year and dt.month == today.month
    
    @staticmethod
    def get_age(birth_date: date, target_date: Optional[date] = None) -> int:
        """计算年龄"""
        if target_date is None:
            target_date = DateUtils.today()
        
        age = target_date.year - birth_date.year
        if target_date.month < birth_date.month or (target_date.month == birth_date.month and target_date.day < birth_date.day):
            age -= 1
        return age
    
    @staticmethod
    def get_weekday_name(dt: Union[datetime, date], language: str = 'zh') -> str:
        """获取星期名称"""
        if isinstance(dt, datetime):
            dt = dt.date()
        
        weekday_names = {
            'zh': ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'],
            'en': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            'en_short': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        }
        
        names = weekday_names.get(language, weekday_names['en'])
        return names[dt.weekday()]
    
    @staticmethod
    def get_month_name(dt: Union[datetime, date], language: str = 'zh') -> str:
        """获取月份名称"""
        if isinstance(dt, datetime):
            dt = dt.date()
        
        month_names = {
            'zh': ['一月', '二月', '三月', '四月', '五月', '六月', 
                   '七月', '八月', '九月', '十月', '十一月', '十二月'],
            'en': ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'],
            'en_short': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        }
        
        names = month_names.get(language, month_names['en'])
        return names[dt.month - 1]
    
    @staticmethod
    def get_quarter(dt: Union[datetime, date]) -> int:
        """获取季度"""
        if isinstance(dt, datetime):
            dt = dt.date()
        return (dt.month - 1) // 3 + 1
    
    @staticmethod
    def get_quarter_dates(dt: Union[datetime, date]) -> tuple[date, date]:
        """获取季度开始和结束日期"""
        if isinstance(dt, datetime):
            dt = dt.date()
        
        quarter = DateUtils.get_quarter(dt)
        start_month = (quarter - 1) * 3 + 1
        start_date = date(dt.year, start_month, 1)
        
        if quarter == 4:
            end_date = date(dt.year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = date(dt.year, start_month + 3, 1) - timedelta(days=1)
        
        return start_date, end_date
    
    @staticmethod
    def is_weekend(dt: Union[datetime, date]) -> bool:
        """判断是否是周末"""
        if isinstance(dt, datetime):
            dt = dt.date()
        return dt.weekday() >= 5
    
    @staticmethod
    def is_workday(dt: Union[datetime, date]) -> bool:
        """判断是否是工作日"""
        return not DateUtils.is_weekend(dt)
    
    @staticmethod
    def get_workdays_between(start_date: date, end_date: date) -> int:
        """获取两个日期之间的工作日数量"""
        workdays = 0
        current = start_date
        
        while current <= end_date:
            if DateUtils.is_workday(current):
                workdays += 1
            current = DateUtils.add_days(current, 1)
        
        return workdays
    
    @staticmethod
    def convert_timezone(dt: datetime, from_tz: str, to_tz: str) -> datetime:
        """转换时区"""
        from_timezone = DateUtils.TIMEZONES.get(from_tz, pytz.UTC)
        to_timezone = DateUtils.TIMEZONES.get(to_tz, pytz.UTC)
        
        if dt.tzinfo is None:
            dt = from_timezone.localize(dt)
        
        return dt.astimezone(to_timezone)
    
    @staticmethod
    def extract_date_from_text(text: str) -> Optional[date]:
        """从文本中提取日期"""
        # 常见的日期模式
        patterns = [
            r'(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})[日]?',
            r'(\d{1,2})[-/月](\d{1,2})[日]?',
            r'(\d{4})年(\d{1,2})月(\d{1,2})日',
            r'(\d{1,2})月(\d{1,2})日',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                groups = match.groups()
                if len(groups) == 3:
                    year, month, day = int(groups[0]), int(groups[1]), int(groups[2])
                    if year < 100:  # 两位数年份，假设是20xx年
                        year += 2000
                    try:
                        return date(year, month, day)
                    except ValueError:
                        continue
                elif len(groups) == 2:
                    month, day = int(groups[0]), int(groups[1])
                    current_year = DateUtils.today().year
                    try:
                        return date(current_year, month, day)
                    except ValueError:
                        continue
        
        return None
    
    @staticmethod
    def get_relative_time(dt: datetime, reference: Optional[datetime] = None) -> str:
        """获取相对时间描述"""
        if reference is None:
            reference = DateUtils.now()
        
        if isinstance(dt, date) and not isinstance(dt, datetime):
            dt = datetime.combine(dt, datetime.min.time())
        
        diff = reference - dt
        
        if diff.total_seconds() < 0:
            # 未来时间
            diff = abs(diff)
            if diff.days > 0:
                return f"{diff.days}天后"
            elif diff.seconds >= 3600:
                hours = diff.seconds // 3600
                return f"{hours}小时后"
            elif diff.seconds >= 60:
                minutes = diff.seconds // 60
                return f"{minutes}分钟后"
            else:
                return "马上"
        else:
            # 过去时间
            if diff.days > 365:
                years = diff.days // 365
                return f"{years}年前"
            elif diff.days > 30:
                months = diff.days // 30
                return f"{months}个月前"
            elif diff.days > 0:
                return f"{diff.days}天前"
            elif diff.seconds >= 3600:
                hours = diff.seconds // 3600
                return f"{hours}小时前"
            elif diff.seconds >= 60:
                minutes = diff.seconds // 60
                return f"{minutes}分钟前"
            else:
                return "刚刚"


# 便捷函数
def now(timezone: str = 'UTC') -> datetime:
    """获取当前时间"""
    return DateUtils.now(timezone)


def today(timezone: str = 'UTC') -> date:
    """获取当前日期"""
    return DateUtils.today(timezone)


def parse_date(date_str: str) -> Optional[date]:
    """解析日期字符串"""
    return DateUtils.parse_date(date_str)


def format_date(dt: Union[datetime, date], format_str: str = '%Y-%m-%d') -> str:
    """格式化日期"""
    return DateUtils.format_date(dt, format_str)


def add_days(dt: Union[datetime, date], days: int) -> Union[datetime, date]:
    """添加天数"""
    return DateUtils.add_days(dt, days)


def is_today(dt: Union[datetime, date]) -> bool:
    """判断是否是今天"""
    return DateUtils.is_today(dt)


def get_relative_time(dt: datetime) -> str:
    """获取相对时间描述"""
    return DateUtils.get_relative_time(dt)
