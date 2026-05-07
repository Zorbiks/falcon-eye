import { useEffect, useMemo, useState } from 'react'
import { useGlobalData } from '../context'
import type { FeedCard } from '../types/feed'
import { getRelativeTime } from '../utils/timelineFeed'
import TimelineDrawer from './timelineDrawer'
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

  const visibleEvents = useMemo(() => feedEvents?.slice(0, visibleCount), [feedEvents, visibleCount])
  const hasMoreEvents = visibleCount < feedEvents.length
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
      <TimelineDrawer
        event={selectedEvent}
        bookmarkId={selectedBookmarkId}
        isBookmarked={isBookmarked}
        onToggleBookmark={(event: FeedCard) =>
          toggleBookmark({
            id: selectedBookmarkId,
            kind: 'feed',
            title: event.title,
            subtitle: `${event.sourceLabel} · ${event.publishedLabel}`,
          })
        }
        onClose={() => setSelectedEvent(null)}
      />

      <div className="flex h-[500px] w-full flex-col rounded-xl border border-slate-800/70 bg-slate-950/80 p-4 sm:h-[550px]">
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
                className="group relative block w-full rounded-lg pl-6 pr-2 pt-0 text-left border-l border-slate-800 pb-2 transition-colors hover:bg-slate-900/40"
              >
                <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_currentcolor]" />

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
