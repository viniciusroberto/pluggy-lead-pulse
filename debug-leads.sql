-- =====================================================
-- SCRIPT PARA DEBUGAR A TABELA CONTROLE_LEADS
-- =====================================================

-- 1. Verificar se a tabela existe
SELECT 
  'TABELA EXISTE' as status,
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'controle_leads';

-- 2. Contar total de registros
SELECT 
  'TOTAL DE REGISTROS' as status,
  COUNT(*) as total_leads
FROM public.controle_leads;

-- 3. Ver alguns registros de exemplo
SELECT 
  'REGISTROS DE EXEMPLO' as status,
  id,
  nome,
  email,
  telefone,
  data_criacao,
  origem,
  atividade,
  solucao,
  tamanho,
  followup_status,
  criado_no_hubspot
FROM public.controle_leads
LIMIT 5;

-- 4. Verificar estrutura da tabela
SELECT 
  'ESTRUTURA DA TABELA' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'controle_leads'
ORDER BY ordinal_position;
