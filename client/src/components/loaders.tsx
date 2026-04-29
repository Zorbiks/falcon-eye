import { Skeleton } from './ui/skeleton'
import { Card, CardContent, CardHeader } from './ui/card'

/**
 * Card-shaped skeleton loader for widget components
 */
export const CardSkeleton = () => (
  <Card className="w-full max-w-xs border-slate-800/70 bg-slate-950/80">
    <CardHeader className="space-y-2">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="aspect-video w-full" />
    </CardContent>
  </Card>
)

/**
 * Map widget skeleton loader
 */
export const MapSkeleton = () => (
  <div className="w-[95%] overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80 shadow-sm">
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-8 w-20" />
      </div>

      <Skeleton className="h-[520px] w-full rounded-xl" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    </div>
  </div>
)

/**
 * Timeline widget skeleton loader
 */
export const TimelineSkeleton = () => (
  <Card className="flex-1 border-slate-800/70 bg-slate-950/80">
    <CardHeader className="space-y-2">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
)

/**
 * Stats widget skeleton loader
 */
export const StatsSkeleton = () => (
  <Card className="flex-1 border-slate-800/70 bg-slate-950/80">
    <CardHeader className="space-y-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent className="space-y-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </CardContent>
  </Card>
)

/**
 * Compact info card skeleton (for filters, casualties, escalation)
 */
export const CompactCardSkeleton = () => (
  <Card className="border-slate-800/70 bg-slate-950/80">
    <CardContent className="space-y-3 pt-6">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
    </CardContent>
  </Card>
)

/**
 * Filters bar skeleton loader
 */
export const FiltersSkeleton = () => (
  <div className="flex w-full items-center gap-3 overflow-x-auto rounded-xl border border-slate-800/70 bg-slate-950/80 p-2">
    <Skeleton className="h-8 w-32 rounded-md" />
    <div className="flex items-center gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-24 rounded-md" />
      ))}
    </div>
    <div className="mx-2 h-6 w-px bg-slate-800/70" />
    <div className="flex items-center gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-7 w-12 rounded-md" />
      ))}
    </div>
  </div>
)
