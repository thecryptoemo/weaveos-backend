from typing import Dict, Any, List
from agents.llm_router import get_model_for_task
from agents.db import get_db
import json
import asyncio

class NegotiationAgent:
    def __init__(self, tenant_id: str, supplier_id: str, supplier_email: str, target_price: float):
        self.tenant_id = tenant_id
        self.supplier_id = supplier_id
        self.supplier_email = supplier_email
        self.target_price = target_price

    async def generate_opening_email(self) -> Dict[str, str]:
        """
        Generates an email draft for supplier negotiation.
        """
        # In production: model = get_model_for_task("sourcing.negotiation.compose_message")
        subject = f"Inquiry: Partnership & Pricing for Office Chairs"
        body = (
            f"Dear Supplier Team,\n\n"
            f"We've reviewed your products and are interested in a long-term partnership. "
            f"Given our projected volume, we are looking for a unit price around ₹{self.target_price}. "
            f"Could you please let us know if this is something we can work towards?\n\n"
            f"Best regards,\nProcurement Team | WeaveOS"
        )
        return {"subject": subject, "body": body}

    async def persist_negotiation(self, subject: str, body: str):
        """
        Saves the initial email to the Negotiation table.
        """
        db = await get_db()
        history = [{"role": "agent", "type": "email", "subject": subject, "content": body}]
        
        negotiation = await db.negotiation.create(
            data={
                "supplierId": self.supplier_id,
                "status": "AWAITING_REPLY",
                "history": json.dumps(history)
            }
        )
        
        # Update supplier status to NEGOTIATING
        await db.supplier.update(
            where={"id": self.supplier_id},
            data={"status": "NEGOTIATING"}
        )
        
        return negotiation.id

if __name__ == "__main__":
    async def test():
        from agents.db import db
        await db.connect()
        # Mock supplier setup
        tenant = await db.tenant.upsert(where={"id": "t1"}, data={"create": {"id": "t1", "name": "T1"}, "update": {}})
        supplier = await db.supplier.create(data={"tenantId": "t1", "name": "Global Chairs", "source": "indiamart"})
        
        neg_agent = NegotiationAgent("t1", supplier.id, "sales@globalchairs.com", 850)
        email = await neg_agent.generate_opening_email()
        neg_id = await neg_agent.persist_negotiation(email["subject"], email["body"])
        
        print(f"Negotiation started. ID: {neg_id}")
        await db.disconnect()

    asyncio.run(test())