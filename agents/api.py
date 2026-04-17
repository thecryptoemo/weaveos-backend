from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.db import get_db
import json
import uuid
import random
import asyncio

app = FastAPI(title="D2C Wingman API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class ResearchRequest(BaseModel):
    tenant_id: str
    keyword: str

@app.get("/health")
async def health():
    return {"status": "operational"}

@app.get("/sync/{tenant_id}")
async def get_all_data(tenant_id: str):
    db = await get_db()
    try:
        prods = await db.product.find_many(where={"tenantId": tenant_id}, order={"createdAt": "desc"})
        sups = await db.supplier.find_many(where={"tenantId": tenant_id}, include={"product": True}, order={"rating": "desc"})
        negs = await db.negotiation.find_many(where={"supplier": {"tenantId": tenant_id}}, include={"supplier": {"include": {"product": True}}}, order={"createdAt": "desc"})
        reps = await db.report.find_many(where={"tenantId": tenant_id}, order={"createdAt": "desc"})
        logs = await db.auditlog.find_many(where={"tenantId": tenant_id}, order={"timestamp": "desc"})
        intel = await db.intelligencealert.find_many(where={"tenantId": tenant_id}, order={"timestamp": "desc"})
        orders = await db.order.find_many(where={"tenantId": tenant_id}, include={"supplier": True}, order={"createdAt": "desc"})
        tasks = await db.agenttask.find_many(where={"tenantId": tenant_id}, order={"updatedAt": "desc"})

        return {
            "prods": prods, "sups": sups, "negs": negs, "reps": reps, 
            "logs": logs, "intel": intel, "orders": orders, "tasks": tasks
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/seed")
async def seed_data(req: dict):
    t_id = req.get("tenant_id", "hackathon_demo")
    db = await get_db()
    try:
        await db.intelligencealert.delete_many(where={"tenantId": t_id})
        await db.order.delete_many(where={"tenantId": t_id})
        await db.negotiation.delete_many(where={"supplier": {"tenantId": t_id}})
        await db.supplier.delete_many(where={"tenantId": t_id})
        await db.product.delete_many(where={"tenantId": t_id})
        await db.report.delete_many(where={"tenantId": t_id})
        await db.auditlog.delete_many(where={"tenantId": t_id})
        await db.agenttask.delete_many(where={"tenantId": t_id})
    except: pass
    await db.tenant.upsert(where={"id": t_id}, data={"create": {"id": t_id, "name": "Brand"}, "update": {}})
    await db.product.create(data={"tenantId": t_id, "name": "Organic Neem Wood Comb", "category": "Personal Care", "status": "RESEARCHING", "winningScore": 75})
    await db.product.create(data={"tenantId": t_id, "name": "Bamboo Toothbrush Set", "category": "Personal Care", "status": "SHORTLISTED", "winningScore": 82})
    p_comb = await db.product.create(data={"tenantId": t_id, "name": "Handmade Neem Comb", "category": "Personal Care", "status": "APPROVED", "winningScore": 88})
    s_green = await db.supplier.create(data={"tenantId": t_id, "productId": p_comb.id, "name": "GreenCraft Industries", "source": "IndiaMART", "price": 38.0, "moq": 1000, "rating": 4.8, "status": "APPROVED"})
    await db.order.create(data={"tenantId": t_id, "supplierId": s_green.id, "productName": "Organic Neem Wood Comb", "units": 1000, "totalAmount": 38000.0, "status": "CONFIRMED"})
    await db.intelligencealert.create(data={"tenantId": t_id, "title": "New product ready: Organic Neem Wood Comb", "type": "SUCCESS", "badge": "NEW", "content": "Product sourced at ₹38/unit with 71% margin potential."})
    await db.auditlog.create(data={"tenantId": t_id, "action": "SUPPLIER_APPROVED", "entity": "GreenCraft Industries"})
    await db.agenttask.create(data={"tenantId": t_id, "agentName": "Market Intel", "status": "MONITORING", "progress": 100, "details": "Scanned listings."})
    return {"status": "SUCCESS"}

@app.post("/research")
async def start_research(req: ResearchRequest):
    db = await get_db()
    await db.product.create(data={"tenantId": req.tenant_id, "name": f"Premium {req.keyword}", "category": "Discovery", "status": "RESEARCHING", "winningScore": random.randint(75, 95)})
    return {"status": "SUCCESS"}

@app.post("/shortlist/{id}")
async def shortlist(id: str):
    db = await get_db()
    await db.product.update(where={"id": id}, data={"status": "SHORTLISTED"})
    return {"status": "SUCCESS"}