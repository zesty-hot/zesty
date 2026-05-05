ALTER TABLE public.chat_message REPLICA IDENTITY FULL;

COMMIT;

CREATE PUBLICATION supabase_realtime FOR TABLE public.chat_message;

COMMIT;

CREATE OR REPLACE FUNCTION public.chat_message_broadcast()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Broadcast a message to a topic based on chatId
    PERFORM realtime.broadcast_changes(
        'chat:' || NEW."chatId"::text, -- must match exact column name
        TG_OP,                         -- event name: INSERT/UPDATE/DELETE
        TG_OP,                         -- operation
        TG_TABLE_NAME,                 -- table
        TG_TABLE_SCHEMA,               -- schema
        NEW,                           -- new row
        OLD                            -- old row
    );
    RETURN NULL;
END;
$$;

COMMIT;

CREATE TRIGGER chat_message_broadcast_trigger
AFTER INSERT OR UPDATE OR DELETE
ON public.chat_message
FOR EACH ROW
EXECUTE FUNCTION public.chat_message_broadcast();

COMMIT;

CREATE POLICY "authenticated can receive broadcasts"
ON "realtime"."messages"
FOR SELECT
TO authenticated
USING ( true );

COMMIT;