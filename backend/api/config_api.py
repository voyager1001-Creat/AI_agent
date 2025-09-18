from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
import json
import os
from pathlib import Path

router = APIRouter(prefix="/api/config", tags=["配置管理"])

CONFIG_FILE = Path(__file__).parent.parent.parent / "config" / "settings.json"

#获取配置文件路径
def get_config_file_path():
    file_path = Path(__file__).parent.parent.parent / "config" / "settings.json"
    return file_path  # 总是返回路径，不管文件是否存在

class OllamaConfig(BaseModel):
    base_url: str = "http://localhost:11434"
    default_model: str = "qwen2.5:1.5b"
    timeout: int = 60

class IndexTTSConfig(BaseModel):
    base_url: str = "http://localhost:8000"
    default_audio_prompt: str = "examples/natural.wav"#默认音频路径
    default_emotion_natural: str = "examples/natural.wav"#默认平淡音频路径
    default_emotion_care: str = "examples/care.wav"#默认关切音频路径
    default_emotion_happy: str = "examples/happy.wav"#默认开心音频路径
    #default_emotion_angry: str = "examples/2.wav"#默认愤怒音频路径
    default_emotion_sad: str = "examples/sad.wav"#默认悲伤音频路径
    default_emotion_question: str = "examples/question.wav"#默认疑问音频路径
    default_emotion_surprised: str = "examples/surprise.wav"#默认惊讶音频路径
    #default_emotion_disgusted: str = "examples/emo_hate.wav"#默认厌恶音频路径
    timeout: int = 60

class SystemConfig(BaseModel):
    ollama: OllamaConfig = Field(default_factory=OllamaConfig)
    index_tts: IndexTTSConfig = Field(default_factory=IndexTTSConfig)

#加载配置文件
def load_config() -> SystemConfig:
    try:
        config_file = get_config_file_path()
        if config_file.exists():
            with open(config_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                print(f"✅ 配置文件加载成功: {data}")
                try:
                    return SystemConfig(**data)
                except Exception as parse_error:
                    print(f"⚠️ 配置文件解析失败，使用默认配置: {parse_error}")
                    return SystemConfig()
        else:
            # 创建默认配置
            print("📝 配置文件不存在，创建默认配置")
            default_config = SystemConfig()
            save_config(default_config)
            return default_config
    except Exception as e:
        print(f"❌ 加载配置失败: {e}")
        print(f"❌ 错误类型: {type(e)}")
        import traceback
        traceback.print_exc()
        # 返回默认配置
        return SystemConfig()

#保存配置文件
def save_config(config: SystemConfig):
    """保存配置文件"""
    try:
        config_file = get_config_file_path()
        print(f"💾 尝试保存配置文件: {config_file}")
        print(f"💾 配置目录: {config_file.parent}")
        config_file.parent.mkdir(parents=True, exist_ok=True)
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(config.model_dump(), f, ensure_ascii=False, indent=4)
        print(f"💾 配置文件保存成功: {config_file}")
    except Exception as e:
        print(f"❌ 保存配置文件失败: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"保存配置文件失败: {str(e)}")

#获取配置文件
@router.get("/", response_model=SystemConfig)
async def get_config():
    try:
        return load_config()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取配置失败: {str(e)}")

#获取ollama配置
@router.get("/ollama")
async def get_ollama_config():
    try:
        return load_config().ollama
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取Ollama配置失败: {str(e)}")

        
#更新ollama配置
@router.put("/ollama")
async def update_ollama_config(config: OllamaConfig):
    try:
        current_config = load_config()
        current_config.ollama = config
        save_config(current_config)
        
        return {
            "success": True,
            "message": "Ollama配置已更新",
            "data": config
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新Ollama配置失败: {str(e)}")

#获取index-tts配置
@router.get("/index-tts")
async def get_index_tts_config():
    try:
        return load_config().index_tts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取IndexTTS配置失败: {str(e)}")

#更新index-tts配置
@router.put("/index-tts")
async def update_index_tts_config(config: IndexTTSConfig):
    try:
        current_config = load_config()
        current_config.index_tts = config
        save_config(current_config)
        return {
            "success": True,
            "message": "IndexTTS配置已更新",
            "data": config
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新IndexTTS配置失败: {str(e)}")