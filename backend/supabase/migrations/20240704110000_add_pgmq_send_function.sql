CREATE OR REPLACE FUNCTION pgmq_send(
    queue_name TEXT,
    messages JSONB[]
) RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM pgmq.send_batch(queue_name, messages);
END;
$$; 