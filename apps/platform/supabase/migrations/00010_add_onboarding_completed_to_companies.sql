-- Migration: 00010_add_onboarding_completed_to_companies.sql
-- Description: Adiciona a flag onboarding_completed à tabela kore_companies para gerenciar a primeira demanda.

ALTER TABLE public.kore_companies 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
