import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogIn, AlertCircle, BarChart3 } from "lucide-react";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // Tratamento de erro mais específico
        let errorMessage = "Erro no login";
        
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Email ou senha incorretos";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Email não confirmado. Verifique sua caixa de entrada";
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "Muitas tentativas. Tente novamente em alguns minutos";
        } else {
          errorMessage = error.message;
        }

        setError(errorMessage);
        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (data.user) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao Dashboard Pluggy",
        });
        
        // Aguardar um pouco para o sistema de autenticação se estabilizar
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
        
        setLoading(false);
      }
    } catch (error: any) {
      const errorMessage = "Erro inesperado. Tente novamente";
      setError(errorMessage);
      toast({
        title: "Erro inesperado",
        description: errorMessage,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden flex items-center justify-center">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-glass opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      
      <div className="relative w-full max-w-md p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Dashboard Pluggy
          </h1>
          <p className="text-muted-foreground">
            Acesse sua conta para continuar
          </p>
        </div>

        <Card className="glass-card border-glass">
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Fazer Login
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Entre com suas credenciais para acessar o dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="glass-input"
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="glass-input"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full button-premium"
                  disabled={loading || !email.trim() || !password}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Card>

      </div>
    </div>
  );
};

export default Auth;