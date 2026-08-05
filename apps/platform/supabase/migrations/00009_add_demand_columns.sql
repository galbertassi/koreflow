-- Migration: 00009_add_demand_columns.sql
-- Description: Adiciona colunas de texto para cliente e categoria para compatibilidade com o frontend atual

ALTER TABLE public.kore_demands
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS category_name TEXT,
ADD COLUMN IF NOT EXISTS category_color TEXT;
