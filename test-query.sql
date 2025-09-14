-- =====================================================
-- TESTE DA CONSULTA QUE O DASHBOARD FAZ
-- =====================================================

-- 1. Consulta simples (sem filtros) - igual ao dashboard
SELECT 
  'CONSULTA SIMPLES' as status,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE origem IS NOT NULL AND email IS NOT NULL AND atividade IS NOT NULL AND solucao IS NOT NULL AND tamanho IS NOT NULL) as qualified_leads,
  COUNT(*) FILTER (WHERE followup_status = 1) as pending_followups,
  COUNT(*) FILTER (WHERE criado_no_hubspot = true) as hubspot_created
FROM public.controle_leads;

-- 2. Ver todos os registros
SELECT 
  'TODOS OS REGISTROS' as status,
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
  criado_no_hubspot,
  ultimo_tipo_msg
FROM public.controle_leads
ORDER BY id DESC;

-- 3. Verificar se há problemas com data_criacao
SELECT 
  'PROBLEMAS COM DATA' as status,
  COUNT(*) as total,
  COUNT(data_criacao) as com_data,
  COUNT(*) - COUNT(data_criacao) as sem_data
FROM public.controle_leads;

-- 4. Verificar valores nulos nos campos importantes
SELECT 
  'CAMPOS NULOS' as status,
  COUNT(*) as total,
  COUNT(origem) as com_origem,
  COUNT(email) as com_email,
  COUNT(atividade) as com_atividade,
  COUNT(solucao) as com_solucao,
  COUNT(tamanho) as com_tamanho
FROM public.controle_leads;
