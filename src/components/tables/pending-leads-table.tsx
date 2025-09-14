import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, Download, Phone, Mail, History, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChatHistoryDialog } from "./chat-history-dialog";

interface PendingLead {
  id: number;
  nome: string | null;
  telefone: number;
  email: string | null;
  data_criacao: string | null;
  ultima_msg: string | null;
  origem: string | null;
  atividade: string | null;
  solucao: string | null;
  tamanho: string | null;
  followup_status: number | null;
  criado_no_hubspot: boolean | null;
  nps_score: number | null;
  ultimo_tipo_msg: string | null;
  validacao_status?: 'validada' | 'invalida' | 'pendente';
}

interface PendingLeadsTableProps {
  leads: PendingLead[];
  onExport?: () => void;
}

export function PendingLeadsTable({ leads, onExport }: PendingLeadsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<PendingLead | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = (lead.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      lead.telefone.toString().includes(searchTerm) ||
      (lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === "all" || lead.validacao_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleShowHistory = (lead: PendingLead) => {
    setSelectedLead(lead);
    setShowHistory(true);
  };

  const handleCloseHistory = () => {
    setShowHistory(false);
    setSelectedLead(null);
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
      return;
    }

    // Função de exportação padrão
    const csvContent = generateCSV(filteredLeads);
    downloadCSV(csvContent, 'leads.csv');
  };

  const generateCSV = (leads: PendingLead[]) => {
    const headers = [
      'Nome',
      'Telefone', 
      'Email',
      'Data Criação',
      'Follow-up',
      'HubSpot',
      'NPS',
      'Status Validação'
    ];

    const rows = leads.map(lead => [
      lead.nome || '',
      lead.telefone.toString(),
      lead.email || '',
      lead.data_criacao ? formatDate(lead.data_criacao) : '',
      lead.followup_status ? `Follow-up ${lead.followup_status}` : 'Sem follow-up',
      lead.criado_no_hubspot ? 'Sim' : 'Não',
      lead.nps_score?.toString() || '-',
      getValidationStatusText(lead.validacao_status)
    ]);

    const csvRows = [headers, ...rows];
    return csvRows.map(row => 
      row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFollowupStatusColor = (status: number | null) => {
    switch (status) {
      case 1: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-orange-100 text-orange-800';
      case 3: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFollowupStatusText = (status: number | null) => {
    switch (status) {
      case 1: return 'Follow-up 1';
      case 2: return 'Follow-up 2';
      case 3: return 'Follow-up 3';
      default: return 'Sem follow-up';
    }
  };

  const getValidationStatusColor = (status: 'validada' | 'invalida' | 'pendente' | undefined) => {
    switch (status) {
      case 'validada': return 'bg-green-100 text-green-800 border-green-200';
      case 'invalida': return 'bg-red-100 text-red-800 border-red-200';
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getValidationStatusText = (status: 'validada' | 'invalida' | 'pendente' | undefined) => {
    switch (status) {
      case 'validada': return 'Válida';
      case 'invalida': return 'Inválida';
      case 'pendente': return 'Pendente';
      default: return 'Pendente';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Data não informada';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Validação dos Leads</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="validada">Válida</SelectItem>
                <SelectItem value="invalida">Inválida</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Data Criação</TableHead>
                <TableHead>Follow-up</TableHead>
                <TableHead>HubSpot</TableHead>
                <TableHead>NPS</TableHead>
                <TableHead>Validado</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'Nenhum lead encontrado' : 'Nenhum lead cadastrado'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      {lead.nome || 'Nome não informado'}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {lead.telefone}
                        </div>
                        {lead.email && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(lead.data_criacao)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getFollowupStatusColor(lead.followup_status)}>
                        {getFollowupStatusText(lead.followup_status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={lead.criado_no_hubspot ? "default" : "secondary"}>
                        {lead.criado_no_hubspot ? 'Sim' : 'Não'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lead.nps_score !== null ? (
                        <span className="text-sm font-medium">{lead.nps_score}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getValidationStatusColor(lead.validacao_status)}>
                        {getValidationStatusText(lead.validacao_status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleShowHistory(lead)}
                      >
                        <History className="h-4 w-4 mr-1" />
                        Histórico
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {filteredLeads.length > 0 && (
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <p>
              Mostrando {filteredLeads.length} de {leads.length} leads
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-yellow-100" />
                <span>Follow-up 1</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-100" />
                <span>Follow-up 2</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-100" />
                <span>Follow-up 3</span>
              </div>
            </div>
          </div>
        )}

        {/* Dialog de histórico */}
        {selectedLead && (
          <ChatHistoryDialog
            isOpen={showHistory}
            onClose={handleCloseHistory}
            lead={selectedLead}
          />
        )}
      </CardContent>
    </Card>
  );
}