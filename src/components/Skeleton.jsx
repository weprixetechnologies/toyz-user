export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-[16px] border border-[#E7EBEF] overflow-hidden animate-pulse flex flex-col justify-between h-full w-full">
      <div className="aspect-square bg-gray-200 w-full" />
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="h-3.5 bg-gray-200 rounded-md w-16 mb-2.5" />
          <div className="h-4 bg-gray-200 rounded w-4/5 mb-1.5" />
          <div className="h-4 bg-gray-200 rounded w-3/5" />
        </div>
        <div className="mt-3">
          <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
          <div className="flex items-end justify-between gap-2">
            <div className="h-6 bg-gray-200 rounded w-20" />
            <div className="w-9 h-9 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function Skeleton({ className = 'h-32 w-full bg-slate-200 animate-pulse rounded-lg' }) {
  return <div className={className} />;
}
