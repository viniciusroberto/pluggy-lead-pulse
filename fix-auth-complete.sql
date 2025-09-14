-- =====================================================
-- SCRIPT COMPLETO PARA CORRIGIR AUTENTICAÇÃO
-- =====================================================

-- PASSO 1: Limpar tudo e começar do zero
-- =====================================================

-- Remover tudo relacionado à autenticação antiga
DROP TABLE IF EXISTS public.usuarios_dashboard CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Remover funções antigas
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.is_user_active(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.update_last_login(uuid) CASCADE;

-- Remover triggers antigos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_usuarios_dashboard_updated_at ON public.usuarios_dashboard;

-- PASSO 2: Criar nova estrutura
-- =====================================================

-- Criar tabela users
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- PASSO 3: Configurar RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seu próprio perfil
CREATE POLICY "users_select_own" 
ON public.users 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para usuários atualizarem apenas seu próprio perfil
CREATE POLICY "users_update_own" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Política para admins verem todos os usuários
CREATE POLICY "admins_select_all" 
ON public.users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  )
);

-- Política para admins inserirem usuários
CREATE POLICY "admins_insert_users" 
ON public.users 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  )
);

-- Política para admins atualizarem qualquer usuário
CREATE POLICY "admins_update_all" 
ON public.users 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  )
);

-- PASSO 4: Criar funções auxiliares
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (user_id, email, name, role)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    'user'
  );
  RETURN NEW;
END;
$$;

-- PASSO 5: Criar triggers
-- =====================================================

-- Trigger para atualizar updated_at
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para criar perfil automaticamente após signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PASSO 6: Inserir usuário admin (TEMPORARIAMENTE DESABILITAR RLS)
-- =====================================================

-- Desabilitar RLS temporariamente para inserir o admin
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Inserir usuário admin
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

-- Reabilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- PASSO 7: Verificar se tudo foi criado corretamente
-- =====================================================

-- Verificar se o usuário admin foi criado
SELECT 
  'USUÁRIO ADMIN CRIADO' as status,
  id,
  email,
  name,
  role,
  is_active,
  created_at
FROM public.users 
WHERE email = 'admin@pluggy.com';

-- Verificar políticas RLS
SELECT 
  'POLÍTICAS RLS ATIVAS' as status,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'users';

-- Verificar triggers
SELECT 
  'TRIGGERS ATIVOS' as status,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'users';
