export default function StoreLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 bg-canvas text-center font-bvp">
      <div className="flex flex-col items-center space-y-4">
        {/* Elegant spinner using terracotta border */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-border/30"></div>
          <div className="absolute inset-0 rounded-full border-2 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
        
        {/* Subtle loading message */}
        <p className="text-secondary text-sm font-medium tracking-wide animate-pulse">
          Đang tải trải nghiệm Cốc Nối...
        </p>
      </div>
    </div>
  );
}
