-- =====================================================
-- SCRIPT SIMPLES - APENAS CRIAR E INSERIR
-- =====================================================

-- 1. Criar tabela users (se não existir)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Desabilitar RLS temporariamente
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 3. Inserir usuário admin
INSERT INTO public.users (user_id, email, name, role, is_active)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@pluggy.com'),
  'admin@pluggy.com',
  'Administrador',
  'admin',
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  name = 'Administrador',
  role = 'admin',
  is_active = true,
  updated_at = now();

-- 4. Verificar se foi inserido
SELECT 'USUÁRIO CRIADO:' as status, * FROM public.users WHERE email = 'admin@pluggy.com';
