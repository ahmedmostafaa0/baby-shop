import { Skeleton } from "@/components/ui/skeleton";

const CategorySkeleton = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-end gap-3">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-28" /> {/* Refresh */}
          <Skeleton className="h-10 w-40" /> {/* Sort */}
          <Skeleton className="h-10 w-40" /> {/* Add */}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 p-4 border-b">
          <Skeleton className="h-5 w-20" /> {/* Image */}
          <Skeleton className="h-5 w-32" /> {/* Name */}
          <Skeleton className="h-5 w-32" /> {/* Type */}
          <Skeleton className="h-5 w-32" /> {/* Created */}
          <Skeleton className="h-5 w-24 ml-auto" /> {/* Actions */}
        </div>

        {/* Rows */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-5 gap-4 p-4 border-b items-center"
          >
            {/* Image */}
            <Skeleton className="h-12 w-12 rounded-md" />

            {/* Name */}
            <Skeleton className="h-5 w-40" />

            {/* Type */}
            <Skeleton className="h-5 w-32" />

            {/* Date */}
            <Skeleton className="h-5 w-32" />

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-72" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  );
};

export default CategorySkeleton;
