import { useState } from 'react'
import { CalendarDays, LogOut, Mail, UserCircle2 } from 'lucide-react'
import { Button } from 'src/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from 'src/components/ui/dialog'
import { Separator } from 'src/components/ui/separator'
import { formatDate } from 'src/utils/dateFormatter'
import { UserProfileDialogProps } from 'src/types/bookmarks'

export const UserProfileDialog = ({ open, onOpenChange, user, onLogout, onOpenBookmarks }: UserProfileDialogProps) => {
  const [isClosing, setIsClosing] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-slate-800 bg-slate-950 text-slate-100 sm:max-w-lg">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <UserCircle2 className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl text-slate-100">Account details</DialogTitle>
              <DialogDescription className="text-slate-400">Basic profile information.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Name</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">{user.displayName}</p>
              </div>
              <div className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-300">
                Signed in
              </div>
            </div>

            <Separator className="my-4 bg-slate-800" />

            <div className="grid gap-3 text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-emerald-400" />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Email</p>
                  <p className="mt-1 break-all text-slate-100">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Created at</p>
                  <p className="mt-1 text-slate-100">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-slate-700 bg-slate-900/60 text-slate-100 hover:bg-slate-800 hover:text-white"
              onClick={onOpenBookmarks}
            >
              Bookmarks
            </Button>
            <Button
              type="button"
              className="flex-1 bg-rose-600 text-white hover:bg-rose-500"
              disabled={isClosing}
              onClick={() => {
                setIsClosing(true)
                onLogout()
                onOpenChange(false)
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
