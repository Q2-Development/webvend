# This file will contain the logic for the customer agent. 

import random
from app.database.supabase_client import supabase

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
                purchases.append({
                    "product_name": item['product_name'],
                    "price": item['retail_price']
                })
                
    return purchases 