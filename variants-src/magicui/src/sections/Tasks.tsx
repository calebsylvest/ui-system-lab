import { useRef, useState } from "react"
import { ArrowDown, ArrowUp, ListOrdered, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { AnimatePresence } from "motion/react"
import { AnimatedListItem } from "@/components/ui/animated-list"
import { initialTasks, extraTasks, type Task } from "@/data-extra"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

// Round-2 section: a list that changes. Add, complete, remove (with undo), reorder and sort.
// data-lab attributes let the comparison viewer trigger the same action in every variant.
export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [draft, setDraft] = useState("")
  const [sorted, setSorted] = useState(false)
  const next = useRef(0)

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
  }

  function remove(id: string) {
    const index = tasks.findIndex((t) => t.id === id)
    const task = tasks[index]
    if (!task) return
    setTasks((ts) => ts.filter((t) => t.id !== id))
    toast("Task removed", {
      description: task.title,
      action: { label: "Undo", onClick: () => setTasks((ts) => [...ts.slice(0, index), task, ...ts.slice(index)]) },
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
  const first = visible.find((t) => !t.done)

  return (
    <Card>
      <CardHeader>
        <CardTitle>This week</CardTitle>
        <CardDescription>{open} open tasks across the studio.</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" data-lab="task-sort" aria-pressed={sorted} onClick={() => setSorted(!sorted)}>
            <ListOrdered /> {sorted ? "Sorted by due date" : "Sort by due date"}
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
          <div role="list" className="grid gap-1">
            {/* Magic UI animated-list items: spring scale/opacity on enter and exit, plus `layout`
                so reorder, sort and removal slide neighbours instead of jumping. initial={false}
                keeps the first paint static (BlurFade already handles the section entrance). */}
            <AnimatePresence initial={false}>
            {visible.map((t, i) => (
              <AnimatedListItem key={t.id}>
              <div role="listitem" className="group bg-card flex items-center gap-3 rounded-md border px-3 py-2">
                <Checkbox checked={t.done} onCheckedChange={() => toggle(t.id)} aria-label={`Mark “${t.title}” done`} />
                <span className={"flex-1 text-sm " + (t.done ? "text-muted-foreground line-through" : "")}>{t.title}</span>
                <span className="text-muted-foreground text-xs">{t.due}</span>
                <Avatar className="size-6"><AvatarFallback className="text-[10px]">{t.who}</AvatarFallback></Avatar>
                <div className="flex">
                  <Button variant="ghost" size="icon" className="size-7" aria-label="Move up" disabled={i === 0} onClick={() => move(t.id, -1)}><ArrowUp /></Button>
                  <Button variant="ghost" size="icon" className="size-7" aria-label="Move down" disabled={i === visible.length - 1} onClick={() => move(t.id, 1)}><ArrowDown /></Button>
                  <Button variant="ghost" size="icon" className="size-7" aria-label={`Remove “${t.title}”`} onClick={() => remove(t.id)}><X /></Button>
                </div>
              </div>
              </AnimatedListItem>
            ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
