import { useMemo } from 'react'
import { Card } from 'src/components/ui/card'
import { useGlobalData } from 'src/context'

const formatNumber = (value: number) => new Intl.NumberFormat().format(value)

export default function CasualtiesCard() {
  const { events } = useGlobalData()

  const metricData = useMemo(() => {
    const totals = events.reduce(
      (acc, event) => {
        const eventVolume = Number(event.events) || 0

        acc.totalFatalities += Number(event.fatalities) || 0
        acc.totalEventVolume += eventVolume
        acc.totalPopExposure += Number(event.popExposure) || 0

        if (event.subEventType?.trim() === 'Armed clash') {
          acc.armedClashes += eventVolume > 0 ? eventVolume : 1
        }

        if (event.critical) {
          acc.criticalAlerts += 1
        }

        return acc
      },
      {
        totalFatalities: 0,
        armedClashes: 0,
        criticalAlerts: 0,
        totalEventVolume: 0,
        totalPopExposure: 0,
      },
    )

    return [
      { label: 'Fatalities', value: formatNumber(totals.totalFatalities), color: 'text-red-500' },
      { label: 'Armed Clashes', value: formatNumber(totals.armedClashes), color: 'text-orange-400' },
      { label: 'Critical Alerts', value: formatNumber(totals.criticalAlerts), color: 'text-purple-400' },
      {
        label: 'Population Exposure',
        value: formatNumber(Math.round(totals.totalPopExposure)),
        color: 'text-yellow-400',
      },
    ]
  }, [events])

  return (
    <Card className="bg-slate-950/80 border-slate-800/70 p-4 rounded-2xl w-full max-w-[600px] flex-auto">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-zinc-300 text-sm font-semibold">Casualties</h3>
        <p className="text-zinc-500 text-[10px] uppercase tracking-tight">
          ACLED event-derived metrics
          <span className="text-emerald-500 ml-2">• high confidence</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metricData.map((item) => (
          <div key={item.label} className="bg-slate-950 border border-slate-800/70 p-4 rounded-xl shadow-inner">
            <p className="text-zinc-500 text-[11px] font-medium mb-1">{item.label}</p>
            <p className={`text-xl font-bold tracking-tight ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
