from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from agents.sourcing.graph import sourcing_graph
from agents.sourcing.negotiator import NegotiationAgent
from agents.db import get_db
import uuid
import json

app = FastAPI(title="WeaveOS Agent Gateway")

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
    return {
        "name": "WeaveOS API Gateway",
        "status": "operational",
        "endpoints": ["/health", "/research", "/products", "/negotiate", "/reports"]
    }

@app.get("/health")
async def health():
    return {"status": "operational"}

# --- SOURCING ENDPOINTS ---

@app.post("/research")
async def start_research(req: ResearchRequest):
    """
    SYNC RESEARCH (Required for Vercel Free Tier).
    In serverless, background tasks are killed immediately after response.
    """
    thread_id = str(uuid.uuid4())
    inputs = {
        "tenant_id": req.tenant_id,
        "keyword": req.keyword,
        "asins": [],
        "products_data": [],
        "selected_product_index": None,
        "suppliers": [],
        "report_id": None,
        "status": "STARTING"
    }
    
    # We wait for the graph to complete so Vercel doesn't kill the process
    try:
        await sourcing_graph.ainvoke(inputs)
        return {"status": "COMPLETED", "thread_id": thread_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/products/{tenant_id}")
async def get_products(tenant_id: str):
    db = await get_db()
    return await db.product.find_many(
        where={"tenantId": tenant_id},
        include={"suppliers": True},
        order={"createdAt": "desc"}
    )

# --- NEGOTIATION ENDPOINTS ---

@app.post("/negotiate")
async def start_negotiation(req: NegotiateRequest):
    agent = NegotiationAgent(req.tenant_id, req.supplier_id, req.supplier_email, req.target_price)
    email = await agent.generate_opening_email()
    neg_id = await agent.persist_negotiation(email["subject"], email["body"])
    
    return {"status": "NEGOTIATION_STARTED", "negotiation_id": neg_id, "draft": email}

@app.get("/negotiations/{tenant_id}")
async def get_negotiations(tenant_id: str):
    db = await get_db()
    return await db.negotiation.find_many(
        where={"supplier": {"tenantId": tenant_id}},
        include={"supplier": True},
        order={"createdAt": "desc"}
    )

# --- REPORT ENDPOINTS ---

@app.get("/reports/{tenant_id}")
async def get_reports(tenant_id: str):
    db = await get_db()
    return await db.report.find_many(
        where={"tenantId": tenant_id},
        order={"createdAt": "desc"}
    )
