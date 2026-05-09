import * as React from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getCountryStatsByEventType } from 'src/services/statsService'
import type { EventTypeStats } from 'src/types/stats'

type Props = {
  country: string
  start?: string
  end?: string
}

const palette = ['#8b5cf6', '#06b6d4', '#f97316', '#22c55e', '#eab308', '#ef4444']

export default function EventTypeChart({ country, start, end }: Props) {
  const [data, setData] = React.useState<EventTypeStats[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true

    const loadData = async () => {
      setIsLoading(true)
      const response = await getCountryStatsByEventType(country, start, end)

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

  const chartData = data
    .slice()
    .sort((left, right) => right.totalEvents - left.totalEvents)
    .map((entry, index) => ({
      ...entry,
      fill: palette[index % palette.length],
    }))

  return (
    <ChartCard title="Events by type" description="Event and fatality totals grouped by event type.">
      {isLoading ? <Placeholder /> : <EventTypeBarChart data={chartData} />}
    </ChartCard>
  )
}

const EventTypeBarChart = ({ data }: { data: Array<EventTypeStats & { fill: string }> }) => (
  <ResponsiveContainer width="100%" height={320}>
    <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
      <XAxis type="number" stroke="#94a3b8" />
      <YAxis type="category" dataKey="eventType" stroke="#94a3b8" width={140} />
      <Tooltip
        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}
        labelStyle={{ color: '#e2e8f0' }}
      />
      <Legend />
      <Bar dataKey="totalEvents" name="Events" radius={[0, 4, 4, 0]}>
        {data.map((entry) => (
          <Cell key={entry.eventType} fill={entry.fill} />
        ))}
      </Bar>
      <Bar dataKey="totalFatalities" name="Fatalities" fill="#ef4444" radius={[0, 4, 4, 0]} />
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
