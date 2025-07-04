-- Enable pgmq extension
CREATE EXTENSION IF NOT EXISTS pgmq;

-- Create the message queue to hold incoming events for the autonomous agent
SELECT pgmq.create('agent_events');

-- Table to record processed events for dashboard consumption
CREATE TABLE IF NOT EXISTS event_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    event_type TEXT NOT NULL,
    payload JSONB,
    ai_response JSONB
);

-- Enable Row Level Security so we can define read-only policies
ALTER TABLE event_logs ENABLE ROW LEVEL SECURITY;

-- Allow unauthenticated (public) clients to read the event log in real-time
CREATE POLICY "public_select_event_logs" ON event_logs
    FOR SELECT USING (true);

-- Add the table to Supabase Realtime publication so subscriptions work
ALTER PUBLICATION supabase_realtime ADD TABLE event_logs; 