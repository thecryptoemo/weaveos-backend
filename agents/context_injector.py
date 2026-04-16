import json
from typing import Dict, List, Any
from agents.db import get_db

class ContextInjector:
    def __init__(self, tenant_id: str, agent_type: str):
        self.tenant_id = tenant_id
        self.agent_type = agent_type

    async def get_relevant_context(self) -> Dict[str, Any]:
        db = await get_db()
        required_keys = self._get_keys_for_agent()
        context = {}
        
        for key in required_keys:
            brain_entry = await db.storebrain.find_unique(
                where={"tenantId_key": {"tenantId": self.tenant_id, "key": key}}
            )
            if brain_entry:
                # Handle potential JSON parsing if value is stored as string
                try:
                    context[key] = json.loads(brain_entry.value)
                except:
                    context[key] = brain_entry.value
                    
        return context

    def _get_keys_for_agent(self) -> List[str]:
        mapping = {
            "sourcing.negotiation": ["product.market_prices", "supplier.competitor_quotes", "product.target_margins"],
            "sourcing.research": ["market.trends", "competitor.benchmarks"],
            "marketing.budget": ["product.margins", "logistics.inventory", "campaign.history"],
            "sourcing.logistics": ["shipping.rates", "supplier.location"]
        }
        return mapping.get(self.agent_type, [])