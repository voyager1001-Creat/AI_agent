import json
import requests
from typing import Dict, List, Optional, Any
from datetime import datetime
import sys
import os
import re

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from config.settings import ollama_base_url, default_system_prompt
from core.services.chat_service import chat_service
from core.services.system_prompt_service import system_prompt_service


class AIAgent:
    """AI智能助手核心类"""

    # 初始化
    def __init__(self, user_id: int = 1):
        self.user_id = user_id
        self.conversation_manager = chat_service  # 直接使用chat_service作为对话管理器
        self.ollama_url = ollama_base_url
        self.active_system_prompt = system_prompt_service.get_active_system_prompt(self.user_id)
        self.default_system_prompt = default_system_prompt
   
    def _extract_time_info(self, message: str) -> Optional[Dict[str, str]]:
        """从消息中提取时间信息"""
        time_patterns = [
            (r"今天|现在|当前", "today"),
            (r"明天|明日", "tomorrow"),
            (r"后天|后日", "day_after_tomorrow"),
            (r"昨天|昨日", "yesterday"),
            (r"下周|下个星期", "next_week")
        ]
        
        for pattern, time_type in time_patterns:
            if re.search(pattern, message):
                return {
                    "type": time_type,
                    "value": pattern
                }
        
        return None

    def _build_context_with_active_system_prompt(self, message: str) -> Dict[str, str]:
        """构建AI推理的上下文"""
        if self.active_system_prompt:
            active_system_prompt = self.active_system_prompt.content if hasattr(self.active_system_prompt, 'content') else str(self.active_system_prompt)
        else:
            active_system_prompt = self.default_system_prompt

        # 构建上下文字典
        context = {
            "user_prompt": message,
            "system_prompt": active_system_prompt
        }

        return context

    def _generate_response(self, context: Dict[str, str]) -> str:
        """使用Ollama生成回复"""           
        try:
            # 构建请求数据
            request_data = {
                "model": "qwen2.5:1.5b",  # 使用可用的模型
                "prompt": context["user_prompt"],  # Ollama使用prompt字段
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "num_predict": 500  # Ollama使用num_predict而不是max_tokens
                }
            }
            
            # 如果有系统提示词，添加到请求中
            if context.get("system_prompt"):
                request_data["system"] = context["system_prompt"]
            
            # 发送请求到Ollama
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json=request_data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "抱歉，我现在无法生成回复。")
            else:
                # 如果Ollama不可用，返回默认回复
                return "抱歉，AI模型暂时不可用，请稍后再试。"
                
        except Exception as e:
            print(f"调用Ollama失败: {e}")
            # 返回默认回复
            return "抱歉，AI服务暂时不可用，请稍后再试。"
    
    def chat(self, message: str) -> str:
        """处理用户消息并生成回复"""
        try:
            # 构建上下文
            context = self._build_context_with_active_system_prompt(message)
            
            # 生成回复
            response = self._generate_response(context)
            
            # 这里可以添加消息保存逻辑
            # self.conversation_manager.add_message(...)
            
            return response
            
        except Exception as e:
            print(f"处理聊天消息失败: {e}")
            return "抱歉，处理您的消息时出现错误，请稍后再试。"





