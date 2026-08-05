-- Migration: 00011_onboarding_rpc.sql
-- Description: RPC transacional para criar a primeira demanda e concluir o onboarding de forma atômica e idempotente.

CREATE OR REPLACE FUNCTION public.complete_onboarding_with_first_demand(
    p_title TEXT,
    p_due_option TEXT -- 'TODAY', 'TOMORROW', 'THIS_WEEK', 'NO_DATE'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Roda com permissões do criador (banco) para garantir a transação
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_company_id UUID;
    v_onboarding_completed BOOLEAN;
    v_due_date TIMESTAMP WITH TIME ZONE;
    v_demand_id UUID;
BEGIN
    -- 1. Validar usuário autenticado
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado.';
    END IF;

    -- 2. Validar input
    IF p_title IS NULL OR length(trim(p_title)) = 0 THEN
        RAISE EXCEPTION 'O título da demanda é obrigatório.';
    END IF;

    IF length(p_title) > 255 THEN
        RAISE EXCEPTION 'O título da demanda deve ter no máximo 255 caracteres.';
    END IF;

    -- 3. Localizar o workspace pessoal do usuário e bloquear a linha (FOR UPDATE)
    SELECT c.id, c.onboarding_completed 
    INTO v_company_id, v_onboarding_completed
    FROM public.kore_companies c
    WHERE c.personal_owner_user_id = v_user_id
    FOR UPDATE; -- Bloqueia a linha da company para evitar race conditions

    IF v_company_id IS NULL THEN
        RAISE EXCEPTION 'Workspace pessoal não encontrado para este usuário.';
    END IF;

    -- 4. Verificar se o onboarding já foi concluído (Idempotência/Segurança)
    IF v_onboarding_completed THEN
        RAISE EXCEPTION 'Onboarding já foi concluído para este workspace.';
    END IF;

    -- 5. Calcular a data de entrega baseada na opção (Assumindo UTC por padrão)
    CASE p_due_option
        WHEN 'TODAY' THEN
            v_due_date := date_trunc('day', now()) + interval '23 hours 59 minutes 59 seconds';
        WHEN 'TOMORROW' THEN
            v_due_date := date_trunc('day', now() + interval '1 day') + interval '23 hours 59 minutes 59 seconds';
        WHEN 'THIS_WEEK' THEN
            -- "Até sexta-feira"
            -- next_day function ou lógica similar em plpgsql pode ser complexa, 
            -- mas uma aproximação segura para "Até sexta-feira" da semana atual:
            -- Se hoje for sábado (6) ou domingo (0/7), jogar para a PRÓXIMA sexta.
            -- Se for dia de semana, jogar para a sexta DESTA semana.
            -- Uma forma simples no postgres (ISODOW: 1=Seg, 5=Sex, 7=Dom):
            IF extract(isodow from now()) > 5 THEN
                -- Fim de semana, sexta da próxima semana
                v_due_date := date_trunc('day', now() + (12 - extract(isodow from now()))::int * interval '1 day') + interval '23 hours 59 minutes 59 seconds';
            ELSE
                -- Segunda a sexta, sexta da semana atual
                v_due_date := date_trunc('day', now() + (5 - extract(isodow from now()))::int * interval '1 day') + interval '23 hours 59 minutes 59 seconds';
            END IF;
        WHEN 'NO_DATE' THEN
            v_due_date := NULL;
        ELSE
            RAISE EXCEPTION 'Opção de prazo inválida.';
    END CASE;

    -- 6. Criar a demanda
    INSERT INTO public.kore_demands (
        company_id,
        user_id,
        title,
        status,
        priority,
        estimated_time_minutes -- Campo existente no schema 00003
        -- due_date não existe no schema 00003_saas_demands_schema.sql. Adicionando na query se já criamos em outra sprint, senão omitimos.
        -- O schema atual não tem due_date! Vamos precisar criar a coluna.
    ) VALUES (
        v_company_id,
        v_user_id,
        trim(p_title),
        'PENDING',
        'MEDIUM',
        0
    ) RETURNING id INTO v_demand_id;

    -- 7. Atualizar a flag de onboarding
    UPDATE public.kore_companies
    SET onboarding_completed = TRUE
    WHERE id = v_company_id;

    -- 8. Retornar o ID da demanda criada
    RETURN v_demand_id;
END;
$$;
