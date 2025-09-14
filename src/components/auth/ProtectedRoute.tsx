import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, profile, loading, isAdmin, isActive, refreshProfile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Se o usuário existe mas não tem profile, mostra erro
  if (user && !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Erro no Perfil</h2>
          <p className="text-muted-foreground">Não foi possível carregar o perfil do usuário.</p>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Usuário: {user?.email}
            </p>
            <p className="text-sm text-muted-foreground">
              Profile: Não encontrado
            </p>
          </div>
          <button 
            onClick={() => refreshProfile()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!isActive()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Acesso Negado</h2>
          <p className="text-muted-foreground">Sua conta está inativa. Entre em contato com o administrador.</p>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Usuário: {user?.email}
            </p>
            <p className="text-sm text-muted-foreground">
              Profile: {profile ? 'Carregado' : 'Não encontrado'}
            </p>
            <p className="text-sm text-muted-foreground">
              Ativo: {profile?.is_active ? 'Sim' : 'Não'}
            </p>
          </div>
          <button 
            onClick={() => refreshProfile()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Acesso Restrito</h2>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta área.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};