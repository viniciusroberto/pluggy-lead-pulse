import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AuthFallbackProps {
  onRetry: () => void;
  onForceLogout: () => void;
}

export function AuthFallback({ onRetry, onForceLogout }: AuthFallbackProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    try {
      // Tentar obter sessão novamente
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao obter sessão:', error);
      }
      
      if (session) {
        onRetry();
      } else {
        // Se não há sessão, forçar logout
        onForceLogout();
      }
    } catch (error) {
      console.error('Erro no retry de autenticação:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleForceLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
    onForceLogout();
  };

  const handleClearStorage = async () => {
    try {
      // Limpar todas as chaves do Supabase do localStorage
      const keys = Object.keys(localStorage);
      keys.filter(key => key.includes('supabase') || key.includes('auth')).forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Fazer logout do Supabase
      await supabase.auth.signOut();
      
      // Recarregar a página
      window.location.reload();
    } catch (error) {
      console.error('Erro ao limpar armazenamento:', error);
      // Mesmo com erro, recarregar a página
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-xl">Problema de Conexão</CardTitle>
          <CardDescription>
            Não foi possível verificar sua autenticação. Tente novamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={handleRetry} 
              disabled={isRetrying}
              className="flex-1"
            >
              {isRetrying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Tentando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </>
              )}
            </Button>
            <Button 
              onClick={handleForceLogout} 
              variant="outline"
              className="flex-1"
            >
              Fazer Login
            </Button>
          </div>
          
          <Button 
            onClick={handleClearStorage} 
            variant="destructive"
            className="w-full"
          >
            Limpar Dados e Recarregar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
