import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Função para formatar tempo em minutos para formato legível
export function formatQualificationTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  } else if (minutes < 1440) { // Menos de 24 horas
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  } else {
    const days = Math.floor(minutes / 1440);
    const remainingHours = Math.floor((minutes % 1440) / 60);
    if (remainingHours === 0) {
      return `${days}d`;
    }
    return `${days}d ${remainingHours}h`;
  }
}

export interface DashboardFilters {
  dateRange: { start: string; end: string };
  origem: string[];
  atividade: string[];
  solucao: string[];
  hubspot: boolean | null;
  followup: number | null;
  interaction: string | null;
  tamanho: string | null;
}

export interface DashboardData {
  totalLeads: number;
  qualifiedLeads: number;
  qualificationRate: number;
  pendingFollowups: number;
  hubspotCreated: number;
  npsScore: number;
  satisfeitos: number;
  neutros: number;
  distribuicaoAvaliacoes: Array<{ score: number; quantidade: number }>;
  avgQualificationTime: number;
  totalMessages: number;
  iaVsHuman: { ia: number; human: number };
  dailyLeads: Array<{ date: string; leads: number; qualified: number; hubspot: number }>;
  funnelData: Array<{ stage: string; count: number; rate: number }>;
  distributionData: {
    origem: Array<{ name: string; value: number }>;
    atividade: Array<{ name: string; value: number }>;
    solucao: Array<{ name: string; value: number }>;
  };
  hourlyHeatmap: Array<{ hour: number; day: number; volume: number }>;
  qualificationTimeByOrigin: Array<{ origem: string; avgTime: number; p50: number; p90: number }>;
  tamanhoDistribution: Array<{ range: string; count: number }>;
  npsSegments: Array<{ segment: string; nps: number; count: number }>;
  validationStatusData: Array<{
    status: string;
    count: number;
    color: string;
  }>;
  pendingLeads: Array<{
    id: number;
    nome: string;
    telefone: string;
    email: string;
    data_criacao: string;
    ultima_msg: string;
    missing_stage: string;
  }>;
}

