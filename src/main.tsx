import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Firefox ETP compatibility: Suppress fingerprinting warnings
if (typeof window !== 'undefined') {
  const originalWarn = console.warn
  console.warn = function (...args: any[]) {
    if (args[0]?.includes?.('Fingerprinting Protection')) {
      return
    }
    originalWarn.apply(console, args)
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
