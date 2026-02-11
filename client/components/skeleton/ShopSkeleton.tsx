import { Skeleton } from "@/components/ui/skeleton";

const ShopSkeleton = () => {
  return (
    <div className="flex flex-col md:flex-row gap-5">
      {/* Sidebar Skeleton */}
      <div className="p-5 bg-babyshopWhite w-full md:max-w-64 min-w-60 rounded-lg border space-y-6">
        {/* Filters Title */}
        <Skeleton className="h-6 w-24" />

        {/* Category */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Brand */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Price */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Sort */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>

      {/* Products Skeleton */}
      <div className="p-5 bg-babyshopWhite rounded-md w-full border">
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="space-y-3">
              {/* Image */}
              <Skeleton className="aspect-square w-full rounded-md" />

              {/* Title */}
              <Skeleton className="h-4 w-3/4" />

              {/* Price */}
              <Skeleton className="h-4 w-1/2" />

              {/* Button */}
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopSkeleton;
