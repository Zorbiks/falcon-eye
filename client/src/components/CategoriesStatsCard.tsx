import { useMemo } from 'react'
import { useGlobalData } from '../context'
import { categoryColorMap, DEFAULT_CATEGORY_COLOR, rawThemes, registryCategories } from '../constants/stats'
import { CategoriesStatsCardSkeleton } from './loaders'

export default function CategoriesStatsCard() {
  const { events, isLoading } = useGlobalData()

  const { categoryStats, totalEvents } = useMemo(() => {
    const countsByCategory: Record<string, number> = { Other: 0 }
    let total = 0

    events.forEach((event) => {
      const eventType = event.eventType?.trim()
      const subEventType = event.subEventType?.trim()
      const key = eventType && subEventType ? `${eventType}|${subEventType}` : ''
      const isMapped = Boolean(key && rawThemes[key])
      const category = isMapped && eventType ? eventType : 'Other'
      const eventCount = 1

      countsByCategory[category] = (countsByCategory[category] ?? 0) + eventCount
      total += eventCount
    })

    registryCategories.forEach((category) => {
      if (countsByCategory[category] === undefined) {
        countsByCategory[category] = 0
      }
    })

    const stats = Object.entries(countsByCategory)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total === 0 ? 0 : Math.round((count / total) * 100),
        color: name === 'Other' ? DEFAULT_CATEGORY_COLOR : categoryColorMap[name] ?? DEFAULT_CATEGORY_COLOR,
      }))
      .sort((a, b) => {
        if (a.name === 'Other') return 1
        if (b.name === 'Other') return -1
        return b.count - a.count
      })

    if (!stats.some((item) => item.name === 'Other')) {
      stats.push({
        name: 'Other',
        count: 0,
        percentage: 0,
        color: DEFAULT_CATEGORY_COLOR,
      })
    }

    return {
      categoryStats: stats,
      totalEvents: total,
    }
  }, [events])

  if (isLoading) {
    return <CategoriesStatsCardSkeleton />
  }

  return (
    <div className="flex h-full w-full min-w-0 flex-col gap-4">
      <div className="bg-slate-950/80 border border-slate-800/70 rounded-xl p-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-slate-200 text-xs font-semibold uppercase tracking-wider">Categories</h3>
          <span className="text-slate-300 text-[10px] font-mono">{totalEvents} TOTAL</span>
        </div>

        <div className="space-y-5">
          {categoryStats.map((cat) => (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium">
                <span className="text-slate-200">{cat.name}</span>
                <span className="text-slate-300">
                  {cat.percentage}% <span className="text-slate-400 ml-1">{cat.count}</span>
                </span>
              </div>
              <div className="h-1 w-full bg-slate-700/60 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full opacity-80 shadow-[0_0_8px] shadow-current"
                  style={{ backgroundColor: cat.color, width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
