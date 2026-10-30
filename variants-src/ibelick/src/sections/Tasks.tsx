import { useRef, useState } from "react"
import { ArrowDown, ArrowUp, ListOrdered, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { initialTasks, extraTasks, type Task } from "@/data-extra"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Round-2 section: a list that changes. Add, complete, remove (with undo), reorder and sort.
// data-lab attributes let the comparison viewer trigger the same action in every variant.
export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [draft, setDraft] = useState("")
  const [sorted, setSorted] = useState(false)
  const next = useRef(0)
  const listRef = useRef<HTMLUListElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // Screen-reader echo of list changes, so the Undo toast isn't the only feedback.
  const [announcement, setAnnouncement] = useState("")

  // Moving or removing a row can drop keyboard focus to <body>. Put it back on a sensible control.
  function refocus(selector: string, fallback?: () => void) {
    requestAnimationFrame(() => {
      const el = listRef.current?.querySelector<HTMLElement>(selector)
      if (el && !el.hasAttribute("disabled")) el.focus()
      else fallback?.()
    })
  }

  const visible = sorted ? [...tasks].sort((a, b) => Number(a.done) - Number(b.done) || a.dueOrder - b.dueOrder) : tasks
  const open = tasks.filter((t) => !t.done).length

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
    setAnnouncement(`Added “${t.title}”`)
  }

  function remove(id: string, restoreFocus = false) {
    const index = tasks.findIndex((t) => t.id === id)
    const task = tasks[index]
    if (!task) return
    const neighbour = visible[visible.findIndex((t) => t.id === id) + 1] ?? visible[visible.findIndex((t) => t.id === id) - 1]
    setTasks((ts) => ts.filter((t) => t.id !== id))
    setAnnouncement(`Removed “${task.title}”. Undo is available in the notification.`)
    toast("Task removed", {
      description: task.title,
      action: {
        label: "Undo",
        onClick: () => {
          setTasks((ts) => [...ts.slice(0, index), task, ...ts.slice(index)])
          setAnnouncement(`Restored “${task.title}”`)
        },
      },
    })
    // Focus the next row's Remove button (or the previous one), else the new-task field.
    if (restoreFocus) refocus(`[data-task-id="${neighbour?.id}"] [data-action="remove"]`, () => inputRef.current?.focus())
  }

  function move(id: string, dir: -1 | 1, restoreFocus = false) {
    const task = tasks.find((t) => t.id === id)
    if (task) setAnnouncement(`Moved “${task.title}” ${dir < 0 ? "up" : "down"}`)
    if (restoreFocus) {
      const row = `[data-task-id="${id}"]`
      refocus(`${row} [data-action="${dir < 0 ? "up" : "down"}"]`, () => refocus(`${row} [data-action="${dir < 0 ? "down" : "up"}"]`))
    }
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
  const first = visible.find((t) => !t.done)

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">This week</CardTitle>
        <CardDescription className="tabular-nums">{open} open {open === 1 ? "task" : "tasks"} across the studio.</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" data-lab="task-sort" aria-pressed={sorted} onClick={() => setSorted(!sorted)}>
            <ListOrdered /> {sorted ? "Sorted by due date" : "Sort by due date"}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) add(draft) }}>
          <Input ref={inputRef} id="task-new" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a task and press Enter" aria-label="New task" />
          <Button type="button" variant="secondary" data-lab="task-add" onClick={() => add(draft || undefined)}><Plus /> Add</Button>
        </form>
        <span hidden data-lab="task-complete" onClick={() => first && toggle(first.id)} />
        <span hidden data-lab="task-remove" onClick={() => first && remove(first.id)} />
        <span hidden data-lab="task-move" onClick={() => first && move(first.id, 1)} />
        {visible.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm text-pretty">No tasks. Add one above.</p>
        ) : (
          <ul ref={listRef} aria-label="Tasks" className="grid gap-1">
            {visible.map((t, i) => (
              <li key={t.id} data-task-id={t.id} className="flex min-w-0 items-center gap-3 rounded-md border px-3 py-2">
                <Checkbox checked={t.done} onCheckedChange={() => toggle(t.id)} aria-label={`Mark “${t.title}” done`} />
                <span className={cn("min-w-0 flex-1 truncate text-sm", t.done && "text-muted-foreground line-through")} title={t.title}>{t.title}</span>
                <span className="text-muted-foreground shrink-0 text-xs whitespace-nowrap tabular-nums"><span className="sr-only">Due </span>{t.due}</span>
                <Avatar aria-hidden className="size-6 shrink-0"><AvatarFallback className="text-[10px]">{t.who}</AvatarFallback></Avatar>
                <span className="sr-only">Assigned to {t.who}</span>
                <div className="flex shrink-0">
                  <Button variant="ghost" size="icon" className="size-7" data-action="up" aria-label={`Move “${t.title}” up`} disabled={i === 0} onClick={() => move(t.id, -1, true)}><ArrowUp /></Button>
                  <Button variant="ghost" size="icon" className="size-7" data-action="down" aria-label={`Move “${t.title}” down`} disabled={i === visible.length - 1} onClick={() => move(t.id, 1, true)}><ArrowDown /></Button>
                  <Button variant="ghost" size="icon" className="size-7" data-action="remove" aria-label={`Remove “${t.title}”`} onClick={() => remove(t.id, true)}><X /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p role="status" className="sr-only">{announcement}</p>
      </CardContent>
    </Card>
  )
}
