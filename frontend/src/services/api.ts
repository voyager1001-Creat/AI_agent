// API服务层 - 与后端API对接
import { 
   ChatResponse, 
   TTSRequest, 
   TTSResponse
} from '../types/api';

// API基础配置
const API_BASE_URL = '/api';
const WS_BASE_URL = '/ws';

// 通用API请求函数
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API请求失败 ${endpoint}:`, error);
    throw error;
  }
}

// ==================== 聊天API ====================
export const chatAPI = {
  // 发送消息
  async sendMessage(message: string, _messageType: string = 'text'): Promise<ChatResponse> {
    return apiRequest<ChatResponse>('/chat/send', {
      method: 'POST',
      body: JSON.stringify({
        message: message,
        user_id: 1,
        conversation_id: null,
        system_prompt: null
      })
    });
  },

  // 获取对话历史
  async getChatHistory(limit: number = 20, conversationId?: string | number): Promise<any> {
    let url = `/chat/history?limit=${limit}`;
    if (conversationId) {
      url += `&conversation_id=${conversationId}`;
    }
    return apiRequest(url);
  },

  // 获取最新消息（用于初始加载）
  async getLatestMessages(limit: number = 15, conversationId?: string | number): Promise<any> {
    let url = `/chat/history?limit=${limit}`;
    if (conversationId) {
      url += `&conversation_id=${conversationId}`;
    }
    return apiRequest(url);
  },

  // 获取更早的消息（用于滚动加载）
  async getOlderMessages(limit: number = 15, conversationId: string | number, beforeMessageId: number): Promise<any> {
    const url = `/chat/history/older?limit=${limit}&conversation_id=${conversationId}&before_message_id=${beforeMessageId}`;
    return apiRequest(url);
  },

  // 获取对话列表
  async getConversations(userId: number = 1, limit: number = 20, offset: number = 0): Promise<any> {
    return apiRequest(`/chat/conversations?user_id=${userId}&limit=${limit}&offset=${offset}`);
  },

  // 开始新对话
  async startNewConversation(title?: string): Promise<any> {
    return apiRequest(`/chat/conversations/new`, {
      method: 'POST',
      body: JSON.stringify({
        title: title || "新对话"
      })
    });
  },

  // 继续上次对话
  async continueLastConversation(): Promise<any> {
    return apiRequest('/chat/conversations/continue', {
      method: 'POST',
      body: JSON.stringify({})
    });
  },

  // 获取当前对话
  async getCurrentConversation(): Promise<any> {
    return apiRequest('/chat/conversations/current');
  },

  // 获取指定对话
  async getConversation(sessionId: string): Promise<any> {
    return apiRequest(`/chat/conversations/${sessionId}`);
  },

  // 更新对话标题
  async updateConversationTitle(sessionId: string, title: string): Promise<any> {
    return apiRequest(`/chat/conversations/${sessionId}/title`, {
      method: 'PUT',
      body: JSON.stringify({ title })
    });
  },

  // 删除对话
  async deleteConversation(sessionId: string): Promise<any> {
    return apiRequest(`/chat/conversations/${sessionId}`, {
      method: 'DELETE'
    });
  },

  // 导出对话
  async exportConversation(sessionId: string, format: string = 'json'): Promise<any> {
    return apiRequest(`/chat/conversations/${sessionId}/export?format=${format}`);
  },

  // 清空当前对话
  async clearCurrentConversation(): Promise<any> {
    return apiRequest('/chat/clear', {
      method: 'POST'
    });
  },
  // 获取API使用建议
  async getAPISuggestions(message: string): Promise<any> {
    return apiRequest('/chat/external-api/suggestions', {
      method: 'POST',
      body: JSON.stringify({
        message: message
      })
    });
  }
};

// ==================== TTS API ====================
export const ttsAPI = {
  // 生成TTS语音
  async generateTTS(request: TTSRequest): Promise<TTSResponse> {
    return apiRequest('/tts/synthesize', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  },

  // 下载音频文件 - 通过后端API代理
  async downloadAudio(filename: string): Promise<Blob> {
    const response = await fetch(`/api/tts/download/${filename}`);
    if (!response.ok) {
      throw new Error(`下载失败: ${response.statusText}`);
    }
    return response.blob();
  },

  // 获取音频文件列表 - 通过后端API
  async getAudioFiles(): Promise<any> {
    return apiRequest('/tts/files');
  },

  // 删除音频文件 - 通过后端API
  async deleteAudio(filename: string): Promise<any> {
    return apiRequest(`/tts/delete/${filename}`, {
      method: 'DELETE'
    });
  },

  // 获取可用参考音频 - 通过后端API
  async getAvailableVoices(): Promise<any> {
    return apiRequest('/tts/voices');
  },

  // 上传参考音频 - 通过后端API
  async uploadVoice(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/tts/upload-voice', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`上传失败: ${response.statusText}`);
    }
    
    return response.json();
  },

  // 健康检查 - 通过后端API
  async healthCheck(): Promise<any> {
    return apiRequest('/tts/health');
  },

  // 获取服务状态 - 通过后端API
  async getStatus(): Promise<any> {
    return apiRequest('/tts/status');
  },

};



// ==================== Ollama模型API ====================
export const ollamaAPI = {
  // 获取可用模型列表
  async getModels(): Promise<any> {
    return apiRequest('/ollama/models');
  },

  // 生成文本
  async generateText(model: string, prompt: string, stream: boolean = false, options?: any): Promise<any> {
    return apiRequest('/ollama/generate', {
      method: 'POST',
      body: JSON.stringify({
        model,
        prompt,
        stream,
        options
      })
    });
  },

  // 获取模型信息
  async getModelInfo(modelName: string): Promise<any> {
    return apiRequest(`/ollama/model/${modelName}`);
  },

  // 拉取模型
  async pullModel(modelName: string): Promise<any> {
    return apiRequest(`/ollama/pull/${modelName}`, {
      method: 'POST'
    });
  },

  // 删除模型
  async deleteModel(modelName: string): Promise<any> {
    return apiRequest(`/ollama/model/${modelName}`, {
      method: 'DELETE'
    });
  },

  // 获取服务状态
  async getStatus(): Promise<any> {
    return apiRequest('/ollama/status');
  },

  // 与模型对话
  async chatWithModel(model: string, messages: any[], stream: boolean = false, options?: any): Promise<any> {
    return apiRequest('/ollama/chat', {
      method: 'POST',
      body: JSON.stringify({
        model,
        messages,
        stream,
        options
      })
    });
  },

  // 设置默认模型
  async setDefaultModel(modelName: string): Promise<any> {
    return apiRequest(`/ollama/set-default/${modelName}`, {
      method: 'POST'
    });
  },

  // 获取默认模型
  async getDefaultModel(): Promise<any> {
    return apiRequest('/ollama/default-model');
  },
};

// ==================== 配置管理API ====================
export const configAPI = {
  // 获取所有配置
  async getConfig(): Promise<any> {
    return apiRequest('/config/');
  },

  // 获取Ollama配置
  async getOllamaConfig(): Promise<any> {
    return apiRequest('/config/ollama');
  },

  // 更新Ollama配置
  async updateOllamaConfig(config: any): Promise<any> {
    return apiRequest('/config/ollama', {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  },

  // 获取TTS配置
  async getTTSConfig(): Promise<any> {
    return apiRequest('/config/index-tts');
  },

  // 更新TTS配置
  async updateTTSConfig(config: any): Promise<any> {
    return apiRequest('/config/index-tts', {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  },

  // 获取用户配置
  async getUserConfig(): Promise<any> {
    return apiRequest('/config/user');
  },

  // 更新用户配置
  async updateUserConfig(config: any): Promise<any> {
    return apiRequest('/config/user', {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  },

  // 重置配置
  async resetConfig(): Promise<any> {
    return apiRequest('/config/reset', {
      method: 'POST'
    });
  },

  // 获取模型列表
  async getModels(): Promise<any> {
    return apiRequest('/ollama/models');
  },

  // 测试TTS连接
  async testTTSConnection(): Promise<any> {
    return apiRequest('/tts/health');
  }
};

// ==================== WebSocket连接 ====================
export class WebSocketService {
  private ws: WebSocket | null = null;
  private messageHandlers: ((data: any) => void)[] = [];
  private errorHandlers: ((error: any) => void)[] = [];

  connect(sessionId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 如果已经有连接，先断开
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.close(1000, '重新连接')
          this.ws = null
        }
        
        // 添加连接超时
        const connectionTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
            this.ws.close(1000, '连接超时')
            reject(new Error('WebSocket连接超时'))
          }
        }, 10000) // 10秒超时
        
        const url = sessionId 
          ? `${WS_BASE_URL}?session_id=${sessionId}`
          : WS_BASE_URL;
        
        console.log('尝试连接WebSocket:', url)
        this.ws = new WebSocket(url);
        
        this.ws.onopen = () => {
          clearTimeout(connectionTimeout)
          console.log('WebSocket连接已建立');
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.messageHandlers.forEach(handler => handler(data));
          } catch (error) {
            console.error('WebSocket消息解析失败:', error);
          }
        };
        
        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout)
          console.error('WebSocket错误:', error);
          this.errorHandlers.forEach(handler => handler(error));
          reject(error);
        };
        
        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout)
          console.log('WebSocket连接已关闭', event.code, event.reason);
          
          // 分析关闭原因
          switch (event.code) {
            case 1000:
              console.log('WebSocket正常关闭')
              break
            case 1001:
              console.warn('WebSocket端点离开')
              break
            case 1002:
              console.error('WebSocket协议错误')
              break
            case 1003:
              console.error('WebSocket不支持的数据类型')
              break
            case 1005:
              console.error('WebSocket没有状态码 - 连接被意外关闭')
              break
            case 1006:
              console.error('WebSocket异常关闭')
              break
            case 1009:
              console.error('WebSocket消息过大')
              break
            case 1011:
              console.error('WebSocket服务器错误')
              break
            default:
              console.warn('WebSocket未知关闭代码:', event.code)
          }
        };
        
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket未连接');
    }
  }

  onMessage(handler: (data: any) => void): void {
    this.messageHandlers.push(handler);
  }

  onError(handler: (error: any) => void): void {
    this.errorHandlers.push(handler);
  }

  removeMessageHandler(handler: (data: any) => void): void {
    const index = this.messageHandlers.indexOf(handler);
    if (index > -1) {
      this.messageHandlers.splice(index, 1);
    }
  }

  removeErrorHandler(handler: (error: any) => void): void {
    const index = this.errorHandlers.indexOf(handler);
    if (index > -1) {
      this.errorHandlers.splice(index, 1);
    }
  }
}

// 导出WebSocket服务实例
export const wsService = new WebSocketService();

// ==================== 系统提示词API ====================
export const SystemPromptAPI = {
  // 获取系统提示词列表
  async getSystemPrompts(category?: string, includeInactive: boolean = false): Promise<any> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (includeInactive) params.append('include_inactive', 'true');
    return apiRequest(`/system-prompt/?${params.toString()}`);
  },

  // 获取指定的系统提示词
  async getSystemPrompt(promptId: number): Promise<any> {
    return apiRequest(`/system-prompt/${promptId}`);
  },

  // 创建系统提示词
  async createSystemPrompt(data: any): Promise<any> {
    return apiRequest('/system-prompt/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 更新系统提示词
  async updateSystemPrompt(promptId: number, data: any): Promise<any> {
    return apiRequest(`/system-prompt/${promptId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // 删除系统提示词
  async deleteSystemPrompt(promptId: number): Promise<any> {
    return apiRequest(`/system-prompt/${promptId}`, {
      method: 'DELETE'
    });
  },

  // 激活系统提示词
  async activateSystemPrompt(promptId: number): Promise<any> {
    return apiRequest(`/system-prompt/${promptId}/activate`, {
      method: 'POST'
    });
  },

  // 获取提示词模板列表
  async getPromptTemplates(category?: string, search?: string): Promise<any> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    return apiRequest(`/system-prompt/templates?${params.toString()}`);
  },

  // 使用提示词模板
  async usePromptTemplate(templateId: number): Promise<any> {
    return apiRequest(`/system-prompt/templates/${templateId}/use`, {
      method: 'POST'
    });
  },

  // 获取当前激活的提示词
  async getActivePrompt(): Promise<any> {
    return apiRequest('/system-prompt/active');
  }
};

// 导出所有API
export default {
  chat: chatAPI,
  tts: ttsAPI,
  ollama: ollamaAPI,
  systemPrompt: SystemPromptAPI,
  config: configAPI,
  ws: wsService
};
