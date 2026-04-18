import { Home, Expand } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function MainMap() {
  return (
    <div className="relative mx-auto flex h-[600px] w-[95%] flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
      <div className="w-full border-b border-slate-800 bg-slate-900/85 px-5 py-6 flex justify-between">
        <h1 className="text-[22px] text-slate-100 font-bold">Conflict Map</h1>

        <div className="flex gap-3">
          <Home className="stroke-slate-200 cursor-pointer" />
          <Expand className="stroke-slate-200 cursor-pointer" />
        </div>
      </div>

      <div className="w-full flex-1 overflow-hidden">
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
