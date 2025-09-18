# Agent Frontend

基于 React + TypeScript + Tailwind CSS 的 AI 智能助手前端应用。

## 功能特性

- 🤖 **智能对话** - 与 AI 进行实时对话
- 📚 **对话历史** - 查看和管理历史对话
- ⚙️ **系统设置** - 配置 Ollama 和 TTS 服务
- 🎨 **现代 UI** - 响应式设计，支持深色模式
- 🔄 **实时更新** - 自动滚动和状态管理

## 技术栈

- **React 18** - 用户界面框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **React Router** - 路由管理
- **Vite** - 构建工具
- **Axios** - HTTP 客户端

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 启动

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 项目结构

```
frontend/
├── public/                 # 静态资源
├── src/
│   ├── components/         # React 组件
│   │   ├── ui/            # 基础 UI 组件
│   │   └── Layout.tsx     # 布局组件
│   ├── pages/             # 页面组件
│   │   ├── ChatPage.tsx   # 聊天页面
│   │   ├── ConversationsPage.tsx # 对话历史页面
│   │   └── SettingsPage.tsx # 设置页面
│   ├── hooks/             # 自定义 Hooks
│   ├── services/          # API 服务
│   ├── types/             # TypeScript 类型定义
│   ├── utils/             # 工具函数
│   ├── App.tsx            # 主应用组件
│   └── main.tsx           # 应用入口
├── package.json           # 项目配置
├── vite.config.ts         # Vite 配置
├── tailwind.config.js     # Tailwind 配置
└── tsconfig.json          # TypeScript 配置
```

## 主要页面

### 聊天页面 (`/chat`)
- 实时对话界面
- 消息发送和接收
- 自动滚动和加载状态

### 对话历史 (`/conversations`)
- 查看所有对话记录
- 搜索和筛选功能
- 导出和删除对话

### 系统设置 (`/settings`)
- Ollama 服务配置
- TTS 服务配置
- 连接测试功能

## API 集成

前端通过以下方式与后端 API 集成：

- **聊天 API** - 发送消息、获取回复
- **对话 API** - 管理对话历史
- **配置 API** - 系统配置管理
- **TTS API** - 语音合成功能

## 开发说明

### 环境要求
- Node.js 16+
- npm 或 yarn

### 开发命令
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 代码检查
npm run lint

# 构建项目
npm run build
```

### 代理配置
开发环境下，API 请求会自动代理到后端服务 (http://localhost:8001)

## 部署

### 构建
```bash
npm run build
```

### 静态文件部署
将 `dist` 目录部署到任何静态文件服务器即可。

### Nginx 配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 浏览器支持

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 许可证

MIT License
