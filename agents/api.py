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
    p_brush = await db.product.create(data={"tenantId": t_id, "name": "Bamboo Toothbrush", "category": "Personal Care", "status": "NEGOTIATING", "winningScore": 82})
    s_raj = await db.supplier.create(data={"tenantId": t_id, "productId": p_brush.id, "name": "Raj Enterprises", "source": "IndiaMART", "price": 12.5, "moq": 500, "rating": 4.2, "status": "NEGOTIATING"})
    await db.negotiation.create(data={"supplierId": s_raj.id, "status": "ACTIVE", "history": json.dumps([{"role": "agent", "content": "Initial price check."}] )})
    await db.order.create(data={"tenantId": t_id, "supplierId": s_green.id, "productName": "Organic Neem Wood Comb", "units": 1000, "totalAmount": 38000.0, "status": "CONFIRMED"})
    await db.order.create(data={"tenantId": t_id, "supplierId": s_raj.id, "productName": "Bamboo Toothbrush Set", "units": 500, "totalAmount": 27500.0, "status": "IN_PRODUCTION", "eta": "08/04/2026"})
    alerts = [
        ("New product ready: Organic Neem Wood Comb", "SUCCESS", "NEW", "Product sourced at ₹38/unit with 71% margin potential."),
        ("Supplier delay: 3 days", "WARNING", "ACKNOWLEDGED", "Shipment from GreenCraft Industries delayed by 3 days."),
        ("Demand spike: +45%", "INFO", "NEW", "Sales velocity for Bamboo Toothbrush Set increased by 45%.")
    ]
    for title, type, badge, content in alerts: await db.intelligencealert.create(data={"tenantId": t_id, "title": title, "type": type, "badge": badge, "content": content})
    logs = [("ORDER_CONFIRMED", "Neem Wood Comb"), ("SUPPLIER_APPROVED", "GreenCraft Industries"), ("NEGOTIATION_STARTED", "Raj Enterprises")]
    for action, entity in logs: await db.auditlog.create(data={"tenantId": t_id, "action": action, "entity": entity})
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

@app.post("/research")
async def start_research(req: ResearchRequest):
    db = await get_db()
    for i in range(3): await db.product.create(data={"tenantId": req.tenant_id, "name": f"Premium {req.keyword} #{i+1}", "category": "Discovery", "status": "RESEARCHING", "winningScore": random.randint(70, 95)})
    return {"status": "SUCCESS"}

@app.post("/shortlist/{id}")
async def shortlist(id: str):
    db = await get_db()
    await db.product.update(where={"id": id}, data={"status": "SHORTLISTED"})
    return {"status": "SUCCESS"}

@app.post("/negotiate")
async def negotiate(req: dict):
    db = await get_db()
    await db.supplier.update(where={"id": req["supplier_id"]}, data={"status": "NEGOTIATING"})
    return {"status": "SUCCESS"}
