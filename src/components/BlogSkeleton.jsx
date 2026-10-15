export function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm animate-pulse flex flex-col justify-between h-full">
      <div>
        <div className="aspect-[16/10] bg-gray-200 w-full" />
        <div className="p-6 space-y-3">
          <div className="flex gap-2">
            <div className="h-3.5 bg-gray-200 rounded w-20" />
            <div className="h-3.5 bg-gray-200 rounded w-16" />
          </div>
          <div className="h-6 bg-gray-200 rounded w-4/5" />
          <div className="h-4 bg-gray-200 rounded w-full mt-2" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
      <div className="px-6 pb-6 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="h-3 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-20" />
      </div>
    </div>
  );
}

export function BlogGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function BlogDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-64 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          <div className="aspect-[16/9] bg-gray-200 rounded-2xl w-full" />
          <div className="h-10 bg-gray-200 rounded w-3/4" />
          <div className="flex gap-4">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
          <div className="space-y-3 pt-4">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="h-64 bg-gray-200 rounded-2xl" />
          <div className="h-48 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
