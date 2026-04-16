from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END
from agents.sourcing.research import MarketResearchAgent
from agents.sourcing.supplier_discovery import SupplierDiscoveryAgent
from agents.tools.scrapers.amazon_scraper import AmazonScraper
from agents.tools.scrapers.indiamart_scraper import IndiaMartScraper
from agents.db import get_db
import json
import asyncio

class SourcingState(TypedDict):
    tenant_id: str
    keyword: str
    asins: List[str]
    products_data: List[Dict[str, Any]]
    selected_product_index: Optional[int]
    suppliers: List[Dict[str, Any]]
    report_id: Optional[str]
    status: str

async def search_node(state: SourcingState):
    scraper = AmazonScraper()
    asins = await scraper.search_category(state["keyword"])
    return {"asins": asins, "status": "RESEARCHING"}

async def scrape_and_score_node(state: SourcingState):
    scraper = AmazonScraper()
    research_agent = MarketResearchAgent(state["tenant_id"])
    products_data = []
    for asin in state["asins"]:
        raw_data = await scraper.scrape_product(asin)
        simulated_metrics = {"demand_signal": 80, "competition_gap": 70, "margin_potential": 80, "sentiment_opportunity": 85}
        scored_data = research_agent.calculate_winning_score(simulated_metrics)
        raw_data["winning_score"] = scored_data
        products_data.append(raw_data)
    return {"products_data": products_data}

async def persist_research_node(state: SourcingState):
    db = await get_db()
    # 1. Ensure tenant exists
    await db.tenant.upsert(
        where={"id": state["tenant_id"]},
        data={"create": {"id": state["tenant_id"], "name": "Startup Brand"}, "update": {}}
    )
    
    # 2. Persist Products
    for p in state["products_data"]:
        await db.product.create(
            data={
                "tenantId": state["tenant_id"],
                "name": p["title"],
                "category": p.get("category", "Uncategorized"),
                "winningScore": p["winning_score"]["total_score"],
                "marketData": json.dumps(p),
                "status": "RESEARCHING"
            }
        )
    
    # 3. PHASE 2: Persist Research Report
    report_content = f"Research Report for {state['keyword']}\nFound {len(state['products_data'])} products."
    report = await db.report.create(
        data={
            "tenantId": state["tenant_id"],
            "title": f"Initial Research: {state['keyword']}",
            "content": report_content,
            "type": "RESEARCH"
        }
    )
    
    return {"status": "AWAITING_SELECTION", "report_id": report.id}

async def supplier_discovery_node(state: SourcingState):
    selected_product = state["products_data"][state["selected_product_index"]]
    scraper = IndiaMartScraper()
    discovery_agent = SupplierDiscoveryAgent(state["tenant_id"])
    
    raw_suppliers = await scraper.search_suppliers(selected_product["title"])
    scored_suppliers = []
    for s in raw_suppliers:
        s["score"] = discovery_agent.calculate_supplier_score(s)
        scored_suppliers.append(s)
    
    db = await get_db()
    
    # PHASE 1: Lifecycle Update - Move product to SUPPLIER_SEARCH
    # In a real app, we'd find the product by ID. Here we'll simulate by name/tenant.
    await db.product.update_many(
        where={"tenantId": state["tenant_id"], "name": selected_product["title"]},
        data={"status": "SUPPLIER_SEARCH"}
    )

    # Persist Suppliers in DB
    for s in scored_suppliers:
        await db.supplier.create(
            data={
                "tenantId": state["tenant_id"],
                "name": s["name"],
                "source": s.get("source", "indiamart"),
                "price": s.get("price"),
                "moq": s.get("moq"),
                "rating": s.get("rating"),
                "status": "DISCOVERED"
            }
        )

    # PHASE 2: Persist Sourcing Report
    report_content = f"Supplier Discovery for {selected_product['title']}\nFound {len(scored_suppliers)} suppliers."
    await db.report.create(
        data={
            "tenantId": state["tenant_id"],
            "title": f"Sourcing Plan: {selected_product['title']}",
            "content": report_content,
            "type": "SOURCING"
        }
    )

    # Store Brain update
    await db.storebrain.upsert(
        where={"tenantId_key": {"tenantId": state["tenant_id"], "key": "product.margins"}},
        data={
            "create": {"tenantId": state["tenant_id"], "key": "product.margins", "value": json.dumps({"landed_cost": 1450, "selling_price": 4500})},
            "update": {"value": json.dumps({"landed_cost": 1450, "selling_price": 4500})}
        }
    )
    
    return {"suppliers": scored_suppliers, "status": "COMPLETED"}

workflow = StateGraph(SourcingState)
workflow.add_node("search", search_node)
workflow.add_node("scrape", scrape_and_score_node)
workflow.add_node("persist", persist_research_node)
workflow.add_node("discover_suppliers", supplier_discovery_node)

workflow.set_entry_point("search")
workflow.add_edge("search", "scrape")
workflow.add_edge("scrape", "persist")
workflow.add_edge("persist", END)

# Trigger for second phase
workflow.add_node("resume_trigger", lambda s: s)
workflow.add_edge("resume_trigger", "discover_suppliers")
workflow.add_edge("discover_suppliers", END)

sourcing_graph = workflow.compile()

if __name__ == "__main__":
    async def run_integrated_test():
        from agents.db import db
        await db.connect()
        
        inputs = {
            "tenant_id": "weave_startup_1",
            "keyword": "bamboo toothbrush",
            "asins": [],
            "products_data": [],
            "selected_product_index": None,
            "suppliers": [],
            "report_id": None,
            "status": "STARTING"
        }
        
        print(">>> STARTING PHASE 1: RESEARCH & REPORT PERSISTENCE")
        state = await sourcing_graph.ainvoke(inputs)
        print(f"Status: {state['status']}, Report ID: {state['report_id']}")
        
        # Check DB for report
        report = await db.report.find_unique(where={"id": state["report_id"]})
        print(f"Verified Report in DB: {report.title} - {report.type}")

        print("\n>>> STARTING PHASE 2: SELECTION & LIFECYCLE UPDATE")
        state["selected_product_index"] = 0
        final_state = await supplier_discovery_node(state)
        
        # Check Product Status
        product = await db.product.find_first(where={"tenantId": "weave_startup_1", "status": "SUPPLIER_SEARCH"})
        print(f"Verified Product Lifecycle: {product.name} is now in {product.status}")
        
        # Check Sourcing Report
        sourcing_report = await db.report.find_first(where={"tenantId": "weave_startup_1", "type": "SOURCING"})
        print(f"Verified Sourcing Report: {sourcing_report.title}")
        
        await db.disconnect()

    asyncio.run(run_integrated_test())