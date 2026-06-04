export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse font-bvp">
      {/* Page Header Skeleton */}
      <div className="flex justify-between items-center pb-4 border-b border-border/40">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-border/40 rounded-pill"></div>
          <div className="h-4 w-64 bg-border/20 rounded-pill"></div>
        </div>
        <div className="h-10 w-32 bg-border/30 rounded-pill"></div>
      </div>

      {/* Cards/Widgets Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 bg-white border border-border/30 rounded-3 space-y-3">
            <div className="h-4 w-24 bg-border/30 rounded-pill"></div>
            <div className="h-8 w-16 bg-border/40 rounded-pill"></div>
            <div className="h-4 w-32 bg-border/20 rounded-pill"></div>
          </div>
        ))}
      </div>

      {/* Content Area/Table Skeleton */}
      <div className="p-6 bg-white border border-border/30 rounded-3 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 w-36 bg-border/30 rounded-pill"></div>
          <div className="h-8 w-24 bg-border/20 rounded-pill"></div>
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="flex items-center space-x-4 py-2 border-b border-border/10 last:border-0">
              <div className="h-10 w-10 bg-border/20 rounded-2 flex-shrink-0"></div>
              <div className="flex-grow space-y-2">
                <div className="h-4 w-2/5 bg-border/30 rounded-pill"></div>
                <div className="h-3 w-1/4 bg-border/20 rounded-pill"></div>
              </div>
              <div className="h-6 w-16 bg-border/30 rounded-pill"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
