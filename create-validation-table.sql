-- =====================================================
-- SCRIPT PARA CRIAR TABELA DE VALIDAÇÃO DE CONVERSAS
-- =====================================================

-- 1. Criar tabela de validação de conversas
CREATE TABLE IF NOT EXISTS public.conversa_validacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telefone BIGINT NOT NULL,
  validada BOOLEAN NOT NULL DEFAULT false,
  observacoes TEXT,
  validado_por UUID REFERENCES auth.users(id),
  validado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Criar índice para busca rápida por telefone
CREATE INDEX IF NOT EXISTS idx_conversa_validacao_telefone ON public.conversa_validacao(telefone);

-- 3. Habilitar RLS
ALTER TABLE public.conversa_validacao ENABLE ROW LEVEL SECURITY;

-- 4. Criar política para usuários autenticados
CREATE POLICY "Allow all access to conversa_validacao" ON public.conversa_validacao
FOR ALL USING (auth.role() = 'authenticated');

-- 5. Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_conversa_validacao_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger para updated_at
CREATE TRIGGER update_conversa_validacao_updated_at
  BEFORE UPDATE ON public.conversa_validacao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversa_validacao_updated_at();

-- 7. Verificar se a tabela foi criada
SELECT 
  'TABELA CRIADA' as status,
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'conversa_validacao';

-- 8. Verificar estrutura da tabela
SELECT 
  'ESTRUTURA DA TABELA' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'conversa_validacao'
ORDER BY ordinal_position;
