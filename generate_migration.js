const fs = require('fs');

const sqlContent = `-- Migração 00002: Tabelas base do KORE FLOW (Zustand -> Supabase)
-- Ignorando "Metas" conforme solicitado.

-- 1. Configurações de Usuário
CREATE TABLE IF NOT EXISTS public.kore_configuracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  foto TEXT,
  agencia TEXT,
  tema TEXT DEFAULT 'Original',
  notificacoes JSONB DEFAULT '{"atraso": true, "demandasExtras": true, "resumoSemanal": true, "atualizacoes": true}'::jsonb,
  ia JSONB DEFAULT '{"chaveApi": "", "tom": "Profissional e direto"}'::jsonb,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- 2. Execuções (Tarefas Ativas)
CREATE TABLE IF NOT EXISTS public.kore_execucoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  categoria TEXT,
  entrega DATE,
  prioridade TEXT,
  status TEXT DEFAULT 'Aguardando',
  progresso INTEGER DEFAULT 0,
  tipo_planejamento TEXT DEFAULT 'Previsto',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Projetos
CREATE TABLE IF NOT EXISTS public.kore_projetos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cliente TEXT NOT NULL,
  inicio DATE,
  fim DATE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Campanhas (Filhas de Projetos)
CREATE TABLE IF NOT EXISTS public.kore_campanhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  projeto_id UUID NOT NULL REFERENCES public.kore_projetos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'Planejamento',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Posts (Filhos de Campanhas)
CREATE TABLE IF NOT EXISTS public.kore_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campanha_id UUID NOT NULL REFERENCES public.kore_campanhas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT,
  status TEXT DEFAULT 'Ideia',
  link TEXT,
  imagem_url TEXT,
  observacao TEXT,
  data DATE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Inspirações (Filhas de Projetos)
CREATE TABLE IF NOT EXISTS public.kore_inspiracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  projeto_id UUID NOT NULL REFERENCES public.kore_projetos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  url TEXT,
  nota TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Planejamentos (Grade Editorial Mensal flexível via JSON)
CREATE TABLE IF NOT EXISTS public.kore_planejamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  meses_ativos JSONB DEFAULT '[]'::jsonb,
  clientes JSONB DEFAULT '[]'::jsonb,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Eventos (Calendário e Alarmes)
CREATE TABLE IF NOT EXISTS public.kore_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  data TIMESTAMP WITH TIME ZONE NOT NULL,
  alarme BOOLEAN DEFAULT false,
  notificacao BOOLEAN DEFAULT false,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CONFIGURAÇÃO DE SEGURANÇA (RLS)
ALTER TABLE public.kore_configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kore_execucoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kore_projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kore_campanhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kore_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kore_inspiracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kore_planejamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kore_eventos ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: Apenas o dono pode ver, criar, editar e excluir
CREATE POLICY "user_configuracoes_all" ON public.kore_configuracoes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_execucoes_all" ON public.kore_execucoes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_projetos_all" ON public.kore_projetos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_campanhas_all" ON public.kore_campanhas FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_posts_all" ON public.kore_posts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_inspiracoes_all" ON public.kore_inspiracoes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_planejamentos_all" ON public.kore_planejamentos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_eventos_all" ON public.kore_eventos FOR ALL USING (auth.uid() = user_id);
`;

fs.writeFileSync('supabase/migrations/00002_koreflow_schema.sql', sqlContent, 'utf8');
console.log('Migration generated successfully.');
