// Native View Transitions for list mutations (no animation library).
// Rules: transition-over-js-library, transition-name-required, transition-name-unique,
// transition-name-cleanup, transition-style-pseudo-elements (styles live in index.css).
// Elements opt in with data-vt-name="<unique name>". Names are applied only for the
// duration of a transition, then removed. Reduced motion or no API support: plain update.
import { flushSync } from "react-dom"

type StartViewTransition = (update: () => void) => { finished: Promise<void> }

let running = 0

function applyNames(scope: HTMLElement, on: boolean) {
  scope.querySelectorAll<HTMLElement>("[data-vt-name]").forEach((el) => {
    if (on) el.style.setProperty("view-transition-name", el.dataset.vtName ?? "")
    else el.style.removeProperty("view-transition-name")
  })
}

export function listTransition(scope: HTMLElement | null, update: () => void) {
  const start = (document as unknown as { startViewTransition?: StartViewTransition }).startViewTransition
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  if (!scope || !start || reduced) { update(); return }

  applyNames(scope, true) // old snapshot
  running++
  document.documentElement.dataset.listTransition = ""
  const transition = start.call(document, () => {
    flushSync(update)
    applyNames(scope, true) // new snapshot, including items that just mounted
  })
  transition.finished.finally(() => {
    applyNames(scope, false)
    if (--running === 0) delete document.documentElement.dataset.listTransition
  })
}
