import { Skeleton } from "@/components/ui/skeleton";

const BrandSkeleton = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="rounded-md border">
        <div className="w-full">
          <div className="grid grid-cols-4 gap-4 p-4 border-b">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24 ml-auto" />
          </div>

          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-4 gap-4 p-4 border-b items-center"
            >
              <Skeleton className="h-12 w-12 rounded-md" />

              <Skeleton className="h-5 w-40" />

              <Skeleton className="h-5 w-32" />

              <div className="flex gap-2 justify-end">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandSkeleton;
