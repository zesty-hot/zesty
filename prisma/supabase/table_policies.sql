DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon;', r.tablename);
    END LOOP;
END $$;

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT sequence_name
        FROM information_schema.sequences
        WHERE sequence_schema = 'public'
    LOOP
        EXECUTE format('REVOKE ALL ON SEQUENCE public.%I FROM anon;', r.sequence_name);
    END LOOP;
END $$;

GRANT USAGE ON SCHEMA public TO anon;

COMMIT;

GRANT USAGE ON SCHEMA public TO authenticated;

COMMIT;

GRANT SELECT ON public.zesty_user TO authenticated;

COMMIT;