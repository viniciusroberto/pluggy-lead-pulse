import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardFilters {
  dateRange: { start: string; end: string };
  origem: string[];
  atividade: string[];
  solucao: string[];
  hubspot: boolean | null;
  followup: boolean | null;
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
  promoters: number;
  passives: number;
  detractors: number;
  avgQualificationTime: number;
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
      
      if (filters.dateRange.start) {
        query = query.gte('data_criacao', filters.dateRange.start);
      }
      if (filters.dateRange.end) {
        query = query.lte('data_criacao', filters.dateRange.end);
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
        query = query.eq('followup_status', filters.followup ? 1 : 0);
      }
      if (filters.interaction !== null) {
        query = query.eq('ultimo_tipo_msg', filters.interaction);
      }

      const { data: leads, error: leadsError } = await query;
      
      if (leadsError) throw leadsError;

      // Calculate metrics
      const totalLeads = leads?.length || 0;
      
      const qualifiedLeads = leads?.filter(lead => 
        lead.origem && lead.email && lead.atividade && lead.solucao && lead.tamanho
      ).length || 0;
      
      const qualificationRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;
      
      const pendingFollowups = leads?.filter(lead => lead.followup_status === 1).length || 0;
      
      const hubspotCreated = leads?.filter(lead => lead.criado_no_hubspot).length || 0;

      // NPS calculations
      const npsResponses = leads?.filter(lead => lead.nps_score !== null) || [];
      const promoters = npsResponses.filter(lead => lead.nps_score >= 9).length;
      const passives = npsResponses.filter(lead => lead.nps_score >= 7 && lead.nps_score <= 8).length;
      const detractors = npsResponses.filter(lead => lead.nps_score <= 6).length;
      const npsScore = npsResponses.length > 0 ? ((promoters - detractors) / npsResponses.length) * 100 : 0;

      // IA vs Human
      const iaMessages = leads?.filter(lead => lead.ultimo_tipo_msg === 'ia').length || 0;
      const humanMessages = leads?.filter(lead => lead.ultimo_tipo_msg === 'human').length || 0;

      // Mock data for complex calculations that would require more complex queries
      const dashboardData: DashboardData = {
        totalLeads,
        qualifiedLeads,
        qualificationRate,
        pendingFollowups,
        hubspotCreated,
        npsScore,
        promoters,
        passives,
        detractors,
        avgQualificationTime: 45, // Mock - would need complex calculation
        iaVsHuman: { ia: iaMessages, human: humanMessages },
        dailyLeads: [], // Would need time series query
        funnelData: [
          { stage: 'Origem', count: totalLeads, rate: 100 },
          { stage: 'E-mail', count: Math.floor(totalLeads * 0.8), rate: 80 },
          { stage: 'Atividade', count: Math.floor(totalLeads * 0.65), rate: 65 },
          { stage: 'Solução', count: Math.floor(totalLeads * 0.5), rate: 50 },
          { stage: 'Tamanho', count: qualifiedLeads, rate: qualificationRate },
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
        pendingLeads: leads?.filter(lead => lead.followup_status === 1).map(lead => ({
          id: lead.id,
          nome: lead.nome || 'N/A',
          telefone: lead.telefone?.toString() || 'N/A',
          email: lead.email || 'N/A',
          data_criacao: lead.data_criacao || '',
          ultima_msg: lead.ultima_msg || 'N/A',
          missing_stage: getMissingStage(lead),
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
    origens: [] as string[],
    atividades: [] as string[],
    solucoes: [] as string[],
  });

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const { data: leads } = await supabase
        .from('controle_leads')
        .select('origem, atividade, solucao');

      if (leads) {
        const origens = [...new Set(leads.map(l => l.origem).filter(Boolean))];
        const atividades = [...new Set(leads.map(l => l.atividade).filter(Boolean))];
        const solucoes = [...new Set(leads.map(l => l.solucao).filter(Boolean))];

        setOptions({ origens, atividades, solucoes });
      }
    } catch (error) {
      console.error('Erro ao carregar opções de filtro:', error);
    }
  };

  return options;
}