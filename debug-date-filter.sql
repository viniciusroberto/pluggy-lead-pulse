-- Script para debugar o filtro de datas
-- Verificar dados na tabela controle_leads

-- 1. Verificar estrutura da tabela e dados
SELECT 
  id,
  nome,
  telefone,
  data_criacao,
  timestamp,
  created_at,
  updated_at
FROM controle_leads 
ORDER BY data_criacao DESC
LIMIT 10;

-- 2. Verificar se há dados entre 13/09/2025 e 14/09/2025
SELECT 
  COUNT(*) as total_registros,
  MIN(data_criacao) as data_mais_antiga,
  MAX(data_criacao) as data_mais_recente
FROM controle_leads 
WHERE data_criacao >= '2025-09-13T00:00:00.000Z' 
  AND data_criacao <= '2025-09-14T23:59:59.999Z';

-- 3. Verificar dados específicos do período
SELECT 
  id,
  nome,
  telefone,
  data_criacao,
  DATE(data_criacao) as data_sem_hora
FROM controle_leads 
WHERE data_criacao >= '2025-09-13T00:00:00.000Z' 
  AND data_criacao <= '2025-09-14T23:59:59.999Z'
ORDER BY data_criacao;

-- 4. Verificar formato das datas
SELECT 
  data_criacao,
  EXTRACT(YEAR FROM data_criacao) as ano,
  EXTRACT(MONTH FROM data_criacao) as mes,
  EXTRACT(DAY FROM data_criacao) as dia,
  EXTRACT(HOUR FROM data_criacao) as hora
FROM controle_leads 
WHERE data_criacao IS NOT NULL
ORDER BY data_criacao DESC
LIMIT 5;

-- 5. Testar diferentes formatos de data
SELECT 
  COUNT(*) as registros_13_set,
  '2025-09-13' as data_teste
FROM controle_leads 
WHERE DATE(data_criacao) = '2025-09-13';

SELECT 
  COUNT(*) as registros_14_set,
  '2025-09-14' as data_teste
FROM controle_leads 
WHERE DATE(data_criacao) = '2025-09-14';
