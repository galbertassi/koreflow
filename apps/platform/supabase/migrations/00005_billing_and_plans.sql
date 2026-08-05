-- Migration: 00005_billing_and_plans.sql
-- Description: Adiciona o controle de assinaturas (planos), uso mensal e cadastro via webhook Hotmart.

-- 1. Controle de Assinaturas (Adicionar ao Tenant)
ALTER TABLE public.kore_companies
ADD COLUMN plan TEXT NOT NULL DEFAULT 'Free',
ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'active',
ADD COLUMN plan_expires_at TIMESTAMP WITH TIME ZONE;

-- 2. Tabela de Permissão de Cadastro (Webhook Hotmart)
CREATE TABLE IF NOT EXISTS public.kore_approved_customers (
    email TEXT PRIMARY KEY,
    plan TEXT NOT NULL DEFAULT 'Free',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Uso Mensal por Empresa
CREATE TABLE IF NOT EXISTS public.kore_company_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.kore_companies(id) ON DELETE CASCADE,
    month_year TEXT NOT NULL, -- Formato: YYYY-MM
    demands_created INTEGER NOT NULL DEFAULT 0,
    ai_requests INTEGER NOT NULL DEFAULT 0,
    pdf_exports INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(company_id, month_year)
);

-- RLS
ALTER TABLE public.kore_approved_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kore_company_usage ENABLE ROW LEVEL SECURITY;

-- Approved Customers: Apenas o sistema via service role / backend precisa acessar essa tabela.
-- Não criaremos select policies abertas. O cadastro fará check em modo seguro.
-- Podemos criar policy pra role 'service_role' mas o Supabase ignora RLS para service_role por padrão.

-- Company Usage: Usuários podem ler o uso de sua empresa.
CREATE POLICY "Users can view usage of their company" ON public.kore_company_usage
    FOR SELECT USING (company_id IN (SELECT company_id FROM public.kore_company_users WHERE user_id = auth.uid()));

-- Função Helper (opcional mas recomendado) para inicializar uso mensal automaticamente quando uma demanda é criada
-- Se não fizermos no backend/Next.js, podemos fazer via Trigger, mas a lógica de JS é mais flexível no início.
