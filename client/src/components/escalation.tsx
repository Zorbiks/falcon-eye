import { Info } from 'lucide-react'
import { useGlobalData } from 'src/context'
import { Badge } from './pages/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './pages/ui/card'
import { Separator } from './pages/ui/separator'
import { ThreatAssessmentSkeleton } from './loaders'

export default function EscalationCard() {
  const { isLoading, hasEventsLoaded } = useGlobalData()

  if (isLoading && !hasEventsLoaded) {
    return <ThreatAssessmentSkeleton />
  }

  return (
    <Card className="w-full flex-1 min-w-fit rounded-2xl border border-slate-800/70 bg-slate-950/80 p-5 shadow-2xl">
      <CardHeader className="mb-6 flex flex-row items-center justify-between space-y-0 p-0">
        <div className="flex items-center gap-2 text-zinc-400">
          <CardTitle className="text-sm font-semibold tracking-tight text-zinc-400">Threat Assessment</CardTitle>
          <Info size={14} className="opacity-50" />
        </div>
        <Badge
          variant="outline"
          className="border-orange-500/50 bg-orange-950/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-500"
        >
          High Risk
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4 p-0">
        <div className="flex items-center gap-10">
          <div className="relative flex flex-col items-center">
            <svg className="h-20 w-32">
              <path
                d="M 10 70 A 50 50 0 0 1 110 70"
                fill="none"
                stroke="#18181b"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 10 70 A 50 50 0 0 1 110 70"
                fill="none"
                stroke="#f97316"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="157"
                strokeDashoffset="65"
                className="shadow-[0_0_10px_#f97316]"
              />
            </svg>
            <span className="absolute bottom-1 text-3xl font-bold font-mono text-orange-500">58</span>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Pipeline Analytics
              </span>
              <div className="flex items-center gap-2 text-red-500">
                <span className="text-lg font-bold">↑ Critical Shift</span>
              </div>
            </div>

            <Separator className="bg-slate-800/70" />

            <ul className="space-y-2 text-[11px] font-medium text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-zinc-600">—</span>
                <span>
                  MapReduce calculated severity: <span className="text-zinc-200">6.2/10</span> across{' '}
                  <span className="text-zinc-200">1.2M points</span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-600">—</span>
                <span>
                  HBase ingress: <span className="text-zinc-200">241 events</span> detected in current{' '}
                  <span className="text-zinc-200">24h batch</span>
                </span>
              </li>
              <li className="flex items-start gap-2 italic text-zinc-500">
                <span className="text-zinc-600">—</span>
                <span>Latest anomaly: Persistent kinetic activity in maritime corridors (Strait of Hormuz)</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
