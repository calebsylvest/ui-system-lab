import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, type Transition } from "motion/react"
import { ArrowDown, ArrowUp, Check, ListOrdered, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { initialTasks, extraTasks, people, type Task } from "@/data-extra"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { IconSwap } from "@/components/ui/icon-swap"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { modKey } from "@/lib/platform"

// Motion (surface-motion): rows enter on the entrance curve, leave ~70% faster on the exit curve,
// and siblings slide into place with a no-bounce spring so the list never jumps.
const enterT: Transition = { duration: 0.2, ease: [0, 0, 0.2, 1] }
const exitT: Transition = { duration: 0.14, ease: [0.4, 0, 1, 1] }
const layoutT: Transition = { type: "spring", bounce: 0, duration: 0.3 }

const byDue = (ts: Task[]) => [...ts].sort((a, b) => Number(a.done) - Number(b.done) || a.dueOrder - b.dueOrder)
const nameOf = (id: string) => people.find((p) => p.id === id)?.name ?? id

type FocusIntent = { kind: "row"; id: string; action: "up" | "down" | "remove" } | { kind: "input" }

// Round-2 section: a list that changes. Add, complete, remove (with undo), reorder and sort.
// data-lab attributes let the comparison viewer trigger the same action in every variant.
export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [draft, setDraft] = useState("")
  const [sorted, setSorted] = useState(false)
  const [announcement, setAnnouncement] = useState("")
  const next = useRef(0)
  const listRef = useRef<HTMLUListElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pendingFocus = useRef<FocusIntent | null>(null)

  const visible = sorted ? byDue(tasks) : tasks
  const open = tasks.filter((t) => !t.done).length

  // Keep keyboard focus on the list when the focused control is removed or becomes disabled
  // (surface-details › Inactive regions / learnings: focus must not fall back to <body>).
  useEffect(() => {
    const intent = pendingFocus.current
    if (!intent) return
    pendingFocus.current = null
    if (intent.kind === "input") { inputRef.current?.focus(); return }
    const row = listRef.current?.querySelector<HTMLElement>(`[data-task-id="${intent.id}"]`)
    const want = row?.querySelector<HTMLButtonElement>(`[data-action="${intent.action}"]`)
    if (want && !want.disabled) { want.focus(); return }
    const other = intent.action === "up" ? "down" : "up"
    row?.querySelector<HTMLButtonElement>(`[data-action="${other}"]:not(:disabled)`)?.focus()
  })

  const focusIsIn = (id: string) => !!document.activeElement?.closest(`[data-task-id="${id}"]`)

  function add(title?: string) {
    const canned = extraTasks[next.current % extraTasks.length]
    const t: Task = {
      id: "n" + Date.now() + next.current,
      title: title?.trim() || canned.title,
      who: title ? "CS" : canned.who,
      due: title ? "No date" : canned.due,
      dueOrder: title ? 99 : canned.dueOrder,
      done: false,
    }
    next.current++
    setTasks((ts) => [t, ...ts])
    setDraft("")
    setAnnouncement(`Added “${t.title}”.`)
  }

  function remove(id: string) {
    const index = tasks.findIndex((t) => t.id === id)
    const task = tasks[index]
    if (!task) return
    if (focusIsIn(id)) {
      const v = visible.findIndex((t) => t.id === id)
      const neighbour = visible[v + 1] ?? visible[v - 1]
      pendingFocus.current = neighbour ? { kind: "row", id: neighbour.id, action: "remove" } : { kind: "input" }
    }
    setTasks((ts) => ts.filter((t) => t.id !== id))
    // Reversible, so no confirmation: act now and offer Undo (system-patterns › Confirmation dialogs).
    toast("Task removed", {
      description: task.title,
      action: { label: "Undo", onClick: () => setTasks((ts) => [...ts.slice(0, index), task, ...ts.slice(index)]) },
    })
  }

  function move(id: string, dir: -1 | 1) {
    if (focusIsIn(id)) pendingFocus.current = { kind: "row", id, action: dir < 0 ? "up" : "down" }
    // Moving inside the sorted view starts from the order the user is looking at,
    // so the list doesn't jump back to the manual order (surface-details › Jumping scroll position).
    setTasks((ts) => {
      const base = sorted ? byDue(ts) : ts
      const i = base.findIndex((t) => t.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= base.length) return base
      const copy = [...base]
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
      return copy
    })
    setSorted(false)
  }

  const toggle = (id: string) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  const first = visible.find((t) => !t.done)

  return (
    <Card>
      <CardHeader>
        <CardTitle>This week</CardTitle>
        <CardDescription className="tabular-nums">{open} open {open === 1 ? "task" : "tasks"} across the studio.</CardDescription>
        <CardAction>
          {/* A toggle keeps one label; aria-pressed and the icon carry the state (system-naming › Toggles). */}
          <Button variant={sorted ? "secondary" : "outline"} size="sm" data-lab="task-sort" aria-pressed={sorted} onClick={() => setSorted(!sorted)}>
            <IconSwap active={sorted} activeIcon={<Check />} inactiveIcon={<ListOrdered />} className="size-4" />
            Sort by due date
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) add(draft) }}>
          <Input ref={inputRef} id="task-new" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a task and press Enter" aria-label="New task" autoComplete="off" enterKeyHint="done" />
          <Button type="button" variant="secondary" data-lab="task-add" onClick={() => add(draft || undefined)}><Plus /> Add</Button>
        </form>
        <span hidden data-lab="task-complete" onClick={() => first && toggle(first.id)} />
        <span hidden data-lab="task-remove" onClick={() => first && remove(first.id)} />
        <span hidden data-lab="task-move" onClick={() => first && move(first.id, 1)} />
        <p className="sr-only" aria-live="polite">{announcement}</p>

        {/* Rows touch (padding, not gap) so there is no dead zone between them (surface-details). */}
        <ul ref={listRef} className="relative -mx-2" aria-label="Tasks">
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((t, i) => (
              <motion.li
                key={t.id}
                data-task-id={t.id}
                layout
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0, transition: enterT }}
                exit={{ opacity: 0, y: 4, transition: exitT }}
                transition={{ layout: layoutT }}
                onKeyDown={(e) => {
                  // ⌘/Ctrl+Backspace removes the focused row (surface-details › Accessibility micro-details).
                  if ((e.metaKey || e.ctrlKey) && e.key === "Backspace") { e.preventDefault(); remove(t.id) }
                }}
                className="bg-card hover:bg-accent/60 focus-within:bg-accent/60 flex items-center gap-3 rounded-lg px-2 transition-colors"
              >
                <Checkbox id={`task-${t.id}`} checked={t.done} onCheckedChange={() => toggle(t.id)} />
                {/* The title is the checkbox's label: a full-height click target and its accessible name. */}
                <label htmlFor={`task-${t.id}`} className={cn("min-w-0 flex-1 cursor-pointer py-2.5 text-sm break-words transition-colors select-none", t.done && "text-muted-foreground decoration-muted-foreground/60 line-through")}>
                  {t.title}
                </label>
                <span className="text-muted-foreground shrink-0 text-xs tabular-nums">{t.due}</span>
                <Avatar className="size-6 shrink-0" aria-hidden title={nameOf(t.who)}><AvatarFallback className="text-[10px]">{t.who}</AvatarFallback></Avatar>
                <span className="sr-only">Assigned to {nameOf(t.who)}</span>
                <div className="flex shrink-0">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground size-8" data-action="up" aria-label="Move up" disabled={i === 0} onClick={() => move(t.id, -1)}><ArrowUp /></Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground size-8" data-action="down" aria-label="Move down" disabled={i === visible.length - 1} onClick={() => move(t.id, 1)}><ArrowDown /></Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground size-8" data-action="remove" aria-label={`Remove “${t.title}”`} aria-keyshortcuts="Meta+Backspace Control+Backspace" title={`Remove (${modKey}⌫)`} onClick={() => remove(t.id)}><X /></Button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        {visible.length === 0 && (
          <p className="animate-enter text-muted-foreground py-6 text-center text-sm">Nothing left for this week. Add a task above to plan ahead.</p>
        )}
      </CardContent>
    </Card>
  )
}
