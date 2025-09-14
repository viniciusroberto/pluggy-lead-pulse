-- =====================================================
-- TESTE DO CÁLCULO DE TEMPO MÉDIO DE QUALIFICAÇÃO
-- =====================================================

-- 1. Verificar leads qualificados com dados de tempo
SELECT 
  'LEADS QUALIFICADOS COM TEMPO' as status,
  COUNT(*) as total_qualified_with_time
FROM public.controle_leads
WHERE criado_no_hubspot = true 
  AND data_criacao IS NOT NULL 
  AND timestamp IS NOT NULL;

-- 2. Ver detalhes dos leads qualificados
SELECT 
  'DETALHES LEADS QUALIFICADOS' as status,
  id,
  nome,
  data_criacao,
  timestamp,
  EXTRACT(EPOCH FROM (timestamp::timestamp - data_criacao::timestamp)) / 60 as tempo_minutos
FROM public.controle_leads
WHERE criado_no_hubspot = true 
  AND data_criacao IS NOT NULL 
  AND timestamp IS NOT NULL
ORDER BY id;

-- 3. Calcular tempo médio de qualificação
SELECT 
  'TEMPO MÉDIO DE QUALIFICAÇÃO' as status,
  COUNT(*) as total_leads,
  ROUND(AVG(EXTRACT(EPOCH FROM (timestamp::timestamp - data_criacao::timestamp)) / 60)) as tempo_medio_minutos,
  ROUND(AVG(EXTRACT(EPOCH FROM (timestamp::timestamp - data_criacao::timestamp)) / 3600), 2) as tempo_medio_horas
FROM public.controle_leads
WHERE criado_no_hubspot = true 
  AND data_criacao IS NOT NULL 
  AND timestamp IS NOT NULL;

-- 4. Verificar se há leads com tempo negativo (timestamp anterior à data_criacao)
SELECT 
  'LEADS COM TEMPO NEGATIVO' as status,
  COUNT(*) as leads_tempo_negativo
FROM public.controle_leads
WHERE criado_no_hubspot = true 
  AND data_criacao IS NOT NULL 
  AND timestamp IS NOT NULL
  AND timestamp::timestamp < data_criacao::timestamp;

-- 5. Verificar leads qualificados sem timestamp
SELECT 
  'LEADS QUALIFICADOS SEM TIMESTAMP' as status,
  COUNT(*) as leads_sem_timestamp
FROM public.controle_leads
WHERE criado_no_hubspot = true 
  AND (timestamp IS NULL OR timestamp = '');

-- 6. Verificar leads qualificados sem data_criacao
SELECT 
  'LEADS QUALIFICADOS SEM DATA_CRIACAO' as status,
  COUNT(*) as leads_sem_data_criacao
FROM public.controle_leads
WHERE criado_no_hubspot = true 
  AND (data_criacao IS NULL OR data_criacao = '');

-- 7. Estatísticas por faixa de tempo
SELECT 
  'ESTATÍSTICAS POR FAIXA DE TEMPO' as status,
  CASE 
    WHEN EXTRACT(EPOCH FROM (timestamp::timestamp - data_criacao::timestamp)) / 60 <= 30 THEN '0-30 min'
    WHEN EXTRACT(EPOCH FROM (timestamp::timestamp - data_criacao::timestamp)) / 60 <= 60 THEN '30-60 min'
    WHEN EXTRACT(EPOCH FROM (timestamp::timestamp - data_criacao::timestamp)) / 60 <= 120 THEN '1-2 horas'
    WHEN EXTRACT(EPOCH FROM (timestamp::timestamp - data_criacao::timestamp)) / 60 <= 480 THEN '2-8 horas'
    ELSE 'Mais de 8 horas'
  END as faixa_tempo,
  COUNT(*) as quantidade
FROM public.controle_leads
WHERE criado_no_hubspot = true 
  AND data_criacao IS NOT NULL 
  AND timestamp IS NOT NULL
GROUP BY 
  CASE 
    WHEN EXTRACT(EPOCH FROM (timestamp::timestamp - data_criacao::timestamp)) / 60 <= 30 THEN '0-30 min'
    WHEN EXTRACT(EPOCH FROM (timestamp::timestamp - data_criacao::timestamp)) / 60 <= 60 THEN '30-60 min'
    WHEN EXTRACT(EPOCH FROM (timestamp::timestamp - data_criacao::timestamp)) / 60 <= 120 THEN '1-2 horas'
    WHEN EXTRACT(EPOCH FROM (timestamp::timestamp - data_criacao::timestamp)) / 60 <= 480 THEN '2-8 horas'
    ELSE 'Mais de 8 horas'
  END
ORDER BY quantidade DESC;
