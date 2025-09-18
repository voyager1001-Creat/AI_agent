// ==================== 通用API响应 ====================
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ==================== 用户类型 ====================
export interface User {
  id: string
  name: string
  avatar_url?: string
  ai_avatar_url?: string
  preferences: {
    theme: 'light' | 'dark'
    language: string
    voice: string
    autoPlay: boolean
  }
}

// ==================== 基础消息类型 ====================
export interface Message {
  id: string
  content?: string
  role?: 'user' | 'assistant'
  timestamp?: Date | string
  audioUrl?: string
  content_type?: string
}

// ==================== 聊天状态 ====================
export interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  isRecording: boolean
}

// ==================== 聊天API类型 ====================
export interface ChatMessage {
    id: number;
    conversation_id: number;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
  }
  
export interface ChatRequest {
    message: string;
    user_id: number;
    conversation_id?: number;
    system_prompt?: string;
  }
  
export interface ChatResponse {
    success: boolean;
    message: string;
    conversation_id?: number;
    message_id?: number;
    timestamp: string;
    error?: string;
  }

// ==================== TTS API类型 ====================
export interface TTSRequest {
  text: string
  voice_path?: string
  speed?: number
  pitch?: number
}

export interface TTSResponse {
  success: boolean
  message: string
  output_file?: string
  output_path?: string
  timestamp: string
}

// ==================== Ollama API类型 ====================
export interface OllamaGenerateRequest {
  model: string
  prompt: string
  stream: boolean
  options?: any
}

export interface OllamaGenerateResponse {
  success: boolean
  response?: string
  model: string
  prompt: string
  timestamp: string
  error?: string
}

export interface OllamaModelInfo {
  name: string
  size: string
  modified_at: string
  digest: string
}

export interface OllamaModelsInfoResponse {
  success: boolean
  models: OllamaModelInfo[]
  total: number
  timestamp: string
}

// ==================== WebSocket类型 ====================
export interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
}

// ==================== 对话管理类型 ====================
export interface Conversation {
  session_id: string
  title?: string
  created_at: string
  updated_at: string
  message_count: number
}

// ==================== 音频文件类型 ====================
export interface AudioFile {
  filename: string
  size: number
  created_time: string
  modified_time: string
}

// ==================== 参考音频类型 ====================
export interface ReferenceVoice {
  filename: string
  path: string
  size: number
  modified_time: string
}

