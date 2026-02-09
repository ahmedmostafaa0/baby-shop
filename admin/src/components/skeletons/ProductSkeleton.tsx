import { Skeleton } from "@/components/ui/skeleton";

const ProductSkeleton = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg border border-border/50 shadow-sm bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <div className="w-full">
            {/* Table Header */}
            <div className="grid grid-cols-9 gap-4 p-4 border-b bg-muted/30">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>

            {/* Table Rows */}
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-9 gap-4 p-4 border-b"
              >
                {/* Image */}
                <Skeleton className="h-12 w-12 rounded-md" />

                {/* Name */}
                <Skeleton className="h-4 w-full" />

                {/* Price */}
                <Skeleton className="h-4 w-20" />

                {/* Discount */}
                <Skeleton className="h-6 w-16 rounded-full" />

                {/* Stock */}
                <Skeleton className="h-6 w-14 rounded-full" />

                {/* Rating */}
                <Skeleton className="h-4 w-16" />

                {/* Category */}
                <Skeleton className="h-6 w-24 rounded-full" />

                {/* Brand */}
                <Skeleton className="h-6 w-24 rounded-full" />

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
