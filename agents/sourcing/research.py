from typing import Dict, Any, List
import json

class MarketResearchAgent:
    def __init__(self, tenant_id: str):
        self.tenant_id = tenant_id

    def calculate_winning_score(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates the Winning Product Score (0-100).
        Formula:
        - Demand Signal (30%)
        - Competition Gap (25%)
        - Margin Potential (25%)
        - Sentiment Opportunity (20%)
        """
        demand = data.get("demand_signal", 0) * 0.30
        competition = data.get("competition_gap", 0) * 0.25
        margin = data.get("margin_potential", 0) * 0.25
        sentiment = data.get("sentiment_opportunity", 0) * 0.20
        
        total_score = demand + competition + margin + sentiment
        
        return {
            "total_score": round(total_score, 2),
            "breakdown": {
                "demand": round(demand, 2),
                "competition": round(competition, 2),
                "margin": round(margin, 2),
                "sentiment": round(sentiment, 2)
            }
        }

    async def analyze_sentiment(self, reviews: List[str]) -> Dict[str, Any]:
        """
        Placeholder for LLM-based sentiment analysis.
        Extracts unmet needs and theme sentiment.
        """
        # In production, this calls get_model_for_task("sourcing.research.classify_sentiment")
        return {
            "opportunity_score": 85,
            "top_complaints": ["Poor packaging", "Instruction manual unclear"],
            "unmet_needs": ["Rechargeable version", "Travel-sized option"]
        }

if __name__ == "__main__":
    # Test logic
    agent = MarketResearchAgent(tenant_id="tenant_123")
    sample_data = {
        "demand_signal": 90,        # High BSR, high search volume
        "competition_gap": 70,     # Few dominant brands
        "margin_potential": 80,    # Good price vs estimated cost
        "sentiment_opportunity": 85 # Lots of "fixable" complaints in reviews
    }
    
    result = agent.calculate_winning_score(sample_data)
    print(f"Winning Product Score: {json.dumps(result, indent=2)}")