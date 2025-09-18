# Agent Backend API

## 项目概述

Agent Backend API 是一个基于 FastAPI 的智能对话系统后端服务，集成了 AI 对话、语音合成(TTS)和情感分析功能。系统采用分层架构设计，提供完整的 RESTful API 接口。

## 技术栈

- **框架**: FastAPI 0.104.0+
- **数据库**: SQLAlchemy + SQLite
- **AI模型**: Ollama (qwen2.5:1.5b)
- **语音合成**: IndexTTS
- **情感分析**: 自定义情感分析模型
- **日志**: Python logging
- **验证**: Pydantic

## 项目结构

```
backend/
├── api/                    # API路由层
│   ├── chat_api.py        # 聊天对话API
│   ├── config_api.py      # 配置管理API
│   ├── ollama_api.py      # Ollama模型API
│   └── tts_api.py         # 语音合成API
├── core/                   # 核心业务逻辑
│   ├── agent.py           # AI智能体
│   └── services/          # 业务服务层
│       ├── chat_service.py        # 聊天服务
│       ├── system_prompt_service.py # 系统提示词服务
│       └── user_service.py        # 用户服务
├── database/               # 数据库层
│   └── database_model.py  # 数据库模型和连接
├── models/                 # 数据模型
│   ├── base.py            # 基础模型类
│   ├── conversation.py    # 对话模型
│   ├── system_prompt.py   # 系统提示词模型
│   └── user.py            # 用户模型
├── emotion_model/          # 情感分析模型
│   ├── emotion_enhance.py # 情感分析核心
│   └── Chinese-Emotion-Small/ # 预训练模型
├── index-tts/              # TTS服务集成
│   ├── indextts/          # IndexTTS核心代码
│   ├── checkpoints/       # 模型检查点
│   └── examples/          # 示例音频文件
├── utils/                  # 工具函数
│   ├── db_utils.py        # 数据库工具
│   ├── logger_config.py   # 日志配置
│   ├── date_utils.py      # 日期工具
│   ├── text_utils.py      # 文本工具
│   ├── file_utils.py      # 文件工具
│   └── validation_utils.py # 验证工具
├── logs/                   # 日志文件目录
├── main.py                 # 应用入口
├── start_server.py         # 服务器启动脚本
└── requirements.txt        # 依赖包列表
```

## 核心功能模块

### 1. AI对话系统

**核心组件**: `core/agent.py`
- **功能**: 集成 Ollama 模型进行智能对话
- **特性**: 
  - 支持系统提示词自定义
  - 上下文感知对话
  - 时间信息提取
  - 错误处理和降级

**API端点**: `/api/chat/*`
- `POST /api/chat/send` - 发送消息并获取AI回复
- `GET /api/chat/conversations` - 获取对话列表
- `GET /api/chat/conversations/{id}/messages` - 获取消息历史
- `DELETE /api/chat/conversations/{id}` - 删除对话
- `GET /api/chat/stats` - 获取聊天统计

### 2. 语音合成(TTS)

**核心组件**: `api/tts_api.py`
- **功能**: 集成 IndexTTS 进行语音合成
- **特性**:
  - 情感感知语音合成
  - 多说话人支持
  - 音频文件管理
  - 实时语音生成

**API端点**: `/api/tts/*`
- `POST /api/tts/synthesize` - 带情感分析的语音合成

### 3. 模型管理

**核心组件**: `api/ollama_api.py`
- **功能**: Ollama 模型管理和调用
- **特性**:
  - 模型列表获取
  - 默认模型设置
  - 模型信息展示
  - 动态配置更新

**API端点**: `/api/ollama/*`
- `GET /api/ollama/models` - 获取可用模型列表
- `POST /api/ollama/chat` - 直接调用模型生成
- `GET /api/ollama/default-model` - 获取默认模型
- `POST /api/ollama/set-default/{model_name}` - 设置默认模型

### 4. 配置管理

**核心组件**: `api/config_api.py`
- **功能**: 系统配置管理和持久化
- **特性**:
  - JSON配置文件管理
  - 动态配置更新
  - 配置验证和默认值
  - 多服务配置支持

**API端点**: `/api/config/*`
- `GET /api/config` - 获取完整配置
- `GET /api/config/ollama` - 获取Ollama配置
- `PUT /api/config/ollama` - 更新Ollama配置
- `GET /api/config/index-tts` - 获取TTS配置
- `PUT /api/config/index-tts` - 更新TTS配置

## 数据模型

### 用户模型 (User)
```python
class User(BaseModel):
    id: int                    # 用户ID
    username: str             # 用户名
    email: str                # 邮箱
    created_at: datetime      # 创建时间
    updated_at: datetime      # 更新时间
```

### 对话模型 (Conversation)
```python
class Conversation(BaseModel):
    id: int                   # 对话ID
    user_id: int             # 用户ID
    title: str               # 对话标题
    system_prompt: str       # 系统提示词
    created_at: datetime     # 创建时间
    updated_at: datetime     # 更新时间
```

### 消息模型 (Message)
```python
class Message(BaseModel):
    id: int                   # 消息ID
    conversation_id: int     # 对话ID
    role: str                # 角色 (user/assistant)
    content: str             # 消息内容
    content_type: str        # 内容类型 (text/audio/image)
    message_metadata: dict   # 消息元数据
    created_at: datetime     # 创建时间
```

