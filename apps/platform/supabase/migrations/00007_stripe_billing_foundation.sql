-- ==============================================================================
-- MIGRATION 00007: STRIPE BILLING FOUNDATION & WORKSPACE TYPE
-- Description: Implementa o modelo de dados definitivo para billing com Stripe,
-- cria as tabelas de subscrições e eventos (webhooks), e provisiona a RPC
-- segura de criação de workspace pessoal.
-- ==============================================================================

-- 1. NOVAS COLUNAS EM kore_companies
ALTER TABLE public.kore_companies
ADD COLUMN IF NOT EXISTS workspace_type TEXT NOT NULL DEFAULT 'personal',
ADD COLUMN IF NOT EXISTS personal_owner_user_id UUID,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Índice para garantir 1 único workspace pessoal por usuário
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_personal_workspace 
ON public.kore_companies (personal_owner_user_id) 
WHERE workspace_type = 'personal';

-- Índice para garantir unicidade do customer_id do Stripe por workspace
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_stripe_customer 
ON public.kore_companies (stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;


-- 2. TABELA DE ASSINATURAS (ESPElho DO STRIPE)
CREATE TABLE IF NOT EXISTS public.kore_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.kore_companies(id) ON DELETE CASCADE,
    stripe_customer_id TEXT NOT NULL,
    stripe_subscription_id TEXT NOT NULL UNIQUE,
    stripe_price_id TEXT NOT NULL,
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
    status TEXT NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    status_changed_at TIMESTAMP WITH TIME ZONE,
    past_due_since TIMESTAMP WITH TIME ZONE,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Índices e restrições
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_active_sub 
ON public.kore_subscriptions (company_id) 
WHERE status NOT IN ('canceled', 'incomplete_expired');

-- RLS: Subscription é apenas para leitura pelo dono/admin da company
ALTER TABLE public.kore_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view subscriptions for their companies"
ON public.kore_subscriptions
FOR SELECT
USING (
    company_id IN (
        SELECT company_id 
        FROM public.kore_company_users 
        WHERE user_id = auth.uid()
    )
);


-- 3. TABELA DE EVENTOS DO STRIPE (IDEMPOTÊNCIA)
CREATE TABLE IF NOT EXISTS public.kore_stripe_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stripe_event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    livemode BOOLEAN NOT NULL,
    stripe_created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
    attempt_count INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS: Apenas backend (Service Role) acessa essa tabela
ALTER TABLE public.kore_stripe_events ENABLE ROW LEVEL SECURITY;
-- Sem policies para o role autenticado público, o que impede qualquer acesso client-side.


-- 4. RPC DE PROVISIONAMENTO DE WORKSPACE (SEGURO PARA BACKEND E NOVO USUÁRIO)
-- Esta RPC NUNCA deve ser chamada diretamente do client, mas como o Supabase expõe 
-- RPCs via REST, nós mitigamos qualquer risco garantindo que ela use apenas auth.uid() 
-- e não aceite um user_id como parâmetro de quem chamou.
CREATE OR REPLACE FUNCTION public.ensure_my_personal_workspace(p_full_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_existing_company_id UUID;
    v_new_company_id UUID;
    v_first_name TEXT;
BEGIN
    -- Captura estritamente o usuário autenticado que está chamando
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Extrai o primeiro nome para compor o nome do workspace
    v_first_name := split_part(p_full_name, ' ', 1);
    IF v_first_name = '' THEN
        v_first_name := 'Meu';
    END IF;

    -- Verifica se já existe um workspace personal para este usuário (idempotência)
    SELECT id INTO v_existing_company_id 
    FROM public.kore_companies 
    WHERE personal_owner_user_id = v_user_id 
      AND workspace_type = 'personal'
    LIMIT 1;

    IF v_existing_company_id IS NOT NULL THEN
        RETURN v_existing_company_id;
    END IF;

    -- Cria o workspace
    INSERT INTO public.kore_companies (
        name, 
        workspace_type, 
        personal_owner_user_id,
        trial_started_at,
        trial_ends_at
    ) VALUES (
        'Workspace de ' || v_first_name,
        'personal',
        v_user_id,
        timezone('utc'::text, now()),
        timezone('utc'::text, now()) + interval '14 days'
    ) RETURNING id INTO v_new_company_id;

    -- Vincula o usuário como owner
    INSERT INTO public.kore_company_users (
        company_id, 
        user_id, 
        role
    ) VALUES (
        v_new_company_id,
        v_user_id,
        'owner'
    );

    RETURN v_new_company_id;
END;
$$;
