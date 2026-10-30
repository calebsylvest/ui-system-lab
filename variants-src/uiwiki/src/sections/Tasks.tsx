import { useRef, useState } from "react"
import { ArrowDown, ArrowUp, ListOrdered, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { initialTasks, extraTasks, type Task } from "@/data-extra"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { AnimatedWidth } from "@/components/ui/animated-width"
import { listTransition } from "@/lib/view-transition"

// Round-2 section: a list that changes. Add, complete, remove (with undo), reorder and sort.
// data-lab attributes let the comparison viewer trigger the same action in every variant.
export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [draft, setDraft] = useState("")
  const [sorted, setSorted] = useState(false)
  const next = useRef(0)
  const listRef = useRef<HTMLUListElement>(null)
  // Every list mutation runs inside a native view transition: items slide to their new
  // place, new ones fade in from above, removed ones fade out the same way (exit-matches-initial).
  const animate = (update: () => void) => listTransition(listRef.current, update)

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
    animate(() => setTasks((ts) => [t, ...ts]))
    setDraft("")
  }

  function remove(id: string) {
    const index = tasks.findIndex((t) => t.id === id)
    const task = tasks[index]
    if (!task) return
    animate(() => setTasks((ts) => ts.filter((t) => t.id !== id)))
    toast("Task removed", {
      description: task.title,
      action: { label: "Undo", onClick: () => animate(() => setTasks((ts) => [...ts.slice(0, index), task, ...ts.slice(index)])) },
    })
  }

  function move(id: string, dir: -1 | 1) {
    animate(() => {
      setSorted(false)
      setTasks((ts) => {
        const i = ts.findIndex((t) => t.id === id)
        const j = i + dir
        if (i < 0 || j < 0 || j >= ts.length) return ts
        const copy = [...ts]
        ;[copy[i], copy[j]] = [copy[j], copy[i]]
        return copy
      })
    })
  }

  const toggle = (id: string) => animate(() => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t))))
  const first = visible.find((t) => !t.done)

  return (
    <Card>
      <CardHeader>
        <CardTitle>This week</CardTitle>
        <CardDescription><span className="tabular-nums">{open}</span> open tasks across the studio.</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" data-lab="task-sort" aria-pressed={sorted} onClick={() => animate(() => setSorted(!sorted))}>
            <ListOrdered /> <AnimatedWidth>{sorted ? "Sorted by due date" : "Sort by due date"}</AnimatedWidth>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) add(draft) }}>
          <Input id="task-new" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a task and press Enter" aria-label="New task" />
          <Button type="button" variant="secondary" data-lab="task-add" onClick={() => add(draft || undefined)}><Plus /> Add</Button>
        </form>
        <span hidden data-lab="task-complete" onClick={() => first && toggle(first.id)} />
        <span hidden data-lab="task-remove" onClick={() => first && remove(first.id)} />
        <span hidden data-lab="task-move" onClick={() => first && move(first.id, 1)} />
        {visible.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">No tasks. Add one above.</p>
        ) : (
          <ul ref={listRef} className="grid gap-1">
            {visible.map((t, i) => (
              <li key={t.id} data-vt-name={`task-${t.id}`} className="group flex items-center gap-3 rounded-md border px-3 py-2">
                <Checkbox checked={t.done} onCheckedChange={() => toggle(t.id)} aria-label={`Mark “${t.title}” done`} />
                <span className={"flex-1 text-sm transition-colors duration-150 " + (t.done ? "text-muted-foreground line-through" : "")}>{t.title}</span>
                <span className="text-muted-foreground text-xs tabular-nums">{t.due}</span>
                <Avatar className="size-6"><AvatarFallback className="text-[10px]">{t.who}</AvatarFallback></Avatar>
                <div className="flex">
                  <Button variant="ghost" size="icon" className="size-8" aria-label="Move up" disabled={i === 0} onClick={() => move(t.id, -1)}><ArrowUp /></Button>
                  <Button variant="ghost" size="icon" className="size-8" aria-label="Move down" disabled={i === visible.length - 1} onClick={() => move(t.id, 1)}><ArrowDown /></Button>
                  <Button variant="ghost" size="icon" className="size-8" aria-label={`Remove “${t.title}”`} onClick={() => remove(t.id)}><X /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
