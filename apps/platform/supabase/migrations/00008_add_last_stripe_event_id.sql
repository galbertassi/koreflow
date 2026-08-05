-- ==============================================================================
-- MIGRATION 00008: ADD LAST STRIPE EVENT ID TO SUBSCRIPTIONS
-- ==============================================================================

ALTER TABLE public.kore_subscriptions
ADD COLUMN IF NOT EXISTS last_stripe_event_id TEXT;

-- Criação da função para incrementar tentativas de evento do stripe
CREATE OR REPLACE FUNCTION public.increment_stripe_event_attempt(event_uuid UUID, err_msg TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.kore_stripe_events
  SET attempt_count = attempt_count + 1,
      status = 'failed',
      error_message = err_msg,
      updated_at = timezone('utc'::text, now())
  WHERE id = event_uuid;
END;
$$;
