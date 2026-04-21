import L from 'leaflet'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'

library.add(fas)
dom.watch()

export const createCustomIcon = (style: { icon: string; color: string }) => {
  return L.divIcon({
    className: 'leaflet-custom-icon',
    html: `
      <div class="custom-event-marker" style="background-color: ${style.color};">
        <i class="fa-solid ${style.icon}"></i>
      </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  })
}
