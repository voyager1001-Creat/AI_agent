/**
 * 存储工具函数
 * 提供本地存储和会话存储的便捷操作
 */

/**
 * 本地存储工具类
 */
export class LocalStorage {
  /**
   * 设置本地存储项
   * @param key 键名
   * @param value 值
   */
  static set<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value)
      localStorage.setItem(key, serializedValue)
    } catch (error) {
      console.error(`设置本地存储失败 ${key}:`, error)
    }
  }

  /**
   * 获取本地存储项
   * @param key 键名
   * @param defaultValue 默认值
   * @returns 存储的值或默认值
   */
  static get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key)
      if (item === null) {
        return defaultValue || null
      }
      return JSON.parse(item)
    } catch (error) {
      console.error(`获取本地存储失败 ${key}:`, error)
      return defaultValue || null
    }
  }

  /**
   * 移除本地存储项
   * @param key 键名
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`移除本地存储失败 ${key}:`, error)
    }
  }

  /**
   * 检查本地存储项是否存在
   * @param key 键名
   * @returns 是否存在
   */
  static has(key: string): boolean {
    try {
      return localStorage.getItem(key) !== null
    } catch (error) {
      console.error(`检查本地存储失败 ${key}:`, error)
      return false
    }
  }

  /**
   * 清空所有本地存储
   */
  static clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('清空本地存储失败:', error)
    }
  }

  /**
   * 获取所有本地存储键名
   * @returns 键名数组
   */
  static keys(): string[] {
    try {
      return Object.keys(localStorage)
    } catch (error) {
      console.error('获取本地存储键名失败:', error)
      return []
    }
  }

  /**
   * 获取本地存储大小
   * @returns 存储项数量
   */
  static size(): number {
    try {
      return localStorage.length
    } catch (error) {
      console.error('获取本地存储大小失败:', error)
      return 0
    }
  }
}

/**
 * 会话存储工具类
 */
export class SessionStorage {
  /**
   * 设置会话存储项
   * @param key 键名
   * @param value 值
   */
  static set<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value)
      sessionStorage.setItem(key, serializedValue)
    } catch (error) {
      console.error(`设置会话存储失败 ${key}:`, error)
    }
  }

  /**
   * 获取会话存储项
   * @param key 键名
   * @param defaultValue 默认值
   * @returns 存储的值或默认值
   */
  static get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = sessionStorage.getItem(key)
      if (item === null) {
        return defaultValue || null
      }
      return JSON.parse(item)
    } catch (error) {
      console.error(`获取会话存储失败 ${key}:`, error)
      return defaultValue || null
    }
  }

  /**
   * 移除会话存储项
   * @param key 键名
   */
  static remove(key: string): void {
    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      console.error(`移除会话存储失败 ${key}:`, error)
    }
  }

  /**
   * 检查会话存储项是否存在
   * @param key 键名
   * @returns 是否存在
   */
  static has(key: string): boolean {
    try {
      return sessionStorage.getItem(key) !== null
    } catch (error) {
      console.error(`检查会话存储失败 ${key}:`, error)
      return false
    }
  }

  /**
   * 清空所有会话存储
   */
  static clear(): void {
    try {
      sessionStorage.clear()
    } catch (error) {
      console.error('清空会话存储失败:', error)
    }
  }

  /**
   * 获取所有会话存储键名
   * @returns 键名数组
   */
  static keys(): string[] {
    try {
      return Object.keys(sessionStorage)
    } catch (error) {
      console.error('获取会话存储键名失败:', error)
      return []
    }
  }

  /**
   * 获取会话存储大小
   * @returns 存储项数量
   */
  static size(): number {
    try {
      return sessionStorage.length
    } catch (error) {
      console.error('获取会话存储大小失败:', error)
      return 0
    }
  }
}

/**
 * 通用存储工具类
 */
export class StorageUtils {
  /**
   * 设置存储项（自动选择存储类型）
   * @param key 键名
   * @param value 值
   * @param persistent 是否持久化（true使用localStorage，false使用sessionStorage）
   */
  static set<T>(key: string, value: T, persistent: boolean = true): void {
    if (persistent) {
      LocalStorage.set(key, value)
    } else {
      SessionStorage.set(key, value)
    }
  }

