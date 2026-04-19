import { ChevronRight, ChevronDown, LucideIcon } from 'lucide-react'
import { ReactElement } from 'react'

const categories = [
  { name: 'Diplomatic', percentage: 39, count: 147, color: 'bg-blue-500' },
  { name: 'Naval Incident', percentage: 31, count: 120, color: 'bg-cyan-500' },
  { name: 'Military Strike', percentage: 12, count: 47, color: 'bg-red-500' },
  { name: 'Proxy Conflict', percentage: 8, count: 31, color: 'bg-purple-500' },
  { name: 'Humanitarian', percentage: 5, count: 19, color: 'bg-green-500' },
  { name: 'Nuclear', percentage: 4, count: 17, color: 'bg-orange-500' },
]

export default function StatsCard() {
  return (
    <div className="flex flex-col gap-4 h-full min-w-[500px]">
      <div className="bg-slate-950/80 border border-slate-800/70 rounded-xl p-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-slate-200 text-xs font-semibold uppercase tracking-wider">Categories</h3>
          <span className="text-slate-300 text-[10px] font-mono">381 TOTAL</span>
        </div>

        <div className="space-y-5">
          {categories.map((cat) => (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium">
                <span className="text-slate-200">{cat.name}</span>
                <span className="text-slate-300">
                  {cat.percentage}% <span className="text-slate-400 ml-1">{cat.count}</span>
                </span>
              </div>
              <div className="h-1 w-full bg-slate-700/60 rounded-full overflow-hidden">
                <div
                  className={`${cat.color} h-full rounded-full opacity-80 shadow-[0_0_8px] shadow-current`}
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-950/80 border border-slate-800/70 rounded-xl p-4 flex-1">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-slate-200 text-xs font-semibold uppercase tracking-wider">Sources</h3>
          <span className="text-[10px] text-slate-300 font-mono">
            <span className="text-emerald-500">23</span>/24 <span className="text-orange-500 ml-1">(1 idle)</span>
          </span>
        </div>

        <div className="space-y-3 text-[11px]">
          <SourceItem label="News" count="13/14" icon={<ChevronRight size={14} />} status="orange" />
          <div className="space-y-2">
            <SourceItem label="Analysis" count="2/2" icon={<ChevronDown size={14} />} active />
            <div className="ml-6 space-y-2 text-slate-300 border-l border-slate-800 pl-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Arms Control Association
                </div>
                <span>1 day ago</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> The War Zone
                </div>
                <span>21 hours ago</span>
              </div>
            </div>
          </div>
          <SourceItem label="Regional Media" count="8/8" icon={<ChevronRight size={14} />} />
        </div>
      </div>
    </div>
  )
}

function SourceItem({
  label,
  count,
  icon,
  status = 'green',
  active = false,
}: {
  label: string
  count: string
  icon: ReactElement
  status?: string
  active?: boolean
}) {
  return (
    <div className={`flex justify-between items-center ${active ? 'text-slate-100' : 'text-slate-300'}`}>
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
        {status === 'orange' && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_5px_#f97316]" />}
      </div>
      <span className="font-mono opacity-60">{count}</span>
    </div>
  )
}
