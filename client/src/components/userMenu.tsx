import { useState } from 'react'
import { ChevronDown, UserCircle2 } from 'lucide-react'
import { Button } from 'src/components/ui/button'
import { UserProfileDialog } from './userDialog'
import { UserBookmarksDrawer } from './bookmarksDrawer'
import { UserAccountMenuProps } from 'src/types/bookmarks'

export const UserAccountMenu = ({ user, token, onLogout }: UserAccountMenuProps) => {
  const [profileOpen, setProfileOpen] = useState(false)
  const [bookmarksOpen, setBookmarksOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 border-slate-700 bg-slate-950/70 text-slate-100 hover:bg-slate-900 hover:text-white"
        onClick={() => setProfileOpen(true)}
      >
        <UserCircle2 className="h-4 w-4 text-emerald-400" />
        <span className="max-w-[120px] truncate">{user.displayName}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-70" />
      </Button>

      <UserProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        user={user}
        onLogout={onLogout}
        onOpenBookmarks={() => setBookmarksOpen(true)}
      />

      <UserBookmarksDrawer open={bookmarksOpen} onOpenChange={setBookmarksOpen} token={token} />
    </>
  )
}
