-- =====================================================
-- SCRIPT PARA LIBERAR ACESSO À TABELA CHAT_PLUGGY
-- =====================================================

-- 1. Verificar se a tabela existe
SELECT 
  'TABELA EXISTE' as status,
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'chat_pluggy';

-- 2. Verificar políticas RLS atuais
SELECT 
  'POLÍTICAS RLS ATUAIS' as status,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'chat_pluggy';

-- 3. Verificar se RLS está habilitado
SELECT 
  'RLS STATUS' as status,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'chat_pluggy';

-- 4. Contar registros na tabela
SELECT 
  'TOTAL DE REGISTROS' as status,
  COUNT(*) as total_messages
FROM public.chat_pluggy;

-- 5. Ver alguns registros de exemplo
SELECT 
  'REGISTROS DE EXEMPLO' as status,
  id,
  nome,
  telefone,
  mensagem,
  tipo_msg,
  created_at
FROM public.chat_pluggy
LIMIT 5;

-- 6. Desabilitar RLS temporariamente para teste
ALTER TABLE public.chat_pluggy DISABLE ROW LEVEL SECURITY;

-- 7. Criar política permissiva para usuários autenticados
CREATE POLICY "Allow all access to chat_pluggy" ON public.chat_pluggy
FOR ALL USING (auth.role() = 'authenticated');

-- 8. Habilitar RLS novamente
ALTER TABLE public.chat_pluggy ENABLE ROW LEVEL SECURITY;

-- 9. Verificar se a política foi criada
SELECT 
  'POLÍTICA CRIADA' as status,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'chat_pluggy';

-- 10. Testar consulta
SELECT 
  'TESTE DE CONSULTA' as status,
  COUNT(*) as total_messages
FROM public.chat_pluggy
WHERE telefone IS NOT NULL;
