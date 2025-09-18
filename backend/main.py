from fastapi import FastAPI
from api.config_api import router as config_router
from api.ollama_api import router as ollama_router
from api.tts_api import router as tts_router
from api.chat_api import router as chat_router
from api.system_prompt_api import router as system_prompt_router
from datetime import datetime
from database.database_model import db

app = FastAPI(
    title="Agent Backend API",
    description="Agent项目的后端API服务",
    version="1.0.0"
)

# 初始化数据库
@app.on_event("startup")
async def startup_event():
    """应用启动时初始化数据库"""
    try:
        db.create_engine()
        db.create_tables()
        print("✅ 数据库初始化成功")
    except Exception as e:
        print(f"❌ 数据库初始化失败: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时清理资源"""
    try:
        db.close()
        print("✅ 数据库连接已关闭")
    except Exception as e:
        print(f"❌ 关闭数据库连接失败: {e}")

# 注册路由
app.include_router(config_router)
app.include_router(ollama_router)
app.include_router(tts_router)
app.include_router(chat_router)
app.include_router(system_prompt_router)

@app.get("/")
async def root():
    return {"message": "Agent Backend API 运行中", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
