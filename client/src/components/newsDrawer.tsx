import { Bookmark, BookMarked, ExternalLink } from 'lucide-react'
import { useMemo, useState } from 'react'

import type { FeedCard } from '../types/feed'
import { formatPublishedDate } from '../utils/timelineFeed'
import { addNewsBookmark, removeNewsBookmark } from 'src/services/bookmarkService'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from './ui/drawer'

type TimelineDrawerProps = {
  event: FeedCard | null
  bookmarkId: string
  token: string | null
  isBookmarked: (id: string) => boolean
  onToggleBookmark: (event: FeedCard) => void
  onClose: () => void
}

export default function TimelineDrawer({
  event,
  bookmarkId,
  token,
  isBookmarked,
  onToggleBookmark,
  onClose,
}: TimelineDrawerProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const publishedDate = event ? formatPublishedDate(event.publishedAt) : ''

  const handleToggleBookmark = async (feedCard: FeedCard) => {
    if (!token) return

    setIsUpdating(true)
    try {
      if (isBookmarked(bookmarkId)) {
        await removeNewsBookmark(feedCard.link)
      } else {
        await addNewsBookmark(feedCard)
      }
      onToggleBookmark(feedCard)
    } finally {
      setIsUpdating(false)
    }
  }

  // create a safe, truncated description for the drawer
  const maxDescriptionLength = 400
  const { truncatedDescription, hasMore } = useMemo(() => {
    if (!event?.description) return { truncatedDescription: '', hasMore: false }
    const cleaned = event.description.replace(/\s+/g, ' ').trim()
    const hasMoreLocal = cleaned.length > maxDescriptionLength
    const truncated = hasMoreLocal ? cleaned.slice(0, maxDescriptionLength).trim() + '...' : cleaned
    return { truncatedDescription: truncated, hasMore: hasMoreLocal }
  }, [event])

  return (
    <Drawer open={Boolean(event)} onOpenChange={(open: boolean) => !open && onClose()} direction="right">
      <DrawerContent className="inset-y-0 right-0 left-auto mt-0 h-full w-full max-w-[420px] gap-0 overflow-hidden rounded-none border-l border-slate-800 border-t-0 bg-slate-950 p-0 font-sans text-slate-100 antialiased shadow-2xl sm:max-w-[420px] [&>div:first-child]:hidden">
        {event ? (
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-800 px-5 py-4">
              <DrawerHeader className="space-y-3 text-left">
                {event.imageUrl ? (
                  <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
                    <img src={event.imageUrl} alt={event.title} className="h-48 w-full object-cover" />
                  </div>
                ) : null}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-sky-500/40 bg-sky-900/10 text-sky-300">
                    {event.source}
                  </Badge>
                </div>
                <DrawerTitle className="text-balance text-xl font-semibold leading-tight tracking-tight text-slate-50">
                  {event.title}
                </DrawerTitle>
                <DrawerDescription className="text-sm text-slate-400">
                  {event.sourceLabel} · {event.publishedLabel}
                </DrawerDescription>
              </DrawerHeader>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="mb-6">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Description
                </div>
                <p className="text-sm leading-7 text-slate-300">{truncatedDescription}</p>
                {hasMore ? (
                  <div className="mt-3 text-sm text-slate-400">
                    The article is truncated here — open the full article to read the complete content.
                  </div>
                ) : null}
              </div>

              <div className="mb-6 grid gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Source</span>
                  <span className="font-medium text-slate-200">{event.sourceLabel}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Published</span>
                  <span className="font-mono text-xs text-slate-200">{publishedDate}</span>
                </div>
              </div>
            </div>

            <div className="mt-auto border-t border-slate-800 bg-slate-950/95 px-5 py-4 backdrop-blur-sm">
              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  className="w-full border-slate-700 bg-transparent hover:bg-slate-900 text-slate-200 hover:text-slate-200"
                  disabled={isUpdating || !token}
                  onClick={() => handleToggleBookmark(event)}
                >
                  {isBookmarked(bookmarkId) ? (
                    <BookMarked className="mr-2 h-4 w-4 text-emerald-400" />
                  ) : (
                    <Bookmark className="mr-2 h-4 w-4" />
                  )}
                  {isBookmarked(bookmarkId) ? 'Saved article' : 'Bookmark article'}
                </Button>

                <Button asChild className="w-full bg-sky-500 text-slate-950 hover:bg-sky-400">
                  <a href={event.link} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open article
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-slate-700 bg-transparent text-slate-200 hover:bg-slate-900"
                  onClick={onClose}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}
