-- =====================================================
-- SCRIPT PARA DEBUGAR O DASHBOARD
-- =====================================================

-- 1. Verificar se há registros na tabela
SELECT 
  'VERIFICAÇÃO INICIAL' as status,
  COUNT(*) as total_registros
FROM public.controle_leads;

-- 2. Consulta exata que o dashboard faz (sem filtros)
SELECT 
  'CONSULTA DASHBOARD' as status,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE origem IS NOT NULL AND email IS NOT NULL AND atividade IS NOT NULL AND solucao IS NOT NULL AND tamanho IS NOT NULL) as qualified_leads,
  COUNT(*) FILTER (WHERE followup_status = 1) as pending_followups,
  COUNT(*) FILTER (WHERE criado_no_hubspot = true) as hubspot_created
FROM public.controle_leads;

-- 3. Verificar se há problemas com data_criacao (filtro padrão)
SELECT 
  'PROBLEMA COM DATA' as status,
  COUNT(*) as total,
  COUNT(data_criacao) as com_data,
  MIN(data_criacao) as data_mais_antiga,
  MAX(data_criacao) as data_mais_recente
FROM public.controle_leads;

-- 4. Verificar se há RLS bloqueando
SELECT 
  'VERIFICAR RLS' as status,
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename = 'controle_leads';

-- 5. Teste de inserção de um registro de exemplo
INSERT INTO public.controle_leads (
  nome,
  telefone,
  email,
  data_criacao,
  origem,
  atividade,
  solucao,
  tamanho,
  followup_status,
  criado_no_hubspot,
  ultimo_tipo_msg
) VALUES (
  'Teste Dashboard',
  11999999999,
  'teste@exemplo.com',
  NOW(),
  'Website',
  'Consultoria',
  'Sistema ERP',
  'Pequena',
  0,
  false,
  'ia'
) ON CONFLICT DO NOTHING;

-- 6. Verificar se o registro foi inserido
SELECT 
  'REGISTRO INSERIDO' as status,
  COUNT(*) as total_apos_insercao
FROM public.controle_leads;
