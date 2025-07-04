// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Autonomous agent function: consumes events from pgmq queue and logs outcome
Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    const record: any = payload.record ?? {}

    // The event may be stored in the "message" column or directly in record
    const rawEvent = record.message ?? record
    let event
    try {
      event = typeof rawEvent === "string" ? JSON.parse(rawEvent) : rawEvent
    } catch (_e) {
      event = { type: "unknown", payload: rawEvent }
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // TODO: Replace with real LLM reasoning and state mutation
    const aiResponse = { message: "acknowledged" }

    // Persist log for dashboard
    await supabaseAdmin.from("event_logs").insert({
      event_type: event.type ?? "unknown",
      payload: event.payload ?? {},
      ai_response: aiResponse,
    })

    return new Response("OK")
  } catch (error) {
    console.error("Edge function error", error)
    return new Response(JSON.stringify({ error: "internal" }), { status: 500 })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/webvend' \
    --header 'Authorization: Bearer SECRET_FROM_SUPABASE_START' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
