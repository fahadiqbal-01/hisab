export default function DashboardLoading() {
  return (
    <div className="space-y-8 pb-16 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-white/5 p-6 md:p-8 rounded-3xl border border-black/5 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-3">
          <div className="h-3 w-24 bg-emerald-500/20 rounded-full" />
          <div className="h-8 w-48 bg-black/10 dark:bg-white/10 rounded-2xl" />
          <div className="h-4 w-64 bg-black/5 dark:bg-white/5 rounded-xl" />
        </div>
        <div className="h-12 w-32 bg-black/5 dark:bg-white/5 rounded-2xl" />
      </div>

      {/* KPI Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-black/5 dark:border-white/5 space-y-4"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-28 bg-black/10 dark:bg-white/10 rounded-full" />
              <div className="w-9 h-9 bg-black/10 dark:bg-white/10 rounded-2xl" />
            </div>
            <div className="h-9 w-36 bg-black/10 dark:bg-white/10 rounded-2xl" />
            <div className="h-3 w-24 bg-black/5 dark:bg-white/5 rounded-full" />
          </div>
        ))}
      </div>

      {/* Grid Layout: Chart & Recent Activity Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-80 bg-white dark:bg-white/5 rounded-[2.5rem] border border-black/5 dark:border-white/5 p-6" />
          <div className="h-64 bg-white dark:bg-white/5 rounded-[2.5rem] border border-black/5 dark:border-white/5 p-6" />
        </div>
        <div className="space-y-6">
          <div className="h-72 bg-white dark:bg-white/5 rounded-[2.5rem] border border-black/5 dark:border-white/5 p-6" />
        </div>
      </div>
    </div>
  );
}
