import { useState } from "react";
import { 
  Users, 
  Target, 
  Clock, 
  TrendingUp, 
  MessageSquare,
  CheckCircle,
  AlertCircle,
  BarChart3,
  LogOut,
  Settings
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { UserManagement } from "@/components/admin/UserManagement";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { MetricCard } from "@/components/ui/metric-card";
import { FilterBar } from "@/components/ui/filter-bar";
import { NPSGauge } from "@/components/charts/nps-gauge";
import { ValidationStatusChart } from "@/components/charts/validation-status-chart";
import { PendingLeadsTable } from "@/components/tables/pending-leads-table";
import { useDashboardDataOptimized, useFilterOptions, DashboardFilters, formatQualificationTime } from "@/hooks/use-dashboard-data-optimized";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { DashboardLoadingSkeleton } from "@/components/ui/loading-skeleton";

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
    page: 1,
    limit: 100, // Limite padrão de 100 registros por página
  });
  const [showUserManagement, setShowUserManagement] = useState(false);

  const { data, loading, error, refetch } = useDashboardDataOptimized(filters);
  const filterOptions = useFilterOptions();
  const { profile, signOut, isAdmin } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  if (loading) {
    return <DashboardLoadingSkeleton />;
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
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-glass opacity-50" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      
      <div className="relative container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              Dashboard Executivo
            </h1>
            <p className="text-muted-foreground">
              Monitoramento da operação de qualificação Pluggy
            </p>
            {profile && (
              <p className="text-sm text-muted-foreground mt-1">
                Bem-vindo, {profile.nome} ({profile.role === 'admin' ? 'Admin' : 'Usuário'})
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              Dados atualizados em tempo real
            </div>
            <div className="flex gap-2">
              {isAdmin() && (
                <Button
                  variant="outline"
                  onClick={() => setShowUserManagement(!showUserManagement)}
                  className="glass-button"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {showUserManagement ? 'Dashboard' : 'Usuários'}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="glass-button"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Admin User Management */}
        {showUserManagement && isAdmin() ? (
          <UserManagement />
        ) : (
          <>
            {/* Filters */}
            <FilterBar 
              filters={filters} 
              onFiltersChange={setFilters}
              onSearch={() => {
                // A busca já é automática quando os filtros mudam
                console.log('Pesquisando com filtros:', filters);
              }}
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
            title="Total de Mensagens"
            value={data.totalMessages.toLocaleString()}
            icon={<MessageSquare className="h-6 w-6" />}
            variant="default"
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
            value={formatQualificationTime(data.avgQualificationTime)}
            icon={<Clock className="h-6 w-6" />}
          />
          <ValidationStatusChart data={data.validationStatusData} />
          <NPSGauge
            score={data.npsScore}
            satisfeitos={data.satisfeitos}
            neutros={data.neutros}
            distribuicao={data.distribuicaoAvaliacoes}
          />
        </div>

            {/* Validação dos Leads Table */}
            <PendingLeadsTable 
              leads={data.pendingLeads}
            />

            {/* Pagination Controls */}
            {data.pagination && (
              <PaginationControls
                currentPage={data.pagination.currentPage}
                totalPages={data.pagination.totalPages}
                hasNextPage={data.pagination.hasNextPage}
                hasPrevPage={data.pagination.hasPrevPage}
                onPageChange={handlePageChange}
                totalCount={data.pagination.totalCount}
                limit={filters.limit || 100}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

