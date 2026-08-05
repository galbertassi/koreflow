-- Migration: 00011_sprint_2_time_tracking.sql
-- Description: Transforma o fluxo de Demandas em Supabase-First, implementa Time Tracking transacional e configura Realtime

-- 1. Alterar de minutos para segundos
ALTER TABLE public.kore_demands RENAME COLUMN spent_time_minutes TO spent_time_seconds;
UPDATE public.kore_demands SET spent_time_seconds = spent_time_seconds * 60 WHERE spent_time_seconds > 0;

ALTER TABLE public.kore_demand_time_logs DROP COLUMN IF EXISTS duration_minutes;

-- 2. Garantir apenas um timer ativo por usuário
DROP INDEX IF EXISTS one_active_timer_per_user;
CREATE UNIQUE INDEX one_active_timer_per_user 
ON public.kore_demand_time_logs (user_id) 
WHERE ended_at IS NULL;

-- 3. Habilitar Realtime para as tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE kore_demands;
ALTER PUBLICATION supabase_realtime ADD TABLE kore_demand_time_logs;

-- 4. Criar RPCs Transacionais
-- O uso de SECURITY DEFINER é necessário para garantir que o cliente (frontend) 
-- só consiga alterar logs de tempo através dessas funções estritas, 
-- já que não daremos GRANT explícito de UPDATE na tabela de logs diretamente.

-- Função Auxiliar para garantir acesso
CREATE OR REPLACE FUNCTION public.check_user_demand_access(p_user_id UUID, p_demand_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_company_id UUID;
BEGIN
    SELECT company_id INTO v_company_id FROM public.kore_demands WHERE id = p_demand_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Demand not found';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.kore_company_users 
        WHERE user_id = p_user_id AND company_id = v_company_id
    ) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    RETURN v_company_id;
END;
$$;

-- PLAY DEMAND
CREATE OR REPLACE FUNCTION public.play_demand(p_demand_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_company_id UUID;
    v_active_log RECORD;
    v_elapsed_seconds INTEGER;
    v_demand_status TEXT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Validar acesso (não faz LOCK ainda)
    v_company_id := public.check_user_demand_access(v_user_id, p_demand_id);

    -- Lock the demand to check access and prevent concurrent updates to this demand
    SELECT status INTO v_demand_status
    FROM public.kore_demands
    WHERE id = p_demand_id FOR UPDATE;

    IF v_demand_status = 'COMPLETED' THEN
        RAISE EXCEPTION 'Cannot play a completed demand';
    END IF;

    -- Check for an active timer for this user and lock it
    SELECT * INTO v_active_log
    FROM public.kore_demand_time_logs
    WHERE user_id = v_user_id AND ended_at IS NULL
    FOR UPDATE;

    IF FOUND THEN
        -- If it's the exact same demand, do nothing and return
        IF v_active_log.demand_id = p_demand_id THEN
            RETURN;
        END IF;

        -- Close the active timer
        v_elapsed_seconds := EXTRACT(EPOCH FROM (now() - v_active_log.started_at))::INTEGER;
        
        UPDATE public.kore_demand_time_logs
        SET ended_at = now()
        WHERE id = v_active_log.id;

        -- Add time to the interrupted demand and set to PAUSED
        -- Fazemos um lock na demanda interrompida também
        UPDATE public.kore_demands
        SET spent_time_seconds = COALESCE(spent_time_seconds, 0) + v_elapsed_seconds,
            status = 'PAUSED',
            updated_at = now()
        WHERE id = v_active_log.demand_id;
    END IF;

    -- Start new timer
    INSERT INTO public.kore_demand_time_logs (demand_id, user_id, started_at)
    VALUES (p_demand_id, v_user_id, now());

    -- Update current demand status
    UPDATE public.kore_demands
    SET status = 'IN_PROGRESS',
        updated_at = now()
    WHERE id = p_demand_id;

END;
$$;

-- PAUSE DEMAND
CREATE OR REPLACE FUNCTION public.pause_demand(p_demand_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_active_log RECORD;
    v_elapsed_seconds INTEGER;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Validar acesso
    PERFORM public.check_user_demand_access(v_user_id, p_demand_id);

    -- Check for an active timer for this user ON THIS DEMAND and lock it
    SELECT * INTO v_active_log
    FROM public.kore_demand_time_logs
    WHERE user_id = v_user_id AND demand_id = p_demand_id AND ended_at IS NULL
    FOR UPDATE;

    IF NOT FOUND THEN
        -- Se não tiver timer ativo, apenas muda o status para PAUSED caso estivesse diferente
        UPDATE public.kore_demands SET status = 'PAUSED', updated_at = now() WHERE id = p_demand_id;
        RETURN;
    END IF;

    -- Close the active timer
    v_elapsed_seconds := EXTRACT(EPOCH FROM (now() - v_active_log.started_at))::INTEGER;
    
    UPDATE public.kore_demand_time_logs
    SET ended_at = now()
    WHERE id = v_active_log.id;

    -- Add time to the demand and set to PAUSED
    UPDATE public.kore_demands
    SET spent_time_seconds = COALESCE(spent_time_seconds, 0) + v_elapsed_seconds,
        status = 'PAUSED',
        updated_at = now()
    WHERE id = p_demand_id;

END;
$$;

-- COMPLETE DEMAND
CREATE OR REPLACE FUNCTION public.complete_demand(p_demand_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_active_log RECORD;
    v_elapsed_seconds INTEGER;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Validar acesso
    PERFORM public.check_user_demand_access(v_user_id, p_demand_id);

    -- Fechar timer ativo deste usuário (se houver) para ESTA demanda
    SELECT * INTO v_active_log
    FROM public.kore_demand_time_logs
    WHERE user_id = v_user_id AND demand_id = p_demand_id AND ended_at IS NULL
    FOR UPDATE;

    IF FOUND THEN
        v_elapsed_seconds := EXTRACT(EPOCH FROM (now() - v_active_log.started_at))::INTEGER;
        
        UPDATE public.kore_demand_time_logs
        SET ended_at = now()
        WHERE id = v_active_log.id;

        UPDATE public.kore_demands
        SET spent_time_seconds = COALESCE(spent_time_seconds, 0) + v_elapsed_seconds
        WHERE id = p_demand_id;
    END IF;

    -- Muda status para COMPLETED e seta a data de conclusão
    UPDATE public.kore_demands
    SET status = 'COMPLETED',
        completed_at = now(),
        updated_at = now()
    WHERE id = p_demand_id;

END;
$$;
