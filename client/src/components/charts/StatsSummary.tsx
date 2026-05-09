import * as React from 'react'
import { getCountryStats } from 'src/services/statsService'
import type { CountryStats } from 'src/types/stats'

type Props = {
  country: string
}

const formatNumber = (value: number) => new Intl.NumberFormat().format(value)

export default function StatsSummary({ country }: Props) {
  const [stats, setStats] = React.useState<CountryStats | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let active = true

    const loadStats = async () => {
      setIsLoading(true)
      const response = await getCountryStats(country)

      if (!active) {
        return
      }

      setStats(response)
      setIsLoading(false)
    }

    loadStats()

    return () => {
      active = false
    }
  }, [country])

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <StatCard label="Country" value={isLoading ? 'Loading...' : country} />
      <StatCard label="Total events" value={isLoading ? 'Loading...' : formatNumber(stats?.totalEvents ?? 0)} />
      <StatCard label="Total fatalities" value={isLoading ? 'Loading...' : formatNumber(stats?.totalFatalities ?? 0)} />
    </section>
  )
}

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-slate-800/70 bg-slate-950/80 p-5 shadow-2xl">
    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{label}</p>
    <p className="mt-3 text-2xl font-semibold text-slate-100">{value}</p>
  </div>
)
