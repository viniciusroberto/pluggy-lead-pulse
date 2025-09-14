import { useState } from "react";
import { CalendarDays, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface FilterBarProps {
  filters: {
    dateRange: { start: string; end: string };
    origem: string[];
    atividade: string[];
    solucao: string[];
    hubspot: boolean | null;
    followup: boolean | null;
    interaction: string | null;
    tamanho: string | null;
  };
  onFiltersChange: (filters: any) => void;
  options: {
    origens: string[];
    atividades: string[];
    solucoes: string[];
  };
}

export function FilterBar({ filters, onFiltersChange, options }: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const clearFilters = () => {
    onFiltersChange({
      dateRange: { start: "", end: "" },
      origem: [],
      atividade: [],
      solucao: [],
      hubspot: null,
      followup: null,
      interaction: null,
      tamanho: null,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.origem.length > 0) count++;
    if (filters.atividade.length > 0) count++;
    if (filters.solucao.length > 0) count++;
    if (filters.hubspot !== null) count++;
    if (filters.followup !== null) count++;
    if (filters.interaction !== null) count++;
    if (filters.tamanho !== null) count++;
    return count;
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Filtros</h3>
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? "Menos filtros" : "Mais filtros"}
          </Button>
          {getActiveFiltersCount() > 0 && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Período</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => onFiltersChange({
                ...filters,
                dateRange: { ...filters.dateRange, start: e.target.value }
              })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => onFiltersChange({
                ...filters,
                dateRange: { ...filters.dateRange, end: e.target.value }
              })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Origem</label>
          <Select
            value={filters.origem[0] || "all"}
            onValueChange={(value) => onFiltersChange({
              ...filters,
              origem: value === "all" ? [] : [value]
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as origens" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as origens</SelectItem>
              {options.origens.map((origem) => (
                <SelectItem key={origem} value={origem}>{origem}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Atividade</label>
          <Select
            value={filters.atividade[0] || "all"}
            onValueChange={(value) => onFiltersChange({
              ...filters,
              atividade: value === "all" ? [] : [value]
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as atividades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as atividades</SelectItem>
              {options.atividades.map((atividade) => (
                <SelectItem key={atividade} value={atividade}>{atividade}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Solução</label>
          <Select
            value={filters.solucao[0] || "all"}
            onValueChange={(value) => onFiltersChange({
              ...filters,
              solucao: value === "all" ? [] : [value]
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as soluções" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as soluções</SelectItem>
              {options.solucoes.map((solucao) => (
                <SelectItem key={solucao} value={solucao}>{solucao}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <label className="text-sm font-medium">HubSpot</label>
            <Select
              value={filters.hubspot === null ? "all" : filters.hubspot.toString()}
              onValueChange={(value) => onFiltersChange({
                ...filters,
                hubspot: value === "all" ? null : value === "true"
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Criado no HubSpot</SelectItem>
                <SelectItem value="false">Não criado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Follow-up</label>
            <Select
              value={filters.followup === null ? "all" : filters.followup.toString()}
              onValueChange={(value) => onFiltersChange({
                ...filters,
                followup: value === "all" ? null : value === "true"
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Pendente</SelectItem>
                <SelectItem value="false">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Interação</label>
            <Select
              value={filters.interaction || "all"}
              onValueChange={(value) => onFiltersChange({
                ...filters,
                interaction: value === "all" ? null : value
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="ia">IA</SelectItem>
                <SelectItem value="human">Humano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tamanho</label>
            <Select
              value={filters.tamanho || "all"}
              onValueChange={(value) => onFiltersChange({
                ...filters,
                tamanho: value === "all" ? null : value
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="1-10">1-10</SelectItem>
                <SelectItem value="11-50">11-50</SelectItem>
                <SelectItem value="51-200">51-200</SelectItem>
                <SelectItem value="201-1000">201-1000</SelectItem>
                <SelectItem value="1000+">1000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </Card>
  );
}