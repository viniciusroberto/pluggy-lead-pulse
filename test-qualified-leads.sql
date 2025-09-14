-- =====================================================
-- TESTE DA NOVA LÓGICA DE LEADS QUALIFICADOS
-- =====================================================

-- 1. Verificar total de leads
SELECT 
  'TOTAL DE LEADS' as status,
  COUNT(*) as total
FROM public.controle_leads;

-- 2. Verificar leads qualificados (criado_no_hubspot = true)
SELECT 
  'LEADS QUALIFICADOS' as status,
  COUNT(*) as qualified_leads
FROM public.controle_leads
WHERE criado_no_hubspot = true;

-- 3. Verificar leads não qualificados (criado_no_hubspot = false ou null)
SELECT 
  'LEADS NÃO QUALIFICADOS' as status,
  COUNT(*) as not_qualified_leads
FROM public.controle_leads
WHERE criado_no_hubspot = false OR criado_no_hubspot IS NULL;

-- 4. Ver detalhes dos leads qualificados
SELECT 
  'DETALHES LEADS QUALIFICADOS' as status,
  id,
  nome,
  email,
  criado_no_hubspot,
  data_criacao
FROM public.controle_leads
WHERE criado_no_hubspot = true;

-- 5. Ver todos os leads com status do hubspot
SELECT 
  'TODOS OS LEADS COM STATUS HUBSPOT' as status,
  id,
  nome,
  email,
  criado_no_hubspot,
  data_criacao
FROM public.controle_leads
ORDER BY id DESC;

-- 6. Atualizar um lead para ser qualificado (teste)
UPDATE public.controle_leads 
SET criado_no_hubspot = true 
WHERE id = 151;

-- 7. Verificar se foi atualizado
SELECT 
  'LEAD ATUALIZADO' as status,
  id,
  nome,
  email,
  criado_no_hubspot
FROM public.controle_leads
WHERE id = 151;
