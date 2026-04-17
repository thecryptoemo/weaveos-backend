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
        await db.intelligencealert.delete_many(where={"tenantId": t_id})
        await db.order.delete_many(where={"tenantId": t_id})
        await db.negotiation.delete_many(where={"supplier": {"tenantId": t_id}})
        await db.supplier.delete_many(where={"tenantId": t_id})
        await db.product.delete_many(where={"tenantId": t_id})
        await db.report.delete_many(where={"tenantId": t_id})
        await db.auditlog.delete_many(where={"tenantId": t_id})
        await db.agenttask.delete_many(where={"tenantId": t_id})
    except: pass
    await db.tenant.upsert(where={"id": t_id}, data={"create": {"id": t_id, "name": "D2C Wingman Brand"}, "update": {}})
    await db.product.create(data={"tenantId": t_id, "name": "Organic Neem Wood Comb", "category": "Personal Care", "status": "RESEARCHING", "winningScore": 75})
    await db.product.create(data={"tenantId": t_id, "name": "Silk Sleeping Mask", "category": "Bedding", "status": "RESEARCHING", "winningScore": 72})
    await db.product.create(data={"tenantId": t_id, "name": "Bamboo Toothbrush Set", "category": "Personal Care", "status": "SHORTLISTED", "winningScore": 82})
    p_comb = await db.product.create(data={"tenantId": t_id, "name": "Handmade Neem Comb", "category": "Personal Care", "status": "APPROVED", "winningScore": 88})
    s1 = await db.supplier.create(data={"tenantId": t_id, "productId": p_comb.id, "name": "GreenCraft Industries", "source": "IndiaMART", "price": 38.0, "moq": 1000, "rating": 4.8, "status": "APPROVED"})
    p_rug = await db.product.create(data={"tenantId": t_id, "name": "Organic Cotton Yoga Rug", "category": "Wellness", "status": "NEGOTIATING", "winningScore": 76})
    s2 = await db.supplier.create(data={"tenantId": t_id, "productId": p_rug.id, "name": "Raj Enterprises", "source": "IndiaMART", "price": 1650.0, "moq": 500, "rating": 4.2, "status": "NEGOTIATING"})
    await db.negotiation.create(data={"supplierId": s2.id, "status": "ACTIVE", "history": json.dumps([{"role": "agent", "content": "Initial price check for 500 units."}, {"role": "supplier", "content": "Price is ₹1800 for 500 units."}] )})
    await db.order.create_many(data=[
        {"tenantId": t_id, "supplierId": s1.id, "productName": "Organic Neem Wood Comb", "units": 1000, "totalAmount": 38000.0, "status": "CONFIRMED"},
        {"tenantId": t_id, "supplierId": s2.id, "productName": "Bamboo Toothbrush Set", "units": 500, "totalAmount": 27500.0, "status": "IN_PRODUCTION", "eta": "08/04/2026"}
    ])
    await db.intelligencealert.create_many(data=[
        {"tenantId": t_id, "title": "New product ready: Organic Neem Wood Comb", "type": "SUCCESS", "badge": "NEW", "content": "Product sourced at ₹38/unit with 71% margin potential."},
        {"tenantId": t_id, "title": "Supplier delay: 3 days", "type": "WARNING", "badge": "ACKNOWLEDGED", "content": "Shipment from GreenCraft Industries delayed by 3 days."},
        {"tenantId": t_id, "title": "Demand spike: +45%", "type": "INFO", "badge": "NEW", "content": "Sales velocity for Bamboo Toothbrush Set increased by 45%."}
    ])
    await db.auditlog.create_many(data=[
        {"tenantId": t_id, "action": "ORDER_CONFIRMED", "entity": "Neem Wood Comb"},
        {"tenantId": t_id, "action": "SUPPLIER_APPROVED", "entity": "GreenCraft Industries"},
        {"tenantId": t_id, "action": "NEGOTIATION_STARTED", "entity": "Raj Enterprises"}
    ])
    await db.agenttask.create_many(data=[
        {"tenantId": t_id, "agentName": "Sourcing Agent", "status": "NEGOTIATING", "progress": 65, "details": "Evaluating counter-offer from Raj Enterprises"},
        {"tenantId": t_id, "agentName": "Market Intel", "status": "MONITORING", "progress": 100, "details": "Scanned 500+ listings"}
    ])
    return {"status": "SUCCESS"}

@app.get("/products/{tenant_id}")
async def get_products(tenant_id: str):
    db = await get_db()
    return await db.product.find_many(where={"tenantId": tenant_id}, order={"createdAt": "desc"})

@app.get("/suppliers/{tenant_id}")
async def get_suppliers(tenant_id: str):
    db = await get_db()
    return await db.supplier.find_many(where={"tenantId": tenant_id}, include={"product": True}, order={"rating": "desc"})

@app.get("/negotiations/{tenant_id}")
async def get_negotiations(tenant_id: str):
    db = await get_db()
    return await db.negotiation.find_many(where={"supplier": {"tenantId": tenant_id}}, include={"supplier": {"include": {"product": True}}}, order={"createdAt": "desc"})

@app.get("/orders/{tenant_id}")
async def get_orders(tenant_id: str):
    db = await get_db()
    return await db.order.find_many(where={"tenantId": tenant_id}, include={"supplier": True}, order={"createdAt": "desc"})

@app.get("/intelligence/{tenant_id}")
async def get_intelligence(tenant_id: str):
    db = await get_db()
    return await db.intelligencealert.find_many(where={"tenantId": tenant_id}, order={"timestamp": "desc"})

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
    prefixes = ["Premium", "Eco-Friendly", "Ultra", "Smart"]
    data_to_create = [{"tenantId": req.tenant_id, "name": f"{random.choice(prefixes)} {req.keyword} #{i+1}", "category": "Marketdiscovery", "status": "RESEARCHING", "winningScore": random.randint(70, 95)} for i in range(4)]
    await db.product.create_many(data=data_to_create)
    return {"status": "SUCCESS"}

@app.post("/shortlist/{id}")
async def shortlist(id: str):
    db = await get_db()
    await db.product.update(where={"id": id}, data={"status": "SHORTLISTED"})
    return {"status": "SUCCESS"}

@app.post("/discover-suppliers/{id}")
async def discover_sups(id: str):
    db = await get_db()
    p = await db.product.find_unique(where={"id": id})
    await db.supplier.create(data={"tenantId": p.tenantId, "productId": p.id, "name": "Global Source Ltd", "source": "IndiaMART", "price": 120.0, "rating": 4.5, "status": "DISCOVERED"})
    await db.product.update(where={"id": id}, data={"status": "SUPPLIER_SEARCH"})
    return {"status": "SUCCESS"}

@app.post("/negotiate")
async def start_neg(req: NegotiateRequest):
    db = await get_db()
    history = [{"role": "agent", "content": f"Negotiation started at ₹{req.target_price}"}]
    await db.negotiation.create(data={"supplierId": req.supplier_id, "status": "ACTIVE", "history": json.dumps(history)})
    await db.supplier.update(where={"id": req.supplier_id}, data={"status": "NEGOTIATING"})
    return {"status": "SUCCESS"}

@app.post("/chat")
async def assistant_chat(req: ChatRequest):
    msg = req.message.lower()
    if "status" in msg: res = "Agents are live. 2 active negotiations, 1 discovery run in progress."
    else: res = "I'm monitoring your D2C brand operations. How can I help you scale today?"
    return {"reply": res}
