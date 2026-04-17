from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.db import get_db
import json
import uuid
import random
from datetime import datetime

app = FastAPI(title="D2C Wingman API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResearchRequest(BaseModel):
    tenant_id: str
    keyword: str

class NegotiateRequest(BaseModel):
    tenant_id: str
    supplier_id: str
    supplier_email: str
    target_price: float

class ChatRequest(BaseModel):
    tenant_id: str
    message: str

@app.get("/")
async def root():
    return {"name": "D2C Wingman API", "status": "operational"}

@app.get("/health")
async def health():
    try:
        db = await get_db()
        return {"status": "operational", "db": "connected"}
    except Exception as e:
        return {"status": "error", "msg": str(e)}

@app.post("/seed")
async def seed_data(req: dict):
    t_id = req.get("tenant_id", "hackathon_demo")
    db = await get_db()
    try:
        await db.negotiation.delete_many(where={"supplier": {"tenantId": t_id}})
        await db.supplier.delete_many(where={"tenantId": t_id})
        await db.product.delete_many(where={"tenantId": t_id})
        await db.report.delete_many(where={"tenantId": t_id})
        await db.auditlog.delete_many(where={"tenantId": t_id})
        await db.agenttask.delete_many(where={"tenantId": t_id})
    except: pass
    await db.tenant.upsert(where={"id": t_id}, data={"create": {"id": t_id, "name": "Brand"}, "update": {}})
    await db.product.create(data={"tenantId": t_id, "name": "Bamboo Smart Toothbrush", "category": "Personal Care", "status": "RESEARCHING", "winningScore": 89.2})
    await db.product.create(data={"tenantId": t_id, "name": "Premium Silk Pillowcases", "category": "Home", "status": "SHORTLISTED", "winningScore": 94.5})
    p_rug = await db.product.create(data={"tenantId": t_id, "name": "Organic Cotton Rug", "category": "Wellness", "status": "SUPPLIER_SEARCH", "winningScore": 76.4, "marketData": json.dumps({"price": 4500})})
    s_eco = await db.supplier.create(data={"tenantId": t_id, "productId": p_rug.id, "name": "EcoFabric Ltd", "source": "IndiaMART", "price": 1650.0, "rating": 4.9, "status": "NEGOTIATING"})
    await db.supplier.create(data={"tenantId": t_id, "productId": p_rug.id, "name": "Textile India", "source": "IndiaMART", "price": 1800.0, "rating": 4.6, "status": "DISCOVERED"})
    await db.negotiation.create(data={"supplierId": s_eco.id, "status": "AWAITING_REPLY", "history": json.dumps([{"role": "agent", "content": "Hi EcoFabric team, we're looking to procure Organic Cotton Yoga Rugs. Our target price is ₹1100 given our scale. Can you support this?"}, {"role": "supplier", "content": "Thank you. ₹1100 is low. We can offer ₹1400 for 500 units."}])})
    await db.report.create(data={"tenantId": t_id, "title": "Supply Chain Risk Analysis", "content": "AI identified low risk weaving clusters in Panipat.", "type": "SOURCING"})
    await db.auditlog.create(data={"tenantId": t_id, "action": "RESEARCH_STARTED", "entity": "Organic Goods"})
    await db.auditlog.create(data={"tenantId": t_id, "action": "PRODUCT_SHORTLISTED", "entity": "Silk Pillowcases"})
    await db.agenttask.create(data={"tenantId": t_id, "agentName": "Sourcing Agent", "status": "NEGOTIATING", "progress": 65, "details": "Evaluating counter-offer from EcoFabric Ltd"})
    return {"status": "SUCCESS"}

@app.get("/products/{tenant_id}")
async def get_products(tenant_id: str):
    db = await get_db()
    return await db.product.find_many(where={"tenantId": tenant_id}, order={"createdAt": "desc"})

@app.post("/shortlist/{product_id}")
async def shortlist_product(product_id: str):
    db = await get_db()
    await db.product.update(where={"id": product_id}, data={"status": "SHORTLISTED"})
    return {"status": "SUCCESS"}

@app.post("/discover-suppliers/{product_id}")
async def discover_suppliers(product_id: str):
    db = await get_db()
    product = await db.product.find_unique(where={"id": product_id})
    await db.supplier.create(data={"tenantId": product.tenantId, "productId": product.id, "name": "Global Sourcing Ltd", "source": "IndiaMART", "price": 1100.0, "rating": 4.5, "status": "DISCOVERED"})
    await db.product.update(where={"id": product_id}, data={"status": "SUPPLIER_SEARCH"})
    return {"status": "SUCCESS"}

@app.get("/suppliers/{tenant_id}")
async def get_suppliers(tenant_id: str):
    db = await get_db()
    return await db.supplier.find_many(where={"tenantId": tenant_id}, include={"product": True}, order={"rating": "desc"})

@app.get("/negotiations/{tenant_id}")
async def get_negotiations(tenant_id: str):
    db = await get_db()
    return await db.negotiation.find_many(where={"supplier": {"tenantId": tenant_id}}, include={"supplier": {"include": {"product": True}}}, order={"createdAt": "desc"})

@app.post("/negotiate")
async def start_negotiation(req: NegotiateRequest):
    db = await get_db()
    await db.negotiation.create(data={"supplierId": req.supplier_id, "status": "AWAITING_REPLY", "history": json.dumps([{"role": "agent", "content": f"Target ₹{req.target_price}"}])})
    await db.supplier.update(where={"id": req.supplier_id}, data={"status": "NEGOTIATING"})
    return {"status": "SUCCESS"}

@app.get("/reports/{tenant_id}")
async def get_reports(tenant_id: str):
    db = await get_db()
    return await db.report.find_many(where={"tenantId": tenant_id}, order={"createdAt": "desc"})

@app.get("/logs/{tenant_id}")
async def get_logs(tenant_id: str):
    db = await get_db()
    return await db.auditlog.find_many(where={"tenantId": tenant_id}, order={"timestamp": "desc"})

@app.get("/tasks/{tenant_id}")
async def get_tasks(tenant_id: str):
    db = await get_db()
    return await db.agenttask.find_many(where={"tenantId": tenant_id}, order={"updatedAt": "desc"})

@app.post("/research")
async def start_research(req: ResearchRequest):
    db = await get_db()
    prefixes = ["Premium", "Eco", "Pro", "Ultra"]
    for i in range(4):
        await db.product.create(data={"tenantId": req.tenant_id, "name": f"{random.choice(prefixes)} {req.keyword}", "category": "Demo", "status": "RESEARCHING", "winningScore": random.randint(65, 98)})
    return {"status": "SUCCESS"}

@app.post("/chat")
async def assistant_chat(req: ChatRequest):
    msg = req.message.lower()
    if "status" in msg: response = "Agents are active. 1 negotiation in Panipat and 1 product in Discovery."
    else: response = "I'm aligning your sourcing goals with market data to maximize margins."
    return {"reply": response}