  /**
   * 获取存储项（自动选择存储类型）
   * @param key 键名
   * @param defaultValue 默认值
   * @param persistent 是否持久化
   * @returns 存储的值或默认值
   */
  static get<T>(key: string, defaultValue?: T, persistent: boolean = true): T | null {
    if (persistent) {
      return LocalStorage.get(key, defaultValue)
    } else {
      return SessionStorage.get(key, defaultValue)
    }
  }

  /**
   * 移除存储项（自动选择存储类型）
   * @param key 键名
   * @param persistent 是否持久化
   */
  static remove(key: string, persistent: boolean = true): void {
    if (persistent) {
      LocalStorage.remove(key)
    } else {
      SessionStorage.remove(key)
    }
  }

  /**
   * 检查存储项是否存在（自动选择存储类型）
   * @param key 键名
   * @param persistent 是否持久化
   * @returns 是否存在
   */
  static has(key: string, persistent: boolean = true): boolean {
    if (persistent) {
      return LocalStorage.has(key)
    } else {
      return SessionStorage.has(key)
    }
  }

  /**
   * 批量设置存储项
   * @param items 存储项对象
   * @param persistent 是否持久化
   */
  static setMultiple(items: Record<string, any>, persistent: boolean = true): void {
    Object.entries(items).forEach(([key, value]) => {
      this.set(key, value, persistent)
    })
  }

  /**
   * 批量获取存储项
   * @param keys 键名数组
   * @param persistent 是否持久化
   * @returns 存储项对象
   */
  static getMultiple(keys: string[], persistent: boolean = true): Record<string, any> {
    const result: Record<string, any> = {}
    keys.forEach(key => {
      result[key] = this.get(key, null, persistent)
    })
    return result
  }

  /**
   * 批量移除存储项
   * @param keys 键名数组
   * @param persistent 是否持久化
   */
  static removeMultiple(keys: string[], persistent: boolean = true): void {
    keys.forEach(key => {
      this.remove(key, persistent)
    })
  }

  /**
   * 监听存储变化
   * @param callback 回调函数
   * @returns 清理函数
   */
  static onStorageChange(callback: (event: StorageEvent) => void): () => void {
    const handleStorageChange = (event: StorageEvent) => {
      callback(event)
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }

  /**
   * 获取存储使用情况
   * @returns 存储使用信息
   */
  static getStorageInfo(): {
    localStorage: { size: number; keys: string[] }
    sessionStorage: { size: number; keys: string[] }
  } {
    return {
      localStorage: {
        size: LocalStorage.size(),
        keys: LocalStorage.keys()
      },
      sessionStorage: {
        size: SessionStorage.size(),
        keys: SessionStorage.keys()
      }
    }
  }

  /**
   * 清理过期的存储项
   * @param expirationKey 过期时间键名后缀
   * @param persistent 是否持久化
   */
  static cleanupExpired(expirationKey: string = '_expires', persistent: boolean = true): void {
    const storage = persistent ? LocalStorage : SessionStorage
    const keys = storage.keys()
    const now = Date.now()

    keys.forEach(key => {
      if (key.endsWith(expirationKey)) {
        const expirationTime = storage.get<number>(key)
        if (expirationTime && now > expirationTime) {
          const dataKey = key.replace(expirationKey, '')
          storage.remove(dataKey)
          storage.remove(key)
        }
      }
    })
  }

  /**
   * 设置带过期时间的存储项
   * @param key 键名
   * @param value 值
   * @param expiresIn 过期时间（毫秒）
   * @param persistent 是否持久化
   */
  static setWithExpiration<T>(
    key: string, 
    value: T, 
    expiresIn: number, 
    persistent: boolean = true
  ): void {
    const expirationTime = Date.now() + expiresIn
    const expirationKey = `${key}_expires`
    
    this.set(key, value, persistent)
    this.set(expirationKey, expirationTime, persistent)
  }

  /**
   * 获取带过期时间的存储项
   * @param key 键名
   * @param defaultValue 默认值
   * @param persistent 是否持久化
   * @returns 存储的值或默认值
   */
  static getWithExpiration<T>(
    key: string, 
    defaultValue?: T, 
    persistent: boolean = true
  ): T | null {
    const expirationKey = `${key}_expires`
    const expirationTime = this.get<number>(expirationKey, undefined, persistent)
    
    if (expirationTime && Date.now() > expirationTime) {
      // 已过期，清理存储项
      this.remove(key, persistent)
      this.remove(expirationKey, persistent)
      return defaultValue || null
    }
    
    return this.get(key, defaultValue, persistent)
  }
}
