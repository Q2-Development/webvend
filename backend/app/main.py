from fastapi import FastAPI, HTTPException

from app.models import PurchaseRequest
from app.database import supabase
import requests
import dotenv
import os
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)
DEBUG = True

app = FastAPI()
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

dotenv.load_dotenv()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/api/models")
def get_models():
    headers = {
        "Authorization": f'Bearer {os.getenv("OPEN_ROUTER_KEY")}',  # Changed to use OPEN_ROUTER_KEY
        "Content-Type": "application/json"
    }
    r = requests.get("https://openrouter.ai/api/v1/models", headers=headers)
    if r.status_code >= 200 and r.status_code <= 299:
        return r.json()  
    else:
        return {"error": "Failed to retrieve models"}

# Endpoint to fetch the inventory from Supabase for frontend display
@app.get("/api/vending/inventory")
def get_inventory():
    try:
        # Fetch inventory from Supabase
        inventory = supabase.table("inventory").select("*").execute().data
        
        if not inventory:
            raise HTTPException(status_code=404, detail="No items found in inventory")
        
        return {"inventory": inventory}
    
    except Exception as e:
        logger.error(f"Error in /api/vending/inventory endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to handle the purchase request, assuming users are allowed to
@app.post("/api/vending/purchase")
def customer_purchase(purchase: PurchaseRequest):
    try:
        # Validate the purchase request
        item = supabase.table("inventory").select("*") \
            .eq("product_name", purchase.item) \
            .single() \
            .execute().data

        # Check if the item exists and is in stock
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        if item['quantity_in_stock'] <= 0:
            raise HTTPException(status_code=400, detail="Item out of stock")
        
        # Check if the user has enough balance
        pass

        # Updating the quantity
        # PostgreSQL trigger will generate log entry
        supabase.table("inventory").update({
            "quantity_in_stock": item['quantity_in_stock'] - 1
        }).eq("product_name", purchase.item).execute()

            
        return {"message": "Purchase successful", "item": purchase.item}

    except Exception as e:
        logger.error(f"Error in /api/vending/purchase endpoint for vending purchase : {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
        # return {"error": str(e)}



