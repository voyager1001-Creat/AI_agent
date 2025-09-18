/**
 * 应用程序常量
 * 定义应用程序中使用的各种常量
 */

// 应用信息
export const APP_INFO = {
  name: '智能聊天助手',
  version: '1.0.0',
  description: '基于AI的智能聊天助手，支持情感分析和记忆管理',
  author: 'Voyager',
  website: '...',
} as const;

// API配置
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
} as const;

// 分页配置
export const PAGINATION_CONFIG = {
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 20, 50, 100],
  maxPageSize: 100,
  maxPageNumbers: 7,
} as const;

// 文件上传配置
export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedAudioTypes: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
  allowedVideoTypes: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
  maxImageSize: 5 * 1024 * 1024, // 5MB
  maxAudioSize: 20 * 1024 * 1024, // 20MB
  maxVideoSize: 100 * 1024 * 1024, // 100MB
} as const;


// 聊天配置
export const CHAT_CONFIG = {
  maxMessageLength: 10000,
  maxConversationTitle: 200,
  maxSystemPrompt: 2000,
  defaultTemperature: 0.7,
  defaultMaxTokens: 2000,
  messageTypes: {
    user: 'user',
    assistant: 'assistant',
    system: 'system',
  },
  exportFormats: [
    { value: 'json', label: 'JSON', extension: '.json' },
    { value: 'txt', label: '文本', extension: '.txt' },
    { value: 'csv', label: 'CSV', extension: '.csv' },
  ],
} as const;

// 用户配置
export const USER_CONFIG = {
  minUsernameLength: 3,
  maxUsernameLength: 20,
  minPasswordLength: 6,
  maxPasswordLength: 50,
  usernamePattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
  passwordPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
  avatarSizes: {
    small: 32,
    medium: 64,
    large: 128,
    xlarge: 256,
  },
} as const;

// 路由配置
export const ROUTES = {
  home: '/',
  chat: '/chat',
  settings: '/settings',
  profile: '/profile',
  login: '/login',
  register: '/register',
} as const;

// 本地存储键
export const STORAGE_KEYS = {
  user: 'user',
  userAvatar: 'user_avatar',
  aiAvatar: 'ai_avatar',
  theme: 'theme',
  language: 'language',
  settings: 'settings',
  conversations: 'conversations',
} as const;

// 主题配置
export const THEME_CONFIG = {
  light: {
    name: 'light',
    label: '浅色主题',
    primary: '#3B82F6',
    secondary: '#6B7280',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    info: '#3B82F6',
  },
  dark: {
    name: 'dark',
    label: '深色主题',
    primary: '#60A5FA',
    secondary: '#9CA3AF',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    border: '#374151',
    error: '#F87171',
    warning: '#FBBF24',
    success: '#34D399',
    info: '#60A5FA',
  },
} as const;

// 语言配置
export const LANGUAGE_CONFIG = {
  zh: {
    code: 'zh',
    name: '中文',
    nativeName: '中文',
    flag: '🇨🇳',
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
} as const;

// 通知配置
export const NOTIFICATION_CONFIG = {
  duration: 5000,
  position: 'top-right',
  maxCount: 5,
  types: {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
  },
} as const;

// 验证规则
export const VALIDATION_RULES = {
  required: { required: true, message: '此字段是必填的' },
  email: { type: 'email', message: '请输入有效的邮箱地址' },
  phone: { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' },
  username: {
    pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]{3,20}$/,
    message: '用户名只能包含字母、数字、下划线和中文，长度3-20位',
  },
  password: {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,50}$/,
    message: '密码必须包含大小写字母和数字，长度6-50位',
  },
  confirmPassword: (password: string) => ({
    validator: (_: any, value: string) => {
      if (!value) {
        return Promise.reject(new Error('请确认密码'));
      }
      if (value !== password) {
        return Promise.reject(new Error('两次输入的密码不一致'));
      }
      return Promise.resolve();
    },
  }),
} as const;

// 错误消息
export const ERROR_MESSAGES = {
  network: '网络连接失败，请检查网络设置',
  server: '服务器错误，请稍后重试',
  unauthorized: '未授权访问，请先登录',
  forbidden: '权限不足，无法访问此资源',
  notFound: '请求的资源不存在',
  validation: '输入数据验证失败',
  fileUpload: '文件上传失败',
  fileType: '不支持的文件类型',
  fileSize: '文件大小超出限制',
  unknown: '发生未知错误',
} as const;

// 成功消息
export const SUCCESS_MESSAGES = {
  save: '保存成功',
  create: '创建成功',
  update: '更新成功',
  delete: '删除成功',
  upload: '上传成功',
  download: '下载成功',
  export: '导出成功',
  import: '导入成功',
  login: '登录成功',
  register: '注册成功',
  logout: '退出成功',
} as const;

// 确认消息
export const CONFIRM_MESSAGES = {
  delete: '确定要删除这个项目吗？此操作不可撤销。',
  logout: '确定要退出登录吗？',
  clear: '确定要清空所有数据吗？此操作不可撤销。',
  reset: '确定要重置所有设置吗？此操作不可撤销。',
  overwrite: '文件已存在，确定要覆盖吗？',
} as const;

// 默认值
export const DEFAULT_VALUES = {
  user: {
    username: '',
    email: '',
    avatar_url: '',
    ai_avatar_url: '',
  },
  conversation: {
    title: '',
    system_prompt: '',
  },
  settings: {
    theme: 'light',
    language: 'zh',
    autoSave: true,
    notifications: true,
    sound: false,
  },
} as const;

// 导出所有常量
export default {
  APP_INFO,
  API_CONFIG,
  PAGINATION_CONFIG,
  UPLOAD_CONFIG,
  CHAT_CONFIG,
  USER_CONFIG,
  ROUTES,
  STORAGE_KEYS,
  THEME_CONFIG,
  LANGUAGE_CONFIG,
  NOTIFICATION_CONFIG,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  CONFIRM_MESSAGES,
  DEFAULT_VALUES,
};
