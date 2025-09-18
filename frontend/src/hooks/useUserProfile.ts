import { useState, useEffect } from 'react'
import { configAPI } from '@/services/api'
import { ERROR_MESSAGES } from '@/constants/chat'

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<any>(null)

  // 加载用户资料
  const loadUserProfile = async () => {
    try {
      const response = await configAPI.getUserConfig()
      if (response.success) {
        // 优先使用localStorage中的头像，如果没有则使用API返回的
        const localAvatarUrl = localStorage.getItem('user_avatar_url')
        const localAIAvatarUrl = localStorage.getItem('ai_avatar_url')
        
        setUserProfile({
          ...response.user,
          avatar_url: localAvatarUrl || response.user.avatar_url,
          ai_avatar_url: localAIAvatarUrl || response.user.ai_avatar_url
        })
      }
    } catch (error) {
      console.error(ERROR_MESSAGES.LOAD_USER_PROFILE_FAILED, error)
    }
  }

  // 监听localStorage变化，同步头像更新
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_avatar_url' && e.newValue) {
        setUserProfile((prev: any) => prev ? { ...prev, avatar_url: e.newValue } : null)
      }
      if (e.key === 'ai_avatar_url' && e.newValue) {
        setUserProfile((prev: any) => prev ? { ...prev, ai_avatar_url: e.newValue } : null)
      }
    }

    // 监听其他标签页的localStorage变化
    window.addEventListener('storage', handleStorageChange)

    // 监听当前页面的localStorage变化（通过自定义事件）
    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail.key === 'user_avatar_url' && e.detail.newValue) {
        setUserProfile((prev: any) => prev ? { ...prev, avatar_url: e.detail.newValue } : null)
      }
      if (e.detail.key === 'ai_avatar_url' && e.detail.newValue) {
        setUserProfile((prev: any) => prev ? { ...prev, ai_avatar_url: e.detail.newValue } : null)
      }
    }

    window.addEventListener('customStorageChange', handleCustomStorageChange as EventListener)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('customStorageChange', handleCustomStorageChange as EventListener)
    }
  }, [])

  // 初始化加载用户资料
  useEffect(() => {
    loadUserProfile()
  }, [])

  return {
    userProfile,
    loadUserProfile
  }
}
