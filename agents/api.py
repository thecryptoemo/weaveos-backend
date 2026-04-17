from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.sourcing.graph import sourcing_graph
from agents.sourcing.negotiator import NegotiationAgent
from agents.db import get_db
import uuid
import json
import traceback
import random

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
        # 1. Clean data with error suppression
        try: await db.negotiation.delete_many(where={"supplier": {"tenantId": t_id}})
        except: pass
        try: await db.supplier.delete_many(where={"tenantId": t_id})
        except: pass
        try: await db.product.delete_many(where={"tenantId": t_id})
        except: pass
        try: await db.report.delete_many(where={"tenantId": t_id})
        except: pass
        try: await db.auditlog.delete_many(where={"tenantId": t_id})
        except: pass
        try: await db.agenttask.delete_many(where={"tenantId": t_id})
        except: pass

        # 2. Seeding
        await db.tenant.upsert(where={"id": t_id}, data={"create": {"id": t_id, "name": "Demo Brand"}, "update": {}})
        p1 = await db.product.create(data={"tenantId": t_id, "name": "Bamboo Smart Toothbrush", "category": "Personal Care", "status": "SHORTLISTED", "winningScore": 89.2, "marketData": json.dumps({"price": 1200})})
        p2 = await db.product.create(data={"tenantId": t_id, "name": "Organic Cotton Yoga Rug", "category": "Home & Kitchen", "status": "SUPPLIER_SEARCH", "winningScore": 76.4, "marketData": json.dumps({"price": 4500})})
        s2 = await db.supplier.create(data={"tenantId": t_id, "productId": p2.id, "name": "EcoFabric Ltd", "source": "IndiaMART", "price": 1650.0, "rating": 4.9, "status": "NEGOTIATING"})
        await db.negotiation.create(data={"supplierId": s2.id, "status": "AWAITING_REPLY", "history": json.dumps([{"role": "agent", "content": "Hi EcoFabric team, we're looking to procure Organic Cotton Yoga Rugs. Our target price is ₹1100."}, {"role": "supplier", "content": "Thank you. ₹1100 is low. We can do ₹1400 for 500 units."}])})
        await db.report.create(data={"tenantId": t_id, "title": "Market Brief: Sustainable Textiles", "content": "AI Insight: High demand for GOTS certified cotton rugs.", "type": "RESEARCH"})
        await db.auditlog.create(data={"tenantId": t_id, "action": "RESEARCH_STARTED", "entity": "Organic Yoga Mats"})
        await db.agenttask.create(data={"tenantId": t_id, "agentName": "Sourcing Agent", "status": "NEGOTIATING", "progress": 65, "details": "Evaluating counter-offer from EcoFabric Ltd"})
        
        return {"status": "SUCCESS"}
    except Exception as e:
        return {"status": "ERROR", "message": str(e), "trace": traceback.format_exc()}

@app.post("/research")
async def start_research(req: ResearchRequest):
    try:
        db = await get_db()
        prefixes = ["Premium", "Eco-Friendly", "Elite", "Pro"]
        for i in range(4):
            await db.product.create(data={
                "tenantId": req.tenant_id,
                "name": f"{random.choice(prefixes)} {req.keyword} v{i+1}",
                "category": "Market Discovery",
                "status": "RESEARCHING",
                "winningScore": random.randint(70, 98)
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

@app.post("/shortlist/{product_id}")
async def shortlist_product(product_id: str):
    db = await get_db()
    p = await db.product.update(where={"id": product_id}, data={"status": "SHORTLISTED"})
    await db.auditlog.create(data={"tenantId": p.tenantId, "action": "PRODUCT_SHORTLISTED", "entity": p.name})
    return {"status": "SUCCESS"}

@app.post("/discover-suppliers/{product_id}")
async def discover_suppliers(product_id: str):
    db = await get_db()
    product = await db.product.find_unique(where={"id": product_id})
    await db.supplier.create(data={"tenantId": product.tenantId, "productId": product.id, "name": "Global Sourcing Ltd", "source": "IndiaMART", "price": 1100.0, "rating": 4.5, "status": "DISCOVERED"})
    await db.product.update(where={"id": product_id}, data={"status": "SUPPLIER_SEARCH"})
    return {"status": "SUCCESS"}

@app.post("/negotiate")
async def start_negotiation(req: NegotiateRequest):
    agent = NegotiationAgent(req.tenant_id, req.supplier_id, req.supplier_email, req.target_price)
    email = await agent.generate_opening_email()
    await agent.persist_negotiation(email["subject"], email["body"])
    return {"status": "STARTED"}

@app.post("/chat")
async def assistant_chat(req: ChatRequest):
    msg = req.message.lower()
    if "status" in msg: response = "I'm currently orchestrating 2 negotiations and tracking 5 market trends."
    else: response = "I'm aligning your sourcing goals with current market performance data."
    return {"reply": response}
