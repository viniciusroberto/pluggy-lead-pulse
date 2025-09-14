-- =====================================================
-- MIGRAÇÃO: Recriar Sistema de Autenticação Simplificado
-- =====================================================

-- 1. REMOVER ESTRUTURA ANTIGA
-- =====================================================

-- Remover trigger e função antigos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Remover políticas RLS antigas
DROP POLICY IF EXISTS "Users can view their own profile" ON public.usuarios_dashboard;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.usuarios_dashboard;
DROP POLICY IF EXISTS "Admins can insert users" ON public.usuarios_dashboard;
DROP POLICY IF EXISTS "Admins can update users" ON public.usuarios_dashboard;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.usuarios_dashboard;

-- Remover trigger de updated_at
DROP TRIGGER IF EXISTS update_usuarios_dashboard_updated_at ON public.usuarios_dashboard;

-- Remover tabela antiga
DROP TABLE IF EXISTS public.usuarios_dashboard CASCADE;

-- Remover funções antigas
DROP FUNCTION IF EXISTS public.is_user_active(uuid);
DROP FUNCTION IF EXISTS public.update_last_login(uuid);

-- 2. CRIAR NOVA ESTRUTURA SIMPLIFICADA
-- =====================================================

-- Criar tabela de usuários simplificada
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

-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS RLS SIMPLIFICADAS
-- =====================================================

-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "users_select_own" 
ON public.users 
FOR SELECT 
USING (auth.uid() = user_id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "users_update_own" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admins podem ver todos os usuários
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

-- Admins podem inserir usuários
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

-- Admins podem atualizar qualquer usuário
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

-- 4. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para atualizar updated_at automaticamente
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

-- 5. TRIGGERS
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

-- 6. INSERIR USUÁRIO ADMIN INICIAL
-- =====================================================

-- Inserir usuário admin padrão (será criado quando fizer signup)
-- Email: admin@pluggy.com
-- Senha: admin1234
-- Este usuário precisa ser criado manualmente via Supabase Auth

-- 7. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.users IS 'Tabela de usuários do dashboard - versão simplificada';
COMMENT ON COLUMN public.users.user_id IS 'ID do usuário no Supabase Auth';
COMMENT ON COLUMN public.users.email IS 'Email do usuário (único)';
COMMENT ON COLUMN public.users.name IS 'Nome completo do usuário';
COMMENT ON COLUMN public.users.role IS 'Role do usuário: admin ou user';
COMMENT ON COLUMN public.users.is_active IS 'Se o usuário está ativo';
