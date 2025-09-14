-- =====================================================
-- SCRIPT PARA LIMPAR VALIDAÇÕES DUPLICADAS
-- =====================================================

-- 1. Verificar se há registros duplicados
SELECT 
  'REGISTROS DUPLICADOS' as status,
  telefone,
  COUNT(*) as total_registros
FROM public.conversa_validacao
GROUP BY telefone
HAVING COUNT(*) > 1
ORDER BY total_registros DESC;

-- 2. Ver todos os registros atuais
SELECT 
  'TODOS OS REGISTROS' as status,
  id,
  telefone,
  validada,
  observacoes,
  validado_por,
  validado_em,
  created_at
FROM public.conversa_validacao
ORDER BY telefone, created_at;

-- 3. Manter apenas o registro mais recente de cada telefone
WITH ranked_validations AS (
  SELECT *,
    ROW_NUMBER() OVER (PARTITION BY telefone ORDER BY created_at DESC) as rn
  FROM public.conversa_validacao
)
DELETE FROM public.conversa_validacao
WHERE id IN (
  SELECT id 
  FROM ranked_validations 
  WHERE rn > 1
);

-- 4. Verificar se a limpeza funcionou
SELECT 
  'APÓS LIMPEZA' as status,
  telefone,
  COUNT(*) as total_registros
FROM public.conversa_validacao
GROUP BY telefone
HAVING COUNT(*) > 1;

-- 5. Ver registros finais
SELECT 
  'REGISTROS FINAIS' as status,
  id,
  telefone,
  validada,
  observacoes,
  validado_por,
  validado_em,
  created_at
FROM public.conversa_validacao
ORDER BY telefone, created_at;
