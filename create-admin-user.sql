-- =====================================================
-- SCRIPT: Criar Usuário Admin Inicial
-- =====================================================
-- Execute este script no SQL Editor do Supabase Dashboard
-- APÓS executar a migração de recriação do sistema de auth

-- 1. Primeiro, verifique se o usuário admin existe no Supabase Auth
-- Vá para Authentication > Users no dashboard do Supabase
-- Se não existir, crie manualmente:
-- Email: admin@pluggy.com
-- Senha: admin1234

-- 2. Depois execute este script para criar o perfil na tabela users
INSERT INTO public.users (user_id, email, name, role, is_active)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@pluggy.com'),
  'admin@pluggy.com',
  'Administrador',
  'admin',
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- 3. Verificar se o usuário foi criado/atualizado
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.is_active,
  u.created_at
FROM public.users u
WHERE u.email = 'admin@pluggy.com';

-- 4. Para criar outros usuários (opcional)
-- Substitua os valores abaixo pelos dados do usuário desejado
/*
INSERT INTO public.users (user_id, email, name, role, is_active)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'usuario@exemplo.com'),
  'usuario@exemplo.com',
  'Nome do Usuário',
  'user',
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = now();
*/
