import { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import { Home, Expand, Minimize2 } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

export default function MainMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current)
      // Ensure Leaflet recalculates dimensions after fullscreen transition.
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
      className="relative mx-auto flex h-[600px] w-[95%] flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950 fullscreen:w-full fullscreen:h-full"
    >
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
          <Marker position={[51.505, -0.09]}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
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
