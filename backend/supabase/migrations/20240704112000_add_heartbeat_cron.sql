CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule a heartbeat event every 5 minutes to drive the simulation
SELECT cron.schedule(
    'simulation_heartbeat',            -- unique job name
    '*/5 * * * *',                     -- run every 5 minutes
    $$
    SELECT pgmq.send(
        'agent_events',
        '{"type":"system.time.passed","payload":{"minutes":5}}'::jsonb
    );
    $$
); 