import { useCallback, useLayoutEffect, useRef, type RefObject } from "react"

// FLIP for a list whose rows carry `data-flip-id`.
// animate · Step 3 picks the cheapest tool: this is "programmatic control with CSS performance,
// no library" → WAAPI (RECIPES "Programmatic, without a library"). Moves use transform only
// (animation-performance Hard Rule: composite-only), so rows never animate top/height.
//   moves  → translateY, 250ms strong ease-in-out (easing tree: "moving on screen")
//   exits  → a non-interactive clone fades + scale(0.97), 150ms strong ease-out (exit faster than enter)
// Snapshots are taken from the *visual* position, so a second click mid-move retargets from where
// the row is, instead of restarting (STANDARDS: interruptible).
// Reduced motion: no movement, exits keep their fade.

type Box = { top: number; left: number; width: number; height: number }
type Snapshot = {
  boxes: Map<string, Box>
  nodes: Map<string, HTMLElement>
  order: string[]
  focus: { id: string; index: number } | null
}

// Extend the codebase's tokens instead of forking them (animate Hard Rule 3).
const token = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
const focusables = (el: Element) =>
  Array.from(el.querySelectorAll<HTMLElement>("button, input, a[href], [tabindex]:not([tabindex='-1'])"))

export function useFlipList(
  rootRef: RefObject<HTMLElement | null>,
  ghostRef: RefObject<HTMLElement | null>,
  fallbackFocus?: () => HTMLElement | null,
) {
  const snap = useRef<Snapshot | null>(null)

  // Call right before the state change that reorders, adds or removes rows.
  const capture = useCallback(() => {
    const root = rootRef.current
    if (!root) return
    const o = root.getBoundingClientRect()
    const boxes = new Map<string, Box>()
    const nodes = new Map<string, HTMLElement>()
    const order: string[] = []
    let focus: Snapshot["focus"] = null
    const active = document.activeElement as HTMLElement | null
    root.querySelectorAll<HTMLElement>("[data-flip-id]").forEach((el) => {
      const id = el.dataset.flipId!
      const r = el.getBoundingClientRect()
      boxes.set(id, { top: r.top - o.top, left: r.left - o.left, width: r.width, height: r.height })
      nodes.set(id, el)
      order.push(id)
      if (active && el.contains(active)) focus = { id, index: focusables(el).indexOf(active) }
    })
    snap.current = { boxes, nodes, order, focus }
  }, [rootRef])

  useLayoutEffect(() => {
    const s = snap.current
    const root = rootRef.current
    if (!s || !root) return
    snap.current = null
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
    const easeInOut = token("--ease-in-out", "cubic-bezier(0.77, 0, 0.175, 1)")
    const easeOut = token("--ease-out", "cubic-bezier(0.23, 1, 0.32, 1)")
    const o = root.getBoundingClientRect()
    const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-flip-id]"))
    const present = new Set(rows.map((el) => el.dataset.flipId!))

    // Moves: invert to the old visual position, then play to "none".
    for (const el of rows) {
      const first = s.boxes.get(el.dataset.flipId!)
      if (!first) continue
      el.getAnimations().forEach((a) => a.id === "flip" && a.cancel())
      const dy = first.top - (el.getBoundingClientRect().top - o.top)
      if (reduce || Math.abs(dy) < 1) continue
      el.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], { id: "flip", duration: 250, easing: easeInOut })
    }

    // Exits: React already removed the row, so fade a clone where it was.
    const layer = ghostRef.current
    if (layer) {
      s.nodes.forEach((node, id) => {
        if (present.has(id)) return
        const box = s.boxes.get(id)!
        const ghost = node.cloneNode(true) as HTMLElement
        ghost.removeAttribute("data-flip-id")
        ghost.classList.remove("enter-row")
        ghost.setAttribute("inert", "")
        Object.assign(ghost.style, {
          position: "absolute", margin: "0", transition: "none", transformOrigin: "center",
          top: `${box.top}px`, left: `${box.left}px`, width: `${box.width}px`, height: `${box.height}px`,
        })
        layer.append(ghost)
        const frames = reduce
          ? [{ opacity: 1 }, { opacity: 0 }]
          : [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(0.97)" }]
        const a = ghost.animate(frames, { duration: 150, easing: easeOut, fill: "forwards" })
        a.onfinish = a.oncancel = () => ghost.remove()
      })
    }

    // Focus: moving or removing a focused row drops focus to <body>. Put it back on the same
    // control (or its nearest enabled neighbour), so keyboard users can keep pressing "Move down".
    const f = s.focus
    const lost = !document.activeElement || document.activeElement === document.body
    if (f && lost) {
      let row = rows.find((el) => el.dataset.flipId === f.id)
      if (!row) {
        const remaining = s.order.filter((id) => present.has(id))
        const nextId = remaining[Math.min(s.order.indexOf(f.id), remaining.length - 1)]
        row = rows.find((el) => el.dataset.flipId === nextId)
      }
      const items = row ? focusables(row) : []
      const ok = (el?: HTMLElement) => el && !el.matches(":disabled")
      let target: HTMLElement | undefined
      for (let d = 0; d < items.length && !target; d++) {
        if (ok(items[f.index + d])) target = items[f.index + d]
        else if (ok(items[f.index - d])) target = items[f.index - d]
      }
      ;(target ?? fallbackFocus?.())?.focus()
    }
  })

  return capture
}
