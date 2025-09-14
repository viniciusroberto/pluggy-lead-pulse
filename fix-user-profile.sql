-- Script para corrigir o perfil do usuário viniciusrobertoreis@gmail.com
-- Execute este script no SQL Editor do Supabase Dashboard

-- Primeiro, vamos verificar se o usuário existe na tabela auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'viniciusrobertoreis@gmail.com';

-- Se o usuário existir, vamos inserir o perfil na tabela usuarios_dashboard
-- Substitua 'USER_ID_AQUI' pelo ID retornado na consulta acima
INSERT INTO public.usuarios_dashboard (user_id, nome, email, role, is_active)
VALUES (
  'USER_ID_AQUI', -- Substitua pelo ID real do usuário
  'Vinicius Roberto Reis', -- Nome do usuário
  'viniciusrobertoreis@gmail.com',
  'admin', -- Role como admin
  true -- Ativo
)
ON CONFLICT (user_id) DO UPDATE SET
  nome = EXCLUDED.nome,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Verificar se o perfil foi criado/atualizado
SELECT * FROM public.usuarios_dashboard 
WHERE email = 'viniciusrobertoreis@gmail.com';
