/**
 * 字符串工具函数
 * 提供字符串处理相关的工具方法
 */

/**
 * 截断字符串到指定长度
 * @param str 原始字符串
 * @param maxLength 最大长度
 * @param suffix 后缀（默认为...）
 * @returns 截断后的字符串
 */
export const truncateString = (
  str: string,
  maxLength: number,
  suffix: string = '...'
): string => {
  if (!str || str.length <= maxLength) {
    return str
  }
  
  return str.substring(0, maxLength - suffix.length) + suffix
}

/**
 * 首字母大写
 * @param str 原始字符串
 * @returns 首字母大写的字符串
 */
export const capitalizeFirst = (str: string): string => {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * 转换为驼峰命名
 * @param str 原始字符串
 * @returns 驼峰命名字符串
 */
export const toCamelCase = (str: string): string => {
  if (!str) return str
  
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
    .replace(/^(.)/, (_, c) => c.toLowerCase())
}

/**
 * 转换为帕斯卡命名
 * @param str 原始字符串
 * @returns 帕斯卡命名字符串
 */
export const toPascalCase = (str: string): string => {
  if (!str) return str
  
  const camelCase = toCamelCase(str)
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1)
}

/**
 * 转换为短横线命名
 * @param str 原始字符串
 * @returns 短横线命名字符串
 */
export const toKebabCase = (str: string): string => {
  if (!str) return str
  
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

/**
 * 转换为下划线命名
 * @param str 原始字符串
 * @returns 下划线命名字符串
 */
export const toSnakeCase = (str: string): string => {
  if (!str) return str
  
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()
}

/**
 * 生成随机字符串
 * @param length 字符串长度
 * @param charset 字符集
 * @returns 随机字符串
 */
export const generateRandomString = (
  length: number = 8,
  charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string => {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return result
}

/**
 * 移除HTML标签
 * @param html HTML字符串
 * @returns 纯文本字符串
 */
export const stripHtml = (html: string): string => {
  if (!html) return html
  
  return html.replace(/<[^>]*>/g, '')
}

/**
 * 转义HTML特殊字符
 * @param text 原始文本
 * @returns 转义后的文本
 */
export const escapeHtml = (text: string): string => {
  if (!text) return text
  
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  }
  
  return text.replace(/[&<>"'/]/g, (match) => htmlEscapes[match])
}

/**
 * 反转义HTML特殊字符
 * @param text 转义后的文本
 * @returns 原始文本
 */
export const unescapeHtml = (text: string): string => {
  if (!text) return text
  
  const htmlUnescapes: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/'
  }
  
  return text.replace(/&amp;|&lt;|&gt;|&quot;|&#x27;|&#x2F;/g, (match) => htmlUnescapes[match])
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数
 * @returns 格式化后的文件大小
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 检查字符串是否为空或只包含空白字符
 * @param str 要检查的字符串
 * @returns 是否为空
 */
export const isEmpty = (str: string): boolean => {
  return !str || str.trim().length === 0
}

/**
 * 检查字符串是否为有效的邮箱地址
 * @param email 邮箱地址
 * @returns 是否有效
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 检查字符串是否为有效的URL
 * @param url URL字符串
 * @returns 是否有效
 */
export const isValidUrl = (url: string): boolean => {
  if (!url) return false
  
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 提取URL中的域名
 * @param url URL字符串
 * @returns 域名
 */
export const extractDomain = (url: string): string => {
  if (!url) return ''
  
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return ''
  }
}

/**
 * 生成UUID
 * @returns UUID字符串
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 计算字符串的相似度（基于编辑距离）
 * @param str1 字符串1
 * @param str2 字符串2
 * @returns 相似度（0-1）
 */
export const calculateSimilarity = (str1: string, str2: string): number => {
  if (str1 === str2) return 1
  if (!str1 || !str2) return 0
  
  const matrix: number[][] = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  const maxLength = Math.max(str1.length, str2.length)
  return maxLength === 0 ? 1 : (maxLength - matrix[str2.length][str1.length]) / maxLength
}
