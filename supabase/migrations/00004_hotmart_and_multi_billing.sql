-- Migration 00004: Multi-Provider Billing Architecture (Stripe + Hotmart)
-- KORE Flow Multi-Gateway Entitlement System

-- 1. Flexibilização de constraints legadas do Stripe em kore_subscriptions
ALTER TABLE public.kore_subscriptions 
ALTER COLUMN stripe_customer_id DROP NOT NULL,
ALTER COLUMN stripe_price_id DROP NOT NULL,
ALTER COLUMN billing_cycle DROP NOT NULL;

-- 2. Evolução da tabela kore_subscriptions (Fonte da Verdade por Provider)
ALTER TABLE public.kore_subscriptions
ADD COLUMN IF NOT EXISTS billing_provider TEXT DEFAULT 'stripe' NOT NULL,
ADD COLUMN IF NOT EXISTS external_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS external_customer_id TEXT,
ADD COLUMN IF NOT EXISTS external_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS external_product_id TEXT,
ADD COLUMN IF NOT EXISTS external_offer_id TEXT,
ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'Pro' NOT NULL,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_kore_subscriptions_company_provider 
ON public.kore_subscriptions(company_id, billing_provider, status);

CREATE INDEX IF NOT EXISTS idx_kore_subscriptions_external_sub 
ON public.kore_subscriptions(external_subscription_id);

CREATE INDEX IF NOT EXISTS idx_kore_subscriptions_external_trans 
ON public.kore_subscriptions(external_transaction_id);

-- 3. Evolução da tabela kore_companies (Cache Materializado do Entitlement Efetivo)
ALTER TABLE public.kore_companies
ADD COLUMN IF NOT EXISTS billing_provider TEXT DEFAULT 'stripe',
ADD COLUMN IF NOT EXISTS external_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS external_customer_id TEXT,
ADD COLUMN IF NOT EXISTS external_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false;

-- 4. Tabela de Idempotência e Auditoria de Webhooks
CREATE TABLE IF NOT EXISTS public.kore_billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL, -- 'hotmart' | 'stripe'
  external_event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL, -- 'processed' | 'ignored' | 'failed'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(provider, external_event_id)
);

CREATE INDEX IF NOT EXISTS idx_kore_billing_events_lookup 
ON public.kore_billing_events(provider, external_event_id);

-- 5. Tabela de Compras Pendentes (Usuários que compraram antes de criar conta)
CREATE TABLE IF NOT EXISTS public.kore_pending_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  billing_provider TEXT NOT NULL, -- 'hotmart'
  external_transaction_id TEXT NOT NULL UNIQUE,
  external_subscription_id TEXT,
  plan_tier TEXT DEFAULT 'Pro' NOT NULL,
  product_id TEXT,
  offer_code TEXT,
  buyer_name TEXT,
  buyer_phone TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  claimed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_by_company_id UUID REFERENCES public.kore_companies(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kore_pending_entitlements_email 
ON public.kore_pending_entitlements(email) WHERE claimed_at IS NULL;

-- 6. Configuração de RLS para novas tabelas
ALTER TABLE public.kore_billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kore_pending_entitlements ENABLE ROW LEVEL SECURITY;
