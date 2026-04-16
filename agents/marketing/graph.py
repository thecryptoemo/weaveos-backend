from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from agents.marketing.optimizer import MarketingOptimizer
from agents.context_injector import ContextInjector
from agents.db import get_db
import asyncio

class MarketingState(TypedDict):
    tenant_id: str
    campaign_data: List[Dict[str, Any]]
    store_context: Dict[str, Any]
    optimization_plan: Dict[str, Any]

async def fetch_context_node(state: MarketingState):
    injector = ContextInjector(state["tenant_id"], "marketing.budget")
    context = await injector.get_relevant_context()
    return {"store_context": context}

async def optimize_node(state: MarketingState):
    optimizer = MarketingOptimizer(state["tenant_id"])
    context = state["store_context"]
    
    # REAL DATA FETCH: Pulling landed_cost from the Store Brain
    margin_data = context.get("product.margins", {})
    landed_cost = margin_data.get("landed_cost", 2000) # Fallback
    
    plan = []
    for camp in state["campaign_data"]:
        performance = optimizer.calculate_true_roas(
            spend=camp["spend"],
            revenue=camp["revenue"],
            landed_cost=landed_cost,
            units_sold=camp["conversions"]
        )
        plan.append({
            "campaign_id": camp["id"],
            "true_roas": performance["true_roas"],
            "status": performance["status"],
            "landed_cost_used": landed_cost
        })
        
    return {"optimization_plan": {"recommendations": plan}}

workflow = StateGraph(MarketingState)
workflow.add_node("fetch_context", fetch_context_node)
workflow.add_node("optimize", optimize_node)
workflow.set_entry_point("fetch_context")
workflow.add_edge("fetch_context", "optimize")
workflow.add_edge("optimize", END)

marketing_graph = workflow.compile()

if __name__ == "__main__":
    async def run_marketing_test():
        from agents.db import db
        await db.connect()
        inputs = {
            "tenant_id": "weave_startup_1",
            "campaign_data": [{"id": "meta_ads_01", "spend": 5000, "revenue": 15000, "conversions": 3}],
            "store_context": {},
            "optimization_plan": {}
        }
        final_state = await marketing_graph.ainvoke(inputs)
        print("\n--- MARKETING AGENT READ FROM STORE BRAIN ---")
        for rec in final_state["optimization_plan"]["recommendations"]:
            print(f"Campaign: {rec['campaign_id']}")
            print(f"  > True ROAS: {rec['true_roas']}")
            print(f"  > Landed Cost sourced from DB: ₹{rec['landed_cost_used']}")
        await db.disconnect()

    asyncio.run(run_marketing_test())