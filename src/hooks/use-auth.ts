import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Interface simplificada para o perfil do usuário
interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Função para carregar o perfil do usuário
  const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        // Se não encontrou perfil, retornar null (não tentar criar automaticamente)
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  };

  // Função para criar um perfil básico
  const createBasicProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      // Obter dados do usuário autenticado
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) return null;

      const { data, error } = await supabase
        .from('users')
        .insert({
          user_id: userId,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário',
          role: 'user',
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating basic profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error creating basic profile:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setError(null);
        setLoading(true);
        
        // Obter sessão atual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError);
          setError(`Erro de sessão: ${sessionError.message}`);
        } else {
          console.log('Sessão obtida:', session?.user?.id || 'Nenhum usuário');
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            // Carregar perfil de forma assíncrona, sem bloquear
            loadUserProfile(session.user.id).then(profileData => {
              if (mounted) {
                setProfile(profileData);
              }
            }).catch(error => {
              console.warn('Erro ao carregar perfil:', error);
              if (mounted) {
                setProfile(null);
              }
            });
          } else {
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Erro desconhecido');
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    // Inicializar imediatamente
    initializeAuth();

    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        setError(null);

        if (session?.user) {
          // Carregar perfil de forma assíncrona
          loadUserProfile(session.user.id).then(profileData => {
            if (mounted) {
              setProfile(profileData);
            }
          }).catch(error => {
            console.warn('Erro ao carregar perfil no listener:', error);
            if (mounted) {
              setProfile(null);
            }
          });
        } else {
          setProfile(null);
        }
        
        if (mounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Função para fazer logout
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
    return { error };
  };

  // Verificar se o usuário é admin
  const isAdmin = (): boolean => {
    return profile?.role === 'admin' && profile?.is_active === true;
  };

  // Verificar se o usuário está ativo
  const isActive = (): boolean => {
    return profile?.is_active === true;
  };

  // Recarregar perfil do usuário
  const refreshProfile = async (): Promise<void> => {
    if (user) {
      const profileData = await loadUserProfile(user.id);
      setProfile(profileData);
    }
  };

  // Verificar se o usuário está autenticado
  const isAuthenticated = (): boolean => {
    // Se tem usuário autenticado, considerar autenticado mesmo sem perfil
    // O perfil pode ser criado posteriormente
    return !!user;
  };

  return {
    user,
    session,
    profile,
    loading,
    error,
    retryCount: 0, // Mantido para compatibilidade
    isInitialized,
    signOut,
    isAdmin,
    isActive,
    isAuthenticated,
    refreshProfile,
    retry: () => {
      setError(null);
      setLoading(true);
      setIsInitialized(false);
      // Trigger re-initialization
      if (user) {
        loadUserProfile(user.id).then(setProfile).finally(() => {
          setLoading(false);
          setIsInitialized(true);
        });
      }
    }
  };
};