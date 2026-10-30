import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { suppressTransitionsOnThemeChange } from './lib/theme-transitions'

suppressTransitionsOnThemeChange()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
