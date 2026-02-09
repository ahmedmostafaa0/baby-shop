import { Skeleton } from "@/components/ui/skeleton";

const BannerSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 p-4 border-b bg-muted/30">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>

        {/* Rows */}
        {Array.from({ length: 5 }).map((_, row) => (
          <div key={row} className="grid grid-cols-6 gap-4 p-4 border-b">
            {/* Image */}
            <Skeleton className="h-12 w-12 rounded-md" />

            {/* Name */}
            <Skeleton className="h-4 w-full" />

            {/* Title */}
            <Skeleton className="h-4 w-full" />

            {/* Start From */}
            <Skeleton className="h-4 w-16" />

            {/* Type */}
            <Skeleton className="h-6 w-24 rounded-full" />

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BannerSkeleton;
