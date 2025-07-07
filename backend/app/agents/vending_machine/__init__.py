from app.database.supabase_client import supabase
from app.agents.prompts import get_vendor_prompt
from app.agents.vending_machine.parser import parse_llm_response
from app.agents.vendor_data import VENDOR_CATALOG
from dotenv import load_dotenv
from pathlib import Path
import requests
import os

load_dotenv(Path(__file__).parent.parent / ".env")
OPENROUTER_API_KEY = os.getenv('OPEN_ROUTER_KEY')

def get_inventory():
    """Fetches the current inventory from the database."""
    response = supabase.table("inventory").select("*").execute()
    return response.data

def get_cash_balance():
    """Fetches the current cash balance from the database."""
    response = supabase.table("cash_balance").select("balance").eq("account_name", "vending_machine").execute()
    return response.data[0]['balance']

def get_transaction_logs(limit=20):
    """Fetches the last N transaction logs from the database."""
    response = supabase.table("transaction_logs").select("*").order("created_at", desc=True).limit(limit).execute()
    return response.data

def execute_action(action: dict):
    """Executes the parsed action by updating the database."""
    action_type = action.get("action")

    if action_type == "BUY":
        # Logic to handle BUY action
        item_name = action.get("item_name")
        quantity = action.get("quantity")
        
        # 1. Get vendor cost
        vendor_cost = VENDOR_CATALOG.get(item_name, {}).get("cost")
        if not vendor_cost:
            return
            
        total_cost = vendor_cost * quantity

        # 2. Update inventory (DB trigger will adjust cash balance & log transaction)
        quoted_item_name = f'"{item_name}"'
        current_inventory_response = (
            supabase.table("inventory")
            .select("quantity_in_stock")
            .eq("product_name", quoted_item_name)
            .execute()
        )
        current_quantity = current_inventory_response.data[0]['quantity_in_stock']
        (
            supabase.table("inventory")
            .update({"quantity_in_stock": current_quantity + quantity})
            .eq("product_name", quoted_item_name)
            .execute()
        )

    elif action_type == "UPDATE_PRICE":
        # Logic to handle UPDATE_PRICE action
        item_name = action.get("item_name")
        new_price = action.get("price")
        quoted_item_name = f'{item_name}'
        (
            supabase.table("inventory")
            .update({"retail_price": new_price})
            .eq("product_name", quoted_item_name)
            .execute()
        )

def process_business_request():
    # 1. Gather state
    inventory = get_inventory()
    cash_balance = get_cash_balance()
    transaction_logs = get_transaction_logs()

    # 2. Generate prompt
    prompt = get_vendor_prompt(cash_balance, inventory, transaction_logs)

    # 3. Get LLM response via OpenRouter
    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            },
            json={
                "model": "google/gemini-2.5-flash-lite-preview-06-17",
                "messages": [{"role": "user", "content": prompt}],
            },
        )
        response.raise_for_status()
        llm_response_text = response.json()["choices"][0]["message"]["content"]
        print(f"The response from OpenRouter: {response}")
    except requests.exceptions.RequestException as e:
        print(f"Error calling OpenRouter: {e}")
        return {
            "prompt": prompt,
            "response": "Error: Could not get response from LLM.",
            "parsed_action": {"action": "DO_NOTHING"},
        }

    # 4. Parse action
    parsed_action = parse_llm_response(llm_response_text)

    # 5. Execute action
    execute_action(parsed_action)

    return {
        "prompt": prompt,
        "response": llm_response_text,
        "parsed_action": parsed_action,
    }