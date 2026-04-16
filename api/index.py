import os
import sys

root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_path not in sys.path:
    sys.path.append(root_path)

try:
    from agents.api import app
except Exception as e:
    from fastapi import FastAPI
    app = FastAPI()
    @app.get("/")
    @app.get("/health")
    async def health():
        return {
            "status": "initialization_error",
            "error": str(e),
            "cwd": os.getcwd(),
            "sys_path": sys.path
        }