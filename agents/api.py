from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.db import get_db
import json
import uuid
import random
import traceback

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class ResearchRequest(BaseModel):
    tenant_id: str
    keyword: str

@app.get("/")
async def root(): return {"status":"ok"}

@app.get("/health")
async def health():
    try:
        db = await get_db()
        return {"status": "operational", "db": "connected"}
    except Exception as e: return {"status": "error", "msg": str(e)}

@app.post("/seed")
async def seed_data(req: dict):
    t_id = req.get("tenant_id", "hackathon_demo")
    try:
        db = await get_db()
        # Safe Delete
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

        await db.tenant.upsert(where={"id": t_id}, data={"create": {"id": t_id, "name": "Brand"}, "update": {}})
        p = await db.product.create(data={"tenantId": t_id, "name": "Silk Pillowcase Set", "category": "Bedding", "status": "SHORTLISTED", "winningScore": 94})
        s = await db.supplier.create(data={"tenantId": t_id, "productId": p.id, "name": "EcoSilk Mfg", "source": "IndiaMART", "price": 950, "rating": 4.8, "status": "NEGOTIATING"})
        await db.negotiation.create(data={"supplierId": s.id, "status": "AWAITING_REPLY", "history": json.dumps([{"role":"agent", "content":"Inquiry sent."}] )})
        await db.report.create(data={"tenantId": t_id, "title": "Market Scan", "content": "Opportunity detected.", "type": "RESEARCH"})
        await db.agenttask.create(data={"tenantId": t_id, "agentName": "Researcher", "status": "DONE", "progress": 100, "details": "Scan complete."})
        
        return {"status": "SUCCESS"}
    except Exception as e:
        return {"status": "ERROR", "message": str(e), "trace": traceback.format_exc()}

@app.post("/research")
async def start_research(req: ResearchRequest):
    db = await get_db()
    for i in range(4):
        await db.product.create(data={
            "tenantId": req.tenant_id, "name": f"Premium {req.keyword} #{i+1}", 
            "category": "Demo", "status": "RESEARCHING", "winningScore": random.randint(75, 98)
        })
    return {"status": "SUCCESS"}

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
