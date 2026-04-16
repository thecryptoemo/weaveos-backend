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

@app.get("/health")
async def health():
    return {"status": "operational"}

# --- SOURCING ENDPOINTS ---

@app.post("/research")
async def start_research(req: ResearchRequest, background_tasks: BackgroundTasks):
    thread_id = str(uuid.uuid4())
    async def run_research():
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
        await sourcing_graph.ainvoke(inputs)

    background_tasks.add_task(run_research)
    return {"status": "QUEUED", "thread_id": thread_id}

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
    
    # In a real app, this would also call GMAIL_SEND_EMAIL
    return {"status": "NEGOTIATION_STARTED", "negotiation_id": neg_id, "draft": email}

@app.get("/negotiations/{tenant_id}")
async def get_negotiations(tenant_id: str):
    db = await get_db()
    # Fetch negotiations via their suppliers
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

if __name__ == "__main__":
    import uvicorn
    print("FastAPI Gateway updated with Email Negotiation and Report support.")