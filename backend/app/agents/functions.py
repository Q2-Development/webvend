from postgrest.base_request_builder import APIResponse
from app.database.supabase_client import supabase
from postgrest.base_request_builder import APIResponse

import os
import json
import gotrue
import requests
import logging

logger = logging.getLogger(__name__)

# Send chat
def send_chat_prompt(user: gotrue.types.User, messages: APIResponse):
    api_key = None
    if not user.is_anonymous:
        try:
            result = supabase.table("user_api_keys").select("encrypted_key").eq("user_id", user.id).execute()
            if result.data and len(result.data) > 0:
                encrypted_key = result.data[0]['encrypted_key']
                api_key = encryption.decrypt_api_key(encrypted_key)
        except Exception as e:
            logger.error(f"Failed to get user API key: {e}")
        
    openrouter_key = api_key or os.getenv("OPEN_ROUTER_KEY")
    if not openrouter_key:
        raise Exception("No API key available")
            
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f'Bearer {openrouter_key}',
        "Content-Type": "application/json"
    }

    # Change the messages from their DB form to a object compatible with the api
    messagesInApiFormat = [
        {"role": message.get("speaker").lower(), "content": message.get("content")} for message in messages.data
    ]

    if len(messagesInApiFormat) == 0:
        messagesInApiFormat = [{"role": "system", "content": SYSTEM_PROMPT }]
        supabase.table("messages") \
            .insert({"chat_id": item.chatId, "provider_id": item.model, "content": SYSTEM_PROMPT, "speaker": "System"}) \
            .execute()
    print(messagesInApiFormat)
    # return

    # Determine the model to use based on web search setting
    model_to_use = item.model
    if item.webSearchEnabled:
        # Use the :online suffix for web search capability
        if not item.model.endswith(":online"):
            model_to_use = f"{item.model}:online"
    
    # Actual API payload
    payload = {
        "model": model_to_use,
        "messages": [
            *messagesInApiFormat,
            {"role": "user", "content": item.prompt}
        ],
        "stream": True
    }
    print(payload["messages"])

    supabase.table("messages") \
        .insert({"chat_id": item.chatId, "provider_id": item.model, "content": item.prompt, "speaker": "User"}) \
        .execute()
    # Stream the response back to the client
    response = []
    with requests.post(url, headers=headers, json=payload, stream=True) as r:
        for line in r.iter_lines(decode_unicode=True):
            if not line or not line.startswith("data: "):
                continue
            data = line[len("data: "):]
            if data == "[DONE]":
                print(f'R: {"".join(response)}')

                # Save the assistant's response in the database
                supabase.table("messages") \
                    .insert({"chat_id": item.chatId, "provider_id": item.model, "content": "".join(response), "speaker": "Assistant"}) \
                    .execute()
                break
            try:
                data_obj = json.loads(data)
                delta = data_obj["choices"][0]["delta"]

                # Get content, handle potential None values
                content = delta.get("content")
                if content:
                    # Remove the problematic encoding/decoding that was causing issues
                    response.append(content)
                    yield content
            except json.JSONDecodeError:
                continue
