import { useState, useEffect, useCallback } from 'react'
import { systemPromptAPI } from '@/services/api'
import { ERROR_MESSAGES } from '@/constants/chat'

// 全局事件监听器，用于监听系统提示词变化
const SYSTEM_PROMPT_UPDATE_EVENT = 'systemPromptUpdate'

export const useSystemPrompt = () => {
  const [currentSystemPrompt, setCurrentSystemPrompt] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 加载当前系统提示词
  const loadSystemPrompt = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await systemPromptAPI.getActivePrompt()
      if (response.success) {
        setCurrentSystemPrompt(response.data)
      } else {
        setError(response.message || '获取系统提示词失败')
      }
    } catch (error) {
      console.error(ERROR_MESSAGES.LOAD_SYSTEM_PROMPT_FAILED, error)
      setError('获取系统提示词失败，请检查网络连接')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 刷新系统提示词（用于外部调用）
  const refreshSystemPrompt = useCallback(async () => {
    await loadSystemPrompt()
  }, [loadSystemPrompt])

  // 初始化加载系统提示词
  useEffect(() => {
    loadSystemPrompt()
  }, [loadSystemPrompt])

  // 定期刷新系统提示词（每30秒检查一次）
  useEffect(() => {
    const interval = setInterval(() => {
      loadSystemPrompt()
    }, 30000) // 30秒

    return () => clearInterval(interval)
  }, [loadSystemPrompt])

  // 监听系统提示词更新事件
  useEffect(() => {
    const handleSystemPromptUpdate = () => {
      console.log('收到系统提示词更新事件，刷新状态')
      loadSystemPrompt()
    }

    // 添加事件监听器
    window.addEventListener(SYSTEM_PROMPT_UPDATE_EVENT, handleSystemPromptUpdate)

    return () => {
      window.removeEventListener(SYSTEM_PROMPT_UPDATE_EVENT, handleSystemPromptUpdate)
    }
  }, [loadSystemPrompt])

  return {
    currentSystemPrompt,
    isLoading,
    error,
    loadSystemPrompt,
    refreshSystemPrompt
  }
}
