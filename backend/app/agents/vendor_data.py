from typing import Dict
from app.database.supabase_client import supabase

DEFAULT_VENDOR_CATALOG: Dict[str, Dict[str, float]] = {
    "Classic Cola": {"cost": 0.50, "wholesale_price": 0.50, "quantity_in_stock": 42},
    "Potato Chips": {"cost": 0.75, "wholesale_price": 0.75, "quantity_in_stock": 18},
    "Chocolate Bar": {"cost": 0.65, "wholesale_price": 0.65, "quantity_in_stock": 31},
    "Diet Cola": {"cost": 0.55, "wholesale_price": 0.55, "quantity_in_stock": 27},
    "Pretzels": {"cost": 0.70, "wholesale_price": 0.70, "quantity_in_stock": 15},
    "Peanut Butter Cups": {"cost": 0.80, "wholesale_price": 0.80, "quantity_in_stock": 23},
    "Bottled Water": {"cost": 0.40, "wholesale_price": 0.40, "quantity_in_stock": 56},
    "Energy Drink": {"cost": 1.50, "wholesale_price": 1.50, "quantity_in_stock": 12},
    "Gum": {"cost": 0.25, "wholesale_price": 0.25, "quantity_in_stock": 89},
}


def _fetch_catalog_from_db() -> Dict[str, Dict[str, float]]:
    try:
        response = supabase.table("inventory").select("product_name,vendor_cost,quantity_in_stock").execute()
        data = response.data or []

        return {
            item["product_name"]: {
                "cost": item["vendor_cost"],
                "wholesale_price": item["vendor_cost"],
                "quantity_in_stock": item["quantity_in_stock"],
            }
            for item in data
        }
    except Exception as e:
        print(f"[vendor_data] Warning: failed to fetch catalog from DB using default. Error: {e}")
        return {}

def get_vendor_catalog() -> Dict[str, Dict[str, float]]:
    """Return the current vendor catalog, preferring live DB data."""
    catalog = _fetch_catalog_from_db()
    return catalog if catalog else DEFAULT_VENDOR_CATALOG

VENDOR_CATALOG: Dict[str, Dict[str, float]] = get_vendor_catalog()