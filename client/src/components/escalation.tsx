import { Info } from 'lucide-react'
import { useGlobalData } from 'src/context'
import { ThreatAssessmentSkeleton } from './loaders'

export default function EscalationCard() {
  const { isLoading, hasEventsLoaded } = useGlobalData()

  if (isLoading && !hasEventsLoaded) {
    return <ThreatAssessmentSkeleton />
  }

  return (
    <div className="bg-slate-950/80 border border-slate-800/70 rounded-2xl p-5 w-full shadow-2xl flex-1 min-w-fit">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="text-sm font-semibold tracking-tight">Threat Assessment</span>
          <Info size={14} className="opacity-50" />
        </div>
        <div className="bg-orange-950/30 border border-orange-500/50 px-3 py-1 rounded-full">
          <div className="text-orange-500 text-[10px] font-bold uppercase tracking-widest">High Risk</div>
        </div>
      </div>

      <div className="flex items-center gap-10">
        <div className="relative flex flex-col items-center">
          <svg className="w-32 h-20">
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
              strokeDashoffset="65" /* Adjust this for the gauge level */
              className="shadow-[0_0_10px_#f97316]"
            />
          </svg>
          <span className="absolute bottom-1 text-3xl font-bold text-orange-500 font-mono">58</span>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest block mb-1">
              Pipeline Analytics
            </span>
            <div className="flex items-center gap-2 text-red-500">
              <span className="text-lg font-bold">↑ Critical Shift</span>
            </div>
          </div>

          <ul className="space-y-2 text-[11px] text-zinc-400 font-medium">
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
            <li className="flex items-start gap-2 text-zinc-500 italic">
              <span className="text-zinc-600">—</span>
              <span>Latest anomaly: Persistent kinetic activity in maritime corridors (Strait of Hormuz)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
