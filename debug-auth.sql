-- =====================================================
-- SCRIPT DE DEBUG - Verificar o que está acontecendo
-- =====================================================

-- 1. Verificar se a tabela users existe
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'usuarios_dashboard');

-- 2. Verificar se o usuário existe no auth.users
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
WHERE email = 'admin@pluggy.com';

-- 3. Verificar se existe perfil na tabela users (se existir)
SELECT 
  id,
  user_id,
  email,
  name,
  role,
  is_active,
  created_at
FROM public.users 
WHERE email = 'admin@pluggy.com';

-- 4. Verificar políticas RLS da tabela users (se existir)
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'users';
