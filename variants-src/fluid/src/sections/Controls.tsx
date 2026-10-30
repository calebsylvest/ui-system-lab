import { useState } from "react"
import { Bold, Heart, Italic, Plus, RefreshCw, Star, Trash2, Underline } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip } from "@/components/ui/tooltip"

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
        {/* Fluid ships four variants. Baseline's outline/link/destructive map to tertiary/ghost/secondary+icon. */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="secondary" leadingIcon={Trash2}>Delete</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="primary" loading>Loading</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" size="compact">Compact</Button>
          <Button variant="primary">Default</Button>
          <Button variant="tertiary" size="icon" aria-label="Add"><Plus /></Button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex rounded-md border p-0.5">
            {[
              { k: "bold", icon: Bold, label: "Bold" },
              { k: "italic", icon: Italic, label: "Italic" },
              { k: "underline", icon: Underline, label: "Underline" },
            ].map(({ k, icon: Icon, label }) => (
              <Tooltip key={k} content={label}>
                <Button size="icon-compact" variant="ghost" active={fmt.includes(k)} aria-pressed={fmt.includes(k)} aria-label={label} onClick={() => toggleFmt(k)}><Icon /></Button>
              </Tooltip>
            ))}
          </div>
          <Button variant="tertiary" aria-pressed={liked} onClick={() => setLiked(!liked)} leadingIcon={Heart}
            className={liked ? "[&_svg]:fill-current [&_svg]:text-red-500" : ""}>
            {liked ? "Liked" : "Like"}
          </Button>
          <Button variant="tertiary" leadingIcon={Star} onClick={() => setStarred((s) => s + 1)}>
            Star <span className="text-muted-foreground tabular-nums">{starred}</span>
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="tertiary" onClick={() => toast("Draft saved")}>Plain toast</Button>
          <Button variant="tertiary" onClick={() => toast.success("Invoice INV-1042 sent")}>Success toast</Button>
          <Button variant="tertiary" onClick={() => toast.error("Payment failed", { description: "The card was declined. Ask the client for another card." })}>Error toast</Button>
          <Button variant="tertiary" leadingIcon={RefreshCw} onClick={() => toast.promise(new Promise((r) => setTimeout(r, 1500)), { loading: "Syncing with QuickBooks", success: "Synced 12 invoices", error: "Sync failed" })}>
            Promise toast
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
