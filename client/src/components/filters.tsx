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
    <div className="flex items-center gap-3 bg-[#0b0b0b] p-2  w-full overflow-x-auto no-scrollbar ">
      {/* Primary Selector */}
      <Button
        variant="secondary"
        className="bg-zinc-800/50 text-zinc-100 hover:bg-zinc-800 border border-zinc-700 h-8 text-xs font-medium px-4"
      >
        All events (383)
      </Button>

      {/* Event Category Chips */}
      <div className="flex items-center gap-2">
        {eventTypes.map((event) => (
          <button
            key={event.label}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-800/80 bg-zinc-900/30 hover:bg-zinc-800/50 transition-colors group"
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                event.color,
                'shadow-[0_0_5px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform',
              )}
            />
            <span className="text-[11px] text-zinc-400 font-medium whitespace-nowrap">
              {event.label} <span className="text-zinc-600 ml-0.5">({event.count})</span>
            </span>
          </button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6 bg-zinc-800 mx-2" />

      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-zinc-500 tracking-tighter mr-1 uppercase">Range</span>
        {ranges.map((range) => (
          <Button
            key={range}
            variant="ghost"
            className={cn(
              'h-7 px-3 text-[11px] font-mono border transition-all',
              range === 'All'
                ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                : 'text-zinc-500 border-transparent hover:border-zinc-800 hover:text-zinc-300',
            )}
          >
            {range}
          </Button>
        ))}
      </div>
    </div>
  )
}
