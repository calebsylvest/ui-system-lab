import { useState } from "react"
import { Bold, Heart, Italic, Plus, RefreshCw, Star, Underline } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

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
          <Button variant="destructive">Delete</Button>
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
            <Star /> Star <span className="text-muted-foreground">{starred}</span>
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
