import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, Lock, UserCircle } from 'lucide-react'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { useAuth } from 'src/context'

export default function SignupPage() {
  const navigate = useNavigate()
  const { error, isLoading, signUp, clearError } = useAuth()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const username = String(formData.get('username') ?? '')
    const password = String(formData.get('password') ?? '')

    const succeeded = await signUp({ username, password })

    if (succeeded) {
      navigate('/home')
    }
  }

  return (
    <section className="w-full h-[100vh] px-4 py-10 flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-[0_0_120px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="mb-5 space-y-1">
          <div className="flex items-center gap-2 text-slate-400 mb-5">
            <UserCircle size={18} className="text-emerald-500" />
            <p className="text-xs font-semibold uppercase tracking-[0.24em]">New Observer</p>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-100">Sign up</h1>
          <p className="text-sm text-slate-400">Create a secure account for your Falcon Eye workspace.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="username" className="text-xs text-slate-400">
              Username
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Choose a username"
              onChange={clearError}
              className="h-11 border-slate-800 bg-slate-900/60 text-slate-100 placeholder:text-slate-600 focus-visible:ring-emerald-500/30"
              required
            />
          </div>

          <div className="mb-10">
            <Label htmlFor="password" className="text-xs text-slate-400">
              Password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                onChange={clearError}
                className="h-11 pl-10 border-slate-800 bg-slate-900/60 text-slate-100 placeholder:text-slate-600 focus-visible:ring-emerald-500/30"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full bg-emerald-600 text-white hover:bg-emerald-500 mb-4"
          >
            <CheckCircle size={16} className="mr-2" />
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-emerald-500 hover:text-emerald-400">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </section>
  )
}
