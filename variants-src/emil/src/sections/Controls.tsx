import { useRef, useState } from "react"
import { Bold, Heart, Italic, Plus, RefreshCw, Star, Underline } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

// Hold-to-confirm for the destructive action (emil-design-eng "Hold-to-delete pattern";
// animate/RECIPES "Hold to confirm"): 2s linear fill while pressed, 200ms ease-out snap back.
function HoldToDelete() {
  const [holding, setHolding] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const start = () => {
    if (timer.current) return
    setHolding(true)
    timer.current = window.setTimeout(() => {
      timer.current = undefined
      setHolding(false)
      toast("Deleted")
    }, 2000)
  }
  const cancel = () => {
    window.clearTimeout(timer.current)
    timer.current = undefined
    setHolding(false)
  }
  const isKey = (k: string) => k === " " || k === "Enter"
  return (
    <Button variant="destructive" data-holding={holding || undefined} className="relative overflow-hidden"
      aria-description="Press and hold to delete"
      onPointerDown={start} onPointerUp={cancel} onPointerLeave={cancel} onPointerCancel={cancel}
      onKeyDown={(e) => { if (isKey(e.key)) { e.preventDefault(); if (!e.repeat) start() } }}
      onKeyUp={(e) => { if (isKey(e.key)) cancel() }}
      onBlur={cancel}>
      <span aria-hidden className="hold-overlay absolute inset-0 bg-black/25" />
      <span className="relative">Delete</span>
    </Button>
  )
}

export function Controls() {
  const [liked, setLiked] = useState(false)
  const [starred, setStarred] = useState(3)
  const [fmt, setFmt] = useState<string[]>(["bold"])
  const toggleFmt = (k: string) => setFmt((f) => (f.includes(k) ? f.filter((x) => x !== k) : [...f, k]))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Controls</CardTitle>
        <CardDescription>Every button style, plus a few stateful toggles and toasts.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <HoldToDelete />
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" variant="outline" aria-label="Add"><Plus /></Button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex rounded-md border p-0.5">
            {[
              { k: "bold", icon: Bold, label: "Bold" },
              { k: "italic", icon: Italic, label: "Italic" },
              { k: "underline", icon: Underline, label: "Underline" },
            ].map(({ k, icon: Icon, label }) => (
              <Tooltip key={k}>
                <TooltipTrigger asChild>
                  <Button size="icon" variant={fmt.includes(k) ? "secondary" : "ghost"} aria-pressed={fmt.includes(k)} aria-label={label} onClick={() => toggleFmt(k)} className="size-8">
                    <Icon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
          <Button variant="outline" aria-pressed={liked} onClick={() => setLiked(!liked)}>
            <Heart className={liked ? "fill-current text-red-500" : ""} /> {liked ? "Liked" : "Like"}
          </Button>
          <Button variant="outline" onClick={() => setStarred((s) => s + 1)}>
            <Star /> Star <span className="text-muted-foreground tabular-nums">{starred}</span>
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => toast("Draft saved")}>Plain toast</Button>
          <Button variant="outline" onClick={() => toast.success("Invoice INV-1042 sent")}>Success toast</Button>
          <Button variant="outline" onClick={() => toast.error("Payment failed", { description: "The card was declined. Ask the client for another card." })}>Error toast</Button>
          <Button variant="outline" onClick={() => toast.promise(new Promise((r) => setTimeout(r, 1500)), { loading: "Syncing with QuickBooks", success: "Synced 12 invoices", error: "Sync failed" })}>
            <RefreshCw /> Promise toast
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
