import { Skeleton } from './ui/skeleton'
import { Card, CardContent, CardHeader } from './ui/card'

/**
 * Card-shaped skeleton loader for widget components
 */
export const CardSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton variant="text" className="h-6 w-1/3" />
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton variant="text" className="h-4 w-full" />
      <Skeleton variant="text" className="h-4 w-5/6" />
      <Skeleton variant="rect" className="h-24 w-full" />
    </CardContent>
  </Card>
)

/**
 * Map widget skeleton loader
 */
export const MapSkeleton = () => (
  <div className="w-[95%] rounded-lg border bg-card shadow-sm overflow-hidden">
    <div className="h-96 bg-slate-200 dark:bg-slate-700 animate-pulse" />
  </div>
)

/**
 * Timeline widget skeleton loader
 */
export const TimelineSkeleton = () => (
  <Card className="flex-1">
    <CardHeader>
      <Skeleton variant="text" className="h-6 w-1/3" />
    </CardHeader>
    <CardContent className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton variant="circle" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="h-4 w-3/4" />
            <Skeleton variant="text" className="h-3 w-1/2" />
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
  <Card className="flex-1">
    <CardHeader>
      <Skeleton variant="text" className="h-6 w-1/3" />
    </CardHeader>
    <CardContent className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" className="h-4 w-1/4" />
          <Skeleton variant="text" className="h-6 w-1/2" />
        </div>
      ))}
    </CardContent>
  </Card>
)

/**
 * Compact info card skeleton (for filters, casualties, escalation)
 */
export const CompactCardSkeleton = () => (
  <Card>
    <CardContent className="pt-6 space-y-3">
      <Skeleton variant="text" className="h-5 w-1/3" />
      <Skeleton variant="text" className="h-8 w-1/2" />
      <Skeleton variant="text" className="h-4 w-full" />
    </CardContent>
  </Card>
)

/**
 * Filters bar skeleton loader
 */
export const FiltersSkeleton = () => (
  <div className="flex items-center gap-3 bg-slate-950/80 rounded-xl p-2 w-full overflow-x-auto">
    <Skeleton variant="default" className="h-8 w-32 rounded-md" />
    <div className="flex items-center gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} variant="default" className="h-8 w-24 rounded-md" />
      ))}
    </div>
    <div className="h-6 bg-slate-700/50 rounded mx-2" style={{ width: '1px' }} />
    <div className="flex items-center gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} variant="default" className="h-7 w-12 rounded-md" />
      ))}
    </div>
  </div>
)