### 系统提示词模型 (SystemPrompt)
```python
class SystemPrompt(BaseModel):
    id: int                   # 提示词ID
    user_id: int             # 用户ID
    system_prompt: str       # 提示词内容
    is_active: bool          # 是否激活
    created_at: datetime     # 创建时间
    updated_at: datetime     # 更新时间
```

## 服务层架构

### 聊天服务 (ChatService)
- **职责**: 对话和消息管理
- **功能**: 创建对话、添加消息、获取历史、删除对话
- **特性**: 分页查询、搜索功能、统计信息、导出功能

### 用户服务 (UserService)
- **职责**: 用户信息管理
- **功能**: 用户创建、更新、查询、删除
- **特性**: 用户验证、权限管理

### 系统提示词服务 (SystemPromptService)
- **职责**: 系统提示词管理
- **功能**: 提示词创建、更新、激活、删除
- **特性**: 多用户支持、默认提示词

## 工具模块

### 数据库工具 (db_utils.py)
- **功能**: 统一的数据库会话管理
- **特性**: 上下文管理器、事务处理、连接池管理
- **模式**: 自动提交、异常回滚、资源清理

### 日志配置 (logger_config.py)
- **功能**: 统一的日志记录系统
- **特性**: 多级别日志、文件轮转、控制台输出
- **配置**: 自动创建日志目录、格式化输出

### 日期工具 (date_utils.py)
- **功能**: 日期时间处理工具
- **特性**: 时区处理、格式化、相对时间计算

### 文本工具 (text_utils.py)
- **功能**: 文本处理工具
- **特性**: 文本清洗、格式化、验证

## 配置系统

### 配置文件结构
```json
{
  "ollama": {
    "base_url": "http://localhost:11434",
    "default_model": "qwen2.5:1.5b",
    "timeout": 60
  },
  "index_tts": {
    "base_url": "http://localhost:8000",
    "default_audio_prompt": "examples/natural.wav",
    "default_emotion_natural": "examples/natural.wav",
    "default_emotion_care": "examples/care.wav",
    "default_emotion_happy": "examples/happy.wav",
    "default_emotion_sad": "examples/sad.wav",
    "default_emotion_question": "examples/question.wav",
    "default_emotion_surprised": "examples/surprise.wav",
    "default_emotion_disgusted": "examples/emo_hate.wav",
    "timeout": 60
  },
  "system_prompt": {
    "default_system_prompt": "你是一个有用的AI助手。",
    "timeout": 60
  }
}
```

## 错误处理

### 统一错误处理机制
- **HTTP异常**: 使用 FastAPI 的 HTTPException
- **业务异常**: 自定义业务逻辑异常
- **数据库异常**: SQLAlchemy 异常处理
- **日志记录**: 完整的错误日志和堆栈跟踪

### 错误响应格式
```json
{
  "success": false,
  "error": "错误描述",
  "timestamp": "2024-01-01T12:00:00",
  "detail": "详细错误信息"
}
```

## 性能优化

### 数据库优化
- **连接池**: SQLAlchemy 连接池管理
- **索引**: 关键字段索引优化
- **查询优化**: 分页查询、懒加载

### API优化
- **异步处理**: FastAPI 异步支持
- **请求验证**: Pydantic 数据验证
- **响应缓存**: 适当的数据缓存

### 日志优化
- **异步日志**: 非阻塞日志记录
- **日志轮转**: 自动日志文件管理
- **性能监控**: 请求响应时间记录

## 安全考虑

### 输入验证
- **数据验证**: Pydantic 模型验证
- **SQL注入防护**: SQLAlchemy ORM 保护
- **XSS防护**: 输入数据清理

### 错误安全
- **敏感信息**: 错误信息脱敏
- **异常处理**: 安全的异常信息返回
- **日志安全**: 避免敏感数据记录

## 扩展性设计

### 模块化架构
- **分层设计**: API/Service/Model 分离
- **依赖注入**: 服务层依赖管理
- **插件系统**: 可扩展的组件设计

### 配置驱动
- **动态配置**: 运行时配置更新
- **环境适配**: 多环境配置支持
- **服务发现**: 外部服务配置管理

## 监控和调试

### 健康检查
- **API健康**: `/health` 端点
- **服务状态**: 依赖服务状态检查
- **资源监控**: 内存、CPU使用情况

### 调试支持
- **详细日志**: 多级别日志输出
- **请求跟踪**: 请求ID跟踪
- **性能分析**: 响应时间统计

## 部署架构

### 服务依赖
- **Ollama服务**: AI模型服务 (端口11434)
- **IndexTTS服务**: 语音合成服务 (端口8000)
- **数据库**: SQLite 数据库文件
- **日志文件**: 本地日志目录

### 端口配置
- **API服务**: 8001端口
- **健康检查**: 内置健康检查端点
- **API文档**: 自动生成的OpenAPI文档

## 版本信息

- **当前版本**: 1.0.0
- **API版本**: v1
- **Python版本**: 3.8+
- **FastAPI版本**: 0.104.0+
- **SQLAlchemy版本**: 2.0+

## 开发规范

### 代码规范
- **PEP 8**: Python代码风格
- **类型注解**: 完整的类型提示
- **文档字符串**: 详细的函数文档
- **错误处理**: 统一的异常处理

### 测试规范
- **单元测试**: 核心功能测试
- **集成测试**: API端点测试
- **错误测试**: 异常情况测试

---

*本文档描述了 Agent Backend API 的完整架构和功能模块。系统采用现代化的微服务架构，支持高并发、可扩展的AI对话服务。*
