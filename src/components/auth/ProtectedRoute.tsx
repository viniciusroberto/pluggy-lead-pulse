import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthFallback } from "@/components/AuthFallback";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, profile, loading, error, retryCount, isInitialized, isAdmin, isActive, isAuthenticated, refreshProfile, retry } = useAuth();

  console.log('ProtectedRoute - user:', user?.id, 'loading:', loading, 'initialized:', isInitialized, 'error:', error);

  // Error state - mostrar fallback para problemas de autenticação
  if (error && retryCount > 0) {
    // Se for timeout, permitir acesso básico
    if (error.includes('Timeout')) {
      console.log('Timeout detectado, permitindo acesso básico');
      return <>{children}</>;
    }
    
    return (
      <AuthFallback 
        onRetry={retry}
        onForceLogout={() => window.location.href = '/auth'}
      />
    );
  }

  // Loading state - aguardar mais tempo para evitar redirecionamentos prematuros
  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
          {error && (
            <p className="text-sm text-red-600">Erro: {error}</p>
          )}
        </div>
      </div>
    );
  }

  // Usuário não autenticado - só redirecionar após inicialização completa
  if (!user && isInitialized) {
    console.log('Usuário não autenticado, redirecionando para /auth');
    return <Navigate to="/auth" replace />;
  }

  // Usuário autenticado mas sem perfil - permitir acesso básico
  if (user && !profile) {
    // Se não requer admin, permitir acesso mesmo sem perfil
    if (!requireAdmin) {
      console.log('Usuário autenticado sem perfil - permitindo acesso básico');
      return <>{children}</>;
    }
    
    // Se requer admin mas não tem perfil, negar acesso
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto p-6">
          <div className="flex justify-center">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Esta área requer permissões de administrador. Seu perfil não foi encontrado no sistema.
            </p>
          </div>
          <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Status:</strong> Perfil não encontrado</p>
          </div>
          <div className="space-y-2">
            <Button 
              onClick={() => refreshProfile()}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
            <Button 
              onClick={() => window.location.href = '/auth'}
              variant="outline"
              className="w-full"
            >
              Voltar ao Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Usuário com perfil mas inativo
  if (profile && !isActive()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto p-6">
          <div className="flex justify-center">
            <AlertCircle className="w-12 h-12 text-yellow-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Conta Inativa</h2>
            <p className="text-muted-foreground">
              Sua conta está inativa. Entre em contato com o administrador para reativar.
            </p>
          </div>
          <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
            <p><strong>Nome:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Role:</strong> {profile.role}</p>
            <p><strong>Status:</strong> Inativo</p>
          </div>
          <div className="space-y-2">
            <Button 
              onClick={() => refreshProfile()}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Verificar Status
            </Button>
            <Button 
              onClick={() => window.location.href = '/auth'}
              variant="outline"
              className="w-full"
            >
              Fazer Logout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Verificar permissões de admin
  if (requireAdmin && !isAdmin()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto p-6">
          <div className="flex justify-center">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta área. Apenas administradores podem acessar.
            </p>
          </div>
          <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
            <p><strong>Nome:</strong> {profile?.name}</p>
            <p><strong>Role:</strong> {profile?.role}</p>
          </div>
          <Button 
            onClick={() => window.location.href = '/dashboard'}
            className="w-full"
            variant="default"
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Usuário autenticado e autorizado
  return <>{children}</>;
};