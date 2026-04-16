from fastapi import FastAPI
from agents.api import app as fastapi_app

# Vercel needs the app object to be named 'app' at the root of index.py
app = fastapi_app