import json
from agents.llm_router import get_model_for_task

class CreativeAgent:
    def __init__(self, tenant_id: str):
        self.tenant_id = tenant_id

    async def generate_ad_package(self, product_name: str, sentiment_data: dict, landed_cost: float) -> dict:
        """
        MAGIC: Uses the 'Unmet Needs' from research to build the marketing hook.
        """
        # In prod: model = get_model_for_task("marketing.campaign.strategy_generation")
        
        unmet_need = sentiment_data.get("unmet_needs", ["Better Quality"])[0]
        complaint = sentiment_data.get("top_complaints", ["High Price"])[0]
        
        hook = f"Tired of {complaint}? We fixed it."
        body = (
            f"Introducing our new {product_name}. Unlike others, we've focused on {unmet_need}. "
            f"High quality, direct from source, and only possible through WeaveOS intelligence."
        )
        
        return {
            "hook": hook,
            "ad_copy": body,
            "target_audience": f"Fans of {product_name}, interested in {unmet_need}",
            "visual_direction": f"Close-up of {unmet_need} features, contrasting with competitors' {complaint}",
            "projected_profit_margin": "32%"
        }

if __name__ == "__main__":
    import asyncio
    async def test():
        agent = CreativeAgent("t1")
        pkg = await agent.generate_ad_package("Bamboo Toothbrush", {"top_complaints": ["Plastic waste"], "unmet_needs": ["100% Compostable bristles"]}, 45.0)
        print(json.dumps(pkg, indent=2))
    asyncio.run(test())