import { Badge } from 'src/components/ui/badge'
import { Button } from 'src/components/ui/button'
import { Separator } from 'src/components/ui/separator'
import { cn } from 'src/lib/utils'

const eventTypes = [
  { label: 'Military Strike', count: 47, color: 'bg-red-500' },
  { label: 'Diplomatic', count: 147, color: 'bg-blue-500' },
  { label: 'Naval Incident', count: 121, color: 'bg-cyan-500' },
  { label: 'Nuclear', count: 18, color: 'bg-orange-500' },
  { label: 'Proxy Conflict', count: 31, color: 'bg-purple-500' },
  { label: 'Humanitarian', count: 19, color: 'bg-green-500' },
]

const ranges = ['24h', '7d', '30d', 'All']

export default function Filters() {
  return (
    <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800/70 rounded-xl p-2 w-full overflow-x-auto no-scrollbar">
      {/* Primary Selector */}
      <Button
        variant="secondary"
        className="bg-slate-800/70 text-slate-100 hover:bg-slate-800 border border-slate-600 h-8 text-xs font-medium px-4"
      >
        All events (383)
      </Button>

      {/* Event Category Chips */}
      <div className="flex items-center gap-2">
        {eventTypes.map((event) => (
          <button
            key={event.label}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-800/70 bg-slate-900/60 hover:bg-slate-800/80 transition-colors group"
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                event.color,
                'shadow-[0_0_5px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform',
              )}
            />
            <span className="text-[11px] text-slate-200 font-medium whitespace-nowrap">
              {event.label} <span className="text-slate-300 ml-0.5">({event.count})</span>
            </span>
          </button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6 bg-slate-700 mx-2" />

      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-300 tracking-tighter mr-1 uppercase">Range</span>
        {ranges.map((range) => (
          <Button
            key={range}
            variant="ghost"
            className={cn(
              'h-7 px-3 text-[11px] font-mono border transition-all',
              range === 'All'
                ? 'bg-slate-800 text-slate-100 border-slate-600'
                : 'text-slate-300 border-transparent hover:border-slate-700 hover:text-slate-100',
            )}
          >
            {range}
          </Button>
        ))}
      </div>
    </div>
  )
}
