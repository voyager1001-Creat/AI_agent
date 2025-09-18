import { Message } from '../types/api'
import { MESSAGE_ID_PREFIX } from '@/constants/chat'

/**
 * 生成唯一的消息ID
 * @returns 消息ID
 */
export const generateMessageId = (): string => {
  return `${MESSAGE_ID_PREFIX}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 安全的时间戳转换
 * @param timestamp 时间戳
 * @returns Date对象
 */
export const safeParseTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Date) {
    return timestamp
  }
  
  if (typeof timestamp === 'string') {
    try {
      const parsed = new Date(timestamp)
      if (!isNaN(parsed.getTime())) {
        return parsed
      }
    } catch (e) {
      console.warn('时间戳解析失败:', timestamp, e)
    }
  }
  
  if (typeof timestamp === 'number') {
    try {
      const parsed = new Date(timestamp)
      if (!isNaN(parsed.getTime())) {
        return parsed
      }
    } catch (e) {
      console.warn('时间戳解析失败:', timestamp, e)
    }
  }
  
  // 默认返回当前时间
  return new Date()
}

/**
 * 验证消息数据完整性
 * @param msg 消息数据
 * @returns 是否有效
 */
export const validateMessage = (msg: any): boolean => {
  return msg && 
         typeof msg.content === 'string' && 
         msg.content.trim() !== '' &&
         ['user', 'assistant'].includes(msg.role)
}

/**
 * 格式化历史消息数据
 * @param rawMessages 原始消息数据
 * @returns 格式化后的消息数组
 */
export const formatHistoryMessages = (rawMessages: any[]): Message[] => {
  if (!Array.isArray(rawMessages)) {
    console.warn('formatHistoryMessages: 输入不是数组', rawMessages)
    return []
  }
  
  return rawMessages
    .filter(validateMessage)
    .map((msg: any) => {
      try {
        return {
          id: msg.id || generateMessageId(),
          content: msg.content?.trim() || '',
          role: (msg.role as 'user' | 'assistant') || 'user',
          timestamp: safeParseTimestamp(msg.timestamp || msg.created_at),
          content_type: msg.content_type || 'text',
          message_metadata: msg.message_metadata || {}
        }
      } catch (error) {
        console.error('格式化消息失败:', error, msg)
        // 返回一个安全的默认消息
        return {
          id: generateMessageId(),
          content: '消息格式错误',
          role: 'assistant' as const,
          timestamp: new Date(),
          content_type: 'text',
          message_metadata: {}
        }
      }
    })
    .filter(Boolean) // 过滤掉无效消息
}

/**
 * 创建用户消息
 * @param content 消息内容
 * @param emotion 情感数据
 * @param metadata 额外元数据
 * @returns 用户消息对象
 */
export const createUserMessage = (content: string, metadata?: any): Message => {
  return {
    id: generateMessageId(),
    content: content.trim(),
    role: 'user',
    timestamp: new Date(),
    content_type: 'text',
    message_metadata: metadata || {}
  }
}

/**
 * 创建助手消息
 * @param content 消息内容
 * @param emotion 情感数据
 * @param metadata 额外元数据
 * @returns 助手消息对象
 */
export const createAssistantMessage = (content: string, metadata?: any): Message => {
  return {
    id: generateMessageId(),
    content: content.trim(),
    role: 'assistant',
    timestamp: new Date(),
    content_type: 'text',
    message_metadata: metadata || {}
  }
}

/**
 * 创建错误消息
 * @param content 错误内容
 * @param error 错误对象
 * @returns 错误消息对象
 */
export const createErrorMessage = (content: string, error?: any): Message => {
  return {
    id: generateMessageId(),
    content: content.trim(),
    role: 'assistant',
    timestamp: new Date(),
    content_type: 'error',
    message_metadata: {
      error: error ? {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      } : true
    }
  }
}

/**
 * 消息去重
 * @param messages 消息数组
 * @returns 去重后的消息数组
 */
export const deduplicateMessages = (messages: Message[]): Message[] => {
  const seen = new Set<string>()
  return messages.filter(msg => {
    const timestamp = msg.timestamp ? (typeof msg.timestamp === 'string' ? new Date(msg.timestamp).getTime() : msg.timestamp.getTime()) : 0
    const key = `${msg.role}_${msg.content}_${timestamp}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

/**
 * 消息排序（按时间）
 * @param messages 消息数组
 * @param order 排序顺序 ('asc' | 'desc')
 * @returns 排序后的消息数组
 */
export const sortMessages = (messages: Message[], order: 'asc' | 'desc' = 'asc'): Message[] => {
  return [...messages].sort((a, b) => {
    const timeA = a.timestamp ? (typeof a.timestamp === 'string' ? new Date(a.timestamp).getTime() : a.timestamp.getTime()) : 0
    const timeB = b.timestamp ? (typeof b.timestamp === 'string' ? new Date(b.timestamp).getTime() : b.timestamp.getTime()) : 0
    return order === 'asc' ? timeA - timeB : timeB - timeA
  })
}
