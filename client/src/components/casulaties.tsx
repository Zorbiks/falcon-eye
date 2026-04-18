import { Card } from 'src/components/ui/card'

const casualtyData = [
  { label: 'Civilian', value: '2,305', color: 'text-red-400' },
  { label: 'Military', value: '5,320', color: 'text-orange-400' },
  { label: 'US Military', value: '13', color: 'text-blue-400' },
  { label: 'Displaced', value: '3,211,850', color: 'text-yellow-400' },
]

export default function CasualtiesCard() {
  return (
    <Card className="bg-slate-950/80 border-slate-800/70 p-4 rounded-2xl w-full max-w-[600px] flex-auto">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-zinc-300 text-sm font-semibold">Casualties</h3>
        <p className="text-zinc-500 text-[10px] uppercase tracking-tight">
          HRANA / Hengaw / UNHCR aggregated + text extraction
          <span className="text-emerald-500 ml-2">• high confidence</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {casualtyData.map((item) => (
          <div key={item.label} className="bg-slate-950 border border-slate-800/70 p-4 rounded-xl shadow-inner">
            <p className="text-zinc-500 text-[11px] font-medium mb-1">{item.label}</p>
            <p className={`text-xl font-bold tracking-tight ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
