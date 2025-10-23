export function DepositSkeleton() {
  return (
    <div className="">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-3xl p-8 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <div className="h-6 w-32 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse mb-6" />
            </div>

            <div>
              <div className="h-6 w-40 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse mb-6" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 border border-slate-700/50 rounded-2xl p-6 bg-slate-800/30 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-5 w-20 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse mb-2" />

                  <div className="h-4 w-24 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse" />
                </div>
              </div>

              <div className="h-8 w-24 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse ml-auto" />
            </div>

            <div className="w-10 h-10 rounded-full border border-slate-700/50 flex items-center justify-center flex-shrink-0 bg-slate-800/30">
              <div className="w-5 h-5 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse" />
            </div>

            <div className="flex-1 border border-slate-700/50 rounded-2xl p-6 bg-slate-800/30 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-slate-700 to-slate-600 animate-pulse flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-5 w-20 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse mb-2" />

                  <div className="h-4 w-24 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse" />
                </div>
              </div>

              <div className="h-8 w-24 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse ml-auto" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-700/50 rounded-3xl p-8 backdrop-blur-sm space-y-6">
          <div className="border border-slate-700/50 rounded-2xl p-6 bg-slate-800/30 backdrop-blur-sm">
            <div className="h-6 w-64 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse mx-auto" />
          </div>

          <div className="h-14 bg-gradient-to-r from-slate-700 to-slate-600 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
