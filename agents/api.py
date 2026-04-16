from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.sourcing.graph import sourcing_graph
from agents.sourcing.negotiator import NegotiationAgent
from agents.db import get_db
import uuid
import json
from datetime import datetime

app = FastAPI(title="D2C Wingman Agent Gateway")

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
    return {"name": "D2C Wingman API Gateway", "status": "operational"}

@app.get("/health")
async def health():
    return {"status": "operational"}

@app.post("/seed")
async def seed_data(req: dict):
    t_id = req.get("tenant_id", "hackathon_demo")
    db = await get_db()
    await db.negotiation.delete_many(where={"supplier": {"tenantId": t_id}})
    await db.supplier.delete_many(where={"tenantId": t_id})
    await db.product.delete_many(where={"tenantId": t_id})
    await db.report.delete_many(where={"tenantId": t_id})
    await db.auditlog.delete_many(where={"tenantId": t_id})
    await db.agenttask.delete_many(where={"tenantId": t_id})
    p1 = await db.product.create(data={"tenantId": t_id, "name": "Bamboo Smart Toothbrush", "category": "Personal Care", "status": "SHORTLISTED", "winningScore": 89.2, "marketData": json.dumps({"price": 1200})})
    p2 = await db.product.create(data={"tenantId": t_id, "name": "Organic Cotton Yoga Rug", "category": "Home & Kitchen", "status": "SUPPLIER_SEARCH", "winningScore": 76.4, "marketData": json.dumps({"price": 4500})})
    s1 = await db.supplier.create(data={"tenantId": t_id, "productId": p2.id, "name": "Textile India Corp", "source": "IndiaMART", "price": 1800.0, "rating": 4.6, "status": "DISCOVERED"})
    s2 = await db.supplier.create(data={"tenantId": t_id, "productId": p2.id, "name": "EcoFabric Ltd", "source": "IndiaMART", "price": 1650.0, "rating": 4.9, "status": "NEGOTIATING"})
    await db.negotiation.create(data={"supplierId": s2.id, "status": "AWAITING_REPLY", "history": json.dumps([{"role": "agent", "content": "Hi EcoFabric team, we're looking to procure Organic Cotton Yoga Rugs. Our target price is ₹1100."}, {"role": "supplier", "content": "Thank you. ₹1100 is low. We can do ₹1400 for 500 units."}])})
    await db.report.create(data={"tenantId": t_id, "title": "Market Opportunity: Cork Surfaces", "content": "AI detected 40% YoY increase in search volume.", "type": "RESEARCH"})
    await db.auditlog.create(data={"tenantId": t_id, "action": "RESEARCH_STARTED", "entity": "Organic Yoga Mats"})
    await db.auditlog.create(data={"tenantId": t_id, "action": "NEGOTIATION_LAUNCHED", "entity": "EcoFabric Ltd"})
    await db.agenttask.create(data={"tenantId": t_id, "agentName": "Sourcing Agent", "status": "NEGOTIATING", "progress": 65, "details": "Evaluating counter-offer from EcoFabric Ltd"})
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
    await db.auditlog.create(data={"tenantId": req.tenant_id, "action": "RESEARCH_STARTED", "entity": req.keyword})
    await sourcing_graph.ainvoke({"tenant_id": req.tenant_id, "keyword": req.keyword, "asins": [], "products_data": [], "selected_product_index": None, "suppliers": [], "report_id": None, "status": "STARTING"})
    return {"status": "COMPLETED"}

@app.post("/shortlist/{product_id}")
async def shortlist_product(product_id: str):
    db = await get_db()
    p = await db.product.update(where={"id": product_id}, data={"status": "SHORTLISTED"})
    await db.auditlog.create(data={"tenantId": p.tenantId, "action": "PRODUCT_SHORTLISTED", "entity": p.name})
    return {"status": "UPDATED"}

@app.post("/discover-suppliers/{product_id}")
async def discover_suppliers(product_id: str):
    db = await get_db()
    product = await db.product.find_unique(where={"id": product_id})
    await db.supplier.create(data={"tenantId": product.tenantId, "productId": product.id, "name": "Global Sourcing Ltd", "source": "IndiaMART", "price": 1100.0, "rating": 4.5, "status": "DISCOVERED"})
    await db.product.update(where={"id": product_id}, data={"status": "SUPPLIER_SEARCH"})
    await db.auditlog.create(data={"tenantId": product.tenantId, "action": "SUPPLIERS_DISCOVERED", "entity": product.name})
    return {"status": "DISCOVERED"}

@app.post("/negotiate")
async def start_negotiation(req: NegotiateRequest):
    agent = NegotiationAgent(req.tenant_id, req.supplier_id, req.supplier_email, req.target_price)
    await agent.persist_negotiation("Inquiry", "Draft")
    db = await get_db()
    await db.auditlog.create(data={"tenantId": req.tenant_id, "action": "NEGOTIATION_STARTED", "entity": req.supplier_id})
    return {"status": "STARTED"}

@app.post("/chat")
async def assistant_chat(req: ChatRequest):
    msg = req.message.lower()
    if "status" in msg: response = "I'm currently orchestrating 2 negotiations and tracking 5 market trends."
    else: response = "I'm aligning your sourcing goals with current market performance data."
    return {"reply": response}
