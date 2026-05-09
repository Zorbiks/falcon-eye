import * as React from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getCountryStatsByEventType } from 'src/services/statsService'

type Props = {
  country: string
  start?: string
  end?: string
}

type SubEventItem = {
  name: string
  value: number
}

export default function SubEventBreakdownChart({ country, start, end }: Props) {
  const [data, setData] = React.useState<SubEventItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true

    const loadData = async () => {
      setIsLoading(true)
      const response = await getCountryStatsByEventType(country, start, end)
      const breakdown = new Map<string, number>()

      response.forEach((entry) => {
        Object.entries(entry.subEventBreakdown ?? {}).forEach(([name, count]) => {
          breakdown.set(name, (breakdown.get(name) ?? 0) + count)
        })
      })

      const chartData = Array.from(breakdown.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((left, right) => right.value - left.value)
        .slice(0, 8)

      if (!active) {
        return
      }

      setData(chartData)
      setIsLoading(false)
    }

    loadData()

    return () => {
      active = false
    }
  }, [country, start, end])

  return (
    <ChartCard title="Sub-event breakdown" description="Top sub-event categories aggregated from event types.">
      {isLoading ? <Placeholder /> : <SubEventChart data={data} />}
    </ChartCard>
  )
}

const SubEventChart = ({ data }: { data: SubEventItem[] }) => (
  <ResponsiveContainer width="100%" height={320}>
    <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
      <XAxis type="number" stroke="#94a3b8" />
      <YAxis type="category" dataKey="name" stroke="#94a3b8" width={150} />
      <Tooltip
        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}
        labelStyle={{ color: '#e2e8f0' }}
      />
      <Bar dataKey="value" name="Incidents" fill="#38bdf8" radius={[0, 4, 4, 0]} />
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
