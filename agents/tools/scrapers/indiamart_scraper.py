import asyncio
from typing import List, Dict, Any

class IndiaMartScraper:
    async def search_suppliers(self, product_name: str) -> List[Dict[str, Any]]:
        print(f"Searching IndiaMART for: {product_name}...")
        await asyncio.sleep(1)
        return [
            {"name": "Reliable Suppliers Ltd", "price": 1100, "moq": 20, "rating": 4.7},
            {"name": "Bulk Goods India", "price": 950, "moq": 100, "rating": 4.2}
        ]