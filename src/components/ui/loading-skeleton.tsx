import { Skeleton } from "@/components/ui/skeleton";

export function DashboardLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
      </div>

      {/* KPIs Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Secondary KPIs Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-32 w-full" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4">
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}
