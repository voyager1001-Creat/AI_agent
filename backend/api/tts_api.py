import requests
from api.config_api import load_config
from fastapi import APIRouter
from pydantic import BaseModel
from pathlib import Path
import sys
import os

# 添加emotion_model目录到Python路径
emotion_model_dir = Path(__file__).parent.parent / "emotion_model"
if str(emotion_model_dir) not in sys.path:
    sys.path.insert(0, str(emotion_model_dir))

# 添加backend目录到Python路径
backend_dir = Path(__file__).parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

try:
    from emotion_model.emotion_enhance import predict_emotion
except ImportError as e:
    print(f"⚠️ 无法导入emotion_enhance模块: {e}")
    # 提供一个备用函数
    def predict_emotion(text):
        """备用情感分析函数"""
        # 简单的关键词匹配
        emotion_keywords = {
            "开心": ["开心", "高兴", "快乐", "兴奋", "愉快", "😊", "😄", "😃"],
            "悲伤": ["悲伤", "难过", "伤心", "痛苦", "失落", "😢", "😭", "😔"],
            "疑问": ["什么", "怎么", "为什么", "如何", "?", "？", "吗", "呢"],
            "惊讶": ["惊讶", "吃惊", "震惊", "意外", "😮", "😲", "哇"],
            "关切": ["关心", "担心", "关爱", "照顾", "注意", "小心"]
        }
        
        text_lower = text.lower()
        for emotion, keywords in emotion_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    return emotion
        
        return "平淡"  # 默认返回平淡情感

router = APIRouter(prefix="/api/tts", tags=["tts模型"])

# 延迟加载配置，避免在模块导入时就执行
def get_audio_prompt():
    return load_config().index_tts.default_audio_prompt

def get_emotion_audio(text):
    """
    根据文本情感获取对应的情感音频文件路径
    
    Args:
        text: 输入文本
        
    Returns:
        tuple: (emotion_text, emo_audio_prompt)
    """
    try:
        emotion_text = predict_emotion(text)
        config = load_config().index_tts
        
        # 根据情感类型选择对应的情感音频文件
        emotion_audio_map = {
            "平淡": None,
            "关切": config.default_emotion_care,
            "开心": config.default_emotion_happy,
            #"愤怒": config.default_emotion_angry， 
            "悲伤": config.default_emotion_sad,
            "疑问": config.default_emotion_question,
            "惊讶": config.default_emotion_surprised,
            #"厌恶": config.default_emotion_disgusted 
        }
        
        emo_audio_prompt = emotion_audio_map.get(emotion_text)
        return emotion_text, emo_audio_prompt
        
    except Exception as e:
        print(f"❌ 情感分析失败: {e}")
        # 如果情感分析失败，使用平淡情感（不需要emo_audio_prompt）
        return "平淡", None

def call_indextts(text, audio_prompt=None, emo_audio_prompt=None, output_path=None):
    """
    调用IndexTTS进行语音合成
    
    Args:
        text: 要合成的文本
        audio_prompt: 说话人音频路径，如果为None则使用默认配置
        emo_audio_prompt: 情感音频路径，如果为None则使用默认配置
        output_path: 输出文件路径，如果为None则使用默认配置
    
    Returns:
        API响应结果
    """
    try:
        # 如果没有指定说话人音频，使用默认配置
        if audio_prompt is None:
            audio_prompt = get_audio_prompt()
        
        # 根据情感获取情感音频
        emotion_text, emo_audio_prompt = get_emotion_audio(text)
        
        if output_path is None:
            from datetime import datetime
            output_path = f"outputs/{datetime.now().strftime('%Y%m%d%H%M%S')}.wav"
        
        # 构建请求数据
        request_data = {
            "text": text,
            "audio_prompt": audio_prompt,  # 说话人音频
            "emo_audio_prompt": None,
            "output_path": output_path
        }
        
        # 如果有情感音频，添加emo_audio_prompt参数
        if emo_audio_prompt is not None:
            request_data["emo_audio_prompt"] = emo_audio_prompt
            print(f"🎭 检测到情感: {emotion_text}")
            print(f"🎵 使用情感音频: {emo_audio_prompt}")
        else:
            print(f"🎭 检测到情感: {emotion_text} (使用默认合成)")
        
        print(f"🎵 说话人音频: {audio_prompt}")
        print(f"📤 发送TTS请求: {request_data}")
        
        response = requests.post("http://localhost:8000/tts/generate", json=request_data)
        response.raise_for_status()
        
        result = response.json()       
        return result
        
    except requests.exceptions.RequestException as e:
        return {"error": f"TTS API调用失败: {str(e)}", "success": False}
    except Exception as e:
        return {"error": f"未知错误: {str(e)}", "success": False}

