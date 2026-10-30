import { useLayoutEffect, useRef, useState } from "react"
import { ArrowDown, ArrowUp, ListOrdered, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { initialTasks, extraTasks, type Task } from "@/data-extra"
import { PersonAvatar } from "@/components/person"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Round-2 section: a list that changes. Add, complete, remove (with undo), reorder and sort.
// data-lab attributes let the comparison viewer trigger the same action in every variant.
// taste-skill: a list of rules and alignment (app-screens.md 7.1-7.8). 48px rows split by the
// lighter row rule, no box per row; the person as their tinted initials; due dates right-aligned
// on one edge with only "Today" in ink; row actions in one fixed trailing column at the same pitch.
// Motion is feedback only: a row added or undone arrives, a removed row leaves, a moved row
// travels to its new place (FLIP), and the first render has no entrance.
export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [draft, setDraft] = useState("")
  const [sorted, setSorted] = useState(false)
  const [leaving, setLeaving] = useState<Set<string>>(() => new Set())
  const arriving = useRef(new Set<string>())
  const next = useRef(0)

  const visible = sorted ? [...tasks].sort((a, b) => Number(a.done) - Number(b.done) || a.dueOrder - b.dueOrder) : tasks
  const open = tasks.filter((t) => !t.done).length
  const done = tasks.length - open

  // FLIP: remember each row's offset inside the list and animate any row whose place changed.
  const rows = useRef(new Map<string, HTMLLIElement>())
  const lastTop = useRef(new Map<string, number>())
  useLayoutEffect(() => {
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    const tops = new Map<string, number>()
    rows.current.forEach((el, id) => {
      const top = el.offsetTop
      tops.set(id, top)
      const before = lastTop.current.get(id)
      if (!still && before !== undefined && before !== top && el.animate) {
        el.animate([{ transform: `translateY(${before - top}px)` }, { transform: "translateY(0)" }], {
          duration: 280,
          easing: "cubic-bezier(0.76, 0, 0.24, 1)", // --ease-travel: moving between two places
        })
      }
    })
    lastTop.current = tops
  })

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
    arriving.current.add(t.id)
    setTasks((ts) => [t, ...ts])
    setDraft("")
  }

  function remove(id: string) {
    if (leaving.has(id)) return
    const index = tasks.findIndex((t) => t.id === id)
    const task = tasks[index]
    if (!task) return
    setLeaving((s) => new Set(s).add(id))
    window.setTimeout(() => {
      setTasks((ts) => ts.filter((t) => t.id !== id))
      setLeaving((s) => { const n = new Set(s); n.delete(id); return n })
    }, 160)
    toast("Task removed", {
      description: task.title,
      action: {
        label: "Undo",
        onClick: () => {
          arriving.current.add(task.id)
          setTasks((ts) => (ts.some((t) => t.id === task.id) ? ts : [...ts.slice(0, index), task, ...ts.slice(index)]))
        },
      },
    })
  }

  function move(id: string, dir: -1 | 1) {
    setSorted(false)
    setTasks((ts) => {
      const i = ts.findIndex((t) => t.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= ts.length) return ts
      const copy = [...ts]
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
      return copy
    })
  }

  const toggle = (id: string) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  const first = visible.find((t) => !t.done && !leaving.has(t.id))

  return (
    <Card>
      <CardHeader>
        <CardTitle>This week</CardTitle>
        <CardDescription>
          {open} open {open === 1 ? "task" : "tasks"} across the studio{done ? `, ${done} done` : ""}.
        </CardDescription>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            data-lab="task-sort"
            aria-pressed={sorted}
            onClick={() => setSorted(!sorted)}
            className="aria-pressed:bg-secondary aria-pressed:border-transparent"
          >
            <ListOrdered /> {sorted ? "Sorted by due date" : "Sort by due date"}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-3">
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) add(draft) }}>
          <Input id="task-new" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a task and press Enter" aria-label="New task" />
          {/* One control height per row (8.3): the Add button matches the 38px field. */}
          <Button type="button" variant="secondary" data-lab="task-add" className="h-[38px]" onClick={() => add(draft || undefined)}><Plus /> Add</Button>
        </form>
        <span hidden data-lab="task-complete" onClick={() => first && toggle(first.id)} />
        <span hidden data-lab="task-remove" onClick={() => first && remove(first.id)} />
        <span hidden data-lab="task-move" onClick={() => first && move(first.id, 1)} />
        {visible.length === 0 ? (
          // An empty list keeps its frame: one sentence in a 38px dashed box (11).
          <p className="border-input text-muted-foreground flex h-[38px] items-center rounded-lg border border-dashed px-3 text-sm">
            No tasks this week. Add one above.
          </p>
        ) : (
          <ul className="relative" aria-label="Tasks">
            {visible.map((t, i) => {
              const isNew = arriving.current.has(t.id)
              return (
                <li
                  key={t.id}
                  ref={(el) => { if (el) rows.current.set(t.id, el); else rows.current.delete(t.id) }}
                  onAnimationEnd={() => arriving.current.delete(t.id)}
                  className={cn(
                    "border-rule bg-card flex min-h-12 items-center gap-3 border-b py-2 last:border-b-0",
                    isNew && "row-in",
                    leaving.has(t.id) && "row-out",
                  )}
                >
                  <Checkbox checked={t.done} onCheckedChange={() => toggle(t.id)} aria-label={`Mark “${t.title}” done`} />
                  <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:gap-3">
                    <span className={cn("min-w-0 flex-1 text-sm sm:truncate", t.done ? "text-muted-foreground line-through decoration-1" : "")}>{t.title}</span>
                    {/* Dates in words for recency; one right edge; only "Today" in ink (7.4, 7.5). */}
                    <span className={cn("text-xs sm:w-14 sm:text-right sm:text-[13px]", t.due === "Today" && !t.done ? "text-foreground font-medium" : "text-muted-foreground")}>{t.due}</span>
                  </div>
                  <PersonAvatar initials={t.who} className="size-6" />
                  <div className="text-muted-foreground flex">
                    <Button variant="ghost" size="icon" className="size-7 hover:text-foreground" aria-label="Move up" disabled={i === 0} onClick={() => move(t.id, -1)}><ArrowUp /></Button>
                    <Button variant="ghost" size="icon" className="size-7 hover:text-foreground" aria-label="Move down" disabled={i === visible.length - 1} onClick={() => move(t.id, 1)}><ArrowDown /></Button>
                    <Button variant="ghost" size="icon" className="size-7 hover:text-foreground" aria-label={`Remove “${t.title}”`} onClick={() => remove(t.id)}><X /></Button>
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
