import { useAuth } from 'src/context'
import { Link } from 'react-router-dom'
import { Button } from 'src/components/ui/button'
import { useLocation } from 'react-router-dom'
import { UserAccountMenu } from './user-account-menu'

export const Header = () => {
  const { pathname } = useLocation()
  const { user, token, isAuthenticated, signOut } = useAuth()

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
        {!isAuthenticated ? (
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
        ) : user ? (
          <UserAccountMenu user={user} token={token} onLogout={signOut} />
        ) : null}
        <Button
          asChild
          variant="outline"
          className="border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900 hover:text-white gap-2"
        >
          <Link to={pathname === '/analysis' ? '/home' : '/analysis'} className="flex items-center gap-2 px-3 py-1.5">
            <div className="relative h-2 w-2">
              <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
              <div className="relative h-2 w-2 bg-emerald-500 rounded-full"></div>
            </div>
            <span className="text-[10px] font-bold text-slate-100 tracking-widest uppercase">
              {pathname === '/analysis' ? 'Home' : 'Analysis'}
            </span>
          </Link>
        </Button>
      </div>
    </header>
  )
}
