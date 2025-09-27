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
  const [retryCount, setRetryCount] = useState(0);
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
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        setError(null);
        
        // Timeout de segurança para evitar loading infinito
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('Auth initialization timeout - forcing loading to false');
            setError('Timeout na inicialização da autenticação');
            setLoading(false);
            setIsInitialized(true);
          }
        }, 3000); // Reduzido para 3 segundos

        // Verificar se há problemas com localStorage
        try {
          const testKey = 'supabase-auth-test';
          localStorage.setItem(testKey, 'test');
          localStorage.removeItem(testKey);
        } catch (storageError) {
          console.warn('Problema com localStorage detectado:', storageError);
          setError('Problema com armazenamento local. Tente limpar os dados do navegador.');
          setLoading(false);
          return;
        }

        // Obter sessão atual com retry
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError);
          
          // Se for erro de sessão inválida, limpar localStorage
          if (sessionError.message.includes('Invalid') || sessionError.message.includes('expired')) {
            console.warn('Sessão inválida detectada, limpando localStorage...');
            try {
              const keys = Object.keys(localStorage);
              keys.filter(key => key.includes('supabase')).forEach(key => {
                localStorage.removeItem(key);
              });
            } catch (clearError) {
              console.warn('Erro ao limpar localStorage:', clearError);
            }
          }
          
          setError(`Erro de sessão: ${sessionError.message}`);
          setRetryCount(prev => prev + 1);
        } else {
          console.log('Sessão obtida com sucesso:', session?.user?.id);
          setSession(session);
          setUser(session?.user ?? null);
          setRetryCount(0); // Reset retry count on success

          if (session?.user) {
            // Verificar se o token não está expirado
            const now = Math.floor(Date.now() / 1000);
            if (session.expires_at && session.expires_at < now) {
              console.warn('Token expirado detectado, fazendo logout...');
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
              setProfile(null);
            } else {
              console.log('Carregando perfil para usuário:', session.user.id);
              // Tentar carregar perfil, mas não bloquear se falhar
              try {
                const profileData = await loadUserProfile(session.user.id);
                if (mounted) {
                  console.log('Perfil carregado:', profileData ? 'Sim' : 'Não');
                  setProfile(profileData);
                }
              } catch (profileError) {
                console.warn('Erro ao carregar perfil, continuando sem perfil:', profileError);
                if (mounted) {
                  setProfile(null);
                }
              }
            }
          } else {
            console.log('Nenhum usuário na sessão');
            setProfile(null);
          }
        }
        
        // Limpar timeout e definir loading como false
        clearTimeout(timeoutId);
        if (mounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Erro desconhecido');
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.id);
        
        // Ignorar eventos de inicialização para evitar conflitos
        if (event === 'INITIAL_SESSION') {
          console.log('Ignorando evento INITIAL_SESSION no listener');
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setError(null);

        if (session?.user) {
          try {
            // Tentar carregar perfil, mas não bloquear se falhar
            const profileData = await loadUserProfile(session.user.id);
            if (mounted) {
              setProfile(profileData);
            }
          } catch (error) {
            console.warn('Erro ao carregar perfil no listener, continuando sem perfil:', error);
            if (mounted) {
              setProfile(null);
            }
          }
        } else {
          setProfile(null);
        }
        
        // Sempre definir loading como false após tentar carregar
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
    retryCount,
    isInitialized,
    signOut,
    isAdmin,
    isActive,
    isAuthenticated,
    refreshProfile,
    retry: () => {
      setRetryCount(0);
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