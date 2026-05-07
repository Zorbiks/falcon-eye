import { Info, TrendingUp, TrendingDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useGlobalData } from 'src/context'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Separator } from './ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { ThreatAssessmentSkeleton } from './loaders'

const getRiskLevel = (fatalities: number, criticalCount: number) => {
  if (fatalities > 120 || criticalCount > 20)
    return { label: 'High', color: 'text-red-500', bg: 'bg-red-950/30', border: 'border-red-500/50' }
  if (fatalities > 40 || criticalCount > 8)
    return { label: 'Elevated', color: 'text-orange-500', bg: 'bg-orange-950/30', border: 'border-orange-500/50' }
  return { label: 'Stable', color: 'text-green-500', bg: 'bg-green-950/30', border: 'border-green-500/50' }
}

export default function EscalationCard() {
  const { events, isLoading } = useGlobalData()
  const [infoOpen, setInfoOpen] = useState(false)

  const snapshot = useMemo(() => {
    const totalFatalities = events.reduce((sum, e) => sum + (Number(e.fatalities) || 0), 0)
    const criticalCount = events.filter((e) => e.critical).length
    const uniqueCountries = new Set(events.map((e) => e.country)).size
    const totalEvents = events.length

    // Top 3 hotspot countries by event count
    const countryEventMap: Record<string, number> = {}
    events.forEach((e) => {
      countryEventMap[e.country] = (countryEventMap[e.country] || 0) + 1
    })
    const topHotspots = Object.entries(countryEventMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([country]) => country)

    // Simple trend: compare first half vs second half
    const midpoint = Math.floor(events.length / 2)
    const firstHalf = events.slice(0, midpoint)
    const secondHalf = events.slice(midpoint)
    const firstHalfFatalities = firstHalf.reduce((sum, e) => sum + (Number(e.fatalities) || 0), 0)
    const secondHalfFatalities = secondHalf.reduce((sum, e) => sum + (Number(e.fatalities) || 0), 0)
    const trendPercent =
      firstHalfFatalities > 0
        ? Math.round(((secondHalfFatalities - firstHalfFatalities) / firstHalfFatalities) * 100)
        : 0
    const isTrendingUp = trendPercent > 0

    const riskLevel = getRiskLevel(totalFatalities, criticalCount)

    return {
      totalEvents,
      uniqueCountries,
      topHotspots,
      trendPercent: Math.abs(trendPercent),
      isTrendingUp,
      riskLevel,
    }
  }, [events])

  if (isLoading) {
    return <ThreatAssessmentSkeleton />
  }

  return (
    <Card className="w-full rounded-2xl border border-slate-800/70 bg-slate-950/80 p-4 shadow-2xl sm:p-5">
      <CardHeader className="mb-6 flex flex-col items-start justify-between gap-3 space-y-0 p-0 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-zinc-400">
          <CardTitle className="text-sm font-semibold tracking-tight text-zinc-400 sm:text-base">
            Operational Snapshot
          </CardTitle>
          <Popover open={infoOpen} onOpenChange={setInfoOpen}>
            <PopoverTrigger asChild>
              <button className="cursor-help">
                <Info size={14} className="opacity-50 hover:opacity-100 transition-opacity" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 text-sm bg-slate-900 border-slate-700">
              <p className="text-zinc-300">
                Quick overview of what's happening right now: total number of events, how many countries are affected,
                whether it's getting worse or better, and how serious things are.
              </p>
            </PopoverContent>
          </Popover>
        </div>
        <Badge
          variant="outline"
          className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${snapshot.riskLevel.border} ${snapshot.riskLevel.bg} ${snapshot.riskLevel.color}`}
        >
          {snapshot.riskLevel.label}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4 p-0">
        <div className="flex flex-col gap-4">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
              <p className="text-zinc-500 text-[9px] uppercase font-bold">Total Events</p>
              <p className="text-2xl font-bold text-zinc-100">{snapshot.totalEvents}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
              <p className="text-zinc-500 text-[9px] uppercase font-bold">Countries</p>
              <p className="text-2xl font-bold text-zinc-100">{snapshot.uniqueCountries}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
              <p className="text-zinc-500 text-[9px] uppercase font-bold">Trend</p>
              <div className="flex items-center gap-1">
                {snapshot.isTrendingUp ? (
                  <TrendingUp size={16} className="text-red-500" />
                ) : (
                  <TrendingDown size={16} className="text-green-500" />
                )}
                <p className={`text-lg font-bold ${snapshot.isTrendingUp ? 'text-red-500' : 'text-green-500'}`}>
                  {snapshot.isTrendingUp ? '+' : '-'}
                  {snapshot.trendPercent}%
                </p>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-800/70" />

          {/* Top Hotspots */}
          <div>
            <p className="text-zinc-500 text-[10px] uppercase font-bold mb-2">Top Hotspots</p>
            <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
              {snapshot.topHotspots.map((country, idx) => (
                <div key={country} className="flex items-center gap-2 text-[11px]">
                  <span className="text-zinc-600 font-bold">{idx + 1}.</span>
                  <span className="text-zinc-300">{country}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
