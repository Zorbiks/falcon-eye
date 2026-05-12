import { useEffect, useRef, useState, useMemo } from 'react'
import { Home, Expand, Minimize2 } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Button } from './ui/button'
import { useGlobalData } from 'src/context'
import { useAuth } from 'src/context'
import { getEventStyle } from 'src/utils/getEventStyle'
import { createCustomIcon } from 'src/utils/createCustomIcon'
import type { AcledEvent } from 'src/types/events'
import EventDrawer from './eventDrawer'

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
  const { events, isLoading, toggleBookmark, isBookmarked } = useGlobalData()
  const { token } = useAuth()

  const memoEvents = useMemo(() => events, [events])

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<AcledEvent | null>(null)
  const [zoom, setZoom] = useState(3)
  const selectedEventBookmarkId = selectedEvent ? `event-${selectedEvent.rowKey}` : ''

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
      {isLoading ? (
        <style>{`
          @keyframes mapLoadingOpacity {
            0% {
              opacity: 0.25;
            }
            100% {
              opacity: 0.85;
            }
          }
        `}</style>
      ) : null}

      <EventDrawer
        open={Boolean(selectedEvent)}
        isFullscreen={isFullscreen}
        selectedEvent={selectedEvent}
        selectedEventBookmarkId={selectedEventBookmarkId}
        token={token}
        isBookmarked={isBookmarked}
        onOpenChange={(open: boolean) => !open && setSelectedEvent(null)}
        onToggleBookmark={(event: AcledEvent) =>
          toggleBookmark({
            id: `event-${event.rowKey}`,
            kind: 'event',
            title: event.eventType,
            subtitle: `${event.subEventType} · ${event.country}`,
          })
        }
      />

      <div className="w-full border-b border-slate-800 bg-slate-900/85 px-5 py-4 pt-5 flex justify-between">
        <h1 className="text-[20px] text-slate-100 font-bold">Conflict Map</h1>

        <div className="flex gap-3">
          <Button
            className="bg-transparent p-0 hover:bg-transparent"
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setView([28, 45], 3)
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
        className="relative w-full flex-1 overflow-hidden [&_.leaflet-bar]:border-zinc-800 [&_.leaflet-bar]:shadow-none [&_.leaflet-bar_a]:bg-zinc-900 [&_.leaflet-bar_a]:text-zinc-400 [&_.leaflet-bar_a]:border-zinc-800 [&_.leaflet-bar_a:hover]:bg-emerald-500/20 [&_.leaflet-bar_a:hover]:text-emerald-400 [&_.leaflet-control-zoom-in]:font-mono [&_.leaflet-control-zoom-out]:font-mono z-0"
        style={isLoading ? { animation: 'mapLoadingOpacity .75s ease-in-out infinite alternate' } : undefined}
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

          {!isLoading && events?.length && (
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

      {!isLoading && events?.length ? (
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
      ) : null}
    </div>
  )
}
