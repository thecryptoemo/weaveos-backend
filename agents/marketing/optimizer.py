from typing import Dict, Any, List

class MarketingOptimizer:
    def __init__(self, tenant_id: str):
        self.tenant_id = tenant_id

    def calculate_true_roas(self, spend: float, revenue: float, landed_cost: float, units_sold: int) -> Dict[str, Any]:
        """
        The 'Brutally Honest' metric.
        True ROAS = (Revenue - (Landed Cost * Units)) / Ad Spend
        """
        if spend == 0:
            return {"true_roas": 0, "status": "no_spend"}
            
        gross_profit = revenue - (landed_cost * units_sold)
        true_roas = gross_profit / spend
        
        return {
            "true_roas": round(true_roas, 2),
            "gross_profit": round(gross_profit, 2),
            "ad_spend": spend,
            "status": "profitable" if true_roas > 1.5 else "bleeding" if true_roas < 1.0 else "marginal"
        }

    def inventory_check(self, current_stock: int, daily_velocity: float) -> Dict[str, Any]:
        """
        Crucial Cross-Agent Check: Should we stop ads?
        """
        days_left = current_stock / daily_velocity if daily_velocity > 0 else 999
        
        return {
            "days_left": round(days_left, 1),
            "action": "PAUSE_ADS" if days_left < 7 else "REDUCE_BUDGET" if days_left < 14 else "MAINTAIN"
        }

if __name__ == "__main__":
    opt = MarketingOptimizer("tenant_123")
    # Scenario: Sourcing found landed cost is 1500, selling price is 4500.
    # We spent 5000 on ads, got 15000 in revenue (3.0 Platform ROAS)
    # Sold 3.33 units (simulated)
    result = opt.calculate_true_roas(spend=5000, revenue=15000, landed_cost=1500, units_sold=3)
    print(f"Marketing Performance: {result}")