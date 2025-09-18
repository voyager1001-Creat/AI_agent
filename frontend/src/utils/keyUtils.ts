/**
 * 生成唯一的key值
 * @param prefix key前缀
 * @param value 值
 * @param index 索引（可选）
 * @returns 唯一的key字符串
 */
export const generateUniqueKey = (prefix: string, value: string | number, index?: number): string => {
  // 输入验证
  if (!prefix || prefix.trim() === '') {
    throw new Error('prefix不能为空')
  }
  
  if (value === undefined || value === null) {
    throw new Error('value不能为空')
  }
  
  const cleanPrefix = prefix.trim()
  const cleanValue = String(value).trim()
  
  if (index !== undefined) {
    if (typeof index !== 'number' || index < 0) {
      throw new Error('index必须是大于等于0的数字')
    }
    return `${cleanPrefix}-${cleanValue}-${index}`
  }
  return `${cleanPrefix}-${cleanValue}`
}

/**
 * 为列表项生成唯一的key
 * @param item 列表项
 * @param idField 唯一标识字段名
 * @param prefix key前缀
 * @returns 唯一的key字符串
 */
export const generateItemKey = <T extends Record<string, any>>(
  item: T, 
  idField: keyof T, 
  prefix: string
): string => {
  // 输入验证
  if (!item || typeof item !== 'object') {
    throw new Error('item必须是有效的对象')
  }
  
  if (!prefix || prefix.trim() === '') {
    throw new Error('prefix不能为空')
  }
  
  const cleanPrefix = prefix.trim()
  const id = item[idField]
  
  if (id === undefined || id === null) {
    // 如果没有id，使用时间戳和随机数生成
    return `${cleanPrefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  
  return `${cleanPrefix}-${id}`
}

/**
 * 为分页组件生成唯一的key
 * @param page 页码或特殊字符
 * @param index 索引
 * @returns 唯一的key字符串
 */
export const generatePageKey = (page: number | string, index: number): string => {
  // 输入验证
  if (typeof index !== 'number' || index < 0) {
    throw new Error('index必须是大于等于0的数字')
  }
  
  if (page === '...') {
    return `ellipsis-${index}`
  }
  
  if (typeof page === 'number' && page > 0) {
    return `page-${page}`
  }
  
  // 对于无效的页码，使用索引作为备选
  return `page-invalid-${index}`
}
