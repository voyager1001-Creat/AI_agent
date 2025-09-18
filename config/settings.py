"""
配置模块
从 settings.json 读取配置信息
"""

import json
import os
from typing import Dict, Any

# 获取配置文件路径
CONFIG_FILE = os.path.join(os.path.dirname(__file__), 'settings.json')

def load_config() -> Dict[str, Any]:
    """加载配置文件"""
    try:
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"配置文件未找到: {CONFIG_FILE}")
        return {}
    except json.JSONDecodeError as e:
        print(f"配置文件格式错误: {e}")
        return {}

# 加载配置
_config = load_config()

# 导出配置变量
ollama_base_url = _config.get('ollama', {}).get('base_url', 'http://localhost:11434')
ollama_default_model = _config.get('ollama', {}).get('default_model', 'qwen2.5:1.5b')
ollama_timeout = _config.get('ollama', {}).get('timeout', 60)

index_tts_base_url = _config.get('index_tts', {}).get('base_url', 'http://localhost:8000')
index_tts_default_audio_prompt = _config.get('index_tts', {}).get('default_audio_prompt', 'examples/natural.wav')
index_tts_timeout = _config.get('index_tts', {}).get('timeout', 60)

# 情感音频文件配置
emotion_audio_files = {
    'natural': _config.get('index_tts', {}).get('default_emotion_natural', 'examples/natural.wav'),
    'care': _config.get('index_tts', {}).get('default_emotion_care', 'examples/care.wav'),
    'happy': _config.get('index_tts', {}).get('default_emotion_happy', 'examples/happy.wav'),
    'sad': _config.get('index_tts', {}).get('default_emotion_sad', 'examples/sad.wav'),
    'question': _config.get('index_tts', {}).get('default_emotion_question', 'examples/question.wav'),
    'surprised': _config.get('index_tts', {}).get('default_emotion_surprised', 'examples/surprise.wav'),
    'disgusted': _config.get('index_tts', {}).get('default_emotion_disgusted', 'examples/emo_hate.wav')
}

# 系统提示词配置
default_system_prompt = _config.get('system_prompt', {}).get('default_system_prompt', '....')