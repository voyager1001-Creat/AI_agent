# Agent - AI智能助手项目

一个基于现代Web技术栈构建的AI智能助手系统，集成了大语言模型、情感分析和语音合成功能，提供完整的聊天对话体验。

## 🌟 项目特色

- **🤖 智能对话**: 基于Ollama的本地大语言模型，支持多种模型切换
- **🎭 情感分析**: 集成Chinese-Emotion-Small模型，智能识别用户情感
- **🎵 语音合成**: 使用IndexTTS2进行情感化语音合成，支持多种情感表达
- **💬 对话管理**: 完整的对话历史管理和系统提示词配置
- **🎨 现代UI**: 基于React + TypeScript + Tailwind CSS的响应式界面
- **⚡ 实时交互**: WebSocket支持实时消息推送和状态更新

## 🏗️ 技术架构

### 前端技术栈
- **React 18** - 现代化用户界面框架
- **TypeScript** - 类型安全的JavaScript
- **Tailwind CSS** - 实用优先的CSS框架
- **Vite** - 快速的构建工具
- **React Router** - 客户端路由
- **Zustand** - 轻量级状态管理

### 后端技术栈
- **FastAPI** - 高性能Python Web框架
- **SQLAlchemy** - Python SQL工具包和ORM
- **SQLite** - 轻量级数据库
- **Uvicorn** - ASGI服务器
- **Pydantic** - 数据验证和序列化

### AI/ML组件
- **Ollama** - 本地大语言模型运行环境
- **Transformers** - Hugging Face模型库
- **IndexTTS2** - 情感化语音合成模型
- **Chinese-Emotion-Small** - 中文情感分析模型

## 📋 系统要求

- **Python**: 3.10+
- **Node.js**: 16+
- **npm**: 8+
- **uv**: 最新版本（用于IndexTTS2）
- **Git LFS**: 用于下载大模型文件
- **Conda**: 用于Python环境管理

## 🚀 部署指南

### 1. 配置IndexTTS2服务

IndexTTS2是一个突破性的情感化语音合成模型，支持零样本情感表达和时长控制。

```bash
# 进入IndexTTS2目录
cd agent/backend/index-tts

# 拉取大文件（需要Git LFS）
git lfs pull

# 安装依赖（使用uv）
uv sync

# 下载IndexTTS2模型（选择其中一种方式）

# 方式1: 使用Hugging Face
hf download IndexTeam/IndexTTS-2 --local-dir=checkpoints

# 方式2: 使用ModelScope
modelscope download --model IndexTeam/IndexTTS-2 --local_dir checkpoints
```

**注意**: IndexTTS2模型文件较大，请确保有足够的存储空间和网络带宽。

### 2. 安装主环境依赖

```bash
# 进入项目根目录
cd agent

# 创建Python环境
conda create -n agent python=3.10
conda activate agent

# 安装依赖
pip install -r requirements.txt
```

### 3. 下载情感分析模型

```bash
# 进入情感模型目录
cd agent/backend/emotion_model

# 下载Chinese-Emotion-Small模型
python -c "
from transformers import pipeline
pipe = pipeline('text-classification', model='Johnson8187/Chinese-Emotion-Small')
"
```

### 4. 启动项目

#### 4.1 启动前端服务

```bash
# 进入前端目录
cd agent/frontend

# 安装依赖
npm install

# 构建项目
npm run build

# 启动开发服务器
npm run dev
```

前端服务将在 `http://localhost:5173` 启动

#### 4.2 启动后端API服务

```bash
# 进入后端目录
cd agent/backend

# 启动FastAPI服务器
python start_server.py
```

后端API服务将在 `http://localhost:8001` 启动

#### 4.3 启动TTS服务

```bash
# 进入TTS服务目录
cd agent/backend/index-tts

# 启动TTS服务
uv run start_tts_service.py
```

TTS服务将在 `http://localhost:8000` 启动

## 🎯 使用指南

### 基本功能

1. **聊天对话**: 在聊天界面输入消息，AI助手会智能回复
2. **语音播放**: 点击消息旁的播放按钮，AI会使用情感化语音朗读回复
3. **对话管理**: 查看历史对话，创建新对话，管理对话标题
4. **系统配置**: 配置Ollama模型、TTS服务和系统提示词

### 高级功能

1. **系统提示词管理**: 
   - 创建自定义系统提示词
   - 编辑和删除现有提示词
   - 激活/停用提示词

2. **情感化语音**: 
   - 自动识别用户情感
   - 根据情感选择合适的语音风格
   - 支持多种情感表达

3. **模型管理**: 
   - 切换不同的Ollama模型
   - 配置模型参数
   - 测试模型连接

## 📁 项目结构

```
agent/
├── frontend/                 # 前端React应用
│   ├── src/
│   │   ├── components/      # React组件
│   │   ├── pages/           # 页面组件
│   │   ├── hooks/           # 自定义Hooks
│   │   ├── services/        # API服务
│   │   └── types/           # TypeScript类型定义
│   └── package.json
├── backend/                  # 后端FastAPI应用
│   ├── api/                 # API路由
│   ├── core/                # 核心业务逻辑
│   ├── models/              # 数据模型
│   ├── database/            # 数据库配置
│   ├── emotion_model/       # 情感分析模型
│   ├── index-tts/          # IndexTTS2服务
│   └── utils/               # 工具函数
├── config/                  # 配置文件
└── requirements.txt         # Python依赖
```

## 🔧 配置说明

### 环境变量

创建 `.env` 文件配置环境变量：

```env
# Ollama配置
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=qwen3:1.7b

# TTS配置
INDEX_TTS_BASE_URL=http://localhost:8000
INDEX_TTS_TIMEOUT=60

# 数据库配置
DATABASE_URL=sqlite:///./chat.db
```

### 模型配置

在 `config/settings.json` 中配置模型参数：

```json
{
  "ollama": {
    "base_url": "http://localhost:11434",
    "default_model": "qwen3:1.7b",
    "timeout": 60
  },
  "index_tts": {
    "base_url": "http://localhost:8000",
    "default_audio_prompt": "examples/natural.wav",
    "timeout": 60
  }
}
```

## 🐛 故障排除

### 常见问题

1. **TTS服务启动失败**
   - 检查uv是否正确安装
   - 确认IndexTTS2模型文件已下载
   - 检查端口8000是否被占用

2. **Ollama连接失败**
   - 确认Ollama服务正在运行
   - 检查模型是否已下载
   - 验证端口11434是否可访问

3. **前端构建失败**
   - 检查Node.js版本（需要16+）
   - 清除node_modules重新安装
   - 检查网络连接

### 日志查看

- 后端日志: `backend/logs/`
- TTS服务日志: 控制台输出
- 前端日志: 浏览器开发者工具

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [IndexTTS2](https://github.com/IndexTeam/IndexTTS-2) - 情感化语音合成模型
- [Ollama](https://ollama.ai/) - 本地大语言模型运行环境
- [Hugging Face](https://huggingface.co/) - 模型库和工具
- [FastAPI](https://fastapi.tiangolo.com/) - 现代Python Web框架
- [React](https://reactjs.org/) - 用户界面库

---

**注意**: 本项目仅供学习和研究使用，请遵守相关法律法规和模型使用条款。

## 📖 文档

- [English Documentation](README.md) - 英文文档
- [API Documentation](http://localhost:8001/docs) - FastAPI自动生成文档
- [Frontend Documentation](frontend/README.md) - 前端专用文档
- [Backend Documentation](backend/README.md) - 后端专用文档
