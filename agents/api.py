from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.sourcing.graph import sourcing_graph
from agents.sourcing.negotiator import NegotiationAgent
from agents.db import get_db
import json
import uuid
import random
import traceback

app = FastAPI(title="D2C Wingman API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class ResearchRequest(BaseModel):
    tenant_id: str
    keyword: str

@app.get("/")
async def root():
    return {"name": "D2C Wingman API", "status": "operational"}

@app.get("/health")
async def health():
    try:
        db = await get_db()
        return {"status": "operational", "db": "connected"}
    except Exception as e:
        return {"status": "db_error", "error": str(e)}

@app.post("/seed")
async def seed_data(req: dict):
    t_id = req.get("tenant_id", "hackathon_demo")
    try:
        db = await get_db()
        
        # Super safe delete strategy
        await db.negotiation.delete_many(where={"supplier": {"tenantId": t_id}})
        await db.supplier.delete_many(where={"tenantId": t_id})
        await db.product.delete_many(where={"tenantId": t_id})
        await db.report.delete_many(where={"tenantId": t_id})
        await db.auditlog.delete_many(where={"tenantId": t_id})
        await db.agenttask.delete_many(where={"tenantId": t_id})

        await db.tenant.upsert(
            where={"id": t_id},
            data={"create": {"id": t_id, "name": "Hackathon Brand"}, "update": {}}
        )
        
        # Seeding a flow: Shortlisted -> Supplier Discovered -> Negotiating
        await db.product.create(data={
            "tenantId": t_id, "name": "Bamboo Smart Brush", "category": "Personal Care", 
            "status": "SHORTLISTED", "winningScore": 92
        })
        
        p = await db.product.create(data={
            "tenantId": t_id, "name": "Organic Yoga Mat", "category": "Fitness", 
            "status": "SUPPLIER_SEARCH", "winningScore": 85
        })
        
        s = await db.supplier.create(data={
            "tenantId": t_id, "productId": p.id, "name": "EcoFabric Ltd", 
            "source": "IndiaMART", "price": 1400, "rating": 4.9, "status": "NEGOTIATING"
        })
        
        await db.negotiation.create(data={
            "supplierId": s.id, "status": "AWAITING_REPLY", 
            "history": json.dumps([{"role":"agent", "content":"Inquiry sent to EcoFabric."}])
        })
        
        await db.agenttask.create(data={
            "tenantId": t_id, "agentName": "Sourcing Agent", "status": "NEGOTIATING", 
            "progress": 65, "details": "Waiting for counter-offer from EcoFabric"
        })

        await db.report.create(data={
            "tenantId": t_id, "title": "Market Opp: Bamboo Products", 
            "content": "High search volume (45k/mo) with low domestic competition.", 
            "type": "RESEARCH"
        })

        return {"status": "SUCCESS"}
    except Exception as e:
        return {"status": "ERROR", "message": str(e), "trace": traceback.format_exc()}

@app.post("/research")
async def start_research(req: ResearchRequest):
    try:
        db = await get_db()
        prefixes = ["Premium", "Eco", "Elite", "Pro"]
        for i in range(4):
            await db.product.create(data={
                "tenantId": req.tenant_id,
                "name": f"{random.choice(prefixes)} {req.keyword} v{i+1}",
                "category": "Discovery",
                "status": "RESEARCHING",
                "winningScore": random.randint(70, 96)
            })
        return {"status": "SUCCESS"}
    except Exception as e:
        return {"status": "ERROR", "message": str(e)}

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
    return {"status": "SUCCESS"}
