-- Migration: 00003_saas_demands_schema.sql
-- Description: Implementa a arquitetura SaaS Universal e o novo sistema de Controle Inteligente de Demandas

-- 1. SaaS Architecture (Tenants)
CREATE TABLE IF NOT EXISTS public.kore_companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Extension of the auth.users for Kore Flow context (Tenant binding)
CREATE TABLE IF NOT EXISTS public.kore_company_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.kore_companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member', -- admin, manager, member
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(company_id, user_id)
);

-- 2. Core Entities
CREATE TABLE IF NOT EXISTS public.kore_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.kore_companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.kore_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.kore_companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT 'bg-slate-500',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Demand Management (The Heart of V2.0)
CREATE TABLE IF NOT EXISTS public.kore_demands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.kore_companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.kore_clients(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.kore_categories(id) ON DELETE SET NULL,
    
    title TEXT NOT NULL,
    description TEXT,
    
    -- Scope Control
    type TEXT NOT NULL DEFAULT 'IN_SCOPE', -- IN_SCOPE, OUT_OF_SCOPE
    
    -- Status Control
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, PAUSED, COMPLETED, CANCELED
    priority TEXT NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
    
    -- Time Control
    estimated_time_minutes INTEGER,
    spent_time_minutes INTEGER DEFAULT 0,
    
    -- Interruption Marker
    is_interruption BOOLEAN DEFAULT FALSE,
    interrupted_demand_id UUID REFERENCES public.kore_demands(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Time Logs (To track play/pause automatically)
CREATE TABLE IF NOT EXISTS public.kore_demand_time_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    demand_id UUID NOT NULL REFERENCES public.kore_demands(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER, -- Calculated on end
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) Policies
ALTER TABLE public.kore_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kore_company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kore_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kore_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kore_demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kore_demand_time_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own company users
CREATE POLICY "Users can view users in their companies" ON public.kore_company_users
    FOR SELECT USING (auth.uid() = user_id OR company_id IN (SELECT company_id FROM public.kore_company_users WHERE user_id = auth.uid()));

-- Allow users to see companies they belong to
CREATE POLICY "Users can view their companies" ON public.kore_companies
    FOR SELECT USING (id IN (SELECT company_id FROM public.kore_company_users WHERE user_id = auth.uid()));

-- Isolation logic for Demands
CREATE POLICY "Users can view demands of their company" ON public.kore_demands
    FOR SELECT USING (company_id IN (SELECT company_id FROM public.kore_company_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert demands to their company" ON public.kore_demands
    FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM public.kore_company_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can update demands of their company" ON public.kore_demands
    FOR UPDATE USING (company_id IN (SELECT company_id FROM public.kore_company_users WHERE user_id = auth.uid()));

-- (Assuming similar policies for Clients, Categories, and Time Logs)
CREATE POLICY "Users can view time logs of their company" ON public.kore_demand_time_logs
    FOR SELECT USING (demand_id IN (SELECT id FROM public.kore_demands WHERE company_id IN (SELECT company_id FROM public.kore_company_users WHERE user_id = auth.uid())));
