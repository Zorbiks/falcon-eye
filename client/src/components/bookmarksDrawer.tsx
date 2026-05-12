import { useEffect, useState } from 'react'
import { Bookmark, CalendarClock, ExternalLink, MapPin, Tag, Trash2, X } from 'lucide-react'
import { Button } from 'src/components/ui/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from 'src/components/ui/drawer'
import { Separator } from 'src/components/ui/separator'
import {
  fetchMyEventBookmarks,
  fetchMyNewsBookmarks,
  removeEventBookmark,
  removeNewsBookmark,
} from 'src/services/bookmarkService'
import { formatDate } from 'src/utils/dateFormatter'
import type { EventBookmarkResponse, NewsBookmarkResponse, UserBookmarksDrawerProps } from 'src/types/bookmarks'

type DrawerBookmark =
  | {
      kind: 'event'
      id: number
      createdAt: string
      rowKey: string
      event: EventBookmarkResponse
    }
  | {
      kind: 'news'
      id: number
      createdAt: string
      link: string
      item: NewsBookmarkResponse
    }

export const UserBookmarksDrawer = ({ open, onOpenChange }: UserBookmarksDrawerProps) => {
  const [data, setData] = useState<DrawerBookmark[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [deletingKey, setDeletingKey] = useState<string | null>(null)

  const handleDeleteBookmark = async (bookmark: DrawerBookmark) => {
    const targetKey = `${bookmark.kind}-${bookmark.id}`
    setDeletingKey(targetKey)
    try {
      const success =
        bookmark.kind === 'event' ? await removeEventBookmark(bookmark.rowKey) : await removeNewsBookmark(bookmark.link)

      if (success) {
        setData((prev) => prev.filter((b) => !(b.kind === bookmark.kind && b.id === bookmark.id)))
      }
    } finally {
      setDeletingKey(null)
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
        const [eventBookmarks, newsBookmarks] = await Promise.all([fetchMyEventBookmarks(), fetchMyNewsBookmarks()])

        const combined: DrawerBookmark[] = [
          ...eventBookmarks.map((bookmark) => ({
            kind: 'event' as const,
            id: bookmark.id,
            createdAt: bookmark.createdAt,
            rowKey: bookmark.rowKey,
            event: bookmark,
          })),
          ...newsBookmarks.map((bookmark) => ({
            kind: 'news' as const,
            id: bookmark.id,
            createdAt: bookmark.createdAt,
            link: bookmark.link,
            item: bookmark,
          })),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        setData(combined)
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
                <article
                  key={`${bookmark.kind}-${bookmark.id}`}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {bookmark.kind === 'event'
                          ? bookmark.event.country ?? 'Saved event'
                          : bookmark.item.title ?? 'Saved article'}
                      </p>
                      <p className="mt-1 text-xs text-slate-400 break-all">
                        {bookmark.kind === 'event' ? bookmark.rowKey : bookmark.link}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                        Saved
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-auto p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10"
                        disabled={deletingKey === `${bookmark.kind}-${bookmark.id}`}
                        onClick={() => handleDeleteBookmark(bookmark)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator className="my-3 bg-slate-800" />

                  {bookmark.kind === 'event' ? (
                    <div className="grid gap-2 text-sm text-slate-300">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-emerald-400" />
                        <span>{bookmark.event.eventType ?? 'Unknown event type'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        <span>
                          {bookmark.event.region ?? 'Unknown region'} · {bookmark.event.country ?? 'Unknown country'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-slate-500" />
                        <span>{bookmark.event.week ?? 'Unknown date'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-2 text-sm text-slate-300">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-emerald-400" />
                        <span>{bookmark.item.source ?? 'Unknown source'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-slate-500" />
                        <span>{bookmark.item.publishedAt ?? 'Unknown publication date'}</span>
                      </div>
                      <a
                        href={bookmark.link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-2 text-sky-300 hover:text-sky-200"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open article
                      </a>
                    </div>
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
