from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
# Orchestrate two-agent interaction
from app.agents.vending_machine import process_business_request
from app.agents.customer import simulate_customer_purchases, generate_customer_request
from app.database.supabase_client import supabase
from app.models import PurchaseRequest
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

app = FastAPI()

# Add CORS middleware to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/simulation/start")
def start_simulation():
    """Starts a new simulation, creating a record in the database."""
    try:
        response = supabase.table("simulations").insert({
            "status": "running",
            "llm_model": "claude-3-haiku-20240307" # Or get from request
        }).execute()
        simulation_id = response.data[0]['id']
        return {"simulation_id": simulation_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/simulation/step")
def simulation_step(simulation_id: str, step_number: int):
    try:
        # 1. Customer LLM agent generates a request
        customer_msg = generate_customer_request(simulation_id)

        # Log customer message into simulation_logs
        supabase.table("simulation_logs").insert({
            "simulation_id": simulation_id,
            "step_number": step_number,
            "agent_name": "Customer",
            "prompt": "N/A",
            "response": customer_msg,
            "parsed_action": None,
        }).execute()

        # 2. Vending machine agent processes request & decides action
        vending_machine_turn = process_business_request(simulation_id)

        supabase.table("simulation_logs").insert({
            "simulation_id": simulation_id,
            "step_number": step_number,
            "agent_name": "VendingMachine",
            "prompt": vending_machine_turn["prompt"],
            "response": vending_machine_turn["response"],
            "parsed_action": vending_machine_turn["parsed_action"],
        }).execute()

        # 3. Simulated customer random purchases still happen (optional)
        customer_purchases = simulate_customer_purchases()

        return {
            "customer_request": customer_msg,
            "vending_machine_action": vending_machine_turn["parsed_action"],
            "customer_purchases": customer_purchases,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/simulation/logs/{simulation_id}")
def get_simulation_logs(simulation_id: str):
    """Fetches all logs for a given simulation."""
    try:
        response = supabase.table("simulation_logs").select("*").eq("simulation_id", simulation_id).order("step_number").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/simulation/reset")
def reset_simulation():
    """Resets the simulation state in the database."""
    try:
        # This is a placeholder. A proper reset would involve more complex logic,
        # perhaps calling a database function to reset tables to a default state.
        # For now, we can clear the logs and reset the cash balance.
        supabase.table("transaction_logs").delete().neq("id", 0).execute() # Deletes all rows
        supabase.table("simulation_logs").delete().neq("id", 0).execute()
        supabase.table("cash_balance").update({"balance": 1000.00}).eq("account_name", "vending_machine").execute()
        # You might also want to reset inventory quantities.
        return {"message": "Simulation reset successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/vending/inventory")
def get_inventory():
    try:
        inventory = supabase.table("inventory").select("*").execute().data
        if not inventory:
            raise HTTPException(status_code=404, detail="No items found in inventory")
        return {"inventory": inventory}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/vending/balance")
def get_balance():
    try:
        balance = supabase.table("cash_balance").select("balance").eq("account_name", "vending_machine").execute().data
        if not balance:
            raise HTTPException(status_code=404, detail="Balance not found")
        return {"balance": balance[0]['balance']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/vending/transactions")
def get_transactions():
    try:
        transactions = supabase.table("transaction_logs").select("*").order("created_at", desc=True).limit(100).execute().data
        return {"transactions": transactions}
    except Exception as e:
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



