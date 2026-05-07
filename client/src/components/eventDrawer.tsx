import { Bookmark, BookMarked, Info } from 'lucide-react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from './ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { getEventDescription, getEventStyle } from 'src/utils/getEventStyle'
import type { AcledEvent } from 'src/types/events'

type EventDrawerProps = {
  open: boolean
  isFullscreen: boolean
  selectedEvent: AcledEvent | null
  selectedEventBookmarkId: string
  isBookmarked: (id: string) => boolean
  onOpenChange: (open: boolean) => void
  onToggleBookmark: (event: AcledEvent) => void
}

export default function EventDrawer({
  open,
  isFullscreen,
  selectedEvent,
  selectedEventBookmarkId,
  isBookmarked,
  onOpenChange,
  onToggleBookmark,
}: EventDrawerProps) {
  const selectedEventDescription = selectedEvent
    ? getEventDescription(selectedEvent.eventType, selectedEvent.subEventType)
    : ''

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent
        disablePortal={isFullscreen}
        className={`inset-y-0 right-0 left-auto mt-0 h-full w-full max-w-[420px] gap-0 overflow-hidden rounded-none border-l border-slate-800 border-t-0 bg-slate-950 p-0 font-sans text-slate-100 antialiased shadow-2xl sm:max-w-[420px] [&>div:first-child]:hidden ${
          isFullscreen ? 'z-[9999]' : ''
        }`}
      >
        {selectedEvent ? (
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-800 px-1 py-4">
              <DrawerHeader className="space-y-3 text-left">
                <DrawerTitle className="flex justify-between text-balance text-xl font-semibold leading-tight tracking-tight text-slate-50">
                  <div>
                    <p className="mb-3">{selectedEvent.eventType}</p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        style={{
                          color: getEventStyle(selectedEvent.eventType, selectedEvent.subEventType).color,
                          borderColor: getEventStyle(selectedEvent.eventType, selectedEvent.subEventType).color,
                          backgroundColor:
                            getEventStyle(selectedEvent.eventType, selectedEvent.subEventType).color + '15',
                        }}
                      >
                        {selectedEvent.subEventType}
                      </Badge>
                    </div>
                  </div>

                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="cursor-help text-slate-400 transition-opacity hover:text-slate-200"
                      >
                        <Info size={14} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-72 border-slate-700 bg-slate-900 text-sm text-zinc-300 mr-5"
                      style={{ zIndex: 2102 }}
                    >
                      <p>{selectedEventDescription}</p>
                    </PopoverContent>
                  </Popover>
                </DrawerTitle>

                <DrawerDescription className="text-sm text-slate-400">
                  {selectedEvent.admin1}, {selectedEvent.country}
                </DrawerDescription>
              </DrawerHeader>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 no-scrollbar">
              <div className="mb-6 grid gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Event Type</span>
                  <span className="font-medium text-slate-200">{selectedEvent.eventType}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Sub Type</span>
                  <span className="font-medium text-slate-200">{selectedEvent.subEventType}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Fatalities</span>
                  <span className="font-mono text-sm font-bold text-red-500">{selectedEvent.fatalities}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Date</span>
                  <span className="font-mono text-xs text-slate-200">{selectedEvent.week}</span>
                </div>
              </div>

              <div className="mb-6 grid gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Location</span>
                  <span className="font-medium text-slate-200">{selectedEvent.admin1}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Country</span>
                  <span className="font-medium text-slate-200">{selectedEvent.country}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Coordinates</span>
                  <span className="font-mono text-xs text-slate-300">
                    {selectedEvent.latitude.toFixed(4)}, {selectedEvent.longitude.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-auto border-t border-slate-800 bg-slate-950/95 px-5 py-4 backdrop-blur-sm">
              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  className="w-full border-slate-700 bg-transparent hover:bg-slate-900 text-slate-200 hover:text-slate-200"
                  onClick={() => onToggleBookmark(selectedEvent)}
                >
                  {isBookmarked(selectedEventBookmarkId) ? (
                    <BookMarked className="mr-2 h-4 w-4 text-emerald-400" />
                  ) : (
                    <Bookmark className="mr-2 h-4 w-4" />
                  )}
                  {isBookmarked(selectedEventBookmarkId) ? 'Saved event' : 'Bookmark event'}
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-slate-700 bg-transparent text-slate-200 hover:bg-slate-900"
                  onClick={() => onOpenChange(false)}
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
