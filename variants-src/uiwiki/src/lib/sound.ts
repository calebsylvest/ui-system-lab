// Procedural UI sounds (no audio assets). Off by default.
// Rules: a11y-toggle-setting, a11y-reduced-motion-check, impl-default-subtle,
// context-reuse-single, context-resume-suspended, context-cleanup-nodes,
// envelope-set-initial-value, envelope-exponential-decay, envelope-no-zero-target,
// design-oscillator-for-tonal, design-noise-for-percussion, design-filter-for-character,
// param-click-duration, param-filter-frequency-range, param-q-value-range, param-reasonable-gain,
// appropriate-confirmations-only, appropriate-errors-warnings, appropriate-no-punishing.
import { useSyncExternalStore } from "react"

const STORAGE_KEY = "fieldwork:ui-sounds"
const DEFAULT_VOLUME = 0.3

function readStored(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === "on" } catch { return false }
}

let enabled = readStored()
const listeners = new Set<() => void>()

export function setSoundEnabled(next: boolean) {
  enabled = next
  try { localStorage.setItem(STORAGE_KEY, next ? "on" : "off") } catch { /* ignore */ }
  listeners.forEach((l) => l())
  if (next) playSound("click")
}

export function useSoundEnabled(): [boolean, (next: boolean) => void] {
  const value = useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb) },
    () => enabled,
    () => false,
  )
  return [value, setSoundEnabled]
}

let ctx: AudioContext | null = null
function getContext(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

type Sound = "success" | "error" | "click"

export function playSound(sound: Sound) {
  if (!enabled || typeof window === "undefined") return
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
  const ac = getContext()
  if (ac.state === "suspended") void ac.resume()
  const t = ac.currentTime
  const gain = ac.createGain()
  gain.connect(ac.destination)

  if (sound === "click") {
    // 8ms filtered noise burst for a soft tap
    const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.008), ac.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 50)
    const source = ac.createBufferSource()
    source.buffer = buffer
    const filter = ac.createBiquadFilter()
    filter.type = "bandpass"
    filter.frequency.value = 4000
    filter.Q.value = 3
    gain.gain.setValueAtTime(DEFAULT_VOLUME, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.012)
    source.connect(filter).connect(gain)
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect() }
    source.start(t)
    return
  }

  // Tonal confirmation (rising) or gentle alert (falling, softer timbre, not a buzzer)
  const osc = ac.createOscillator()
  const success = sound === "success"
  const duration = success ? 0.14 : 0.2
  osc.type = success ? "sine" : "triangle"
  osc.frequency.setValueAtTime(success ? 520 : 440, t)
  osc.frequency.exponentialRampToValueAtTime(success ? 780 : 330, t + 0.06)
  gain.gain.setValueAtTime(DEFAULT_VOLUME * (success ? 0.6 : 0.5), t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration)
  osc.connect(gain)
  osc.onended = () => { osc.disconnect(); gain.disconnect() }
  osc.start(t)
  osc.stop(t + duration + 0.02)
}
