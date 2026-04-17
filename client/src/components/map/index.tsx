import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function MainMap() {
  return (
    <div className="relative flex flex-col items-center w-full h-[500px] bg-zinc-950 overflow-hidden border-r-4">
      <div className="py-8 px-5">
        <h1 className="">Conflict Map</h1>
      </div>

      <MapContainer
        center={[51.505, -0.09]}
        zoom={6}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '95%' }}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <Marker position={[51.505, -0.09]}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>

      <div className="absolute top-2 right-10 z-[1000] pointer-events-none">
        <div className="bg-zinc-900/90 border border-zinc-800 p-3 backdrop-blur-sm shadow-2xl">
          <div className="flex flex-col gap-1 font-mono">
            <p className="text-[10px] text-emerald-500 font-bold tracking-widest">MAP_STATUS: ACTIVE</p>
          </div>
        </div>
      </div>
    </div>
  )
}
