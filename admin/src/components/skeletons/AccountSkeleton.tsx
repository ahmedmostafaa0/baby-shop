import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const StatCardSkeleton = () => (
  <Card className="p-6 bg-white border-0 shadow-sm">
    <div className="flex items-start justify-between">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-12 w-12 rounded-lg" />
    </div>
  </Card>
);

const ChartSkeleton = () => (
  <Card className="p-6 bg-white border-0 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-5 w-5 rounded-full" />
    </div>
    <Skeleton className="h-[300px] w-full rounded-lg" />
  </Card>
);

const ListSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
      >
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="space-y-2 text-right">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    ))}
  </div>
);

const AccountSkeleton = () =>  {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8 animate-pulse">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-96" />

        {/* Filters */}
        <Card className="p-4 bg-white border-0 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <ChartSkeleton />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartSkeleton />

        <Card className="p-6 bg-white border-0 shadow-sm">
          <Skeleton className="h-5 w-40 mb-4" />
          <ListSkeleton />
        </Card>
      </div>

      {/* Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 bg-white border-0 shadow-sm">
          <Skeleton className="h-5 w-48 mb-4" />
          <ListSkeleton />
        </Card>

        <Card className="p-6 bg-white border-0 shadow-sm">
          <Skeleton className="h-5 w-48 mb-4" />
          <ListSkeleton />
        </Card>
      </div>

      {/* Summary */}
      <Card className="p-6 bg-white border-0 shadow-sm">
        <Skeleton className="h-5 w-48 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 rounded-lg border space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default AccountSkeleton;
