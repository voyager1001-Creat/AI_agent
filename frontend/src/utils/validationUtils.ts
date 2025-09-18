/**
 * 验证工具函数
 * 提供各种数据验证功能
 */

/**
 * 验证邮箱地址
 * @param email 邮箱地址
 * @returns 是否有效
 */
export const validateEmail = (email: string): boolean => {
  if (!email) return false
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证手机号码（中国大陆）
 * @param phone 手机号码
 * @returns 是否有效
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone) return false
  
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 验证身份证号码（中国大陆）
 * @param idCard 身份证号码
 * @returns 是否有效
 */
export const validateIdCard = (idCard: string): boolean => {
  if (!idCard) return false
  
  // 18位身份证号码
  const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
  
  if (!idCardRegex.test(idCard)) {
    return false
  }
  
  // 验证校验码
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  
  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard[i]) * weights[i]
  }
  
  const checkCode = checkCodes[sum % 11]
  return idCard[17].toUpperCase() === checkCode
}

/**
 * 验证URL地址
 * @param url URL地址
 * @returns 是否有效
 */
export const validateUrl = (url: string): boolean => {
  if (!url) return false
  
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 验证密码强度
 * @param password 密码
 * @returns 密码强度等级
 */
export const validatePasswordStrength = (password: string): {
  score: number
  level: 'weak' | 'medium' | 'strong' | 'very-strong'
  feedback: string[]
} => {
  if (!password) {
    return {
      score: 0,
      level: 'weak',
      feedback: ['请输入密码']
    }
  }
  
  let score = 0
  const feedback: string[] = []
  
  // 长度检查
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('密码长度至少8位')
  }
  
  if (password.length >= 12) {
    score += 1
  }
  
  // 包含数字
  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('密码应包含数字')
  }
  
  // 包含小写字母
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('密码应包含小写字母')
  }
  
  // 包含大写字母
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('密码应包含大写字母')
  }
  
  // 包含特殊字符
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1
  } else {
    feedback.push('密码应包含特殊字符')
  }
  
  // 确定强度等级
  let level: 'weak' | 'medium' | 'strong' | 'very-strong'
  if (score <= 2) {
    level = 'weak'
  } else if (score <= 3) {
    level = 'medium'
  } else if (score <= 5) {
    level = 'strong'
  } else {
    level = 'very-strong'
  }
  
  return { score, level, feedback }
}

/**
 * 验证用户名
 * @param username 用户名
 * @returns 验证结果
 */
export const validateUsername = (username: string): {
  isValid: boolean
  message: string
} => {
  if (!username) {
    return {
      isValid: false,
      message: '用户名不能为空'
    }
  }
  
  if (username.length < 3) {
    return {
      isValid: false,
      message: '用户名长度至少3位'
    }
  }
  
  if (username.length > 20) {
    return {
      isValid: false,
      message: '用户名长度不能超过20位'
    }
  }
  
  // 只允许字母、数字、下划线
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      isValid: false,
      message: '用户名只能包含字母、数字和下划线'
    }
  }
  
  return {
    isValid: true,
    message: '用户名格式正确'
  }
}

/**
 * 验证文件大小
 * @param file 文件对象
 * @param maxSize 最大文件大小（字节）
 * @returns 是否有效
 */
export const validateFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize
}

/**
 * 验证文件类型
 * @param file 文件对象
 * @param allowedTypes 允许的文件类型数组
 * @returns 是否有效
 */
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type)
}

/**
 * 验证图片文件
 * @param file 文件对象
 * @returns 是否有效
 */
export const validateImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  return validateFileType(file, allowedTypes)
}

/**
 * 验证音频文件
 * @param file 文件对象
 * @returns 是否有效
 */
export const validateAudioFile = (file: File): boolean => {
  const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a']
  return validateFileType(file, allowedTypes)
}

/**
 * 验证视频文件
 * @param file 文件对象
 * @returns 是否有效
 */
export const validateVideoFile = (file: File): boolean => {
  const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv']
  return validateFileType(file, allowedTypes)
}

/**
 * 验证表单数据
 * @param data 表单数据对象
 * @param rules 验证规则
 * @returns 验证结果
 */
export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    custom?: (value: any) => boolean | string
  }>
): {
  isValid: boolean
  errors: Record<string, string>
} => {
  const errors: Record<string, string> = {}
  let isValid = true
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field]
    
    // 必填检查
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors[field] = `${field}是必填项`
      isValid = false
      continue
    }
    
    if (value !== undefined && value !== null && value !== '') {
      // 长度检查
      if (typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          errors[field] = `${field}长度不能少于${rule.minLength}位`
          isValid = false
        }
        
        if (rule.maxLength && value.length > rule.maxLength) {
          errors[field] = `${field}长度不能超过${rule.maxLength}位`
          isValid = false
        }
      }
      
      // 正则表达式检查
      if (rule.pattern && !rule.pattern.test(value)) {
        errors[field] = `${field}格式不正确`
        isValid = false
      }
      
      // 自定义验证
      if (rule.custom) {
        const customResult = rule.custom(value)
        if (customResult !== true) {
          errors[field] = typeof customResult === 'string' ? customResult : `${field}验证失败`
          isValid = false
        }
      }
    }
  }
  
  return { isValid, errors }
}

/**
 * 验证信用卡号码（Luhn算法）
 * @param cardNumber 信用卡号码
 * @returns 是否有效
 */
export const validateCreditCard = (cardNumber: string): boolean => {
  if (!cardNumber) return false
  
  // 移除空格和连字符
  const cleanNumber = cardNumber.replace(/\s+/g, '').replace(/-/g, '')
  
  // 检查是否为数字
  if (!/^\d+$/.test(cleanNumber)) {
    return false
  }
  
  // Luhn算法验证
  let sum = 0
  let isEven = false
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i])
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

/**
 * 验证IPv4地址
 * @param ip IPv4地址
 * @returns 是否有效
 */
export const validateIPv4 = (ip: string): boolean => {
  if (!ip) return false
  
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return ipv4Regex.test(ip)
}

/**
 * 验证IPv6地址
 * @param ip IPv6地址
 * @returns 是否有效
 */
export const validateIPv6 = (ip: string): boolean => {
  if (!ip) return false
  
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
  return ipv6Regex.test(ip)
}
