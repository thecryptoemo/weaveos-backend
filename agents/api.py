from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.db import get_db
import json
import uuid
import random

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class ResearchRequest(BaseModel):
    tenant_id: str
    keyword: str

@app.get("/health")
async def health(): return {"status": "operational"}

@app.post("/seed")
async def seed_data(req: dict):
    t_id = req.get("tenant_id", "hackathon_demo")
    db = await get_db()
    await db.auditlog.delete_many(where={"tenantId": t_id})
    await db.agenttask.delete_many(where={"tenantId": t_id})
    await db.report.delete_many(where={"tenantId": t_id})
    await db.negotiation.delete_many(where={"supplier": {"tenantId": t_id}})
    await db.supplier.delete_many(where={"tenantId": t_id})
    await db.product.delete_many(where={"tenantId": t_id})
    await db.product.create(data={"tenantId": t_id, "name": "Bamboo Smart Brush", "category": "Personal Care", "status": "SHORTLISTED", "winningScore": 92})
    p = await db.product.create(data={"tenantId": t_id, "name": "Organic Yoga Mat", "category": "Home", "status": "SUPPLIER_SEARCH", "winningScore": 85})
    s = await db.supplier.create(data={"tenantId": t_id, "productId": p.id, "name": "EcoFabric Ltd", "source": "IndiaMART", "price": 1400, "rating": 4.9, "status": "NEGOTIATING"})
    await db.negotiation.create(data={"supplierId": s.id, "status": "AWAITING_REPLY", "history": json.dumps([{"role":"agent", "content":"Inquiry sent."}])})
    await db.auditlog.create(data={"tenantId": t_id, "action": "RESEARCH_STARTED", "entity": "Organic Goods"})
    await db.agenttask.create(data={"tenantId": t_id, "agentName": "Sourcing Agent", "status": "ACTIVE", "progress": 45, "details": "Scanning suppliers in Panipat"})
    await db.report.create(data={"tenantId": t_id, "title": "Market Intel: 2026 Trends", "content": "Sustainable goods are up 40% YoY.", "type": "RESEARCH"})
    return {"status": "seeded"}

@app.post("/research")
async def start_research(req: ResearchRequest):
    db = await get_db()
    prefixes = ["Premium", "Eco", "Pro", "Direct"]
    for i in range(4):
        await db.product.create(data={
            "tenantId": req.tenant_id,
            "name": f"{random.choice(prefixes)} {req.keyword} v{i+1}",
            "category": "General",
            "status": "RESEARCHING",
            "winningScore": random.randint(65, 95)
        })
    return {"status": "done"}

@app.get("/products/{tenant_id}")
async def get_products(tenant_id: str):
    db = await get_db()
    return await db.product.find_many(where={"tenantId": tenant_id}, order={"createdAt": "desc"})

@app.get("/suppliers/{tenant_id}")
async def get_suppliers(tenant_id: str):
    db = await get_db()
    return await db.supplier.find_many(where={"tenantId": tenant_id}, include={"product": True})

@app.get("/negotiations/{tenant_id}")
async def get_negotiations(tenant_id: str):
    db = await get_db()
    return await db.negotiation.find_many(where={"supplier": {"tenantId": tenant_id}}, include={"supplier": True})

@app.get("/reports/{tenant_id}")
async def get_reports(tenant_id: str):
    db = await get_db()
    return await db.report.find_many(where={"tenantId": tenant_id})

@app.get("/logs/{tenant_id}")
async def get_logs(tenant_id: str):
    db = await get_db()
    return await db.auditlog.find_many(where={"tenantId": tenant_id})

@app.get("/tasks/{tenant_id}")
async def get_tasks(tenant_id: str):
    db = await get_db()
    return await db.agenttask.find_many(where={"tenantId": tenant_id})

@app.post("/shortlist/{product_id}")
async def shortlist(product_id: str):
    db = await get_db()
    await db.product.update(where={"id": product_id}, data={"status": "SHORTLISTED"})
    return {"status": "done"}
