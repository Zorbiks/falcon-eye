import { useMemo, useState } from 'react'
import { Button } from 'src/components/ui/button'
import { Separator } from 'src/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { cn } from 'src/lib/utils'
import { useGlobalData } from 'src/context'
import eventThemeRegistry from 'src/data/eventThemeRegistry.json'
import type { EventTheme, FilterCategory } from 'src/types/categories'
import FilterDrawer from './filterDrawer'
import { RangeOption } from 'src/lib/eventFilter'

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

const ranges: RangeOption[] = ['All', '24h', '7 days', 'Two weeks']

export default function Filters() {
  const { events, isLoading, applyLocalFilters } = useGlobalData()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedRange, setSelectedRange] = useState<RangeOption>('All')

  const { filterCategories } = useMemo(() => {
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

    const categories: FilterCategory[] = registryCategories.map((label) => ({
      label,
      count: countsByCategory[label] ?? 0,
      color: categoryColorMap[label] ?? DEFAULT_CATEGORY_COLOR,
    }))

    console.log(countsByCategory)

    return {
      filterCategories: categories,
    }
  }, [events])

  const rootClass = cn(
    'flex w-full flex-col gap-2 rounded-xl bg-slate-950/80 p-2 md:flex-row md:items-center md:gap-3',
    isLoading ? 'pointer-events-none opacity-60' : '',
  )

  return (
    <div className={rootClass} aria-busy={isLoading} aria-live="polite">
      <Button
        variant="secondary"
        onClick={() => {
          setSelectedCategory('all')
          setSelectedRange('All')
          applyLocalFilters('all', 'All')
        }}
        className="h-8 w-full justify-center border border-slate-600 bg-slate-800/70 px-4 text-[10px] font-medium text-slate-100 hover:bg-slate-800 md:w-auto mb-[2px]"
      >
        All events
      </Button>

      <div className="w-full md:hidden">
        <Select
          value={selectedCategory}
          onValueChange={(val) => {
            setSelectedCategory(val)
            applyLocalFilters(val, selectedRange)
          }}
        >
          <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-900/70 text-slate-100">
            <SelectValue placeholder="Event category" />
          </SelectTrigger>
          <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
            <SelectItem value="all">All categories</SelectItem>
            {filterCategories.map((event) => (
              <SelectItem key={event.label} value={event.label}>
                {event.label} ({event.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full overflow-x-auto no-scrollbar md:w-auto hidden md:block">
        <div className="flex min-w-max items-center gap-2">
          {filterCategories.map((event) => (
            <button
              key={event.label}
              type="button"
              onClick={() => {
                setSelectedCategory(event.label)
                applyLocalFilters(event.label, selectedRange)
              }}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors group',
                event.label === selectedCategory
                  ? 'border-slate-600 bg-slate-800 text-slate-100'
                  : 'border-slate-800/70 bg-slate-900/60 hover:bg-slate-800/80 text-slate-200',
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full shadow-[0_0_5px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform',
                )}
                style={{ backgroundColor: event.color }}
              />
              <span className="text-[11px] font-medium whitespace-nowrap">
                {event.label} <span className="text-slate-300 ml-0.5">({event.count})</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <Separator orientation="vertical" className="mx-2 hidden h-6 bg-slate-700 md:block" />

      <div className="w-full md:hidden">
        <Select
          value={selectedRange}
          onValueChange={(val) => {
            setSelectedRange(val as RangeOption)
            applyLocalFilters(selectedCategory, val as RangeOption)
          }}
        >
          <SelectTrigger className="h-9 w-full border-slate-700 bg-slate-900/70 text-slate-100">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
            {ranges.map((range) => (
              <SelectItem key={range} value={range}>
                {range}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full overflow-x-auto no-scrollbar md:w-auto hidden md:block">
        <div className="flex min-w-max items-center gap-2">
          {ranges.map((range) => (
            <Button
              key={range}
              variant="ghost"
              onClick={() => {
                setSelectedRange(range)
                applyLocalFilters(selectedCategory, range as RangeOption)
              }}
              className={cn(
                'h-7 px-3 text-[11px] font-mono border transition-all',
                range === selectedRange
                  ? 'bg-slate-800 text-slate-100 border-slate-600'
                  : 'text-slate-300 border-transparent hover:border-slate-700 hover:slate-950/80',
              )}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      <Separator orientation="vertical" className="mx-2 hidden h-6 bg-slate-700 md:block" />

      <FilterDrawer />
    </div>
  )
}