export function useDashboardData(filters: DashboardFilters) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build filter conditions
      let query = supabase.from('controle_leads').select('*');
      
      // Debug: Log dos filtros aplicados
      console.log('Filtros aplicados:', {
        start: filters.dateRange.start,
        end: filters.dateRange.end,
        origem: filters.origem,
        atividade: filters.atividade,
        solucao: filters.solucao
      });
      
      if (filters.dateRange.start) {
        // Usar data no formato YYYY-MM-DD para evitar problemas de timezone
        const startDate = filters.dateRange.start + 'T00:00:00.000Z';
        console.log('Start date filter:', startDate);
        query = query.gte('data_criacao', startDate);
      }
      if (filters.dateRange.end) {
        // Usar data no formato YYYY-MM-DD e adicionar 23:59:59
        const endDate = filters.dateRange.end + 'T23:59:59.999Z';
        console.log('End date filter:', endDate);
        query = query.lte('data_criacao', endDate);
      }
      if (filters.origem.length > 0) {
        query = query.in('origem', filters.origem);
      }
      if (filters.atividade.length > 0) {
        query = query.in('atividade', filters.atividade);
      }
      if (filters.solucao.length > 0) {
        query = query.in('solucao', filters.solucao);
      }
      if (filters.hubspot !== null) {
        query = query.eq('criado_no_hubspot', filters.hubspot);
      }
      if (filters.followup !== null) {
        // Follow-up: 1, 2, 3 (não apenas true/false)
        query = query.eq('followup_status', filters.followup);
      }
      if (filters.interaction !== null) {
        query = query.eq('ultimo_tipo_msg', filters.interaction);
      }

      const { data: leads, error: leadsError } = await query;
      
      if (leadsError) {
        throw leadsError;
      }

      // Debug: Log dos resultados
      console.log('Leads encontrados:', leads?.length || 0);
      if (leads && leads.length > 0) {
        console.log('Primeiro lead:', leads[0]);
        console.log('Data do primeiro lead:', leads[0].data_criacao);
      }

      // Get validation status for all leads in a single query (FIXED N+1 problem)
      let leadsWithValidation = leads || [];
      
      if (leads && leads.length > 0) {
        const telefones = leads.map(lead => lead.telefone);
        
        // Single query to get all validations at once
        const { data: validations, error: validationsError } = await supabase
          .from('conversa_validacao')
          .select('telefone, validada')
          .in('telefone', telefones);

        if (!validationsError && validations) {
          // Create a map for O(1) lookup
          const validationMap = new Map(
            validations.map(v => [v.telefone, v.validada])
          );

          // Apply validation status to leads
          leadsWithValidation = leads.map(lead => {
            const validada = validationMap.get(lead.telefone);
            return {
              ...lead,
              validacao_status: validada === true ? 'validada' : 
                               validada === false ? 'invalida' : 'pendente'
            };
          });
        } else {
          // If validation query fails, set all as pending
          leadsWithValidation = leads.map(lead => ({
            ...lead,
            validacao_status: 'pendente' as const
          }));
        }
      }

      // Count total messages from chat_pluggy based on filtered leads
      let totalMessages = 0;
      if (leadsWithValidation && leadsWithValidation.length > 0) {
        const telefones = leadsWithValidation.map(lead => lead.telefone);
        const { data: messages, error: messagesError } = await supabase
          .from('chat_pluggy')
          .select('id')
          .in('telefone', telefones);
        
        if (!messagesError) {
          totalMessages = messages?.length || 0;
        }
      }

      // Calculate metrics
      const totalLeads = leadsWithValidation?.length || 0;
      
      // Leads qualificados = leads criados no HubSpot
      const qualifiedLeads = leadsWithValidation?.filter(lead => 
        lead.criado_no_hubspot === true
      ).length || 0;
      
      const qualificationRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;
      
      const pendingFollowups = leadsWithValidation?.filter(lead => lead.followup_status && lead.followup_status >= 1).length || 0;
      
      const hubspotCreated = leadsWithValidation?.filter(lead => lead.criado_no_hubspot).length || 0;

      // Avaliação Clientes calculations (escala 0-5)
      const avaliacoes = leadsWithValidation?.filter(lead => lead.nps_score !== null) || [];
      const satisfeitos = avaliacoes.filter(lead => lead.nps_score === 5).length; // Score 5
      const neutros = avaliacoes.filter(lead => lead.nps_score >= 1 && lead.nps_score <= 4).length; // Score 1-4
      const npsScore = avaliacoes.length > 0 ? (satisfeitos / avaliacoes.length) * 100 : 0;

      // Distribuição por score (1-5)
      const distribuicaoAvaliacoes = [1, 2, 3, 4, 5].map(score => ({
        score,
        quantidade: avaliacoes.filter(lead => lead.nps_score === score).length
      }));

      // IA vs Human
      const iaMessages = leadsWithValidation?.filter(lead => lead.ultimo_tipo_msg === 'ia').length || 0;
      const humanMessages = leadsWithValidation?.filter(lead => lead.ultimo_tipo_msg === 'human').length || 0;

      // Status de validação para gráfico
      const validationStatusData = [
        {
          status: 'Pendente',
          count: leadsWithValidation?.filter(lead => lead.validacao_status === 'pendente').length || 0,
          color: '#F59E0B'
        },
        {
          status: 'Inválida',
          count: leadsWithValidation?.filter(lead => lead.validacao_status === 'invalida').length || 0,
          color: '#EF4444'
        },
        {
          status: 'Válida',
          count: leadsWithValidation?.filter(lead => lead.validacao_status === 'validada').length || 0,
          color: '#10B981'
        }
      ];


      // Calcular tempo médio de qualificação real
      const qualifiedLeadsWithTime = leadsWithValidation?.filter(lead => 
        lead.criado_no_hubspot === true && 
        lead.data_criacao && 
        lead.timestamp
      ) || [];

      let avgQualificationTime = 0;
      if (qualifiedLeadsWithTime.length > 0) {
        const totalTimeMinutes = qualifiedLeadsWithTime.reduce((total, lead) => {
          const startTime = new Date(lead.data_criacao!).getTime();
          const endTime = new Date(lead.timestamp!).getTime();
          const timeDiffMinutes = (endTime - startTime) / (1000 * 60); // Converter para minutos
          return total + timeDiffMinutes;
        }, 0);
        
        avgQualificationTime = Math.round(totalTimeMinutes / qualifiedLeadsWithTime.length);
      }

      const dashboardData: DashboardData = {
        totalLeads,
        qualifiedLeads,
        qualificationRate,
        pendingFollowups,
        hubspotCreated,
        npsScore,
        satisfeitos,
        neutros,
        distribuicaoAvaliacoes,
        avgQualificationTime,
        totalMessages,
        iaVsHuman: { ia: iaMessages, human: humanMessages },
        dailyLeads: [], // Would need time series query
        funnelData: [
          { stage: 'Total de Leads', count: totalLeads, rate: 100 },
          { stage: 'Leads Qualificados', count: qualifiedLeads, rate: qualificationRate },
        ],
        distributionData: {
          origem: [], // Would need grouping query
          atividade: [],
          solucao: [],
        },
        hourlyHeatmap: [], // Would need chat_pluggy data
        qualificationTimeByOrigin: [],
        tamanhoDistribution: [],
        npsSegments: [],
        validationStatusData,
        pendingLeads: leadsWithValidation?.map(lead => ({
          id: lead.id,
          nome: lead.nome,
          telefone: lead.telefone,
          email: lead.email,
          data_criacao: lead.data_criacao,
          ultima_msg: lead.ultima_msg,
          origem: lead.origem,
          atividade: lead.atividade,
          solucao: lead.solucao,
          tamanho: lead.tamanho,
          followup_status: lead.followup_status,
          criado_no_hubspot: lead.criado_no_hubspot,
          nps_score: lead.nps_score,
          ultimo_tipo_msg: lead.ultimo_tipo_msg,
          validacao_status: lead.validacao_status
        })) || [],
      };

      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getMissingStage = (lead: any): string => {
    if (!lead.origem) return 'Origem';
    if (!lead.email) return 'E-mail';
    if (!lead.atividade) return 'Atividade';
    if (!lead.solucao) return 'Solução';
    if (!lead.tamanho) return 'Tamanho';
    return 'Qualificado';
  };

  return { data, loading, error, refetch: fetchDashboardData };
}

export function useFilterOptions() {
  const [options, setOptions] = useState({
    origens: [
      'Indicação',
      'Busca no Google',
      'Chats de IA (ex: ChatGPT)',
      'Redes sociais (LinkedIn, Instagram...)',
      'Youtube',
      'Matéria ou evento'
    ] as string[],
    atividades: [
      'ERP, BPO ou sistema de gestão',
      'Fintech / app financeiro',
      'Quero apenas para uso pessoal',
      'Outro'
    ] as string[],
    solucoes: [
      'Dados (Open Finance, saldo, movimentações, investimentos, etc.)',
      'Cobranças via PIX (PIX simples, PIX automático)',
      'Pagamentos (boletos, tributos, pagamento em lote...)',
      'Outro'
    ] as string[],
  });

  return options;
}