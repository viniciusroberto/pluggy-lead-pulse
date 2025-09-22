import { Bot, User, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface MessageBubbleProps {
  message: {
    id: number;
    mensagem: string | null;
    nome: string | null;
    telefone: number | null;
    timestamp: string | null;
    tipo_msg: string | null;
    created_at: string;
  };
  formatDate: (dateString: string) => string;
  isFirstClientMessage?: boolean;
}

export function MessageBubble({ message, formatDate, isFirstClientMessage = false }: MessageBubbleProps) {
  const isIA = message.tipo_msg === 'ia';
  const isHuman = message.tipo_msg === 'human';
  const shouldHighlightAsClient = isHuman && isFirstClientMessage;
  
  const getMessageTypeIcon = (tipo: string | null) => {
    switch (tipo) {
      case 'ia':
        return <Bot className="h-4 w-4" />;
      case 'human':
        return <User className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getMessageTypeName = (tipo: string | null) => {
    switch (tipo) {
      case 'ia':
        return 'Lia';
      case 'human':
        return shouldHighlightAsClient ? 'Cliente' : 'Usuário';
      default:
        return tipo || 'Sistema';
    }
  };

  return (
    <div className={`flex ${isIA ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom-2 duration-300`}>
      <div className={`max-w-[80%] ${isIA ? 'ml-0' : 'mr-0'}`}>
        <div
          className={`p-4 rounded-2xl shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
            isIA 
              ? 'bg-gradient-to-br from-sky-50 to-sky-100 border-sky-200 text-sky-900' 
              : isHuman
              ? shouldHighlightAsClient
                ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-900'
                : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 text-gray-900'
              : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 text-gray-900'
          }`}
        >
          {/* Header da mensagem */}
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-1.5 rounded-full transition-colors duration-200 ${
              isIA 
                ? 'bg-sky-200 text-sky-800' 
                : isHuman
                ? shouldHighlightAsClient
                  ? 'bg-green-200 text-green-800'
                  : 'bg-gray-200 text-gray-800'
                : 'bg-gray-200 text-gray-800'
            }`}>
              {getMessageTypeIcon(message.tipo_msg)}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                {isHuman && message.nome ? message.nome : getMessageTypeName(message.tipo_msg)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs opacity-70 ml-auto">
              <Calendar className="h-3 w-3" />
              {formatDate(message.created_at)}
            </div>
          </div>
          
          {/* Conteúdo da mensagem */}
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.mensagem || 'Mensagem vazia'}
          </div>
        </div>
      </div>
    </div>
  );
}
