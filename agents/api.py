from fastapi import FastAPI, BackgroundTasks, HTTPException
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

@app.get("/")
async def root():
    return {"name": "D2C Wingman API Gateway", "status": "operational"}

@app.get("/health")
async def health():
    return {"status": "operational"}

@app.post("/seed")
async def seed_data(req: dict):
    tenant_id = req.get("tenant_id", "hackathon_demo")
    db = await get_db()
    await db.tenant.upsert(where={"id": tenant_id}, data={"create": {"id": tenant_id, "name": "Demo Brand"}, "update": {}})
    product = await db.product.create(data={"tenantId": tenant_id, "name": "Eco Cork Mat", "category": "Fitness", "status": "SUPPLIER_SEARCH", "winningScore": 82.5, "marketData": json.dumps({"price": 3100.0})})
    supplier = await db.supplier.create(data={"tenantId": tenant_id, "productId": product.id, "name": "GreenLife Mfg", "source": "IndiaMART", "price": 1200.0, "moq": 100, "rating": 4.8, "status": "NEGOTIATING"})
    await db.negotiation.create(data={"supplierId": supplier.id, "status": "AWAITING_REPLY", "history": json.dumps([{"role": "agent", "content": "Inquiry sent."}])})
    await db.report.create(data={"tenantId": tenant_id, "title": "Market Brief: Cork Mats", "content": "High demand detected.", "type": "RESEARCH"})
    return {"status": "SUCCESS"}

@app.post("/research")
async def start_research(req: ResearchRequest):
    inputs = {"tenant_id": req.tenant_id, "keyword": req.keyword, "asins": [], "products_data": [], "selected_product_index": None, "suppliers": [], "report_id": None, "status": "STARTING"}
    try:
        await sourcing_graph.ainvoke(inputs)
        return {"status": "COMPLETED"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/products/{tenant_id}")
async def get_products(tenant_id: str):
    db = await get_db()
    prods = await db.product.find_many(where={"tenantId": tenant_id}, order={"createdAt": "desc"})
    results = []
    for p in prods:
        data = p.dict()
        try: 
            m_data = json.loads(p.marketData or "{}")
            data["price"] = m_data.get("price", 1500.0)
        except: data["price"] = 1500.0
        results.append(data)
    return results

@app.post("/negotiate")
async def start_negotiation(req: NegotiateRequest):
    agent = NegotiationAgent(req.tenant_id, req.supplier_id, req.supplier_email, req.target_price)
    email = await agent.generate_opening_email()
    neg_id = await agent.persist_negotiation(email["subject"], email["body"])
    return {"status": "NEGOTIATION_STARTED", "negotiation_id": neg_id}

@app.get("/negotiations/{tenant_id}")
async def get_negotiations(tenant_id: str):
    db = await get_db()
    return await db.negotiation.find_many(where={"supplier": {"tenantId": tenant_id}}, include={"supplier": True}, order={"createdAt": "desc"})

@app.get("/reports/{tenant_id}")
async def get_reports(tenant_id: str):
    db = await get_db()
    return await db.report.find_many(where={"tenantId": tenant_id}, order={"createdAt": "desc"})
