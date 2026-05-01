import { useEffect, useMemo, useState } from 'react'
import { Bookmark, BookMarked, ExternalLink } from 'lucide-react'
import { useGlobalData } from '../context'
import type { FeedCard } from '../types/feed'
import { formatPublishedDate, getRelativeTime } from '../utils/timelineFeed'
import { Button } from './pages/ui/button'
import { Badge } from './pages/ui/badge'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from './pages/ui/drawer'
import { TimelineSkeleton } from './loaders'

export default function TimelineFeed() {
  const { feedData, isFeedLoading, hasFeedLoaded, toggleBookmark, isBookmarked } = useGlobalData()
  const [selectedEvent, setSelectedEvent] = useState<FeedCard | null>(null)
  const [visibleCount, setVisibleCount] = useState(8)
  const loadStep = 6

  const feedEvents = useMemo<FeedCard[] | []>(() => {
    return feedData.map((item) => ({
      ...item,
      sourceLabel: item.source,
      publishedLabel: getRelativeTime(item.publishedAt),
    }))
  }, [feedData])

  useEffect(() => {
    setVisibleCount(8)
  }, [feedEvents?.length])

  const selectedTopicLabel = useMemo(() => selectedEvent?.source ?? 'General', [selectedEvent])
  const visibleEvents = useMemo(() => feedEvents?.slice(0, visibleCount), [feedEvents, visibleCount])
  const hasMoreEvents = visibleCount < feedEvents.length
  const selectedPublishedDate = useMemo(
    () => (selectedEvent ? formatPublishedDate(selectedEvent.publishedAt) : ''),
    [selectedEvent],
  )
  const selectedBookmarkId = selectedEvent ? `feed-${selectedEvent.link}` : ''

  const handleTimelineScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!hasMoreEvents) {
      return
    }

    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
    const nearBottom = scrollHeight - scrollTop - clientHeight < 80

    if (nearBottom) {
      setVisibleCount((prev) => Math.min(prev + loadStep, feedEvents.length))
    }
  }

  if (isFeedLoading && !hasFeedLoaded) {
    return <TimelineSkeleton />
  }

  return (
    <>
      <Drawer
        open={Boolean(selectedEvent)}
        onOpenChange={(open: boolean) => !open && setSelectedEvent(null)}
        direction="right"
      >
        <DrawerContent className="inset-y-0 right-0 left-auto mt-0 h-full w-full max-w-[420px] gap-0 overflow-hidden rounded-none border-l border-slate-800 border-t-0 bg-slate-950 p-0 font-sans text-slate-100 antialiased shadow-2xl sm:max-w-[420px] [&>div:first-child]:hidden">
          {selectedEvent ? (
            <div className="flex h-full flex-col">
              <div className="border-b border-slate-800 px-5 py-4">
                <DrawerHeader className="space-y-3 text-left">
                  {selectedEvent.imageUrl ? (
                    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
                      <img
                        src={selectedEvent.imageUrl}
                        alt={selectedEvent.title}
                        className="h-48 w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-sky-500/40 bg-sky-900/10 text-sky-300">
                      {selectedTopicLabel}
                    </Badge>
                  </div>
                  <DrawerTitle className="text-balance text-xl font-semibold leading-tight tracking-tight text-slate-50">
                    {selectedEvent.title}
                  </DrawerTitle>
                  <DrawerDescription className="text-sm text-slate-400">
                    {selectedEvent.sourceLabel} · {selectedEvent.publishedLabel}
                  </DrawerDescription>
                </DrawerHeader>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                {/* severity removed — working only with feed JSON fields */}

                <div className="mb-6">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Description
                  </div>
                  <p className="text-sm leading-7 text-slate-300">{selectedEvent.description}</p>
                </div>

                <div className="mb-6 grid gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Source</span>
                    <span className="font-medium text-slate-200">{selectedEvent.sourceLabel}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Published</span>
                    <span className="font-mono text-xs text-slate-200">{selectedPublishedDate}</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto border-t border-slate-800 bg-slate-950/95 px-5 py-4 backdrop-blur-sm">
                <div className="flex flex-col gap-3">
                  <Button
                    variant="outline"
                    className="w-full border-slate-700 bg-transparent hover:bg-slate-900 text-slate-200 hover:text-slate-200"
                    onClick={() =>
                      toggleBookmark({
                        id: selectedBookmarkId,
                        kind: 'feed',
                        title: selectedEvent.title,
                        subtitle: `${selectedEvent.sourceLabel} · ${selectedEvent.publishedLabel}`,
                      })
                    }
                  >
                    {isBookmarked(selectedBookmarkId) ? (
                      <BookMarked className="mr-2 h-4 w-4 text-emerald-400" />
                    ) : (
                      <Bookmark className="mr-2 h-4 w-4" />
                    )}
                    {isBookmarked(selectedBookmarkId) ? 'Saved article' : 'Bookmark article'}
                  </Button>

                  <Button asChild className="w-full bg-sky-500 text-slate-950 hover:bg-sky-400">
                    <a href={selectedEvent.link} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open article
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-slate-700 bg-transparent text-slate-200 hover:bg-slate-900"
                    onClick={() => setSelectedEvent(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DrawerContent>
      </Drawer>

      <div className="bg-slate-950/80 border border-slate-800/70 rounded-xl p-4 h-[550px] w-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-slate-200 text-xs font-semibold uppercase tracking-wider">
            Timeline <span className="text-slate-300 ml-1 font-mono">({feedEvents.length})</span>
          </h3>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto pr-1" onScroll={handleTimelineScroll}>
          <div className="space-y-6">
            {visibleEvents.map((event, i) => (
              <button
                key={`${event.link}-${i}`}
                type="button"
                onClick={() => setSelectedEvent(event)}
                className="group relative block w-full rounded-lg pl-24 pr-2 pt-0 text-left border-l border-slate-800 pb-2 transition-colors hover:bg-slate-900/40"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="text-slate-100 text-[13px] font-semibold leading-tight transition-colors group-hover:text-emerald-400">
                      {event.title}
                    </h4>
                    <div className="px-2 py-0.5 rounded text-[9px] font-bold uppercase text-slate-300 border border-slate-700">
                      {event.source}
                    </div>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">{event.description}</p>

                  <div className="flex items-center gap-4 text-[10px] font-mono">
                    <span className="text-slate-400">{event.publishedLabel}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-5 border-t border-slate-800 pt-3 text-[11px] text-slate-400">
            {hasMoreEvents
              ? `Loaded ${visibleEvents.length} of ${feedEvents.length} - scroll for more`
              : `Showing all ${feedEvents.length} items`}
          </div>
        </div>
      </div>
    </>
  )
}
