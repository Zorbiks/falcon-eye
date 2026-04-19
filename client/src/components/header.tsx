import { Shield, Activity, Wifi } from 'lucide-react'

export const Header = () => {
  return (
    <header className=" w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between px-6 py-3 z-[1001]">
      <div className="flex items-center gap-2">
        <div>
          <img className="w-[45px]" src="/assets/logo.png" alt="falcon-eye logo" />
        </div>
        <div>
          <h1 className="text-sm font-black uppercase tracking-tighter leading-none text-slate-100">
            Falcon <span className="text-emerald-500">Eye</span>
          </h1>
          <p className="text-[10px] font-mono text-slate-300 leading-none mt-1">
            Open-source tracking · refreshed continuously
          </p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-8 font-mono text-[10px]">
        <div className="flex flex-col items-end">
          <span className="text-slate-300 uppercase">Data_Stream</span>
          <div className="flex items-center gap-2 text-emerald-500">
            <Wifi size={10} />
            <span>ENCRYPTED_SSL</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-slate-300 uppercase">Region</span>
          <span className="text-slate-100">GLOBAL</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-full">
          <div className="relative h-2 w-2">
            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
            <div className="relative h-2 w-2 bg-emerald-500 rounded-full"></div>
          </div>
          <span className="text-[10px] font-bold text-slate-100 tracking-widest uppercase">Live Analysis</span>
        </div>
      </div>
    </header>
  )
}
