import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, User, Bot, Phone, Calendar, Mail, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { MessageBubble } from "@/components/ui/message-bubble";

interface ChatMessage {
  id: number;
  mensagem: string | null;
  nome: string | null;
  telefone: number | null;
  timestamp: string | null;
  tipo_msg: string | null;
  created_at: string;
}

interface ChatHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lead: {
    nome: string | null;
    telefone: number;
    email: string | null;
  };
}

export function ChatHistoryDialog({ isOpen, onClose, lead }: ChatHistoryDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{
    validada: boolean | null;
    observacoes: string;
    validado_por: string | null;
    validado_em: string | null;
  }>({
    validada: null,
    observacoes: '',
    validado_por: null,
    validado_em: null
  });
  const [showObservations, setShowObservations] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && lead.telefone) {
      fetchChatHistory();
      fetchValidationStatus();
    }
  }, [isOpen, lead.telefone]);

  const fetchChatHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_pluggy')
        .select('*')
        .eq('telefone', lead.telefone)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar histórico:', error);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchValidationStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('conversa_validacao')
        .select('*')
        .eq('telefone', lead.telefone)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Erro ao buscar validação:', error);
        return;
      }

      if (data) {
        setValidationStatus({
          validada: data.validada,
          observacoes: data.observacoes || '',
          validado_por: data.validado_por,
          validado_em: data.validado_em
        });
      }
    } catch (error) {
      console.error('Erro ao buscar validação:', error);
    }
  };

  const saveValidation = async (validada: boolean) => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      // Primeiro, verificar se já existe um registro
      const { data: existingValidation } = await supabase
        .from('conversa_validacao')
        .select('id')
        .eq('telefone', lead.telefone)
        .single();

      let error;
      
      if (existingValidation) {
        // Se existe, fazer UPDATE
        const { error: updateError } = await supabase
          .from('conversa_validacao')
          .update({
            validada,
            observacoes: validationStatus.observacoes,
            validado_por: user.id,
            validado_em: new Date().toISOString()
          })
          .eq('telefone', lead.telefone);
        
        error = updateError;
      } else {
        // Se não existe, fazer INSERT
        const { error: insertError } = await supabase
          .from('conversa_validacao')
          .insert({
            telefone: lead.telefone,
            validada,
            observacoes: validationStatus.observacoes,
            validado_por: user.id,
            validado_em: new Date().toISOString()
          });
        
        error = insertError;
      }

      if (error) {
        throw error;
      }

      setValidationStatus(prev => ({
        ...prev,
        validada,
        validado_por: user.id,
        validado_em: new Date().toISOString()
      }));

      toast({
        title: "Sucesso",
        description: validada ? "Conversa marcada como válida" : "Conversa marcada como inválida",
      });

      setShowObservations(false);
    } catch (error) {
      console.error('Erro ao salvar validação:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar validação",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Histórico de Conversas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do cliente */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-900">{lead.nome || 'Nome não informado'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-800">{lead.telefone}</span>
              </div>
              {lead.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-700">{lead.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Mensagens */}
          <div className="bg-gradient-to-b from-slate-50 to-white p-4 rounded-lg border border-slate-200">
            <div className="flex items-center justify-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-slate-600">Mensagens da IA</span>
              </div>
              <div className="w-px h-4 bg-slate-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-slate-600">Mensagens do Cliente</span>
              </div>
            </div>
            <ScrollArea className="h-96">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-gray-500">Carregando histórico...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-gray-500">Nenhuma conversa encontrada</div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <MessageBubble 
                    key={message.id} 
                    message={message} 
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
            </ScrollArea>
          </div>

          {/* Validação da Conversa */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <span className="font-semibold text-gray-900">Validação da Conversa</span>
              </div>
              {validationStatus.validada !== null && (
                <Badge variant={validationStatus.validada ? "default" : "destructive"}>
                  {validationStatus.validada ? "Válida" : "Inválida"}
                </Badge>
              )}
            </div>

            {validationStatus.validada === null ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    onClick={() => saveValidation(true)}
                    variant="default"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Marcar como Válida
                  </Button>
                  <Button
                    onClick={() => setShowObservations(true)}
                    variant="destructive"
                    size="sm"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Marcar como Inválida
                  </Button>
                </div>
                {showObservations && (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Descreva os problemas encontrados na conversa..."
                      value={validationStatus.observacoes}
                      onChange={(e) => setValidationStatus(prev => ({ ...prev, observacoes: e.target.value }))}
                      className="min-h-20"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => saveValidation(false)}
                        variant="destructive"
                        size="sm"
                      >
                        Confirmar como Inválida
                      </Button>
                      <Button
                        onClick={() => setShowObservations(false)}
                        variant="outline"
                        size="sm"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-gray-700">
                  <strong>Status:</strong> {validationStatus.validada ? "Conversa válida" : "Conversa inválida"}
                </div>
                {validationStatus.observacoes && (
                  <div className="text-sm text-gray-700">
                    <strong>Observações:</strong> {validationStatus.observacoes}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Validado em: {validationStatus.validado_em ? formatDate(validationStatus.validado_em) : 'N/A'}
                </div>
                <Button
                  onClick={() => {
                    setValidationStatus({
                      validada: null,
                      observacoes: '',
                      validado_por: null,
                      validado_em: null
                    });
                    setShowObservations(false);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Revalidar
                </Button>
              </div>
            )}
          </div>

          {/* Estatísticas */}
          {messages.length > 0 && (
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-slate-600" />
                  <span className="font-semibold text-slate-800">Total de mensagens: {messages.length}</span>
                </div>
                <div className="flex gap-8">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-blue-100">
                      <Bot className="h-3 w-3 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      IA: <span className="text-blue-600 font-semibold">{messages.filter(m => m.tipo_msg === 'ia').length}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-emerald-100">
                      <User className="h-3 w-3 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      Cliente: <span className="text-emerald-600 font-semibold">{messages.filter(m => m.tipo_msg === 'human').length}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
