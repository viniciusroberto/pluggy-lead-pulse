-- Script simples para corrigir o perfil do usuário
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Primeiro, encontre o ID do usuário
SELECT id, email FROM auth.users WHERE email = 'viniciusrobertoreis@gmail.com';

-- 2. Depois execute este INSERT (substitua o UUID pelo ID retornado acima)
INSERT INTO public.usuarios_dashboard (user_id, nome, email, role, is_active)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'viniciusrobertoreis@gmail.com'),
  'Vinicius Roberto Reis',
  'viniciusrobertoreis@gmail.com',
  'admin',
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  nome = EXCLUDED.nome,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = now();
