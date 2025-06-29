// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.ts'
Deno.serve(async (req) => {
  // Parse request, setup client
  const { query } = await req.json()
  const apiKey = Deno.env.get('OPEN_ROUTER_KEY')
  const openRouter = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
  })

  // Retrieve stream from OpenRouter
  const stream = await openRouter.chat.completions.create({
    messages: [{ role: 'user', content: query }],
    model: 'openai/gpt-4o-mini',
    stream: true,
  })

  // Recreate a readable stream
  const returnStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        controller.enqueue((new TextEncoder()).encode(chunk.choices[0].delta.content ?? ""))
      }
      controller.close()
    },
  })

  // Send that shit out the door
  return new Response(returnStream, {
    headers: { 
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
    },
  })
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/vending' \
    --header 'Authorization: Bearer "supabase status anon key' \
    --header 'Content-Type: application/json' \
    --data '{"query":"Whatever you want"}'

*/
