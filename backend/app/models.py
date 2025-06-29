# In backend/app/models.py

from typing import Optional, Dict, Any, List
from pydantic import BaseModel

class PurchaseRequest(BaseModel):
    item: str
    model: Optional[str] = None