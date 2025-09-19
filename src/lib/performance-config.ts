// Configurações de performance para a aplicação
export const PERFORMANCE_CONFIG = {
  // Configurações de cache
  CACHE: {
    DASHBOARD_STALE_TIME: 2 * 60 * 1000, // 2 minutos
    DASHBOARD_CACHE_TIME: 5 * 60 * 1000, // 5 minutos
    FILTER_DEBOUNCE: 300, // 300ms
  },
  
  // Configurações de paginação
  PAGINATION: {
    DEFAULT_LIMIT: 100,
    MAX_LIMIT: 500,
    MIN_LIMIT: 10,
  },
  
  // Configurações de queries
  QUERIES: {
    MAX_RETRIES: 2,
    TIMEOUT: 30000, // 30 segundos
    BATCH_SIZE: 1000, // Máximo de registros por batch
  },
  
  // Configurações de UI
  UI: {
    SKELETON_ANIMATION_DURATION: 1000,
    LOADING_DEBOUNCE: 100,
  }
};

// Função para calcular se deve usar paginação
export function shouldUsePagination(totalCount: number): boolean {
  return totalCount > PERFORMANCE_CONFIG.PAGINATION.DEFAULT_LIMIT;
}

// Função para calcular o limite ideal baseado no total
export function calculateOptimalLimit(totalCount: number): number {
  if (totalCount <= 100) return totalCount;
  if (totalCount <= 500) return 100;
  if (totalCount <= 1000) return 200;
  return PERFORMANCE_CONFIG.PAGINATION.DEFAULT_LIMIT;
}

// Função para otimizar filtros
export function optimizeFilters(filters: any) {
  // Remove filtros vazios para otimizar queries
  const optimized = { ...filters };
  
  if (optimized.origem && optimized.origem.length === 0) {
    delete optimized.origem;
  }
  
  if (optimized.atividade && optimized.atividade.length === 0) {
    delete optimized.atividade;
  }
  
  if (optimized.solucao && optimized.solucao.length === 0) {
    delete optimized.solucao;
  }
  
  return optimized;
}
