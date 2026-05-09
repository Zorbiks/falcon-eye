import * as React from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getCountryRiskStats } from 'src/services/statsService'
import type { AdminRiskStats } from 'src/types/stats'

type Props = {
  country: string
  start?: string
  end?: string
}

export default function RiskByAdminChart({ country, start, end }: Props) {
  const [data, setData] = React.useState<AdminRiskStats[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true

    const loadData = async () => {
      setIsLoading(true)
      const response = await getCountryRiskStats(country, start, end)

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
    .sort((left, right) => right.riskScore - left.riskScore)
    .slice(0, 8)

  return (
    <ChartCard title="Admin risk ranking" description="Top administrative areas by risk score.">
      {isLoading ? <Placeholder /> : <RiskChart data={chartData} />}
    </ChartCard>
  )
}

const RiskChart = ({ data }: { data: AdminRiskStats[] }) => (
  <ResponsiveContainer width="100%" height={320}>
    <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
      <XAxis type="number" stroke="#94a3b8" />
      <YAxis type="category" dataKey="admin1" stroke="#94a3b8" width={150} />
      <Tooltip
        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}
        labelStyle={{ color: '#e2e8f0' }}
      />
      <Bar dataKey="riskScore" name="Risk score" fill="#f59e0b" radius={[0, 4, 4, 0]} />
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
