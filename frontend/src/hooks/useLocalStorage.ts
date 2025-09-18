/**
 * 本地存储Hook
 * 提供本地存储的状态管理功能
 */

import { useState, useEffect, useCallback } from 'react'

/**
 * 本地存储Hook
 * @param key 存储键名
 * @param initialValue 初始值
 * @returns [存储值, 设置函数, 移除函数]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  
  // 获取初始值
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`读取本地存储失败 ${key}:`, error)
      return initialValue
    }
  })

  // 设置值的函数
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // 允许值是一个函数，这样我们就有与useState相同的API
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // 保存到状态
      setStoredValue(valueToStore)
      
      // 保存到本地存储
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
      
      // 触发自定义事件，通知其他组件
      window.dispatchEvent(new CustomEvent('localStorageChange', {
        detail: { key, value: valueToStore }
      }))
      
    } catch (error) {
      console.error(`设置本地存储失败 ${key}:`, error)
    }
  }, [key, storedValue])

  // 移除值的函数
  const removeValue = useCallback(() => {
    try {
      // 从状态中移除
      setStoredValue(initialValue)
      
      // 从本地存储中移除
      window.localStorage.removeItem(key)
      
      // 触发自定义事件
      window.dispatchEvent(new CustomEvent('localStorageChange', {
        detail: { key, value: null }
      }))
      
    } catch (error) {
      console.error(`移除本地存储失败 ${key}:`, error)
    }
  }, [key, initialValue])

  // 监听其他标签页的存储变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.error(`解析存储值失败 ${key}:`, error)
        }
      }
    }

    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.value)
      }
    }

    // 监听存储事件（跨标签页）
    window.addEventListener('storage', handleStorageChange)
    
    // 监听自定义事件（同标签页内）
    window.addEventListener('localStorageChange', handleCustomStorageChange as EventListener)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('localStorageChange', handleCustomStorageChange as EventListener)
    }
  }, [key])

  return [storedValue, setValue, removeValue]
}

/**
 * 使用本地存储的简化版本
 * @param key 存储键名
 * @param initialValue 初始值
 * @returns [存储值, 设置函数]
 */
export function useLocalStorageSimple<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [value, setValue] = useLocalStorage(key, initialValue)
  
  const setValueSimple = useCallback((newValue: T) => {
    setValue(newValue)
  }, [setValue])
  
  return [value, setValueSimple]
}

/**
 * 布尔值本地存储Hook
 * @param key 存储键名
 * @param initialValue 初始值
 * @returns [布尔值, 切换函数, 设置函数, 移除函数]
 */
export function useLocalStorageBoolean(
  key: string,
  initialValue: boolean = false
): [boolean, () => void, (value: boolean) => void, () => void] {
  
  const [value, setValue, removeValue] = useLocalStorage(key, initialValue)
  
  const toggle = useCallback(() => {
    setValue(!value)
  }, [value, setValue])
  
  const setBoolean = useCallback((newValue: boolean) => {
    setValue(newValue)
  }, [setValue])
  
  return [value, toggle, setBoolean, removeValue]
}
