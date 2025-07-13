# This file will contain the logic for the customer agent. 

import random
from app.database.supabase_client import supabase

import os
import requests
from pathlib import Path
from dotenv import load_dotenv
from app.agents.conversation import add_message, get_recent_messages

load_dotenv(Path(__file__).parent.parent / ".env")
OPENROUTER_API_KEY = os.getenv("OPEN_ROUTER_KEY")


def get_inventory():
    """Fetches the current inventory from the database."""
    response = supabase.table("inventory").select("*").execute()
    return response.data

def update_inventory_quantity(product_name, new_quantity):
    """Updates the quantity of a product in the inventory."""
    quoted_item_name = f'"{product_name}"'
    (
        supabase.table("inventory")
        .update({"quantity_in_stock": new_quantity})
        .eq("product_name", quoted_item_name)
        .execute()
    )

def add_transaction_log(product_name, price, agent_name):
    """Adds a new transaction to the transaction_logs table."""
    supabase.table("transaction_logs").insert({
        "product": product_name,
        "price": price,
        "agent_name": agent_name
    }).execute()

def update_cash_balance(amount):
    """Updates the cash balance."""
    current_balance_response = supabase.table("cash_balance").select("balance").eq("account_name", "vending_machine").execute()
    current_balance = current_balance_response.data[0]['balance']
    new_balance = current_balance + amount
    supabase.table("cash_balance").update({"balance": new_balance}).eq("account_name", "vending_machine").execute()

def simulate_customer_purchases():
    """
    Simulates customer purchases based on inventory and probabilities.
    """
    inventory = get_inventory()
    # Fetch discounts once
    try:
        discounts_resp = supabase.table("discounts").select("product_name,discount_pct").execute()
        discounts_map = {d['product_name']: d['discount_pct'] for d in (discounts_resp.data or [])}
    except Exception:
        discounts_map = {}

    purchases = []

    for item in inventory:
        # Simple probability: 10% chance to buy an item
        if random.random() < 0.1:
            if item['quantity_in_stock'] > 0:
                new_quantity = item['quantity_in_stock'] - 1
                update_inventory_quantity(item['product_name'], new_quantity)
                # Cash balance adjustment and transaction logging are handled
                # automatically by the `quantity_in_stock_change_trigger` in the
                # database when we update the inventory.
                # Apply discount if available
                discount_pct = discounts_map.get(item['product_name'])
                price_charged = item['retail_price']
                if discount_pct:
                    price_charged = round(price_charged * (1 - discount_pct / 100), 2)

                purchases.append({
                    "product_name": item['product_name'],
                    "price": price_charged,
                })
                
    return purchases 


def generate_customer_request(simulation_id: str) -> str:
    """LLM-based customer agent that creates a single request (discount or new item)."""
    inventory = get_inventory()
    recent_msgs = get_recent_messages(simulation_id)

    inventory_summary = "\n".join([
        f"- {item['product_name']}: {item['quantity_in_stock']} units @ ${item['retail_price']:.2f}"
        for item in inventory
    ])
    conversation_snippet = "\n".join([
        f"{m['sender']}: {m['content']}" for m in recent_msgs
    ]) or "No prior messages."

    prompt = f"""
You are an office worker who occasionally buys snacks from a smart vending machine.\n
Current inventory:\n{inventory_summary}\n\nRecent conversation:\n{conversation_snippet}\n\nIn ONE short sentence, either:\n1. Ask for a percentage discount on an existing product OR\n2. Request a new product you would like stocked.\n\nRespond ONLY in the form:\nREQUEST: <your sentence>\n"""

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}"},
            json={
                "model": "google/gemini-2.5-flash-lite-preview-06-17",
                "messages": [{"role": "user", "content": prompt}],
            },
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"[customer_ai] Error calling OpenRouter: {e}")
        content = "REQUEST: Could I get a discount on Classic Cola?"

    # Ensure the prefix exists
    if not content.startswith("REQUEST:"):
        content = f"REQUEST: {content}"

    # Persist to conversation log (remove prefix for readability)
    add_message(simulation_id, "Customer", content.replace("REQUEST:", "", 1).strip())

    return content 