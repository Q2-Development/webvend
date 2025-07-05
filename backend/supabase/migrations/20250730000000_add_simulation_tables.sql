-- Create simulations table
CREATE TABLE public.simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    status TEXT, -- e.g., 'running', 'paused', 'finished'
    llm_model TEXT
);

-- Add agent_name to transaction_logs
ALTER TABLE public.transaction_logs ADD COLUMN agent_name TEXT;

-- Create simulation_logs table
CREATE TABLE public.simulation_logs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    simulation_id UUID,
    step_number INT,
    agent_name TEXT,
    prompt TEXT,
    response TEXT,
    parsed_action JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_simulation
        FOREIGN KEY(simulation_id) 
        REFERENCES public.simulations(id)
);


-- Enable RLS for new tables
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables to allow access
CREATE POLICY "Enable read access for all users on simulations" ON "public"."simulations" FOR SELECT USING (true);
CREATE POLICY "Enable all access for all users on simulations" ON "public"."simulations" FOR ALL USING (true);

CREATE POLICY "Enable read access for all users on simulation_logs" ON "public"."simulation_logs" FOR SELECT USING (true);
CREATE POLICY "Enable all access for all users on simulation_logs" ON "public"."simulation_logs" FOR ALL USING (true); 