const intelEvents = [
  {
    title: 'Iran War Live Updates: Two Ships Are Fired On As Iran Says the Strait of Hormuz is Closed',
    category: 'Naval Incident',
    desc: "Iran's Revolutionary Guards said they were closing the strait until the U.S. blockade is lifted. Two ships reported being hit...",
    time: '3 minutes ago',
    severity: 8,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/50',
  },
]

export default function TimelineFeed() {
  return (
    <div className="bg-[#0b0b0b] border border-zinc-800/50 rounded-xl p-4 h-full overflow-y-auto no-scrollbar">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
          Timeline <span className="text-zinc-600 ml-1 font-mono">(381)</span>
        </h3>
      </div>

      <div className="space-y-6">
        {intelEvents.map((event, i) => (
          <div key={i} className="relative pl-6 border-l border-zinc-800 pb-2">
            <div
              className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${event.color.replace(
                'text',
                'bg',
              )} shadow-[0_0_8px_currentcolor]`}
            />

            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <h4 className="text-zinc-100 text-[13px] font-semibold leading-tight hover:text-emerald-400 cursor-pointer transition-colors">
                  {event.title}
                </h4>
                <div
                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${event.bgColor} ${event.color} border ${event.borderColor}`}
                >
                  {event.category}
                </div>
              </div>

              <p className="text-zinc-500 text-[11px] leading-relaxed line-clamp-2">{event.desc}</p>

              <div className="flex items-center gap-4 text-[10px] font-mono">
                <span className="text-zinc-600">{event.time}</span>
                <div className="flex items-center gap-1">
                  <span className="text-zinc-600 uppercase">Severity:</span>
                  <div className="flex gap-0.5">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 w-3 rounded-full ${
                          i < event.severity ? event.color.replace('text', 'bg') : 'bg-zinc-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
