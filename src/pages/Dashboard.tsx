import { useState } from "react";
import { 
  Users, 
  Target, 
  Clock, 
  TrendingUp, 
  MessageSquare,
  CheckCircle,
  AlertCircle,
  BarChart3
} from "lucide-react";

import { MetricCard } from "@/components/ui/metric-card";
import { FilterBar } from "@/components/ui/filter-bar";
import { FunnelChart } from "@/components/charts/funnel-chart";
import { TimelineChart } from "@/components/charts/timeline-chart";
import { DistributionChart } from "@/components/charts/distribution-chart";
import { NPSGauge } from "@/components/charts/nps-gauge";
import { PendingLeadsTable } from "@/components/tables/pending-leads-table";
import { useDashboardData, useFilterOptions, DashboardFilters } from "@/hooks/use-dashboard-data";

const Dashboard = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: { start: "", end: "" },
    origem: [],
    atividade: [],
    solucao: [],
    hubspot: null,
    followup: null,
    interaction: null,
    tamanho: null,
  });

  const { data, loading, error } = useDashboardData(filters);
  const filterOptions = useFilterOptions();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-danger mx-auto" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">Erro ao carregar dados</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Dashboard Executivo
            </h1>
            <p className="text-muted-foreground">
              Monitoramento da operação de qualificação Pluggy
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            Dados atualizados em tempo real
          </div>
        </div>

        {/* Filters */}
        <FilterBar 
          filters={filters} 
          onFiltersChange={setFilters}
          options={filterOptions}
        />

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total de Leads"
            value={data.totalLeads.toLocaleString()}
            icon={<Users className="h-6 w-6" />}
            variant="default"
          />
          <MetricCard
            title="Leads Qualificados"
            value={data.qualifiedLeads.toLocaleString()}
            change={{ value: data.qualificationRate, percentage: true }}
            icon={<Target className="h-6 w-6" />}
            variant="success"
          />
          <MetricCard
            title="Follow-ups Pendentes"
            value={data.pendingFollowups.toLocaleString()}
            icon={<Clock className="h-6 w-6" />}
            variant="warning"
          />
          <MetricCard
            title="Criados no HubSpot"
            value={data.hubspotCreated.toLocaleString()}
            icon={<CheckCircle className="h-6 w-6" />}
            variant="success"
          />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Tempo Médio Qualificação"
            value={`${data.avgQualificationTime}min`}
            icon={<Clock className="h-6 w-6" />}
          />
          <MetricCard
            title="Mensagens IA vs Humano"
            value={`${Math.round((data.iaVsHuman.ia / (data.iaVsHuman.ia + data.iaVsHuman.human)) * 100)}% IA`}
            icon={<MessageSquare className="h-6 w-6" />}
            variant="default"
          />
          <NPSGauge
            score={data.npsScore}
            promoters={data.promoters}
            passives={data.passives}
            detractors={data.detractors}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TimelineChart data={data.dailyLeads} />
          <FunnelChart 
            data={data.funnelData}
            onStageClick={(stage) => {
              console.log('Stage clicked:', stage);
              // Implement drill-down functionality
            }}
          />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DistributionChart
            data={data.distributionData.origem}
            title="Distribuição por Origem"
            onItemClick={(item) => {
              setFilters({ ...filters, origem: [item] });
            }}
          />
          <DistributionChart
            data={data.distributionData.atividade}
            title="Distribuição por Atividade"
            onItemClick={(item) => {
              setFilters({ ...filters, atividade: [item] });
            }}
          />
          <DistributionChart
            data={data.distributionData.solucao}
            title="Distribuição por Solução"
            onItemClick={(item) => {
              setFilters({ ...filters, solucao: [item] });
            }}
          />
        </div>

        {/* Pending Leads Table */}
        <PendingLeadsTable 
          leads={data.pendingLeads}
          onExport={() => {
            // Implement CSV export
            console.log('Exporting pending leads...');
          }}
        />
      </div>
    </div>
  );
};

export default Dashboard;