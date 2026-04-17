import { Shield, Activity, Wifi } from 'lucide-react'

export const Header = () => {
  return (
    <header className="h-14 w-full border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md flex items-center justify-between px-6 z-[1001]">
      {/* Left: Branding */}
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-emerald-600 rounded shadow-[0_0_15px_rgba(5,150,105,0.3)]">
          <Shield className="w-5 h-5 text-zinc-950" />
        </div>
        <div>
          <h1 className="text-sm font-black uppercase tracking-tighter leading-none text-zinc-100">
            Falcon <span className="text-emerald-500">Eye</span>
          </h1>
          <p className="text-[10px] font-mono text-zinc-500 leading-none mt-1">
            Open-source tracking · refreshed continuously
          </p>
        </div>
      </div>

      {/* Center: System Status (Informative) */}
      <div className="hidden md:flex items-center gap-8 font-mono text-[10px]">
        <div className="flex flex-col items-end">
          <span className="text-zinc-500 uppercase">Data_Stream</span>
          <div className="flex items-center gap-2 text-emerald-500">
            <Wifi size={10} />
            <span>ENCRYPTED_SSL</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-zinc-500 uppercase">Region</span>
          <span className="text-zinc-200">GLOBAL_MONITOR</span>
        </div>
      </div>

      {/* Right: Live Indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-full">
          <div className="relative h-2 w-2">
            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
            <div className="relative h-2 w-2 bg-emerald-500 rounded-full"></div>
          </div>
          <span className="text-[10px] font-bold text-zinc-300 tracking-widest uppercase">Live Analysis</span>
        </div>
      </div>
    </header>
  )
}
