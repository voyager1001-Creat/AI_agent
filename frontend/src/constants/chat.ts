// 聊天相关的常量配置

// 消息历史记录限制
export const CHAT_HISTORY_LIMIT = 50


// TTS默认配置
export const TTS_DEFAULT_CONFIG = {
  speed: 1.0,
  pitch: 1.0
}

// 消息ID前缀
export const MESSAGE_ID_PREFIX = 'msg'

// 自动滚动行为
export const SCROLL_BEHAVIOR = 'smooth' as ScrollBehavior

// 动画持续时间
export const ANIMATION_DURATION = 0.3


// 错误消息
export const ERROR_MESSAGES = {
  SEND_FAILED: '抱歉，发送消息失败，请重试。',
  INIT_CHAT_FAILED: '初始化聊天失败',
  CREATE_CONVERSATION_FAILED: '创建新对话失败',
  WEBSOCKET_CONNECTION_FAILED: 'WebSocket连接失败',
  RE_CONNECTION_FAILED: '重新连接WebSocket失败',
  MICROPHONE_ACCESS_FAILED: '无法访问麦克风',
  AUDIO_PROCESSING_FAILED: '音频处理失败',
  TTS_GENERATION_FAILED: 'TTS生成失败',
  EMOTION_ANALYSIS_FAILED: '情感分析失败',
  LOAD_USER_PROFILE_FAILED: '加载用户资料失败',
  LOAD_SYSTEM_PROMPT_FAILED: '加载系统提示词失败'
} as const
