import asyncio
import os
import httpx
import random
from typing import Dict, Any, List

class AmazonScraper:
    def __init__(self):
        self.api_key = os.getenv("SCRAPINGBEE_API_KEY")

    async def scrape_product(self, asin: str) -> Dict[str, Any]:
        await asyncio.sleep(0.5)
        products = [
            {"title": "Premium Organic Yoga Mat", "price": 2499.00, "bsr": 105},
            {"title": "Eco-Friendly Cork Yoga Mat", "price": 3100.00, "bsr": 42},
            {"title": "Non-Slip Alignment Mat", "price": 1850.00, "bsr": 210},
            {"title": "Travel Foldable Yoga Mat", "price": 1200.00, "bsr": 560},
            {"title": "High-Density Foam Mat", "price": 999.00, "bsr": 12}
        ]
        selected = random.choice(products)
        return {
            "asin": asin,
            "title": selected["title"],
            "price": selected["price"],
            "currency": "INR",
            "bsr": selected["bsr"],
            "seller_count": random.randint(2, 15),
            "reviews": ["Excellent grip", "Doesn't smell", "Great for hot yoga"]
        }

    async def search_category(self, keyword: str) -> List[str]:
        return [f"ASIN_{i}_{random.randint(100,999)}" for i in range(4)]
