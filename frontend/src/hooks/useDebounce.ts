/**
 * 防抖Hook
 * 提供防抖功能，避免频繁调用函数
 */

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * 防抖Hook
 * @param value 要防抖的值
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的值
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * 防抖函数Hook
 * @param callback 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<number>()

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  ) as T

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

/**
 * 防抖状态Hook
 * @param initialValue 初始值
 * @param delay 延迟时间（毫秒）
 * @returns [当前值, 防抖值, 设置函数]
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number
): [T, T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initialValue)
  const debouncedValue = useDebounce(value, delay)

  return [value, debouncedValue, setValue]
}

/**
 * 防抖搜索Hook
 * @param searchFunction 搜索函数
 * @param delay 延迟时间（毫秒）
 * @returns [搜索值, 防抖搜索值, 设置搜索值函数]
 */
export function useDebouncedSearch<T>(
  searchFunction: (query: string) => Promise<T[]>,
  delay: number = 300
): [string, string, (query: string) => void, T[], boolean] {
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('')
  const [results, setResults] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 防抖搜索值
  const debouncedValue = useDebounce(searchValue, delay)

  // 当防抖值变化时执行搜索
  useEffect(() => {
    if (debouncedValue !== debouncedSearchValue) {
      setDebouncedSearchValue(debouncedValue)
      
      if (debouncedValue.trim()) {
        setIsLoading(true)
        searchFunction(debouncedValue)
          .then(setResults)
          .catch(() => setResults([]))
          .finally(() => setIsLoading(false))
      } else {
        setResults([])
      }
    }
  }, [debouncedValue, debouncedSearchValue, searchFunction])

  return [searchValue, debouncedSearchValue, setSearchValue, results, isLoading]
}

/**
 * 防抖输入Hook
 * @param initialValue 初始值
 * @param delay 延迟时间（毫秒）
 * @param onChange 值变化回调函数
 * @returns [输入值, 防抖值, 设置输入值函数]
 */
export function useDebouncedInput<T>(
  initialValue: T,
  delay: number = 300,
  onChange?: (value: T) => void
): [T, T, (value: T | ((prev: T) => T)) => void] {
  const [inputValue, setInputValue] = useState<T>(initialValue)
  const debouncedValue = useDebounce(inputValue, delay)

  // 当防抖值变化时调用onChange
  useEffect(() => {
    if (onChange && debouncedValue !== initialValue) {
      onChange(debouncedValue)
    }
  }, [debouncedValue, onChange, initialValue])

  return [inputValue, debouncedValue, setInputValue]
}

/**
 * 防抖滚动Hook
 * @param delay 延迟时间（毫秒）
 * @returns 是否正在滚动
 */
export function useDebouncedScroll(delay: number = 100): boolean {
  const [isScrolling, setIsScrolling] = useState(false)
  const timeoutRef = useRef<number>()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true)
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
      }, delay)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [delay])

  return isScrolling
}

/**
 * 防抖窗口大小Hook
 * @param delay 延迟时间（毫秒）
 * @returns 窗口尺寸
 */
export function useDebouncedWindowSize(delay: number = 100) {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    let timeoutId: number

    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight
        })
      }, delay)
    }

    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [delay])

  return windowSize
}
