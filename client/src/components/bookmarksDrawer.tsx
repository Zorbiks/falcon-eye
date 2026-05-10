import { useEffect, useState } from 'react'
import { Bookmark, CalendarClock, MapPin, Tag, Trash2, X } from 'lucide-react'
import { Button } from 'src/components/ui/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from 'src/components/ui/drawer'
import { Separator } from 'src/components/ui/separator'
import { fetchMyBookmarks, removeBookmark } from 'src/services/bookmarkService'
import { formatDate } from 'src/utils/dateFormatter'
import type { BookmarkResponse, UserBookmarksDrawerProps } from 'src/types/bookmarks'

export const UserBookmarksDrawer = ({ open, onOpenChange }: UserBookmarksDrawerProps) => {
  const [data, setData] = useState<BookmarkResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDeleteBookmark = async (bookmarkId: number, rowKey: string) => {
    setDeletingId(bookmarkId)
    try {
      const success = await removeBookmark(rowKey)
      if (success) {
        setData((prev) => prev.filter((b) => b.id !== bookmarkId))
      }
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    if (!open) {
      return
    }

    const loadBookmarks = async () => {
      setIsLoading(true)
      setIsError(false)
      try {
        const bookmarks = await fetchMyBookmarks()
        console.log(bookmarks)
        setData(bookmarks)
      } catch (error) {
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }

    loadBookmarks()
  }, [open])

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-slate-800 bg-slate-950 text-slate-100">
        <DrawerHeader className="space-y-2 border-b border-slate-800 px-4 pb-4 text-left">
          <DrawerTitle className="text-xl text-slate-100">Saved bookmarks</DrawerTitle>
          <DrawerDescription className="text-slate-400">
            Events and feeds you saved in your Falcon Eye workspace.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoading && (
            <div className="space-y-3">
              <div className="h-24 rounded-xl border border-slate-800 bg-slate-900/60 animate-pulse" />
              <div className="h-24 rounded-xl border border-slate-800 bg-slate-900/60 animate-pulse" />
            </div>
          )}

          {isError && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              We could not load your bookmarks right now.
            </div>
          )}

          {data && data.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-10 text-center">
              <Bookmark className="mb-3 h-10 w-10 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-100">No bookmarks yet</h3>
              <p className="mt-2 text-sm text-slate-400">
                Save events and feed items to keep them here for quick access.
              </p>
            </div>
          )}

          {data && data.length > 0 && (
            <div className="space-y-3">
              {data.map((bookmark) => (
                <article key={bookmark.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{bookmark.event?.country ?? 'Saved item'}</p>
                      <p className="mt-1 text-xs text-slate-400 break-all">{bookmark.rowKey}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                        Saved
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-auto p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10"
                        disabled={deletingId === bookmark.id}
                        onClick={() => handleDeleteBookmark(bookmark.id, bookmark.rowKey)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator className="my-3 bg-slate-800" />

                  {bookmark.event ? (
                    <div className="grid gap-2 text-sm text-slate-300">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-emerald-400" />
                        <span>{bookmark.event.eventType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        <span>
                          {bookmark.event.region} · {bookmark.event.country}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-slate-500" />
                        <span>{bookmark.event.week}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-300">
                      This saved item is no longer available in the event dataset.
                    </p>
                  )}

                  <div className="mt-3 text-xs text-slate-500">Saved on {formatDate(bookmark.createdAt)}</div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-800 p-4">
          <Button
            variant="outline"
            className="w-full border-slate-700 bg-slate-900/60 text-slate-100 hover:bg-slate-800 hover:text-white"
            onClick={() => onOpenChange(false)}
          >
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
