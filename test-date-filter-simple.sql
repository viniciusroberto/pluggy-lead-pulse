-- Teste simples do filtro de datas
-- Execute este script no Supabase SQL Editor

-- 1. Verificar todos os registros
SELECT 
  id,
  nome,
  telefone,
  data_criacao,
  DATE(data_criacao) as data_sem_hora
FROM controle_leads 
ORDER BY data_criacao DESC;

-- 2. Testar filtro específico para 13/09/2025
SELECT 
  COUNT(*) as total_13_set,
  '2025-09-13' as data_teste
FROM controle_leads 
WHERE data_criacao >= '2025-09-13T00:00:00.000Z' 
  AND data_criacao <= '2025-09-13T23:59:59.999Z';

-- 3. Testar filtro específico para 14/09/2025  
SELECT 
  COUNT(*) as total_14_set,
  '2025-09-14' as data_teste
FROM controle_leads 
WHERE data_criacao >= '2025-09-14T00:00:00.000Z' 
  AND data_criacao <= '2025-09-14T23:59:59.999Z';

-- 4. Testar filtro de range 13-14/09/2025
SELECT 
  COUNT(*) as total_range,
  '2025-09-13 a 2025-09-14' as periodo_teste
FROM controle_leads 
WHERE data_criacao >= '2025-09-13T00:00:00.000Z' 
  AND data_criacao <= '2025-09-14T23:59:59.999Z';

-- 5. Verificar se há dados usando DATE() function
SELECT 
  COUNT(*) as total_date_function,
  'DATE function test' as metodo
FROM controle_leads 
WHERE DATE(data_criacao) BETWEEN '2025-09-13' AND '2025-09-14';
