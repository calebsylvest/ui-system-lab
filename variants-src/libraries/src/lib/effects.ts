import { useEffect, useState } from "react"

/** True while <html> has the `.dark` class (the lab bridge toggles it). Watched live. */
export function useIsDark() {
  const get = () => typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  const [dark, setDark] = useState(get)
  useEffect(() => {
    const el = document.documentElement
    const mo = new MutationObserver(() => setDark(el.classList.contains("dark")))
    mo.observe(el, { attributes: true, attributeFilter: ["class"] })
    setDark(el.classList.contains("dark"))
    return () => mo.disconnect()
  }, [])
  return dark
}

/** prefers-reduced-motion: reduce, watched live (border-beam docs recipe). */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const on = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  return reduced
}

/**
 * Simulated speech level, 0-1, sampled per frame by voice-glow's `level` getter.
 * The viewer iframe has no microphone, so this stands in for a mic stream:
 * syllable-like bursts with short pauses between words.
 */
export function simulatedVoiceLevel() {
  const t = performance.now() / 1000
  const syllable = Math.abs(Math.sin(t * 6.3)) * (0.55 + 0.45 * Math.sin(t * 1.7 + 1))
  const word = Math.sin(t * 2.1) > -0.55 ? 1 : 0.08
  return Math.min(1, Math.max(0, syllable * word * 0.9 + 0.04))
}
