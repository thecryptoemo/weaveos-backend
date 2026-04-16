from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.sourcing.graph import sourcing_graph
from agents.sourcing.negotiator import NegotiationAgent
from agents.db import get_db
import uuid
import json

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
    await db.product.create(data={"tenantId": t_id, "name": "Bamboo Smart Toothbrush", "category": "Personal Care", "status": "SHORTLISTED", "winningScore": 89.2, "marketData": json.dumps({"price": 1200})})
    p = await db.product.create(data={"tenantId": t_id, "name": "Organic Cotton Yoga Rug", "category": "Home & Kitchen", "status": "SUPPLIER_SEARCH", "winningScore": 76.4, "marketData": json.dumps({"price": 4500})})
    s1 = await db.supplier.create(data={"tenantId": t_id, "productId": p.id, "name": "Textile India Corp", "source": "IndiaMART", "price": 1800.0, "rating": 4.6, "status": "DISCOVERED"})
    s2 = await db.supplier.create(data={"tenantId": t_id, "productId": p.id, "name": "EcoFabric Ltd", "source": "IndiaMART", "price": 1650.0, "rating": 4.9, "status": "NEGOTIATING"})
    await db.negotiation.create(data={"supplierId": s2.id, "status": "AWAITING_REPLY", "history": json.dumps([{"role": "agent", "content": "Initial anchor at ₹1100 sent."}])})
    await db.report.create(data={"tenantId": t_id, "title": "Market Brief: Sustainable Textiles", "content": "AI Insight: High demand for GOTS certified cotton rugs.", "type": "RESEARCH"})
    return {"status": "SUCCESS"}

@app.post("/research")
async def start_research(req: ResearchRequest):
    await sourcing_graph.ainvoke({"tenant_id": req.tenant_id, "keyword": req.keyword, "asins": [], "products_data": [], "selected_product_index": None, "suppliers": [], "report_id": None, "status": "STARTING"})
    return {"status": "COMPLETED"}

@app.get("/products/{tenant_id}")
async def get_products(tenant_id: str):
    db = await get_db()
    return await db.product.find_many(where={"tenantId": tenant_id}, order={"createdAt": "desc"})

@app.post("/shortlist/{product_id}")
async def shortlist_product(product_id: str):
    db = await get_db()
    await db.product.update(where={"id": product_id}, data={"status": "SHORTLISTED"})
    return {"status": "UPDATED"}

@app.post("/discover-suppliers/{product_id}")
async def discover_suppliers(product_id: str):
    db = await get_db()
    product = await db.product.find_unique(where={"id": product_id})
    await db.supplier.create(data={"tenantId": product.tenantId, "productId": product.id, "name": "Global Sourcing Ltd", "source": "IndiaMART", "price": 1100.0, "rating": 4.5, "status": "DISCOVERED"})
    await db.product.update(where={"id": product_id}, data={"status": "SUPPLIER_SEARCH"})
    return {"status": "DISCOVERED"}

@app.get("/suppliers/{tenant_id}")
async def get_suppliers(tenant_id: str):
    db = await get_db()
    return await db.supplier.find_many(where={"tenantId": tenant_id}, include={"product": True}, order={"rating": "desc"})

@app.post("/negotiate")
async def start_negotiation(req: NegotiateRequest):
    agent = NegotiationAgent(req.tenant_id, req.supplier_id, req.supplier_email, req.target_price)
    email = await agent.generate_opening_email()
    await agent.persist_negotiation(email["subject"], email["body"])
    return {"status": "STARTED"}

@app.get("/negotiations/{tenant_id}")
async def get_negotiations(tenant_id: str):
    db = await get_db()
    return await db.negotiation.find_many(where={"supplier": {"tenantId": tenant_id}}, include={"supplier": {"include": {"product": True}}}, order={"createdAt": "desc"})

@app.get("/reports/{tenant_id}")
async def get_reports(tenant_id: str):
    db = await get_db()
    return await db.report.find_many(where={"tenantId": tenant_id}, order={"createdAt": "desc"})

@app.post("/chat")
async def assistant_chat(req: ChatRequest):
    msg = req.message.lower()
    if "status" in msg: response = "I'm currently orchestrating a negotiation with EcoFabric Ltd and monitoring Amazon. All systems nominal."
    elif "sourcing" in msg or "supplier" in msg: response = "I've identified Panipat as the optimal region for your textile requirements. Should I find more suppliers?"
    else: response = "I'm analyzing the D2C market data for your brand to optimize for maximum profit margins."
    return {"reply": response}
