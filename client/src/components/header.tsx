import { Link } from 'react-router-dom'
import { Button } from 'src/components/ui/button'
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
          <p className="text-[10px] font-mono text-slate-300 leading-none mt-2">Open-source tracking</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900 hover:text-white"
          >
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild size="sm" className="bg-emerald-600 text-white hover:bg-emerald-500">
            <Link to="/signup">Sign up</Link>
          </Button>
        </div>
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-full">
          <div className="relative h-2 w-2">
            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
            <div className="relative h-2 w-2 bg-emerald-500 rounded-full"></div>
          </div>
          <span className="text-[10px] font-bold text-slate-100 tracking-widest uppercase">Analysis</span>
        </div>
      </div>
    </header>
  )
}
