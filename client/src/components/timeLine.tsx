import { useEffect, useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { useGlobalData } from '../context'
import type { FeedCard } from '../types/feed'
import {
  formatPublishedDate,
  getColorHex,
  getRelativeTime,
  getTimelineSeverity,
  getTimelineSourceStyle,
  getTimelineTopic,
} from '../utils/timelineFeed'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from './ui/drawer'

export default function TimelineFeed() {
  const { feedData } = useGlobalData()
  const [selectedEvent, setSelectedEvent] = useState<FeedCard | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const feedEvents = useMemo<FeedCard[]>(() => {
    return feedData.map((item) => {
      const style = getTimelineSourceStyle(item.source)
      const topic = getTimelineTopic(item.title, item.description)

      return {
        ...item,
        title: item.title,
        sourceLabel: item.source,
        description: item.description,
        publishedLabel: getRelativeTime(item.publishedAt),
        topic,
        severity: getTimelineSeverity(item.title, item.description),
        color: style.color,
        bgColor: style.bgColor,
        borderColor: style.borderColor,
      }
    })
  }, [feedData])

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(feedEvents.length / itemsPerPage))
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [feedEvents, currentPage])

  const selectedTopicLabel = useMemo(() => selectedEvent?.topic ?? 'General', [selectedEvent])
  const totalPages = useMemo(() => Math.max(1, Math.ceil(feedEvents.length / itemsPerPage)), [feedEvents.length])
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return feedEvents.slice(start, start + itemsPerPage)
  }, [feedEvents, currentPage])
  const startItem = feedEvents.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(feedEvents.length, currentPage * itemsPerPage)
  const selectedPublishedDate = useMemo(
    () => (selectedEvent ? formatPublishedDate(selectedEvent.publishedAt) : ''),
    [selectedEvent],
  )

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
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-sky-500/40 bg-sky-500/10 text-sky-300">
                      {selectedTopicLabel}
                    </Badge>
                    <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
                      Sev {selectedEvent.severity}/10
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

              <div className="flex-1 overflow-y-auto px-5 py-5 no-scrollbar">
                <div className="mb-6">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Severity
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-0.5">
                      {[...Array(10)].map((_, index) => (
                        <div
                          key={index}
                          className="h-1.5 w-3 rounded-full"
                          style={{
                            backgroundColor:
                              index < selectedEvent.severity ? getColorHex(selectedEvent.color) : '#1e293b',
                          }}
                        />
                      ))}
                    </div>
                    <span className={`text-sm font-semibold ${selectedEvent.color}`}>{selectedEvent.severity}/10</span>
                  </div>
                </div>

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

      <div className="bg-slate-950/80 border border-slate-800/70 rounded-xl p-4 h-full overflow-y-auto no-scrollbar flex-1">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-slate-200 text-xs font-semibold uppercase tracking-wider">
            Timeline <span className="text-slate-300 ml-1 font-mono">({feedEvents.length})</span>
          </h3>
        </div>

        <div className="space-y-6">
          {paginatedEvents.map((event, i) => (
            <button
              key={`${event.link}-${i}`}
              type="button"
              onClick={() => setSelectedEvent(event)}
              className="group relative block w-full rounded-lg pl-6 pr-2 pt-0 text-left border-l border-slate-800 pb-2 transition-colors hover:bg-slate-900/40"
            >
              <div
                className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${event.color.replace(
                  'text',
                  'bg',
                )} shadow-[0_0_8px_currentcolor]`}
              />

              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h4 className="text-slate-100 text-[13px] font-semibold leading-tight transition-colors group-hover:text-emerald-400">
                    {event.title}
                  </h4>
                  <div
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${event.bgColor} ${event.color} border ${event.borderColor}`}
                  >
                    {event.topic}
                  </div>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">{event.description}</p>

                <div className="flex items-center gap-4 text-[10px] font-mono">
                  <span className="text-slate-400">{event.publishedLabel}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 uppercase">Severity:</span>
                    <div className="flex gap-0.5">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className="h-1.5 w-3 rounded-full"
                          style={{
                            backgroundColor: i < event.severity ? getColorHex(event.color) : '#3f3f46',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4 text-[11px] text-slate-400">
          <span>
            Showing {startItem}-{endItem} of {feedEvents.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 bg-transparent text-slate-200 hover:bg-slate-900"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <span className="text-slate-300">
              Page {currentPage}/{totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 bg-transparent text-slate-200 hover:bg-slate-900"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
