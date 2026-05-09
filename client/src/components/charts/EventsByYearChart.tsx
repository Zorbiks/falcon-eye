import * as React from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getCountryStatsByYear } from 'src/services/statsService'
import type { YearStats } from 'src/types/stats'

type Props = {
  country: string
  start?: string
  end?: string
}

export default function EventsByYearChart({ country, start, end }: Props) {
  const [data, setData] = React.useState<YearStats[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true

    const loadData = async () => {
      setIsLoading(true)
      const response = await getCountryStatsByYear(country, start, end)

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
  }, [country, start, end])

  return (
    <ChartCard title="Events and fatalities by year" description="Annual totals from the stats endpoint.">
      {isLoading ? <Placeholder /> : <YearChart data={data} />}
    </ChartCard>
  )
}

const YearChart = ({ data }: { data: YearStats[] }) => (
  <ResponsiveContainer width="100%" height={320}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
      <XAxis dataKey="year" stroke="#94a3b8" />
      <YAxis stroke="#94a3b8" />
      <Tooltip
        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}
        labelStyle={{ color: '#e2e8f0' }}
      />
      <Legend />
      <Bar dataKey="totalEvents" name="Events" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      <Bar dataKey="totalFatalities" name="Fatalities" fill="#ef4444" radius={[4, 4, 0, 0]} />
    </BarChart>
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

const Placeholder = () => <div className="h-[320px] rounded-lg bg-slate-900/60" />