class TTSRequest(BaseModel):
    text: str
    audio_prompt: str = None
    emo_audio_prompt: str = None
    output_path: str = None

@router.post("/synthesize")
async def synthesize_with_emotion(request: TTSRequest):
    """
    带情感分析的语音合成API
    
    Args:
        request: TTS请求，包含文本和音频参数
        
    Returns:
        合成结果
    """
    try:
        result = call_indextts(request.text, request.audio_prompt, request.emo_audio_prompt, request.output_path)
        
        # 如果TTS引擎返回成功，需要构造正确的响应格式
        if result.get("success", False):
            # TTS引擎返回的output_path是完整的文件路径，需要提取文件名
            output_path = result.get("output_path", "")
            if output_path:
                # 提取文件名（去掉路径前缀）
                filename = os.path.basename(output_path)
            else:
                filename = ""
            
            return {
                "success": True,
                "audio_url": f"/api/tts/download/{filename}",
                "output_path": filename,
                "message": "TTS合成成功"
            }
        else:
            return {
                "success": False,
                "error": result.get("error", "TTS合成失败")
            }
    except Exception as e:
        return {
            "success": False,
            "error": f"TTS API调用失败: {str(e)}"
        }

@router.get("/emotions")
async def get_emotions():
    """获取可用的情感选项"""
    try:
        response = requests.get("http://localhost:8000/tts/emotions", timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": f"获取情感选项失败: {str(e)}", "success": False}

@router.get("/voices")
async def get_voices():
    """获取可用参考音频"""
    try:
        # 这里可以返回配置中的音频文件列表
        config = load_config().index_tts
        return {
            "success": True,
            "voices": [
                {"name": "natural", "path": config.default_emotion_natural},
                {"name": "care", "path": config.default_emotion_care},
                {"name": "happy", "path": config.default_emotion_happy},
                {"name": "sad", "path": config.default_emotion_sad},
                {"name": "question", "path": config.default_emotion_question},
                {"name": "surprised", "path": config.default_emotion_surprised},
            ]
        }
    except Exception as e:
        return {"error": f"获取参考音频失败: {str(e)}", "success": False}

@router.get("/files")
async def get_audio_files():
    """获取音频文件列表"""
    try:
        import os
        from pathlib import Path
        
        # 获取输出目录
        output_dir = Path(__file__).parent.parent / "index-tts" / "outputs"
        if not output_dir.exists():
            return {"success": True, "files": []}
        
        files = []
        for file_path in output_dir.glob("*.wav"):
            files.append({
                "name": file_path.name,
                "size": file_path.stat().st_size,
                "created_at": file_path.stat().st_ctime
            })
        
        return {"success": True, "files": files}
    except Exception as e:
        return {"error": f"获取音频文件列表失败: {str(e)}", "success": False}

@router.get("/download/{filename}")
async def download_audio(filename: str):
    """下载音频文件"""
    try:
        from fastapi.responses import FileResponse
        from pathlib import Path
        
        output_dir = Path(__file__).parent.parent / "index-tts" / "outputs"
        file_path = output_dir / filename
        
        if not file_path.exists():
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="音频文件不存在")
        
        return FileResponse(file_path, media_type="audio/wav", filename=filename)
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"下载音频文件失败: {str(e)}")

@router.delete("/delete/{filename}")
async def delete_audio(filename: str):
    """删除音频文件"""
    try:
        import os
        from pathlib import Path
        
        output_dir = Path(__file__).parent.parent / "index-tts" / "outputs"
        file_path = output_dir / filename
        
        if not file_path.exists():
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="音频文件不存在")
        
        os.remove(file_path)
        return {"success": True, "message": f"音频文件 {filename} 删除成功"}
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"删除音频文件失败: {str(e)}")

@router.get("/health")
async def health_check():
    """TTS服务健康检查"""
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        response.raise_for_status()
        return {"success": True, "status": "healthy", "tts_engine": "running"}
    except Exception as e:
        return {"success": False, "status": "unhealthy", "error": str(e)}

@router.get("/status")
async def get_status():
    """获取TTS服务状态"""
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        response.raise_for_status()
        return {
            "success": True,
            "tts_engine": "running",
            "port": 8000,
            "base_url": "http://localhost:8000"
        }
    except Exception as e:
        return {"success": False, "tts_engine": "stopped", "error": str(e)}