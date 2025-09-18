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
  message_metadata?: Record<string, any>
}

// ==================== 聊天消息类型 ====================
export interface ChatMessage {
  id: number
  conversation_id: number
  role: 'user' | 'assistant'
  content: string
  content_type: string
  message_metadata?: Record<string, any>
  created_at: string
}

// ==================== 对话类型 ====================
export interface Conversation {
  id: number
  user_id: number
  title?: string
  system_prompt?: string
  created_at: string
  updated_at: string
}

export interface ConversationResponse {
  id: number
  title: string
  user_id: number
  system_prompt?: string
  created_at: string
  updated_at: string
  message_count: number
}

// ==================== 聊天请求/响应类型 ====================
export interface ChatRequest {
  message: string
  user_id: number
  conversation_id?: number
  system_prompt?: string
}

export interface ChatResponse {
  success: boolean
  message: string
  conversation_id?: number
  message_id?: number
  timestamp: string
  error?: string
}

export interface MessageResponse {
  id: number
  conversation_id: number
  role: string
  content: string
  created_at: string
  metadata?: Record<string, any>
}

// ==================== TTS类型 ====================
export interface TTSRequest {
  text: string
  audio_prompt?: string
  emo_audio_prompt?: string
  output_path?: string
}

export interface TTSResponse {
  success: boolean
  audio_url?: string
  output_path?: string
  error?: string
}

// ==================== 模型类型 ====================
export interface ModelInfo {
  name: string
  size: string
  modified_at: string
  digest: string
}

export interface ModelInfoResponse {
  success: boolean
  models: ModelInfo[]
  total: number
  timestamp: string
  error?: string
}

// ==================== 系统提示词类型 ====================
export interface SystemPrompt {
  name: string
  id?: number
  user_id?: number
  system_prompt: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

// ==================== 配置类型 ====================
export interface OllamaConfig {
  base_url: string
  default_model: string
  timeout: number
}

export interface IndexTTSConfig {
  base_url: string
  default_audio_prompt: string
  default_emotion_natural?: string
  default_emotion_care?: string
  default_emotion_happy?: string
  default_emotion_sad?: string
  default_emotion_question?: string
  default_emotion_surprised?: string
  default_emotion_disgusted?: string
  timeout: number
}

export interface SystemPromptConfig {
  system_prompt: SystemPrompt
}

export interface SystemConfig {
  ollama: OllamaConfig
  index_tts: IndexTTSConfig
  system_prompt: SystemPromptConfig
}

// ==================== 统计类型 ====================
export interface ChatStats {
  total_conversations: number
  total_messages: number
  today_conversations: number
  today_messages: number
  avg_message_length: number
}

// ==================== 错误类型 ====================
export interface ApiError {
  detail: string
  status_code: number
}

// ==================== 分页类型 ====================
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  has_next: boolean
  has_prev: boolean
}
