import { useRef, useState } from "react"
import { ArrowDown, ArrowUp, ListOrdered, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { initialTasks, extraTasks, type Task } from "@/data-extra"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { useFlipList } from "@/lib/use-flip-list"
import { plural } from "@/lib/utils"

// Round-2 section: a list that changes. Add, complete, remove (with undo), reorder and sort.
// data-lab attributes let the comparison viewer trigger the same action in every variant.
export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [draft, setDraft] = useState("")
  const [sorted, setSorted] = useState(false)
  const next = useRef(0)
  // Motion: rows move with a WAAPI FLIP (lib/use-flip-list), new rows enter via @starting-style.
  const listRef = useRef<HTMLDivElement>(null)
  const ghostRef = useRef<HTMLDivElement>(null)
  const flip = useFlipList(listRef, ghostRef, () => document.getElementById("task-new"))
  // Only rows added after mount get the entrance; the first paint stays still (frequency gate).
  const entering = useRef(new Set<string>())

  const visible = sorted ? [...tasks].sort((a, b) => Number(a.done) - Number(b.done) || a.dueOrder - b.dueOrder) : tasks
  const open = tasks.filter((t) => !t.done).length

  // `quiet` = submitted with Enter. Keyboard-initiated actions don't animate (emil-design-eng),
  // same call as the Assistant composer in round 1.
  function add(title?: string, quiet = false) {
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
    if (!quiet) {
      flip()
      entering.current.add(t.id)
    }
    setTasks((ts) => [t, ...ts])
    setDraft("")
  }

  function remove(id: string) {
    const index = tasks.findIndex((t) => t.id === id)
    const task = tasks[index]
    if (!task) return
    flip()
    setTasks((ts) => ts.filter((t) => t.id !== id))
    toast("Task removed", {
      description: task.title,
      action: {
        label: "Undo",
        onClick: () => {
          flip()
          entering.current.add(task.id)
          setTasks((ts) => [...ts.slice(0, index), task, ...ts.slice(index)])
        },
      },
    })
  }

  function move(id: string, dir: -1 | 1) {
    flip()
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

  const toggle = (id: string) => {
    flip() // when sorted, finishing a task moves it to the bottom
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }
  const first = visible.find((t) => !t.done)

  return (
    <Card>
      <CardHeader>
        <CardTitle>This week</CardTitle>
        <CardDescription>{plural(open, "open task", "open tasks")} across the studio.</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" data-lab="task-sort" aria-pressed={sorted} onClick={() => { flip(); setSorted(!sorted) }}>
            <ListOrdered /> {sorted ? "Sorted by due date" : "Sort by due date"}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) add(draft, true) }}>
          <Input id="task-new" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a task and press Enter" aria-label="New task" />
          <Button type="button" variant="secondary" data-lab="task-add" onClick={() => add(draft || undefined)}><Plus /> Add</Button>
        </form>
        <span hidden data-lab="task-complete" onClick={() => first && toggle(first.id)} />
        <span hidden data-lab="task-remove" onClick={() => first && remove(first.id)} />
        <span hidden data-lab="task-move" onClick={() => first && move(first.id, 1)} />
        <div ref={listRef} className="relative">
        {visible.length === 0 ? (
          <p className="enter-fade text-muted-foreground py-6 text-center text-sm">No tasks. Add one above.</p>
        ) : (
          <ul className="grid gap-1">
            {visible.map((t, i) => (
              <li key={t.id} data-flip-id={t.id} className={"bg-card group flex items-center gap-3 rounded-md border px-3 py-2" + (entering.current.has(t.id) ? " enter-row" : "")}>
                <Checkbox checked={t.done} onCheckedChange={() => toggle(t.id)} aria-label={`Mark “${t.title}” done`} />
                <span className={"flex-1 text-sm " + (t.done ? "text-muted-foreground line-through" : "")}>{t.title}</span>
                <span className="text-muted-foreground text-xs">{t.due}</span>
                <Avatar className="size-6"><AvatarFallback className="text-[10px]">{t.who}</AvatarFallback></Avatar>
                <div className="flex">
                  <Button variant="ghost" size="icon" className="size-7" aria-label="Move up" disabled={i === 0} onClick={() => move(t.id, -1)}><ArrowUp /></Button>
                  <Button variant="ghost" size="icon" className="size-7" aria-label="Move down" disabled={i === visible.length - 1} onClick={() => move(t.id, 1)}><ArrowDown /></Button>
                  <Button variant="ghost" size="icon" className="size-7" aria-label={`Remove “${t.title}”`} onClick={() => remove(t.id)}><X /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
          {/* Exit clones of removed rows live here, outside React's children. */}
          <div ref={ghostRef} aria-hidden className="pointer-events-none absolute inset-0" />
        </div>
      </CardContent>
    </Card>
  )
}
