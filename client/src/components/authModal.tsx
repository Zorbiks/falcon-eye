import React, { useState } from 'react'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog'
import { Label } from 'src/components/ui/label'
import { UserCircle, Lock, CheckCircle } from 'lucide-react'
import { useAuth } from 'src/context'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { error, isLoading, signIn, signUp, clearError } = useAuth()
  const [isLogin, setIsLogin] = useState(true)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const succeeded = isLogin ? await signIn({ username, password }) : await signUp({ username, password })

    if (succeeded) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-zinc-950/90 border border-zinc-800/80 rounded-3xl p-6 shadow-[0_0_120px_rgba(10,10,10,0.9)] backdrop-blur-xl [&_.overflow-y-auto]:!hidden">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <UserCircle size={20} className="text-zinc-600" />
            <DialogTitle className="text-sm font-semibold tracking-tight uppercase">
              {isLogin ? 'User Authentication' : 'Create New Account'}
            </DialogTitle>
          </div>
          <p className="text-[11px] text-zinc-600 mt-1">
            Access optional bookmarking and personalized workstation settings.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="username" className="text-[11px] text-zinc-500 font-medium">
              Username
            </Label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  clearError()
                  setUsername(e.target.value)
                }}
                placeholder="Enter your username"
                className="bg-zinc-900/50 border-zinc-800 h-10 pl-10 text-[12px] placeholder:text-zinc-700 focus:border-emerald-500/50 focus:shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[11px] text-zinc-500 font-medium">
              Access Cipher (Password)
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  clearError()
                  setPassword(e.target.value)
                }}
                placeholder="JWT encrypted storage"
                className="bg-zinc-900/50 border-zinc-800 h-10 pl-10 text-[12px] placeholder:text-zinc-700 focus:border-emerald-500/50 focus:shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
          >
            <CheckCircle size={18} />
            {isLoading ? 'Processing...' : isLogin ? 'Authenticate' : 'Generate Profile'}
          </Button>

          <div className="text-center mt-6">
            <p className="text-[11px] text-zinc-600">
              {isLogin ? "Don't have profile?" : 'Already authenticated?'}{' '}
              <button
                type="button"
                onClick={() => {
                  clearError()
                  setIsLogin(!isLogin)
                }}
                className="text-emerald-500 hover:text-emerald-400 font-medium transition-colors"
              >
                {isLogin ? 'Generate one now.' : 'Log in here.'}
              </button>
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
