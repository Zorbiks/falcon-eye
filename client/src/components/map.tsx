import { useEffect, useRef, useState } from 'react'
import { Home, Expand, Minimize2 } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from './ui/drawer'
import { useGlobalData } from 'src/context'
import { getEventStyle } from 'src/utils/getEventStyle'
import { createCustomIcon } from 'src/utils/createCustomIcon'
import type { AcledEvent } from 'src/types/events'

export default function MainMap() {
  const { events } = useGlobalData()

  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<AcledEvent | null>(null)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current)
      setTimeout(() => window.dispatchEvent(new Event('resize')), 0)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = async () => {
    if (!containerRef.current) return

    if (document.fullscreenElement === containerRef.current) {
      await document.exitFullscreen()
      return
    }

    await containerRef.current.requestFullscreen()
  }

  return (
    <div
      ref={containerRef}
      className="relative mx-auto flex h-[700px] w-[95%] flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950 fullscreen:w-full fullscreen:h-full"
    >
      <Drawer
        open={Boolean(selectedEvent)}
        onOpenChange={(open: boolean) => !open && setSelectedEvent(null)}
        direction="right"
      >
        <DrawerContent className="inset-y-0 right-0 left-auto mt-0 h-full w-full max-w-[420px] gap-0 overflow-hidden rounded-none border-l border-slate-800 border-t-0 bg-slate-950 p-0 font-sans text-slate-100 antialiased shadow-2xl sm:max-w-[420px] [&>div:first-child]:hidden">
          {selectedEvent ? (
            <div className="flex h-full flex-col">
              <div className="border-b border-slate-800 px-1 py-4">
                <DrawerHeader className="space-y-3 text-left">
                  <DrawerTitle className="text-balance text-xl font-semibold leading-tight tracking-tight text-slate-50">
                    {selectedEvent.eventType}
                  </DrawerTitle>

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
                <Button
                  variant="outline"
                  className="w-full border-slate-700 bg-transparent text-slate-200 hover:bg-slate-900"
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : null}
        </DrawerContent>
      </Drawer>

      <div className="w-full border-b border-slate-800 bg-slate-900/85 px-5 py-4 pt-5 flex justify-between">
        <h1 className="text-[20px] text-slate-100 font-bold">Conflict Map</h1>

        <div className="flex gap-3">
          <Button className="bg-transparent p-0 hover:bg-transparent">
            <Home className="w-[20px] stroke-slate-200 cursor-pointer" />
          </Button>

          <Button
            className="bg-transparent p-0 hover:bg-transparent"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen map' : 'Enter fullscreen map'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-[20px] stroke-slate-200 cursor-pointer" />
            ) : (
              <Expand className="w-[20px] stroke-slate-200 cursor-pointer" />
            )}
          </Button>
        </div>
      </div>

      <div
        className="w-full flex-1 overflow-hidden[&_.leaflet-bar]:border-zinc-800 [&_.leaflet-bar]:shadow-none [&_.leaflet-bar_a]:bg-zinc-900 [&_.leaflet-bar_a]:text-zinc-400 [&_.leaflet-bar_a]:border-zinc-800 [&_.leaflet-bar_a:hover]:bg-emerald-500/20 [&_.leaflet-bar_a:hover]:text-emerald-400 [&_.leaflet-control-zoom-in]:font-mono [&_.leaflet-control-zoom-out]:font-mono
      "
      >
        <MapContainer
          center={[51.505, -0.09]}
          zoom={6}
          scrollWheelZoom={false}
          className="h-full w-full"
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {events.map((event) => {
            const style = getEventStyle(event.eventType, event.subEventType)
            const icon = createCustomIcon(style)

            return (
              <Marker
                key={event.rowKey}
                position={[event.latitude, event.longitude]}
                icon={icon}
                eventHandlers={{
                  click: () => setSelectedEvent(event),
                }}
              />
            )
          })}
        </MapContainer>
      </div>

      <div className="absolute left-0 bottom-2 z-[1000] ml-3 pointer-events-none">
        <div className="bg-slate-900/90 border border-slate-700 p-3 backdrop-blur-sm shadow-2xl">
          <div className="flex flex-col gap-1 font-mono">
            <p className="text-[10px] text-emerald-500 font-bold tracking-widest">LEGEND</p>
          </div>
        </div>
      </div>
    </div>
  )
}
