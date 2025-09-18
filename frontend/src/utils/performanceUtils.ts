/**
 * 性能优化工具
 */

// 消息缓存管理
class MessageCache {
  private cache = new Map<string, any>()
  private maxSize = 1000
  private ttl = 5 * 60 * 1000 // 5分钟过期

  set(key: string, value: any): void {
    // 清理过期缓存
    this.cleanup()
    
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    // 检查是否过期
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.ttl) {
        this.cache.delete(key)
      }
    }
  }

  get size(): number {
    return this.cache.size
  }
}

// 全局消息缓存实例
export const messageCache = new MessageCache()

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 消息分块处理
export function chunkMessages<T>(messages: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < messages.length; i += chunkSize) {
    chunks.push(messages.slice(i, i + chunkSize))
  }
  return chunks
}

// 虚拟滚动计算
export interface VirtualScrollConfig {
  itemHeight: number
  containerHeight: number
  totalItems: number
  scrollTop: number
}

export interface VirtualScrollResult {
  startIndex: number
  endIndex: number
  visibleItems: number[]
  offsetY: number
}

export function calculateVirtualScroll(config: VirtualScrollConfig): VirtualScrollResult {
  const { itemHeight, containerHeight, totalItems, scrollTop } = config
  
  const startIndex = Math.floor(scrollTop / itemHeight)
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const endIndex = Math.min(startIndex + visibleCount, totalItems)
  
  const visibleItems = Array.from(
    { length: endIndex - startIndex },
    (_, i) => startIndex + i
  )
  
  const offsetY = startIndex * itemHeight
  
  return {
    startIndex,
    endIndex,
    visibleItems,
    offsetY
  }
}

// 消息搜索优化
export function createMessageSearchIndex(messages: any[]) {
  const index = new Map<string, number[]>()
  
  messages.forEach((message, idx) => {
    if (message.content) {
      const words = message.content.toLowerCase().split(/\s+/)
      words.forEach((word: string) => {
        if (word.length > 2) { // 忽略太短的词
          if (!index.has(word)) {
            index.set(word, [])
          }
          index.get(word)!.push(idx)
        }
      })
    }
  })
  
  return index
}

export function searchMessages(messages: any[], query: string, searchIndex: Map<string, number[]>): any[] {
  if (!query.trim()) return messages
  
  const searchWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2)
  if (searchWords.length === 0) return messages
  
  const matchedIndices = new Set<number>()
  
  searchWords.forEach(word => {
    const indices = searchIndex.get(word) || []
    indices.forEach(idx => matchedIndices.add(idx))
  })
  
  return Array.from(matchedIndices)
    .sort((a, b) => a - b)
    .map(idx => messages[idx])
    .filter(Boolean)
}

// 内存使用监控
export function getMemoryUsage(): { used: number; total: number; percentage: number } {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
      percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100)
    }
  }
  
  return { used: 0, total: 0, percentage: 0 }
}

// 性能监控
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()
  
  startTimer(label: string): () => void {
    const start = performance.now()
    return () => this.endTimer(label, start)
  }
  
  private endTimer(label: string, start: number): void {
    const duration = performance.now() - start
    if (!this.metrics.has(label)) {
      this.metrics.set(label, [])
    }
    this.metrics.get(label)!.push(duration)
  }
  
  getMetrics(label: string): { avg: number; min: number; max: number; count: number } {
    const values = this.metrics.get(label) || []
    if (values.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 }
    }
    
    const sum = values.reduce((a, b) => a + b, 0)
    return {
      avg: sum / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    }
  }
  
  clearMetrics(): void {
    this.metrics.clear()
  }
}

// 全局性能监控实例
export const performanceMonitor = new PerformanceMonitor()
