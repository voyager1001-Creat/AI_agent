/**
 * 日期工具函数
 * 提供日期格式化和计算相关的工具方法
 */

/**
 * 格式化日期为可读字符串
 * @param date 日期对象或日期字符串
 * @param format 格式化选项
 * @returns 格式化后的日期字符串
 */
export const formatDate = (
  date: Date | string | number,
  format: 'short' | 'long' | 'relative' | 'time' = 'short'
): string => {
  const dateObj = new Date(date)
  
  if (isNaN(dateObj.getTime())) {
    return '无效日期'
  }
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('zh-CN')
    
    case 'long':
      return dateObj.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    
    case 'time':
      return dateObj.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    
    case 'relative':
      return getRelativeTime(dateObj)
    
    default:
      return dateObj.toLocaleDateString('zh-CN')
  }
}

/**
 * 获取相对时间描述
 * @param date 日期对象
 * @returns 相对时间字符串
 */
const getRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInMinutes < 1) {
    return '刚刚'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`
  } else if (diffInHours < 24) {
    return `${diffInHours}小时前`
  } else if (diffInDays < 7) {
    return `${diffInDays}天前`
  } else {
    return formatDate(date, 'short')
  }
}

/**
 * 检查日期是否为今天
 * @param date 日期对象或日期字符串
 * @returns 是否为今天
 */
export const isToday = (date: Date | string | number): boolean => {
  const dateObj = new Date(date)
  const today = new Date()
  
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  )
}

/**
 * 检查日期是否为昨天
 * @param date 日期对象或日期字符串
 * @returns 是否为昨天
 */
export const isYesterday = (date: Date | string | number): boolean => {
  const dateObj = new Date(date)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  return (
    dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear()
  )
}

/**
 * 获取日期范围
 * @param days 天数
 * @returns 日期范围对象
 */
export const getDateRange = (days: number): { start: Date; end: Date } => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  
  return { start, end }
}

/**
 * 格式化时间戳
 * @param timestamp 时间戳
 * @returns 格式化的时间字符串
 */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp)
  return formatDate(date, 'time')
}

/**
 * 获取月份名称
 * @param month 月份（0-11）
 * @param locale 语言环境
 * @returns 月份名称
 */
export const getMonthName = (month: number, locale: string = 'zh-CN'): string => {
  const date = new Date(2021, month, 1)
  return date.toLocaleDateString(locale, { month: 'long' })
}

/**
 * 获取星期名称
 * @param weekday 星期（0-6）
 * @param locale 语言环境
 * @returns 星期名称
 */
export const getWeekdayName = (weekday: number, locale: string = 'zh-CN'): string => {
  const date = new Date(2021, 0, weekday + 1)
  return date.toLocaleDateString(locale, { weekday: 'long' })
}
