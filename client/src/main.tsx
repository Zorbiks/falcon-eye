import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import 'leaflet/dist/leaflet.css'
import './styles/globals.less'
import './i18n/config'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />)
