import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { DayNightProvider } from './context/DayNightContext.jsx'
import './index.css' // Keep this if you plan to put Tailwind here later

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DayNightProvider>
      <App />
    </DayNightProvider>
  </React.StrictMode>,
)