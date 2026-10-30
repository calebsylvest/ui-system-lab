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
  // Enter/exit motion without a motion library: ids that should play the one-shot enter,
  // and ids playing the 150ms subtle exit before they are actually removed.
  const [entering, setEntering] = useState<Set<string>>(() => new Set())
  const [leaving, setLeaving] = useState<Set<string>>(() => new Set())
  const markEntering = (id: string) => setEntering((s) => new Set(s).add(id))
  const doneEntering = (id: string) => setEntering((s) => { const n = new Set(s); n.delete(id); return n })

  const visible = sorted ? [...tasks].sort((a, b) => Number(a.done) - Number(b.done) || a.dueOrder - b.dueOrder) : tasks
  const open = tasks.filter((t) => !t.done && !leaving.has(t.id)).length

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
    markEntering(t.id)
    setTasks((ts) => [t, ...ts])
    setDraft("")
  }

  function remove(id: string) {
    const index = tasks.findIndex((t) => t.id === id)
    const task = tasks[index]
    if (!task || leaving.has(id)) return
    const drop = () => {
      setTasks((ts) => ts.filter((t) => t.id !== id))
      setLeaving((s) => { const n = new Set(s); n.delete(id); return n })
    }
    // Subtle exit (150ms, small fixed translateY) keeps spatial context; removed instantly under reduced motion.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) drop()
    else { setLeaving((s) => new Set(s).add(id)); setTimeout(drop, 150) }
    toast("Task removed", {
      description: task.title,
      action: {
        label: "Undo",
        onClick: () => {
          markEntering(task.id)
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
        <CardDescription><span className="tabular-nums">{open}</span> open tasks across the studio.</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" className="aria-pressed:bg-accent aria-pressed:shadow-border-hover" data-lab="task-sort" aria-pressed={sorted} onClick={() => setSorted(!sorted)}>
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
          <p className="stagger-item text-muted-foreground py-6 text-center text-sm">No tasks. Add one above.</p>
        ) : (
          <ul className="grid gap-1">
            {visible.map((t, i) => (
              <li
                key={t.id}
                className={cn(
                  // Concentric: 6px buttons + 8px vertical padding = 14px row. Shadow-as-border, not a solid border.
                  "group flex items-center gap-3 rounded-xl px-3 py-2 shadow-border transition-[opacity,translate,filter] duration-150 ease-out",
                  entering.has(t.id) && "enter-item",
                  leaving.has(t.id) && "pointer-events-none -translate-y-3 opacity-0 blur-[4px]",
                )}
                aria-hidden={leaving.has(t.id) || undefined}
                onAnimationEnd={() => doneEntering(t.id)}
              >
                <Checkbox checked={t.done} onCheckedChange={() => toggle(t.id)} aria-label={`Mark “${t.title}” done`} />
                <span className={cn("flex-1 text-sm transition-[color] duration-150 ease-out", t.done && "text-muted-foreground line-through")}>{t.title}</span>
                <span className="text-muted-foreground text-xs">{t.due}</span>
                <Avatar className="size-6"><AvatarFallback className="text-[10px]">{t.who}</AvatarFallback></Avatar>
                <div className="flex">
                  <Button variant="ghost" size="icon" className="size-7 rounded-sm after:min-w-0" aria-label="Move up" disabled={i === 0} onClick={() => move(t.id, -1)}><ArrowUp /></Button>
                  <Button variant="ghost" size="icon" className="size-7 rounded-sm after:min-w-0" aria-label="Move down" disabled={i === visible.length - 1} onClick={() => move(t.id, 1)}><ArrowDown /></Button>
                  <Button variant="ghost" size="icon" className="size-7 rounded-sm after:min-w-0" aria-label={`Remove “${t.title}”`} onClick={() => remove(t.id)}><X /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
