import { useMemo, useState } from 'react'
import eventThemeRegistry from '../data/eventThemeRegistry.json'
import { useGlobalData } from '../context'
import type { CategoryStat, EventTheme } from '../types/categories'
import { StatsSkeleton } from './loaders'

const SOURCE_GROUP_ORDER = [
  'Western Media',
  'Regional Media',
  'Iranian Perspective',
  'Official / Primary',
  'OSINT / Analysis',
] as const

const SOURCE_GROUP_MAP: Record<string, (typeof SOURCE_GROUP_ORDER)[number]> = {
  'The Guardian': 'Western Media',
  'Al Jazeera': 'Regional Media',
  ACLED: 'Official / Primary',
  'Iran International': 'Iranian Perspective',
  'Tehran Times': 'Iranian Perspective',
  'Press TV': 'Iranian Perspective',
  'Middle East Eye': 'Regional Media',
  'Jerusalem Post': 'Regional Media',
  'Anadolu Agency': 'Regional Media',
  'Arab News': 'Regional Media',
  'UN News Middle East': 'Official / Primary',
  'US DoD News': 'Official / Primary',
  'UN Security Council': 'Official / Primary',
  'Atlantic Council': 'OSINT / Analysis',
  'Arms Control Association': 'OSINT / Analysis',
  Bellingcat: 'OSINT / Analysis',
  'Long War Journal': 'OSINT / Analysis',
}

const rawThemes = eventThemeRegistry as Record<string, EventTheme>
const categoryColorMap = Object.entries(rawThemes)
  .filter(([key]) => key !== 'default' && key.includes('|'))
  .reduce<Record<string, string>>((acc, [key, value]) => {
    const [category] = key.split('|')
    const normalizedCategory = category.trim()

    if (!acc[normalizedCategory]) {
      acc[normalizedCategory] = value.color
    }
    return acc
  }, {})

const registryCategories = Object.keys(categoryColorMap)

const DEFAULT_CATEGORY_COLOR = rawThemes.default?.color ?? '#7F8C8D'

export default function StatsCard() {
  const { events, feedData, isLoading, hasEventsLoaded, isFeedLoading, hasFeedLoaded } = useGlobalData()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

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

  const groupedSources = useMemo(() => {
    const uniqueSources = new Set<string>()

    feedData.forEach((item) => {
      const sourceName = item.source?.trim()
      if (sourceName) {
        uniqueSources.add(sourceName)
      }
    })

    if (events.length > 0) {
      uniqueSources.add('ACLED')
    }

    const groups = new Map<string, string[]>()

    SOURCE_GROUP_ORDER.forEach((group) => groups.set(group, []))

    Array.from(uniqueSources)
      .sort((a, b) => a.localeCompare(b))
      .forEach((sourceName) => {
        const group = SOURCE_GROUP_MAP[sourceName] ?? 'Regional Media'
        groups.get(group)?.push(sourceName)
      })

    return SOURCE_GROUP_ORDER.map((groupName) => ({
      groupName,
      sources: groups.get(groupName) ?? [],
    })).filter((group) => group.sources.length > 0)
  }, [events.length, feedData])

  const totalSources = useMemo(
    () => groupedSources.reduce((total, group) => total + group.sources.length, 0),
    [groupedSources],
  )

  const isGroupOpen = (groupName: string) => openGroups[groupName] ?? true

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !(prev[groupName] ?? true),
    }))
  }

  if ((isLoading && !hasEventsLoaded) || (isFeedLoading && !hasFeedLoaded)) {
    return (
      <div aria-busy="true" aria-live="polite">
        <StatsSkeleton />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 h-full min-w-[500px]">
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

      <div className="bg-slate-950/80 border border-slate-800/70 rounded-xl p-4 flex-1">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-slate-200 text-xs font-semibold uppercase tracking-wider">Sources</h3>
          <span className="text-[10px] text-slate-300 font-mono">
            <span className="text-emerald-500">{totalSources}</span> SOURCES
            <span className="text-slate-400 ml-2">
              ({feedData.length} feed + {events.length} ACLED events)
            </span>
          </span>
        </div>

        <div className="space-y-4 text-[11px]">
          {groupedSources.map((group) => (
            <div key={group.groupName} className="space-y-2">
              <button
                type="button"
                onClick={() => toggleGroup(group.groupName)}
                className="flex w-full items-center gap-2 text-left text-slate-100 font-semibold"
                aria-expanded={isGroupOpen(group.groupName)}
                aria-label={`Toggle ${group.groupName} sources`}
              >
                <span className="text-slate-400">{isGroupOpen(group.groupName) ? '⌄' : '›'}</span>
                <span>{group.groupName}</span>
                {group.groupName === 'Western Media' ? (
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_5px_#f97316]" />
                ) : null}
              </button>

              {isGroupOpen(group.groupName) ? (
                <div className="ml-4 border-l border-slate-800 pl-4 space-y-2 text-slate-300">
                  {group.sources.map((sourceName) => (
                    <div key={sourceName} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                      <span>{sourceName}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}

          {groupedSources.length === 0 ? <div className="text-slate-400">No sources available</div> : null}
        </div>
      </div>
    </div>
  )
}
