-- Criar tabela de perfis de usuários
CREATE TABLE public.usuarios_dashboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS
ALTER TABLE public.usuarios_dashboard ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own profile" 
ON public.usuarios_dashboard 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.usuarios_dashboard 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_dashboard 
    WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
  )
);

CREATE POLICY "Admins can insert users" 
ON public.usuarios_dashboard 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios_dashboard 
    WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
  )
);

CREATE POLICY "Admins can update users" 
ON public.usuarios_dashboard 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_dashboard 
    WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
  )
);

CREATE POLICY "Users can update their own profile" 
ON public.usuarios_dashboard 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_usuarios_dashboard_updated_at
BEFORE UPDATE ON public.usuarios_dashboard
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios_dashboard (user_id, nome, email, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    'user'
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir usuário admin inicial (será criado quando fizer signup)
-- Este usuário precisa ser criado manualmente via Supabase Auth com email: admin@pluggy.com, senha: admin1234