import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
  totalCount: number;
  limit: number;
}

export function PaginationControls({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  totalCount,
  limit
}: PaginationControlsProps) {
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalCount);

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex items-center text-sm text-muted-foreground">
        Mostrando {startItem} a {endItem} de {totalCount} registros
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={!hasPrevPage}
          className="hidden h-8 w-8 p-0 lg:flex"
        >
          <span className="sr-only">Ir para primeira página</span>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Ir para página anterior</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center space-x-1">
          <span className="text-sm font-medium">
            Página {currentPage} de {totalPages}
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Ir para próxima página</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage}
          className="hidden h-8 w-8 p-0 lg:flex"
        >
          <span className="sr-only">Ir para última página</span>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
