import asyncio
import json
from agents.sourcing.graph import sourcing_graph, supplier_discovery_node
from agents.marketing.creative_agent import CreativeAgent
from agents.marketing.optimizer import MarketingOptimizer
from agents.db import get_db

async def run_hackathon_demo():
    print("🚀 INITIALIZING WEAVEOS MAGIC DEMO...")
    db = await get_db()
    # await db.connect()
    
    tenant_id = "hackathon_demo_brand"
    keyword = "Organic Hemp Yoga Mat"

    # STEP 1: Research Agent - Finding the 'Gap'
    print(f"\n[1] RESEARCHING: '{keyword}'...")
    research_inputs = {
        "tenant_id": tenant_id,
        "keyword": keyword,
        "asins": [], "products_data": [], "selected_product_index": None,
        "suppliers": [], "status": "STARTING", "report_id": None
    }
    state = await sourcing_graph.ainvoke(research_inputs)
    
    # Mocking a 'Sentiment Gap' found in research
    sentiment_gap = {
        "top_complaints": ["Heavy rubber smell", "Slippery when wet"],
        "unmet_needs": ["Non-slip cork grip", "Zero-odor hemp"]
    }
    
    # STEP 2: Sourcing Agent - Fixing the Gap
    print("\n[2] SOURCING: Finding suppliers for 'Non-slip Zero-odor' mats...")
    state["selected_product_index"] = 0
    state["products_data"][0]["title"] = "Zero-Odor Hemp Mat"
    sourcing_results = await supplier_discovery_node(state)
    top_supplier = sourcing_results["suppliers"][0]
    landed_cost = 1200 # INR

    # STEP 3: Marketing Agent - The 'Profit-Native' Ad
    print("\n[3] MARKETING: Generating 'Competitor-Crushing' Ads...")
    creative_agent = CreativeAgent(tenant_id)
    ad_package = await creative_agent.generate_ad_package(
        product_name="Zero-Odor Hemp Mat",
        sentiment_data=sentiment_gap,
        landed_cost=landed_cost
    )

    # STEP 4: The Final Reveal - True ROAS projection
    optimizer = MarketingOptimizer(tenant_id)
    profit_projection = optimizer.calculate_true_roas(
        spend=10000, revenue=35000, landed_cost=landed_cost, units_sold=15
    )

    print("\n" + "="*50)
    print("✨ WEAVEOS MAGIC RECAP ✨")
    print("="*50)
    print(f"PRODUCT FOUND  : {keyword}")
    print(f"COMPETITOR PAIN: {sentiment_gap['top_complaints'][0]}")
    print(f"WEAVEOS FIX    : {sentiment_gap['unmet_needs'][0]} (Sourced at ₹{landed_cost})")
    print(f"AD HOOK        : '{ad_package['hook']}'")
    print(f"PROJECTED ROI  : {profit_projection['true_roas']}x TRUE ROAS (Profit-Native)")
    print("="*50)
    
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(run_hackathon_demo())
