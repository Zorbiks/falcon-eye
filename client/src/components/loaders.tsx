import { Skeleton } from 'src/components/ui/skeleton'

export function CategoriesStatsCardSkeleton() {
  return (
    <div className="flex h-full w-full min-w-0 flex-col gap-4">
      <div className="bg-slate-950/80 border border-slate-800/70 rounded-xl p-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-2.5 w-20 bg-slate-800" />
          <Skeleton className="h-2.5 w-14 bg-slate-800" />
        </div>

        <div className="space-y-5">
          {[72, 45, 28, 15].map((width, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <Skeleton className="h-2.5 w-24 bg-slate-800" />
                <Skeleton className="h-2.5 w-12 bg-slate-800" />
              </div>
              <div className="h-1 w-full bg-slate-700/60 rounded-full overflow-hidden">
                <Skeleton className="h-full rounded-full bg-slate-700" style={{ width: `${width}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SourcesSkeleton() {
  return (
    <div className="bg-slate-950/80 border border-slate-800/70 rounded-xl p-4 flex-1">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-2.5 w-14 bg-slate-800" />
        <Skeleton className="h-2.5 w-16 bg-slate-800" />
      </div>

      <div className="space-y-4">
        {/* One expanded group */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-2.5 w-2.5 rounded-sm bg-slate-800" />
            <Skeleton className="h-2.5 w-28 bg-slate-800" />
          </div>
          <div className="ml-4 border-l border-slate-800 pl-4 space-y-2">
            {[140, 110].map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-2 w-2 rounded-full bg-slate-700 flex-shrink-0" />
                <Skeleton className="h-2.5 bg-slate-800" style={{ width: w }} />
              </div>
            ))}
          </div>
        </div>

        {/* Two collapsed groups */}
        {[120, 88].map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-2.5 w-2.5 rounded-sm bg-slate-800" />
            <Skeleton className="h-2.5 bg-slate-800" style={{ width: w }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function EventPanelSkeleton() {
  return (
    <div className="flex flex-col gap-4 h-full min-w-[500px]">
      <CategoriesStatsCardSkeleton />
      <SourcesSkeleton />
    </div>
  )
}

export function TimelineSkeleton() {
  return (
    <div className="bg-slate-950/80 border border-slate-800/70 rounded-xl p-4 h-[560px] flex-1 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-2.5 w-14 bg-slate-800" />
          <Skeleton className="h-2.5 w-7 bg-slate-800" />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden pr-1">
        <div className="space-y-6">
          {[65, 75, 58, 70].map((titleWidth, i) => (
            <div key={i} className="relative w-full pl-6 pr-2 border-l border-slate-800 pb-2">
              <Skeleton className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-700" />

              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <Skeleton className="h-3 bg-slate-800" style={{ width: `${titleWidth}%` }} />
                  <Skeleton className="h-4 w-13 rounded bg-slate-800 flex-shrink-0" />
                </div>

                <Skeleton className="h-2.5 w-full bg-slate-800" />
                <Skeleton className="h-2.5 w-4/5 bg-slate-800" />

                <div className="flex items-center gap-4">
                  <Skeleton className="h-2 w-14 bg-slate-800" />
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-2 w-11 bg-slate-800" />
                    <div className="flex gap-0.5">
                      {Array.from({ length: 10 }).map((_, j) => (
                        <Skeleton key={j} className="h-1.5 w-3 rounded-full bg-slate-700" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-slate-800 pt-3">
          <Skeleton className="h-2.5 w-44 bg-slate-800" />
        </div>
      </div>
    </div>
  )
}

export function CasualtiesCardSkeleton() {
  return (
    <div className="bg-slate-950/80 border border-slate-800/70 p-4 rounded-2xl w-full max-w-[600px] flex-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-4 w-20 bg-slate-800" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-36 bg-slate-800/70" />
          <Skeleton className="h-3 w-24 bg-slate-800/70" />
        </div>
      </div>

      {/* Grid of metric cells */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-slate-950 border border-slate-800/70 p-4 rounded-xl shadow-inner">
            <Skeleton className="h-3 w-24 bg-slate-800/60 mb-3" />
            <Skeleton className="h-6 w-16 bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ThreatAssessmentSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-slate-800/70 bg-slate-950/80 p-4 shadow-2xl sm:p-5">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-36 bg-slate-800" />
          <Skeleton className="h-3.5 w-3.5 rounded-full bg-slate-800/70" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full bg-slate-800/70" />
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
              <Skeleton className="mb-2 h-2.5 w-16 bg-slate-800/70" />
              <Skeleton className="h-7 w-14 bg-slate-800" />
            </div>
          ))}
        </div>

        <div className="h-px w-full bg-slate-800/70" />

        <div>
          <Skeleton className="mb-2 h-2.5 w-20 bg-slate-800/70" />
          <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
            {[90, 120, 80].map((width, index) => (
              <div key={index} className="flex items-center gap-2">
                <Skeleton className="h-2.5 w-3 bg-slate-800/50" />
                <Skeleton className="h-2.5 bg-slate-800/70" style={{ width: `${width}px` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
