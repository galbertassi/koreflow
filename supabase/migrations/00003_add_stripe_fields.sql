-- Adicionar campos da Stripe à tabela de empresas

ALTER TABLE public.kore_configuracoes
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_current_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'active';

-- Criar um índice para buscar a empresa rapidamente via stripe_customer_id durante os webhooks
CREATE INDEX IF NOT EXISTS idx_kore_configuracoes_stripe_customer_id ON public.kore_configuracoes(stripe_customer_id);
