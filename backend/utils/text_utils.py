"""
文本工具
提供文本处理功能
"""

import re
import jieba
import jieba.posseg as pseg
from typing import List, Dict, Any, Optional, Tuple
import logging

logger = logging.getLogger(__name__)


class TextUtils:
    """文本工具类"""
    
    def __init__(self):
        # 初始化jieba
        jieba.initialize()
        
        # 情感关键词
        self.emotion_keywords = {
            'joy': ['开心', '快乐', '高兴', '兴奋', '愉快', '欢乐', '喜悦', '幸福', '满意', '满足'],
            'sadness': ['悲伤', '难过', '伤心', '痛苦', '沮丧', '失望', '绝望', '孤独', '寂寞', '忧郁'],
            'anger': ['愤怒', '生气', '恼火', '暴躁', '愤怒', '暴怒', '气愤', '恼火', '烦躁', '不满'],
            'fear': ['害怕', '恐惧', '担心', '焦虑', '紧张', '不安', '恐慌', '惊慌', '畏惧', '忧虑'],
            'surprise': ['惊讶', '震惊', '意外', '吃惊', '惊奇', '诧异', '愕然', '目瞪口呆', '难以置信'],
            'disgust': ['厌恶', '恶心', '反感', '讨厌', '憎恶', '嫌弃', '鄙视', '蔑视', '不屑'],
            'neutral': ['平静', '冷静', '淡定', '从容', '镇定', '沉着', '稳重', '平和', '温和']
        }
        
        # 停用词
        self.stop_words = {
            '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'
        }
    
    def clean_text(self, text: str) -> str:
        """清理文本"""
        if not text or not isinstance(text, str):
            return ""
        
        # 移除HTML标签
        text = re.sub(r'<[^>]+>', '', text)
        
        # 移除多余的空白字符
        text = re.sub(r'\s+', ' ', text)
        
        # 移除特殊字符
        text = re.sub(r'[^\w\s\u4e00-\u9fff]', '', text)
        
        return text.strip()
    
    def extract_keywords(self, text: str, top_k: int = 10, use_pos: bool = True) -> List[str]:
        """提取关键词"""
        if not text:
            return []
        
        try:
            if use_pos:
                # 使用词性标注
                words = pseg.cut(text)
                # 只保留名词、动词、形容词
                keywords = [word.word for word in words if word.flag.startswith(('n', 'v', 'a'))]
            else:
                # 使用jieba分词
                keywords = jieba.cut(text)
            
            # 过滤停用词和短词
            keywords = [word for word in keywords if word not in self.stop_words and len(word) > 1]
            
            # 统计词频
            word_freq = {}
            for word in keywords:
                word_freq[word] = word_freq.get(word, 0) + 1
            
            # 按频率排序并返回top_k个
            sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
            return [word for word, freq in sorted_words[:top_k]]
            
        except Exception as e:
            logger.error(f"提取关键词失败: {e}")
            return []
    
    def calculate_text_similarity(self, text1: str, text2: str) -> float:
        """计算文本相似度（基于Jaccard相似度）"""
        if not text1 or not text2:
            return 0.0
        
        try:
            # 分词
            words1 = set(jieba.cut(text1))
            words2 = set(jieba.cut(text2))
            
            # 计算Jaccard相似度
            intersection = len(words1.intersection(words2))
            union = len(words1.union(words2))
            
            if union == 0:
                return 0.0
            
            return intersection / union
            
        except Exception as e:
            logger.error(f"计算文本相似度失败: {e}")
            return 0.0
    
    def extract_emotions(self, text: str) -> Dict[str, float]:
        """提取情感"""
        if not text:
            return {}
        
        try:
            emotions = {}
            text_lower = text.lower()
            
            for emotion, keywords in self.emotion_keywords.items():
                count = 0
                for keyword in keywords:
                    if keyword in text_lower:
                        count += 1
                
                if count > 0:
                    # 计算情感强度（基于关键词出现次数）
                    emotions[emotion] = min(count / len(keywords), 1.0)
            
            return emotions
            
        except Exception as e:
            logger.error(f"提取情感失败: {e}")
            return {}
    
    def summarize_text(self, text: str, max_length: int = 100) -> str:
        """文本摘要"""
        if not text:
            return ""
        
        try:
            # 简单的摘要方法：取前几个句子
            sentences = re.split(r'[。！？]', text)
            sentences = [s.strip() for s in sentences if s.strip()]
            
            summary = ""
            for sentence in sentences:
                if len(summary + sentence) <= max_length:
                    summary += sentence + "。"
                else:
                    break
            
            return summary if summary else text[:max_length]
            
        except Exception as e:
            logger.error(f"文本摘要失败: {e}")
            return text[:max_length] if text else ""
    
    def extract_entities(self, text: str) -> Dict[str, List[str]]:
        """提取实体"""
        if not text:
            return {}
        
        try:
            entities = {
                'persons': [],
                'locations': [],
                'organizations': [],
                'dates': [],
                'numbers': []
            }
            
            # 使用jieba的词性标注
            words = pseg.cut(text)
            
            for word, flag in words:
                if flag.startswith('nr'):  # 人名
                    entities['persons'].append(word)
                elif flag.startswith('ns'):  # 地名
                    entities['locations'].append(word)
                elif flag.startswith('nt'):  # 机构名
                    entities['organizations'].append(word)
                elif flag.startswith('t'):  # 时间词
                    entities['dates'].append(word)
                elif flag.startswith('m'):  # 数词
                    entities['numbers'].append(word)
            
            # 去重
            for key in entities:
                entities[key] = list(set(entities[key]))
            
            return entities
            
        except Exception as e:
            logger.error(f"提取实体失败: {e}")
            return {}
    
    def normalize_text(self, text: str) -> str:
        """文本标准化"""
        if not text:
            return ""
        
        try:
            # 全角转半角
            text = self._full_to_half(text)
            
            # 繁体转简体
            # 这里可以集成opencc等库
            
            # 统一标点符号
            text = re.sub(r'[，,]', '，', text)
            text = re.sub(r'[。.]', '。', text)
            text = re.sub(r'[！!]', '！', text)
            text = re.sub(r'[？?]', '？', text)
            
            return text
            
        except Exception as e:
            logger.error(f"文本标准化失败: {e}")
            return text
    
    def _full_to_half(self, text: str) -> str:
        """全角转半角"""
        result = ""
        for char in text:
            code = ord(char)
            if code == 0x3000:  # 全角空格
                result += chr(0x0020)
            elif 0xFF01 <= code <= 0xFF5E:  # 全角字符
                result += chr(code - 0xFEE0)
            else:
                result += char
        return result
    
    def count_words(self, text: str) -> int:
        """统计词数"""
        if not text:
            return 0
        
        try:
            words = list(jieba.cut(text))
            return len([w for w in words if w not in self.stop_words and len(w.strip()) > 0])
        except Exception as e:
            logger.error(f"统计词数失败: {e}")
            return len(text)
    
    def count_characters(self, text: str) -> int:
        """统计字符数"""
        if not text:
            return 0
        
        return len(text)
    
    def get_reading_time(self, text: str, words_per_minute: int = 200) -> float:
        """估算阅读时间（分钟）"""
        word_count = self.count_words(text)
        return word_count / words_per_minute
    
    def extract_hashtags(self, text: str) -> List[str]:
        """提取话题标签"""
        if not text:
            return []
        
        try:
            hashtags = re.findall(r'#([^#\s]+)', text)
            return list(set(hashtags))
        except Exception as e:
            logger.error(f"提取话题标签失败: {e}")
            return []
    
    def extract_urls(self, text: str) -> List[str]:
        """提取URL"""
        if not text:
            return []
        
        try:
            urls = re.findall(r'https?://[^\s]+', text)
            return list(set(urls))
        except Exception as e:
            logger.error(f"提取URL失败: {e}")
            return []
    
    def extract_emails(self, text: str) -> List[str]:
        """提取邮箱地址"""
        if not text:
            return []
        
        try:
            emails = re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
            return list(set(emails))
        except Exception as e:
            logger.error(f"提取邮箱失败: {e}")
            return []
    
    def extract_phone_numbers(self, text: str) -> List[str]:
        """提取手机号码"""
        if not text:
            return []
        
        try:
            phones = re.findall(r'1[3-9]\d{9}', text)
            return list(set(phones))
        except Exception as e:
            logger.error(f"提取手机号码失败: {e}")
            return []
    
    def is_chinese(self, text: str) -> bool:
        """判断是否包含中文"""
        if not text:
            return False
        
        return bool(re.search(r'[\u4e00-\u9fff]', text))
    
    def is_english(self, text: str) -> bool:
        """判断是否包含英文"""
        if not text:
            return False
        
        return bool(re.search(r'[a-zA-Z]', text))
    
    def get_language_mix(self, text: str) -> Dict[str, float]:
        """获取语言混合比例"""
        if not text:
            return {}
        
        try:
            total_chars = len(text)
            if total_chars == 0:
                return {}
            
            chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', text))
            english_chars = len(re.findall(r'[a-zA-Z]', text))
            digit_chars = len(re.findall(r'\d', text))
            other_chars = total_chars - chinese_chars - english_chars - digit_chars
            
            return {
                'chinese': chinese_chars / total_chars,
                'english': english_chars / total_chars,
                'digits': digit_chars / total_chars,
                'others': other_chars / total_chars
            }
            
        except Exception as e:
            logger.error(f"获取语言混合比例失败: {e}")
            return {}


# 便捷函数
def clean_text(text: str) -> str:
    """清理文本"""
    return TextUtils().clean_text(text)


def extract_keywords(text: str, top_k: int = 10) -> List[str]:
    """提取关键词"""
    return TextUtils().extract_keywords(text, top_k)


def calculate_text_similarity(text1: str, text2: str) -> float:
    """计算文本相似度"""
    return TextUtils().calculate_text_similarity(text1, text2)


def extract_emotions(text: str) -> Dict[str, float]:
    """提取情感"""
    return TextUtils().extract_emotions(text)


def summarize_text(text: str, max_length: int = 100) -> str:
    """文本摘要"""
    return TextUtils().summarize_text(text, max_length)


def extract_entities(text: str) -> Dict[str, List[str]]:
    """提取实体"""
    return TextUtils().extract_entities(text)


def normalize_text(text: str) -> str:
    """文本标准化"""
    return TextUtils().normalize_text(text)


def count_words(text: str) -> int:
    """统计词数"""
    return TextUtils().count_words(text)


def is_chinese(text: str) -> bool:
    """判断是否包含中文"""
    return TextUtils().is_chinese(text)
