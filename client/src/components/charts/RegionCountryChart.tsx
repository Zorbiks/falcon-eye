import * as React from 'react'
import { Bar, ComposedChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'
import { getRegionCountryStats } from 'src/services/statsService'
import type { RegionCountryStats } from 'src/types/stats'

type Props = {
  region: string
}

const getChartHeight = (itemCount: number): number => {
  const MIN_HEIGHT = 320
  const HEIGHT_PER_ITEM = 35
  return Math.max(MIN_HEIGHT, itemCount * HEIGHT_PER_ITEM + 60)
}

export default function RegionCountryChart({ region }: Props) {
  const [data, setData] = React.useState<RegionCountryStats[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true

    const loadData = async () => {
      setIsLoading(true)
      const response = await getRegionCountryStats(region)

      if (!active) {
        return
      }

      setData(response)
      setIsLoading(false)
    }

    loadData()

    return () => {
      active = false
    }
  }, [region])

  const chartData = data.slice().sort((left, right) => right.totalEvents - left.totalEvents)
  const chartHeight = getChartHeight(chartData.length)

  return (
    <ChartCard title="Regional country breakdown" description="Total events by country inside the selected region.">
      {isLoading ? <Placeholder /> : <RegionChart data={chartData} height={chartHeight} />}
    </ChartCard>
  )
}

const RegionChart = ({ data, height }: { data: RegionCountryStats[]; height: number }) => (
  <ResponsiveContainer width="100%" height={height}>
    <ComposedChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
      <XAxis type="number" stroke="#94a3b8" />
      <YAxis type="category" dataKey="country" stroke="#94a3b8" width={140} interval={0} />
      <Tooltip
        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}
        labelStyle={{ color: '#e2e8f0' }}
      />
      <Legend />
      <Bar dataKey="totalEvents" name="Events" fill="#22c55e" radius={[0, 4, 4, 0]} />
      <Bar dataKey="totalFatalities" name="Fatalities" fill="#ef4444" radius={[0, 4, 4, 0]} />
    </ComposedChart>
  </ResponsiveContainer>
)

const ChartCard = ({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) => (
  <section className="rounded-xl border border-slate-800/70 bg-slate-950/80 p-6 shadow-2xl">
    <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
    <p className="mt-1 text-sm text-slate-400">{description}</p>
    <div className="mt-4">{children}</div>
  </section>
)

const Placeholder = () => <div className="h-[320px] rounded-lg bg-slate-900/60 chart-placeholder" />
