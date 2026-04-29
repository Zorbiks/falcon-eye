import { useEffect, useRef, useState, useMemo } from 'react'
import { Home, Expand, Minimize2 } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from './ui/drawer'
import { useGlobalData } from 'src/context'
import { getEventStyle } from 'src/utils/getEventStyle'
import { createCustomIcon } from 'src/utils/createCustomIcon'
import type { AcledEvent } from 'src/types/events'

const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount()

  let sizeClass = 'small'
  if (count > 50) sizeClass = 'large'
  else if (count > 10) sizeClass = 'medium'

  const size = sizeClass === 'large' ? 64 : sizeClass === 'medium' ? 52 : 40

  return L.divIcon({
    html: `<div class="glow-cluster ${sizeClass}" aria-hidden="true"><span>${count}</span></div>`,
    className: '',
    iconSize: L.point(size, size),
    iconAnchor: L.point(size / 2, size / 2),
    popupAnchor: L.point(0, -size / 2),
  })
}

function ZoomWatcher({ setZoom }: { setZoom: (z: number) => void }) {
  useMapEvents({
    zoomend(e) {
      setZoom(e.target.getZoom())
    },
  })

  return null
}

// Helper component to capture map instance
const MapCenter = ({ mapRef }: { mapRef: React.MutableRefObject<any> }) => {
  const map = useMap()
  useEffect(() => {
    mapRef.current = map
  }, [map, mapRef])
  return null
}
// Map
export default function MainMap() {
  const { events, isLoading, hasEventsLoaded } = useGlobalData()

  const memoEvents = useMemo(() => events, [events])

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<AcledEvent | null>(null)
  const [zoom, setZoom] = useState(3)

  const legendItems = useMemo(() => {
    const uniqueSubTypes = new Map<string, AcledEvent>()

    memoEvents.forEach((event) => {
      if (!uniqueSubTypes.has(event.subEventType)) {
        uniqueSubTypes.set(event.subEventType, event)
      }
    })
    return Array.from(uniqueSubTypes.values()).sort((a, b) => a.subEventType.localeCompare(b.subEventType))
  }, [memoEvents])

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
          <Button
            className="bg-transparent p-0 hover:bg-transparent"
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setView([28, 45], zoom)
              }
            }}
          >
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
          zoom={zoom}
          scrollWheelZoom={true}
          className="h-full w-full"
          attributionControl={false}
        >
          <MapCenter mapRef={mapRef} />

          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

          <ZoomWatcher setZoom={setZoom} />

          {!isLoading && hasEventsLoaded && (
            <MarkerClusterGroup
              iconCreateFunction={createClusterCustomIcon}
              chunkedLoading={true}
              chunkInterval={100}
              spiderfyOnMaxZoom={true}
              showCoverageOnHover={false}
            >
              {memoEvents.map((event) => {
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
            </MarkerClusterGroup>
          )}
        </MapContainer>
      </div>

      {!isLoading && hasEventsLoaded && (
        <div className="absolute left-0 bottom-2 z-[1000] ml-3">
          <div
            className="bg-slate-900/90 border border-slate-700 p-4 backdrop-blur-sm shadow-2xl rounded-lg max-h-[250px] overflow-y-auto"
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2 font-mono">
              <div className="flex flex-col gap-1.5 text-[9px] text-slate-300">
                {legendItems.map((event) => {
                  const style = getEventStyle(event.eventType, event.subEventType)
                  return (
                    <div key={event.subEventType} className="flex items-center gap-2">
                      <i className={`fa-solid ${style.icon} flex-shrink-0 w-4`} style={{ color: style.color }} />
                      <span className="truncate">{event.subEventType}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
