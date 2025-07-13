-- Add tables for conversation messages and discounts

-- Conversation messages between Customer and VendingMachine agents
CREATE TABLE IF NOT EXISTS public.agent_messages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    simulation_id UUID REFERENCES public.simulations(id),
    sender TEXT,  -- 'Customer' | 'VendingMachine'
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simple discount table – one active discount per product
CREATE TABLE IF NOT EXISTS public.discounts (
    product_name TEXT REFERENCES public.inventory(product_name) ON DELETE CASCADE,
    discount_pct INT CHECK (discount_pct > 0 AND discount_pct <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (product_name)
);

-- Enable RLS and open simple access (similar to other tables)
ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_msgs_all" ON public.agent_messages FOR ALL USING (true);
CREATE POLICY "discounts_all" ON public.discounts FOR ALL USING (true); 