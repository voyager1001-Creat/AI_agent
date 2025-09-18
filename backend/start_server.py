#!/usr/bin/env python3
"""
Agent Backend API 服务器启动脚本
"""

import uvicorn
import sys
import os
from pathlib import Path

# 获取项目根目录和backend目录
project_root = Path(__file__).parent.parent.absolute()
backend_dir = Path(__file__).parent.absolute()

# 添加项目根目录到Python路径（用于config等模块）
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

# 添加backend目录到Python路径（用于相对导入）
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# 设置工作目录为backend目录
os.chdir(backend_dir)

if __name__ == "__main__":
    print("🚀 启动Agent Backend API服务器...")
    print(f"📍 项目根目录: {project_root}")
    print(f"📍 Backend目录: {backend_dir}")
    print(f"📍 当前工作目录: {os.getcwd()}")
    print(f"📍 Python路径: {sys.path[:3]}...")  # 只显示前3个路径
    print("📍 服务地址: http://localhost:8001")
    print("📖 API文档: http://localhost:8001/docs")
    print("📖 ReDoc文档: http://localhost:8001/redoc")
    print("⏹️  按 Ctrl+C 停止服务")
    print("-" * 50)
    
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8001,
            reload=True,  # 开发模式，代码变更时自动重启
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 服务器已停止")
    except Exception as e:
        print(f"❌ 服务器启动失败: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)