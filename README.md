# Agent - AI Assistant Project

A modern AI assistant system built with cutting-edge web technologies, integrating large language models, emotion analysis, and speech synthesis for a complete conversational experience.

## 🌟 Key Features

- **🤖 Intelligent Chat**: Local large language models via Ollama with multi-model support
- **🎭 Emotion Analysis**: Integrated Chinese-Emotion-Small model for intelligent emotion recognition
- **🎵 Speech Synthesis**: IndexTTS2-powered emotional speech synthesis with multiple emotion expressions
- **💬 Conversation Management**: Complete conversation history and system prompt configuration
- **🎨 Modern UI**: Responsive interface built with React + TypeScript + Tailwind CSS
- **⚡ Real-time Interaction**: WebSocket support for real-time messaging and status updates

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management

### Backend Stack
- **FastAPI** - High-performance Python web framework
- **SQLAlchemy** - Python SQL toolkit and ORM
- **SQLite** - Lightweight database
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation and serialization

### AI/ML Components
- **Ollama** - Local large language model runtime
- **Transformers** - Hugging Face model library
- **IndexTTS2** - Emotional speech synthesis model
- **Chinese-Emotion-Small** - Chinese emotion analysis model

## 📋 System Requirements

- **Python**: 3.10+
- **Node.js**: 16+
- **npm**: 8+
- **uv**: Latest version (for IndexTTS2)
- **Git LFS**: For downloading large model files
- **Conda**: For Python environment management

## 🚀 Deployment Guide

### 1. Configure IndexTTS2 Service

IndexTTS2 is a breakthrough emotional speech synthesis model supporting zero-shot emotion expression and duration control.

```bash
# Navigate to IndexTTS2 directory
cd agent/backend/index-tts

# Pull large files (requires Git LFS)
git lfs pull

# Install dependencies (using uv)
uv sync

# Download IndexTTS2 model (choose one method)

# Method 1: Using Hugging Face
hf download IndexTeam/IndexTTS-2 --local-dir=checkpoints

# Method 2: Using ModelScope
modelscope download --model IndexTeam/IndexTTS-2 --local_dir checkpoints
```

**Note**: IndexTTS2 model files are large, ensure sufficient storage space and network bandwidth.

### 2. Install Main Environment Dependencies

```bash
# Navigate to project root
cd agent

# Create Python environment
conda create -n agent python=3.10
conda activate agent

# Install dependencies
pip install -r requirements.txt
```

### 3. Download Emotion Analysis Model

```bash
# Navigate to emotion model directory
cd agent/backend/emotion_model

# Download Chinese-Emotion-Small model
python -c "
from transformers import pipeline
pipe = pipeline('text-classification', model='Johnson8187/Chinese-Emotion-Small')
"
```

### 4. Start the Project

#### 4.1 Start Frontend Service

```bash
# Navigate to frontend directory
cd agent/frontend

# Install dependencies
npm install

# Build project
npm run build

# Start development server
npm run dev
```

Frontend service will start at `http://localhost:5173`

#### 4.2 Start Backend API Service

```bash
# Navigate to backend directory
cd agent/backend

# Start FastAPI server
python start_server.py
```

Backend API service will start at `http://localhost:8001`

#### 4.3 Start TTS Service

```bash
# Navigate to TTS service directory
cd agent/backend/index-tts

# Start TTS service
uv run start_tts_service.py
```

TTS service will start at `http://localhost:8000`

## 🎯 Usage Guide

### Basic Features

1. **Chat Conversation**: Input messages in the chat interface for AI assistant responses
2. **Voice Playback**: Click the play button next to messages for emotional voice reading
3. **Conversation Management**: View conversation history, create new conversations, manage conversation titles
4. **System Configuration**: Configure Ollama models, TTS service, and system prompts

### Advanced Features

1. **System Prompt Management**: 
   - Create custom system prompts
   - Edit and delete existing prompts
   - Activate/deactivate prompts

2. **Emotional Speech**: 
   - Automatic user emotion recognition
   - Select appropriate voice styles based on emotions
   - Support for multiple emotion expressions

3. **Model Management**: 
   - Switch between different Ollama models
   - Configure model parameters
   - Test model connections

## 📁 Project Structure

```
agent/
├── frontend/                 # Frontend React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   └── types/           # TypeScript type definitions
│   └── package.json
├── backend/                  # Backend FastAPI application
│   ├── api/                 # API routes
│   ├── core/                # Core business logic
│   ├── models/              # Data models
│   ├── database/            # Database configuration
│   ├── emotion_model/       # Emotion analysis model
│   ├── index-tts/          # IndexTTS2 service
│   └── utils/               # Utility functions
├── config/                  # Configuration files
└── requirements.txt         # Python dependencies
```

## 🔧 Configuration

### Environment Variables

Create `.env` file to configure environment variables:

```env
# Ollama configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=qwen3:1.7b

# TTS configuration
INDEX_TTS_BASE_URL=http://localhost:8000
INDEX_TTS_TIMEOUT=60

# Database configuration
DATABASE_URL=sqlite:///./chat.db
```

### Model Configuration

Configure model parameters in `config/settings.json`:

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

## 🐛 Troubleshooting

### Common Issues

1. **TTS Service Startup Failure**
   - Check if uv is properly installed
   - Confirm IndexTTS2 model files are downloaded
   - Check if port 8000 is occupied

2. **Ollama Connection Failure**
   - Confirm Ollama service is running
   - Check if models are downloaded
   - Verify port 11434 is accessible

3. **Frontend Build Failure**
   - Check Node.js version (requires 16+)
   - Clear node_modules and reinstall
   - Check network connection

### Log Viewing

- Backend logs: `backend/logs/`
- TTS service logs: Console output
- Frontend logs: Browser developer tools

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [IndexTTS2](https://github.com/IndexTeam/IndexTTS-2) - Emotional speech synthesis model
- [Ollama](https://ollama.ai/) - Local large language model runtime
- [Hugging Face](https://huggingface.co/) - Model library and tools
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [React](https://reactjs.org/) - User interface library

---

**Note**: This project is for educational and research purposes only. Please comply with relevant laws and regulations and model usage terms.

## 📖 Documentation

- [中文文档](README_zh.md) - Chinese documentation
- [API Documentation](http://localhost:8001/docs) - FastAPI auto-generated docs
- [Frontend Documentation](frontend/README.md) - Frontend specific documentation
- [Backend Documentation](backend/README.md) - Backend specific documentation