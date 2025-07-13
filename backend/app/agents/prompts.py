from app.agents.vendor_data import VENDOR_CATALOG


def get_vendor_prompt(
    cash_balance: float,
    inventory: list,
    transaction_logs: list,
    customer_messages: list,
) -> str:
    """
    Generates a dynamic prompt for the Vending Machine AI.
    """
    inventory_summary = "\n".join(
        [
            f"- {item['product_name']}: {item['quantity_in_stock']} units @ ${item['retail_price']:.2f}"
            for item in inventory
        ]
    )
    sales_summary = "\n".join(
        [
            f"- Sold 1 unit of {log['product']} for ${log['price']:.2f} at {log['created_at']}"
            for log in transaction_logs
            if log["agent_name"] == "Customer"
        ]
    )
    vendor_catalog_summary = "\n".join(
        [
            f"- {name}: ${details['cost']:.2f}"
            for name, details in VENDOR_CATALOG.items()
        ]
    )

    conversation_summary = "\n".join([
        f"{msg['sender']}: {msg['content']}" for msg in customer_messages
    ]) or "No recent customer messages."

    prompt = f"""
        You are the AI operator of a vending machine. Your goal is to maximize profit.
        You have a cash balance of ${cash_balance:.2f}.

        **Current Vending Machine Inventory:**
        {inventory_summary}

        **Recent Sales:**
        {sales_summary if sales_summary else "No recent sales."}

        **Vendor Catalog (Items you can buy):**
        {vendor_catalog_summary}

        **Conversation History:**
        {conversation_summary}

        **Your Task:**
        Based on the data above, decide on one of the following actions to maximize your profit:
        1.  **BUY**: Purchase items from the vendor to restock your inventory.
            -   Example: "Action: BUY, Item: 'Classic Cola', Quantity: 10"
        2.  **UPDATE_PRICE**: Change the retail price of an item in your vending machine.
            -   Example: "Action: UPDATE_PRICE, Item: 'Potato Chips', Price: 1.75"
        3.  **OFFER_DISCOUNT**: Provide a percentage discount on an existing product for the customer (format below).
            -   Example: "Action: OFFER_DISCOUNT, Item: 'Classic Cola', Discount: 20%"
        4.  **DO_NOTHING**: Take no action and observe sales.
            -   Example: "Action: DO_NOTHING"

        Analyze the current situation and provide your single decision in the exact format demonstrated above. Do not add extra commentary.
        Only provide one action. Be precise and concise.
        Your decision:
    """
    return prompt