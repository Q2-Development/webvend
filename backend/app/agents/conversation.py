from app.database.supabase_client import supabase
from typing import List, Dict


def add_message(simulation_id: str, sender: str, content: str) -> None:
    """Insert a new chat message for a simulation."""
    try:
        supabase.table("agent_messages").insert({
            "simulation_id": simulation_id,
            "sender": sender,
            "content": content,
        }).execute()
    except Exception as e:
        # We do not raise to avoid breaking the simulation because of logging issues.
        print(f"[conversation] Failed to add message: {e}")


def get_recent_messages(simulation_id: str, limit: int = 5) -> List[Dict]:
    """Return the most recent conversation messages (oldest → newest)."""
    try:
        response = (
            supabase.table("agent_messages")
            .select("sender,content,created_at")
            .eq("simulation_id", simulation_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        data = response.data or []
        # Reverse so we go oldest -> newest for readability in the prompt.
        return list(reversed(data))
    except Exception as e:
        print(f"[conversation] Failed to fetch messages: {e}")
        return [] 