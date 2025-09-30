import { Loader2 } from "lucide-react";

export function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Carregando aplicação...</p>
      </div>
    </div>
  );
}
