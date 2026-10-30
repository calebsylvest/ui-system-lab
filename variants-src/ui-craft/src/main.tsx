import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Theme switching without transition flash (surface-details): when the .dark class flips,
// suspend all transitions for one frame so the whole page swaps at once.
{
  const root = document.documentElement
  let dark = root.classList.contains("dark")
  new MutationObserver(() => {
    const next = root.classList.contains("dark")
    if (next === dark) return
    dark = next
    const style = document.createElement("style")
    style.textContent = "*,*::before,*::after{transition:none!important}"
    document.head.appendChild(style)
    void window.getComputedStyle(document.body).opacity
    requestAnimationFrame(() => requestAnimationFrame(() => style.remove()))
  }).observe(root, { attributes: true, attributeFilter: ["class"] })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
