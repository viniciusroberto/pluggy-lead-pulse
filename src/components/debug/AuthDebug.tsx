import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function AuthDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar sessão
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // Verificar usuário
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        // Verificar tabela users
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*')
          .limit(5);

        setDebugInfo({
          session: session ? 'Presente' : 'Ausente',
          sessionError: sessionError?.message || 'Nenhum',
          user: user ? 'Presente' : 'Ausente',
          userError: userError?.message || 'Nenhum',
          usersCount: users?.length || 0,
          usersError: usersError?.message || 'Nenhum',
          timestamp: new Date().toLocaleTimeString()
        });
      } catch (error) {
        setDebugInfo({
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          timestamp: new Date().toLocaleTimeString()
        });
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 5000); // Verificar a cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">🔍 Debug Auth</h3>
      <div className="space-y-1">
        <div>Sessão: {debugInfo.session}</div>
        <div>Usuário: {debugInfo.user}</div>
        <div>Usuários na DB: {debugInfo.usersCount}</div>
        {debugInfo.sessionError !== 'Nenhum' && (
          <div className="text-red-400">Sessão Error: {debugInfo.sessionError}</div>
        )}
        {debugInfo.userError !== 'Nenhum' && (
          <div className="text-red-400">User Error: {debugInfo.userError}</div>
        )}
        {debugInfo.usersError !== 'Nenhum' && (
          <div className="text-red-400">Users Error: {debugInfo.usersError}</div>
        )}
        {debugInfo.error && (
          <div className="text-red-400">Erro: {debugInfo.error}</div>
        )}
        <div className="text-gray-400">Atualizado: {debugInfo.timestamp}</div>
      </div>
    </div>
  );
}
