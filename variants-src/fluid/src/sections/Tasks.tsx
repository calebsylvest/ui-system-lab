import { forwardRef, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ArrowDown, ArrowUp, ListOrdered, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { initialTasks, extraTasks, type Task } from "@/data-extra"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputField, InputGroup } from "@/components/ui/input-group"
import { FluidHoverHighlight } from "@/components/fluid-hover-highlight"
import { useFluidHover, useRegisterFluidHoverItem } from "@/hooks/use-fluid-hover"
import { spring } from "@/lib/springs"
import { fontWeights } from "@/lib/font-weight"
import { useShape } from "@/lib/shape-context"
import { useSize } from "@/lib/size-context"
import { cn } from "@/lib/utils"

// Round-2 section: a list that changes. Add, complete, remove (with undo), reorder and sort.
// data-lab attributes let the comparison viewer trigger the same action in every variant.
//
// Fluid treatment (see CHANGES.md, Round 2):
// - one useFluidHover highlight per list; rows touch (gap 0) and sit on the 36px control height
// - rows enter on spring.moderate (opacity only — no travel in an app), leave on its exit tween,
//   and slide to new places with `layout` on spring.moderate (panels that must land exactly)
// - the check square is drawn like CheckboxItem's: 16px outline with 5px corners that steps aside
//   for a self-drawing check (pathLength 0.08s easeOut in, 0.04s easeIn out)
export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [draft, setDraft] = useState("")
  const [sorted, setSorted] = useState(false)
  const next = useRef(0)
  const listRef = useRef<HTMLUListElement>(null)
  const hover = useFluidHover(listRef, { axis: "y" })
  const shape = useShape()

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
          <Button variant="tertiary" size="compact" leadingIcon={ListOrdered} active={sorted} data-lab="task-sort" aria-pressed={sorted} onClick={() => setSorted(!sorted)}>
            {sorted ? "Sorted by due date" : "Sort by due date"}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form className="flex items-start gap-2" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) add(draft) }}>
          <InputGroup className="flex-1">
            <InputField index={0} id="task-new" label="New task" labelHidden placeholder="Add a task and press Enter" value={draft} onChange={setDraft} />
          </InputGroup>
          <Button type="button" variant="secondary" leadingIcon={Plus} data-lab="task-add" onClick={() => add(draft || undefined)}>Add</Button>
        </form>
        <span hidden data-lab="task-complete" onClick={() => first && toggle(first.id)} />
        <span hidden data-lab="task-remove" onClick={() => first && remove(first.id)} />
        <span hidden data-lab="task-move" onClick={() => first && move(first.id, 1)} />
        {visible.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-[length:var(--fs-body,13px)] leading-[var(--lh-body,20px)]">No tasks. Add one above.</p>
        ) : (
          <ul ref={listRef} {...hover.handlers} className="relative -mx-2 grid">
            <FluidHoverHighlight hover={hover} className={shape.bg} />
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((t, i) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  index={i}
                  last={i === visible.length - 1}
                  active={hover.activeIndex === i}
                  registerItem={hover.registerItem}
                  onToggle={() => toggle(t.id)}
                  onMove={(dir) => move(t.id, dir)}
                  onRemove={() => remove(t.id)}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

type RowProps = {
  task: Task
  index: number
  last: boolean
  active: boolean
  registerItem: (index: number, el: HTMLElement | null) => void
  onToggle: () => void
  onMove: (dir: -1 | 1) => void
  onRemove: () => void
}

const TaskRow = forwardRef<HTMLLIElement, RowProps>(function TaskRow(
  { task: t, index, last, active, registerItem, onToggle, onMove, onRemove },
  forwarded
) {
  const ref = useRef<HTMLLIElement | null>(null)
  useRegisterFluidHoverItem(registerItem, index, ref)
  const size = useSize()
  const shape = useShape()

  return (
    <motion.li
      ref={(node) => {
        ref.current = node
        if (typeof forwarded === "function") forwarded(node)
        else if (forwarded) forwarded.current = node
      }}
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: spring.moderate.exit }}
      transition={spring.moderate}
      className={cn("relative z-10 flex items-center gap-1 pr-1", size.control, shape.item)}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={t.done}
        onClick={onToggle}
        className={cn(
          "flex h-full min-w-0 flex-1 cursor-pointer items-center gap-2 pl-2 text-left outline-none",
          "focus-visible:ring-1 focus-visible:ring-[color:var(--focus-ring,#6B97FF)]",
          shape.item
        )}
      >
        <span className="relative size-4 shrink-0" aria-hidden>
          <span
            className={cn(
              "absolute inset-0 rounded-[5px] border-[1.5px] border-solid transition-colors duration-80",
              t.done ? "border-transparent" : active ? "border-neutral-400 dark:border-neutral-500" : "border-border"
            )}
          />
          <AnimatePresence initial={false}>
            {t.done && (
              <motion.svg
                key="check"
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-foreground"
              >
                <motion.path
                  d="M6 12L10 16L18 8"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1, transition: { duration: 0.08, ease: "easeOut" } }}
                  exit={{ pathLength: 0, transition: { duration: 0.04, ease: "easeIn" } }}
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </span>
        <span
          className={cn(
            "min-w-0 flex-1 truncate transition-[color] duration-80 [text-box:trim-both_cap_alphabetic]",
            size.text,
            t.done ? "text-muted-foreground line-through" : "text-foreground"
          )}
          style={{ fontVariationSettings: fontWeights.normal }}
        >
          {t.title}
        </span>
      </button>
      <span className={cn("text-muted-foreground shrink-0 tabular-nums", size.type.caption)}>{t.due}</span>
      <Avatar className="ml-1 size-6 shrink-0"><AvatarFallback className="text-[length:var(--fs-micro,11px)]">{t.who}</AvatarFallback></Avatar>
      <div className="ml-1 flex shrink-0">
        <Button variant="ghost" size="icon-compact" aria-label="Move up" disabled={index === 0} onClick={() => onMove(-1)}><ArrowUp /></Button>
        <Button variant="ghost" size="icon-compact" aria-label="Move down" disabled={last} onClick={() => onMove(1)}><ArrowDown /></Button>
        <Button variant="ghost" size="icon-compact" aria-label={`Remove “${t.title}”`} onClick={onRemove}><X /></Button>
      </div>
    </motion.li>
  )
})
