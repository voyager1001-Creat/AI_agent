from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import requests
import sys
import os
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from config.settings import ollama_base_url
from utils.logger_config import api_logger

router = APIRouter(prefix="/api/ollama", tags=["Ollama模型"])



class ModelInfoRequest(BaseModel):
    name: str
    size: str  # 保持为字符串，但会转换整数
    modified_at: str
    digest: str

class ModelInfoResponse(BaseModel):
    success: bool
    models: List[ModelInfoRequest]
    total: int
    timestamp: str
    error: Optional[str] = None

class UserRequest(BaseModel):
    model: str
    prompt: str
    stream: bool = False
    options: Optional[Dict[str, Any]] = None

class UserResponse(BaseModel):
    success: bool
    response: Optional[str] = None
    model: str
    prompt: str
    timestamp: str
    error: Optional[str] = None

@router.get("/models", response_model=ModelInfoResponse)
async def list_models():
    try:
        response = requests.get(f"{ollama_base_url}/api/tags", timeout=5)
        response.raise_for_status()
        api_logger.info(f"模型列表响应状态: {response.status_code}")
        
        if response.status_code != 200:
            api_logger.warning(f"Ollama服务响应异常: {response.status_code}")
            return ModelInfoResponse(
                success=False,
                models=[],
                total=0,
                timestamp=str(datetime.now()),
                error=f"Ollama服务响应异常: {response.status_code}"
            )
        
        data = response.json()
        api_logger.info(f"获取模型列表成功，原始数据: {data}")
        
        models = []
        # 检查数据结构
        if 'models' in data and isinstance(data['models'], list):
            for model in data['models']:
                if isinstance(model, dict):
                    # 转换大小为可读格式
                    raw_size = model.get('size', 0)
                    if isinstance(raw_size, int):
                        # 转换为人类可读的格式
                        if raw_size >= 1024**3:  # GB
                            size_str = f"{raw_size / (1024**3):.1f} GB"
                        elif raw_size >= 1024**2:  # MB
                            size_str = f"{raw_size / (1024**2):.1f} MB"
                        elif raw_size >= 1024:  # KB
                            size_str = f"{raw_size / 1024:.1f} KB"
                        else:
                            size_str = f"{raw_size} B"
                    else:
                        size_str = str(raw_size)
                    
                    model_info = ModelInfoRequest(
                        name=model.get('name', ''),
                        size=size_str,
                        modified_at=model.get('modified_at', ''),
                        digest=model.get('digest', '')
                    )
                    models.append(model_info)
                    api_logger.debug(f"添加模型: {model_info.name} ({model_info.size})")
                else:
                    api_logger.warning(f"跳过无效模型数据: {model}")
        else:
            api_logger.warning(f"响应数据中没有models字段或格式不正确: {data}")
        
        api_logger.info(f"总共找到 {len(models)} 个模型")
        return ModelInfoResponse(
            success=True,
            models=models,
            total=len(models),
            timestamp=str(datetime.now())
        )
        
    except Exception as e:
        api_logger.error(f"获取模型列表时发生异常: {e}", exc_info=True)
        return ModelInfoResponse(
            success=False,
            models=[],
            total=0,
            timestamp=str(datetime.now()),
            error=str(e)
        )

@router.post("/chat", response_model=UserResponse)
async def chat(request: UserRequest):
    try:
        # 构建请求数据
        request_data = {
            "model": request.model,
            "prompt": request.prompt,
            "stream": request.stream
        }
        if request.options:
            request_data["options"] = request.options
        
        # 发送请求到Ollama
        response = requests.post(f"{ollama_base_url}/api/chat", json=request_data, timeout=60)
        response.raise_for_status()
        return UserResponse(success=True, response=response.json(), model=request.model, prompt=request.prompt, timestamp=str(datetime.now()))
    except Exception as e:
        api_logger.error(f"生成文本时发生异常: {e}", exc_info=True)
        return UserResponse(success=False, error=str(e), timestamp=str(datetime.now()))

#获取当前默认模型
@router.get("/default-model")
async def get_default_model():
    try:
        from .config_api import load_config
        config = load_config()
        return {
            'success': True,
            'default_model': config.ollama.default_model
        }
    except Exception as e:
        api_logger.error(f"获取默认模型失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"获取默认模型失败: {str(e)}")

@router.post("/set-default/{model_name}")
async def set_default_model(model_name: str):
    # 验证模型是否存在
    model_info_response = requests.post(f"{ollama_base_url}/api/show", json={"name": model_name}, timeout=10)
    if model_info_response.status_code != 200:
            api_logger.error(f"模型 {model_name} 不存在，状态码: {model_info_response.status_code}")
            api_logger.error(f"响应内容: {model_info_response.text}")
            raise HTTPException(status_code=404, detail=f"模型 {model_name} 不存在")
    # 更新配置文件
    try:
            from .config_api import load_config, save_config
            config = load_config()
            config.ollama.default_model = model_name
            save_config(config)
            api_logger.info(f"配置保存成功")
    except Exception as config_error:
        api_logger.error(f"配置文件操作失败: {config_error}", exc_info=True)
        # 配置文件更新失败，返回错误
        raise HTTPException(status_code=500, detail=f"配置文件更新失败: {config_error}")
    return {
            'success': True,
            'message': f'默认模型已设置为 {model_name}',
            'default_model': model_name
    }

    
