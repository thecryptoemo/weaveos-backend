from typing import Dict, Any, List
import json

class SupplierDiscoveryAgent:
    def __init__(self, tenant_id: str):
        self.tenant_id = tenant_id

    def calculate_supplier_score(self, data: Dict[str, Any]) -> float:
        """
        Scores suppliers based on Price, MOQ, Rating.
        """
        # Lower price is better (normalized), Lower MOQ is better, Higher Rating is better
        # This is a simplified version of the logic
        price_score = max(0, (2000 - data.get("price", 2000)) / 20) # Mock normalization
        moq_score = max(0, (100 - data.get("moq", 100)))
        rating_score = data.get("rating", 0) * 20
        
        return round((price_score * 0.4) + (moq_score * 0.3) + (rating_score * 0.3), 2)

async def mock_indiamart_search(keyword: str) -> List[Dict[str, Any]]:
    """Mocking IndiaMART scraper output"""
    return [
        {"name": "Delhi Furniture Hub", "price": 950.0, "moq": 50, "rating": 4.5, "source": "indiamart"},
        {"name": "Ludhiana Exports", "price": 850.0, "moq": 100, "rating": 3.8, "source": "indiamart"},
        {"name": "Guangzhou Global (via IndiaMART)", "price": 700.0, "moq": 500, "rating": 4.9, "source": "indiamart"}
    ]