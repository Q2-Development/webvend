import re
import json

def parse_llm_response(response: str) -> dict:
    """
    Parses the LLM's natural language response to extract a structured action.
    """
    response = response.strip()

    # DO_NOTHING action
    if "DO_NOTHING" in response:
        return {"action": "DO_NOTHING"}

    # BUY action
    buy_match = re.search(r"Action: BUY, Item: '([^']*)', Quantity: (\d+)", response, re.IGNORECASE)
    if buy_match:
        return {
            "action": "BUY",
            "item_name": buy_match.group(1),
            "quantity": int(buy_match.group(2)),
        }

    # UPDATE_PRICE action
    update_match = re.search(r"Action: UPDATE_PRICE, Item: '([^']*)', Price: ([\d\.]+)", response, re.IGNORECASE)
    if update_match:
        return {
            "action": "UPDATE_PRICE",
            "item_name": update_match.group(1),
            "price": float(update_match.group(2)),
        }

    discount_match = re.search(r"Action: OFFER_DISCOUNT, Item: '([^']*)', Discount: (\d+)%", response, re.IGNORECASE)
    if discount_match:
        return {
            "action": "OFFER_DISCOUNT",
            "item_name": discount_match.group(1),
            "discount": int(discount_match.group(2)),
        }

    return {"action": "UNKNOWN", "details": "Could not parse response"} 