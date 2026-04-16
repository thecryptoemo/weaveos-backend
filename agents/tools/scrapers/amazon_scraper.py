import asyncio
import os
import random
from typing import Dict, Any, List

class AmazonScraper:
    def __init__(self):
        self.api_key = os.getenv("SCRAPINGBEE_API_KEY")

    async def scrape_product(self, asin: str) -> Dict[str, Any]:
        await asyncio.sleep(random.uniform(0.3, 0.8))
        prefixes = ["Premium", "Eco-Friendly", "Professional", "Ultimate", "Organic"]
        suffixes = ["Pro", "X-Series", "v2.0", "Elite", "Standard"]
        return {
            "asin": asin,
            "title": f"{random.choice(prefixes)} Product {asin.split('_')[-1]} {random.choice(suffixes)}",
            "price": round(random.uniform(999, 4999), 2),
            "currency": "INR",
            "bsr": random.randint(10, 5000),
            "seller_count": random.randint(1, 20),
            "reviews": ["High quality materials", "Exactly as described", "Better than expected"]
        }

    async def search_category(self, keyword: str) -> List[str]:
        return [f"ASIN_{keyword.replace(' ', '_')}_{i}" for i in range(6)]
