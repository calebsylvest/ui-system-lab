import { useLayoutEffect, useRef, useState } from "react"
import { ArrowDown, ArrowUp, ListOrdered, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { initialTasks, extraTasks, type Task } from "@/data-extra"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// better-writing: whole strings per plural category
const plural = new Intl.PluralRules("en-US")
const openTasks = (n: number) => (plural.select(n) === "one" ? `${n} open task across the studio.` : `${n} open tasks across the studio.`)

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

// Round-2 section: a list that changes. Add, complete, remove (with undo), reorder and sort.
// data-lab attributes let the comparison viewer trigger the same action in every variant.
export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [draft, setDraft] = useState("")
  const [sorted, setSorted] = useState(false)
  // Rows playing their exit animation; they leave `tasks` when it ends.
  const [leaving, setLeaving] = useState<string[]>([])
  const [announcement, setAnnouncement] = useState("")
  const next = useRef(0)
  // Rows added after first render get the enter animation; initial rows never animate (skip on first render).
  const [entering, setEntering] = useState<string[]>([])
  const rows = useRef(new Map<string, HTMLLIElement>())
  const lastTop = useRef(new Map<string, number>())
  const pendingFocus = useRef<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const sortTasks = (ts: Task[]) => [...ts].sort((a, b) => Number(a.done) - Number(b.done) || a.dueOrder - b.dueOrder)
  const visible = sorted ? sortTasks(tasks) : tasks
  const live = visible.filter((t) => !leaving.includes(t.id))
  const open = tasks.filter((t) => !t.done && !leaving.includes(t.id)).length

  // FLIP: rows that change position glide there (150ms ease-out, transform only), so a reorder,
  // insert or removal shows where things went. Uses offsetTop so in-flight transforms don't count.
  useLayoutEffect(() => {
    const reduce = reducedMotion()
    const tops = new Map<string, number>()
    rows.current.forEach((el, id) => {
      const top = el.offsetTop
      tops.set(id, top)
      const before = lastTop.current.get(id)
      if (!reduce && before !== undefined && before !== top) {
        el.animate([{ transform: `translateY(${before - top}px)` }, { transform: "none" }], { duration: 150, easing: "ease-out" })
      }
    })
    lastTop.current = tops
    // better-accessibility: when the focused control moves or disappears, put focus back somewhere logical.
    if (pendingFocus.current) {
      const target = document.querySelector<HTMLElement>(pendingFocus.current)
      ;(target ?? inputRef.current)?.focus()
      pendingFocus.current = null
    }
  })

  function add(title?: string) {
    const canned = extraTasks[next.current % extraTasks.length]
    const t: Task = {
      id: "n" + Date.now() + next.current,
      title: title?.trim() || canned.title,
      who: title ? "CS" : canned.who,
      due: title ? "No due date" : canned.due,
      dueOrder: title ? 99 : canned.dueOrder,
      done: false,
    }
    next.current++
    setEntering((e) => [...e, t.id])
    setTasks((ts) => [t, ...ts])
    setDraft("")
    setAnnouncement(`“${t.title}” added`)
  }

  function finishRemove(id: string) {
    setTasks((ts) => ts.filter((t) => t.id !== id))
    setLeaving((l) => l.filter((x) => x !== id))
  }

  function remove(id: string) {
    if (leaving.includes(id)) return
    const index = tasks.findIndex((t) => t.id === id)
    const task = tasks[index]
    if (!task) return
    // Focus was on this row's Remove button: hand it to the neighbouring row, or the new-task field.
    if (rows.current.get(id)?.contains(document.activeElement)) {
      const i = live.findIndex((t) => t.id === id)
      const neighbour = live[i + 1] ?? live[i - 1]
      pendingFocus.current = neighbour ? `[data-remove-id="${neighbour.id}"]` : "#task-new"
    }
    setLeaving((l) => [...l, id])
    // Exit runs on the row (150ms); if no animation is running (e.g. display none), drop it at once.
    requestAnimationFrame(() => {
      const el = rows.current.get(id)
      if (!el || el.getAnimations().length === 0) finishRemove(id)
    })
    // better-writing: undo beats confirmation; better-accessibility: a toast with an action stays until dismissed.
    toast(`“${task.title}” removed`, {
      duration: Infinity,
      closeButton: true,
      action: {
        label: "Undo",
        onClick: () => {
          setEntering((e) => (e.includes(task.id) ? e : [...e, task.id]))
          pendingFocus.current = `[data-check-id="${task.id}"]`
          setTasks((ts) => (ts.some((t) => t.id === task.id) ? ts : [...ts.slice(0, index), task, ...ts.slice(index)]))
          setAnnouncement(`“${task.title}” restored`)
        },
      },
    })
  }

  // Moves within the order the user sees. If the list is sorted, that order becomes the manual order first,
  // so "Move down" always swaps with the row visibly below.
  function move(id: string, dir: -1 | 1) {
    const order = live
    const i = order.findIndex((t) => t.id === id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= order.length) return
    const copy = [...order]
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
    const leavingRows = tasks.filter((t) => leaving.includes(t.id))
    setSorted(false)
    setTasks([...copy, ...leavingRows])
    setAnnouncement(`“${order[i].title}” moved to position ${j + 1} of ${order.length}`)
  }

  function toggleSort() {
    setSorted(!sorted)
    setAnnouncement(sorted ? "Manual order" : "Sorted by due date, open tasks first")
  }

  const toggle = (id: string) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  const first = live.find((t) => !t.done)

  return (
    <Card>
      <CardHeader>
        <CardTitle>This week</CardTitle>
        <CardDescription className="tabular-nums">{openTasks(open)}</CardDescription>
        <CardAction>
          {/* Stable label; aria-pressed carries the state, the inset ring is its visible second cue (round-1 toggle style) */}
          <Button
            variant={sorted ? "secondary" : "outline"}
            size="sm"
            data-lab="task-sort"
            aria-pressed={sorted}
            onClick={toggleSort}
            className="aria-pressed:ring-1 aria-pressed:ring-border-strong aria-pressed:ring-inset"
          >
            <ListOrdered /> Sort by due date
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) add(draft); else inputRef.current?.focus() }}>
          <Label htmlFor="task-new" className="sr-only">New task</Label>
          <Input ref={inputRef} id="task-new" name="task" autoComplete="off" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Send invoice to Calder" />
          <Button type="button" variant="secondary" data-lab="task-add" onClick={() => add(draft || undefined)}><Plus /> Add</Button>
        </form>
        <span hidden data-lab="task-complete" onClick={() => first && toggle(first.id)} />
        <span hidden data-lab="task-remove" onClick={() => first && remove(first.id)} />
        <span hidden data-lab="task-move" onClick={() => first && move(first.id, 1)} />
        <p role="status" className="sr-only">{announcement}</p>
        {live.length === 0 && leaving.length === 0 ? (
          <div className="py-6 text-center text-sm">
            <p className="font-medium">No tasks this week</p>
            <p className="text-muted-foreground text-pretty">Tasks you add above show up here, with who owns them and when they’re due.</p>
          </div>
        ) : (
          <ul className="relative grid gap-1" aria-label="Tasks">
            {visible.map((t) => {
              const isLeaving = leaving.includes(t.id)
              const i = live.findIndex((x) => x.id === t.id)
              const atTop = i === 0
              const atBottom = i === live.length - 1
              return (
                <li
                  key={t.id}
                  ref={(el) => { if (el) rows.current.set(t.id, el); else rows.current.delete(t.id) }}
                  className={"flex items-center gap-3 rounded-md border px-3 py-2 " + (isLeaving ? "list-exit" : entering.includes(t.id) ? "list-enter" : "")}
                  onAnimationEnd={(e) => { if (e.target === e.currentTarget && isLeaving) finishRemove(t.id) }}
                  inert={isLeaving || undefined}
                >
                  {/* Wrapping label: checkbox and title share one hit target; the title is the checkbox's name */}
                  <Label className="min-w-0 flex-1 items-start gap-3 font-normal">
                    <Checkbox data-check-id={t.id} checked={t.done} onCheckedChange={() => toggle(t.id)} className="mt-0.5" />
                    <span className="grid min-w-0 gap-0.5">
                      <span className={"text-sm text-pretty break-words " + (t.done ? "text-muted-foreground line-through" : "")}>{t.title}</span>
                      <span className="text-muted-foreground flex items-center gap-1.5 text-xs tabular-nums">
                        <Avatar className="size-5" aria-hidden="true"><AvatarFallback className="text-[9px]">{t.who}</AvatarFallback></Avatar>
                        <span className="sr-only">Owner {t.who},</span>
                        <span className="whitespace-nowrap">{t.due}</span>
                      </span>
                    </span>
                  </Label>
                  {/* aria-disabled, not disabled: moving a row to the top keeps focus on its Move up button */}
                  <div className="flex shrink-0">
                    <Button variant="ghost" size="icon" className="size-7" aria-label={`Move “${t.title}” up`} aria-disabled={atTop || undefined} onClick={() => !atTop && move(t.id, -1)}><ArrowUp /></Button>
                    <Button variant="ghost" size="icon" className="size-7" aria-label={`Move “${t.title}” down`} aria-disabled={atBottom || undefined} onClick={() => !atBottom && move(t.id, 1)}><ArrowDown /></Button>
                    <Button variant="ghost" size="icon" className="size-7" data-remove-id={t.id} aria-label={`Remove “${t.title}”`} onClick={() => remove(t.id)}><X /></Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
