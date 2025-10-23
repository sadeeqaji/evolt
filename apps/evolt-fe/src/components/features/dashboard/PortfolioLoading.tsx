export function PortfolioLoading() {
  return (
    <div className="w-full bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-8 border border-slate-800">
      <div className="mb-8">
        <div className="h-8 w-12 bg-slate-800 rounded animate-pulse" />
      </div>

      <div className="flex items-start justify-between gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-5 w-32 bg-slate-800 rounded animate-pulse" />
            <div className="h-5 w-5 bg-slate-800 rounded-full animate-pulse" />
          </div>
          <div className="mb-4">
            <div className="h-10 w-40 bg-slate-800 rounded animate-pulse" />
          </div>
          <div className="h-4 w-32 bg-slate-800 rounded animate-pulse" />
        </div>

        <div className="w-px h-32 bg-slate-800" />

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-5 w-32 bg-slate-800 rounded animate-pulse" />
            <div className="h-5 w-5 bg-slate-800 rounded-full animate-pulse" />
          </div>
          <div className="mb-4 flex items-center gap-3">
            <div className="h-10 w-40 bg-slate-800 rounded animate-pulse" />
            <div className="h-6 w-16 bg-slate-800 rounded animate-pulse" />
          </div>
          <div className="h-4 w-32 bg-slate-800 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
