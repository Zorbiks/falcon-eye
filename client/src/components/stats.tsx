import { ChevronRight, ChevronDown } from 'lucide-react'
import { ReactElement, useMemo } from 'react'
import eventThemeRegistry from '../data/eventThemeRegistry.json'
import { useGlobalData } from '../context'

type EventTheme = {
  icon: string
  color: string
}

type CategoryStat = {
  name: string
  percentage: number
  count: number
  color: string
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
  const { events } = useGlobalData()

  const { categoryStats, totalEvents } = useMemo(() => {
    const countsByCategory: Record<string, number> = { Other: 0 }
    let total = 0

    events.forEach((event) => {
      const eventType = event.eventType?.trim()
      const subEventType = event.subEventType?.trim()
      const key = eventType && subEventType ? `${eventType}|${subEventType}` : ''
      const isMapped = Boolean(key && rawThemes[key])
      const category = isMapped && eventType ? eventType : 'Other'
      const eventCount = Number.isFinite(event.events) && event.events > 0 ? event.events : 1

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
            <span className="text-emerald-500">23</span>/24 <span className="text-orange-500 ml-1">(1 idle)</span>
          </span>
        </div>

        <div className="space-y-3 text-[11px]">
          <SourceItem label="News" count="13/14" icon={<ChevronRight size={14} />} status="orange" />
          <div className="space-y-2">
            <SourceItem label="Analysis" count="2/2" icon={<ChevronDown size={14} />} active />
            <div className="ml-6 space-y-2 text-slate-300 border-l border-slate-800 pl-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Arms Control Association
                </div>
                <span>1 day ago</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> The War Zone
                </div>
                <span>21 hours ago</span>
              </div>
            </div>
          </div>
          <SourceItem label="Regional Media" count="8/8" icon={<ChevronRight size={14} />} />
        </div>
      </div>
    </div>
  )
}

function SourceItem({
  label,
  count,
  icon,
  status = 'green',
  active = false,
}: {
  label: string
  count: string
  icon: ReactElement
  status?: string
  active?: boolean
}) {
  return (
    <div className={`flex justify-between items-center ${active ? 'text-slate-100' : 'text-slate-300'}`}>
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
        {status === 'orange' && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_5px_#f97316]" />}
      </div>
      <span className="font-mono opacity-60">{count}</span>
    </div>
  )
}
