import { useEffect, useRef, useState, type CSSProperties } from "react"
import { ArrowDown, ArrowUp, ListOrdered, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { initialTasks, extraTasks, people, type Task } from "@/data-extra"
import { withTransition } from "@/lib/transition"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

const byDue = (a: Task, b: Task) => Number(a.done) - Number(b.done) || a.dueOrder - b.dueOrder
const nameOf = (id: string) => people.find((p) => p.id === id)?.name ?? id

// A list that changes: add, complete, remove (with a real Undo), reorder and sort.
// Every mutation runs through withTransition, so rows keep their identity and the rest of the
// list slides into place (fluid-design #5/#7), the same mechanism as the project cards.
// data-lab attributes let the comparison viewer trigger the same action in every variant.
export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [draft, setDraft] = useState("")
  const [sorted, setSorted] = useState(false)
  const [announce, setAnnounce] = useState("")
  const next = useRef(0)
  const listRef = useRef<HTMLUListElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // After a reorder or removal the focused control can move or vanish; this says where focus goes next.
  const focusAfter = useRef<{ id: string; control: "up" | "down" | "check" } | "input" | null>(null)

  const visible = sorted ? [...tasks].sort(byDue) : tasks
  const open = tasks.filter((t) => !t.done).length

  useEffect(() => {
    const target = focusAfter.current
    if (!target) return
    focusAfter.current = null
    if (target === "input") return inputRef.current?.focus()
    const row = listRef.current?.querySelector<HTMLElement>(`[data-task="${target.id}"]`)
    const wanted = row?.querySelector<HTMLButtonElement>(`[data-control="${target.control}"]`)
    // If the arrow is now disabled (row reached an end), fall back to the opposite arrow.
    const fallback = row?.querySelector<HTMLButtonElement>(`[data-control="${target.control === "up" ? "down" : "up"}"]`)
    ;(wanted && !wanted.disabled ? wanted : fallback)?.focus()
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
    withTransition(() => {
      setTasks((ts) => [t, ...ts])
      setDraft("")
    })
    setAnnounce(`Added “${t.title}”`)
  }

  function remove(id: string) {
    const order = visible
    const index = tasks.findIndex((t) => t.id === id)
    const task = tasks[index]
    if (!task) return
    // Focus moves to the row that takes this one's place, or the input if the list empties.
    const pos = order.findIndex((t) => t.id === id)
    const neighbour = order[pos + 1] ?? order[pos - 1]
    focusAfter.current = neighbour ? { id: neighbour.id, control: "check" } : "input"
    withTransition(() => setTasks((ts) => ts.filter((t) => t.id !== id)))
    toast(`Removed “${task.title}”`, {
      action: {
        label: "Undo",
        onClick: () =>
          withTransition(() =>
            setTasks((ts) => (ts.some((t) => t.id === id) ? ts : [...ts.slice(0, index), task, ...ts.slice(index)])),
          ),
      },
    })
  }

  function move(id: string, dir: -1 | 1) {
    // Moving while sorted adopts the order on screen first, so the swap matches what the person saw.
    const base = visible
    const i = base.findIndex((t) => t.id === id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= base.length) return
    const copy = [...base]
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
    focusAfter.current = { id, control: dir === -1 ? "up" : "down" }
    withTransition(() => {
      setSorted(false)
      setTasks(copy)
    })
    setAnnounce(`Moved “${base[i].title}” to position ${j + 1} of ${base.length}`)
  }

  function toggle(id: string) {
    const update = () => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
    // In sorted view a completed task drops to the bottom, so animate the reflow; otherwise just flip.
    if (sorted) withTransition(update)
    else update()
  }

  function sort() {
    withTransition(() => setSorted((s) => !s))
  }

  const first = visible.find((t) => !t.done)

  return (
    <Card>
      <CardHeader>
        <CardTitle>This week</CardTitle>
        <CardDescription>
          {open === 0 ? "Everything is done." : `${open} open ${open === 1 ? "task" : "tasks"} across the studio.`}
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" data-lab="task-sort" aria-pressed={sorted} onClick={sort}>
            <ListOrdered /> Sort by due date
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) add(draft) }}>
          <label htmlFor="task-new" className="sr-only">New task</label>
          <Input ref={inputRef} id="task-new" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a task and press Enter" autoComplete="off" />
          <Button type="button" variant="secondary" data-lab="task-add" onClick={() => add(draft || undefined)}><Plus /> Add</Button>
        </form>
        <span hidden data-lab="task-complete" onClick={() => first && toggle(first.id)} />
        <span hidden data-lab="task-remove" onClick={() => first && remove(first.id)} />
        <span hidden data-lab="task-move" onClick={() => first && move(first.id, 1)} />
        <p role="status" className="sr-only">{announce}</p>
        {visible.length === 0 ? (
          <p className="text-muted-foreground rounded-md border border-dashed py-6 text-center text-sm">Nothing left this week. Add a task above.</p>
        ) : (
          <ul ref={listRef} className="grid gap-1" aria-label="Tasks">
            {visible.map((t, i) => {
              const today = !t.done && t.due === "Today"
              return (
                <li
                  key={t.id}
                  data-task={t.id}
                  style={{ viewTransitionName: `task-${t.id}`, viewTransitionClass: "task" } as CSSProperties}
                  className={"bg-card flex items-center gap-3 rounded-md border py-1.5 pr-1.5 pl-3 transition-colors " + (t.done ? "bg-muted/40" : "")}
                >
                  <Checkbox id={`task-${t.id}`} data-control="check" checked={t.done} onCheckedChange={() => toggle(t.id)} />
                  <label htmlFor={`task-${t.id}`} className={"min-w-0 flex-1 cursor-pointer text-sm text-pretty " + (t.done ? "text-muted-foreground line-through decoration-muted-foreground/60" : "")}>
                    {t.title}
                  </label>
                  <span className={"shrink-0 text-xs tabular-nums " + (today ? "text-warning font-medium" : "text-muted-foreground")}>
                    {t.due === "No date" ? "No due date" : t.due}
                  </span>
                  <Avatar className="size-6" title={nameOf(t.who)}>
                    <AvatarFallback className="text-[10px]" aria-hidden>{t.who}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Assigned to {nameOf(t.who)}</span>
                  <div className="flex shrink-0" role="group" aria-label={`Actions for “${t.title}”`}>
                    <Button variant="ghost" size="icon" className="size-8" data-control="up" aria-label="Move up" disabled={i === 0} onClick={() => move(t.id, -1)}><ArrowUp /></Button>
                    <Button variant="ghost" size="icon" className="size-8" data-control="down" aria-label="Move down" disabled={i === visible.length - 1} onClick={() => move(t.id, 1)}><ArrowDown /></Button>
                    <Button variant="ghost" size="icon" className="hover:text-destructive size-8" aria-label={`Remove “${t.title}”`} onClick={() => remove(t.id)}><X /></Button>
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
