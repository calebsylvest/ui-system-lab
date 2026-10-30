import { useRef, useState } from "react"
import { AlertCircle, RefreshCw, WifiOff } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"

type Feed = "idle" | "loading" | "error" | "loaded"

const entries = [
  { who: "Maya R.", what: "logged 2.5 h on Spring catalog redesign", when: "9:42 AM" },
  { who: "Jonah O.", what: "logged 4 h on Donor portal v2", when: "9:10 AM" },
  { who: "Lena T.", what: "logged 1 h on Menu boards", when: "Yesterday" },
]

// Round-2 section: async states. An optimistic save that fails and rolls back,
// an offline mode that queues changes, and a reload that can fail.
export function SyncStates() {
  const [rate, setRate] = useState(135)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const attempts = useRef(0)
  const [offline, setOffline] = useState(false)
  const [queued, setQueued] = useState(0)
  const [feed, setFeed] = useState<Feed>("loaded")
  const [failNext, setFailNext] = useState(true)

  function raiseRate() {
    if (saving) return
    const previous = rate
    const nextRate = rate + 10
    setRate(nextRate) // optimistic
    setSaveError(null)
    if (offline) { setQueued((q) => q + 1); return }
    setSaving(true)
    attempts.current++
    const fails = attempts.current % 2 === 1 // first try fails, retry succeeds
    setTimeout(() => {
      setSaving(false)
      if (fails) {
        setRate(previous) // roll back
        setSaveError("Couldn’t save the new rate. The server didn’t respond.")
      } else {
        toast.success(`Hourly rate is now $${nextRate}`)
      }
    }, 1100)
  }

  function goOnline(on: boolean) {
    setOffline(!on)
    if (on && queued > 0) {
      toast.success(`Synced ${queued} queued change${queued === 1 ? "" : "s"}`)
      setQueued(0)
    }
  }

  function reload() {
    setFeed("loading")
    setTimeout(() => {
      setFeed(failNext ? "error" : "loaded")
      setFailNext(!failNext)
    }, 1200)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Sync</CardTitle>
        <CardDescription>Saving, failing, retrying and working offline.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        {offline && (
          <div role="status" className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <WifiOff aria-hidden className="size-4 shrink-0" />
            <span className="flex-1 text-pretty tabular-nums">You’re offline. {queued ? `${queued} change${queued === 1 ? "" : "s"} will sync when you reconnect.` : "Changes will sync when you reconnect."}</span>
          </div>
        )}

        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Default hourly rate</p>
              <p className="text-2xl font-semibold tabular-nums">${rate}</p>
            </div>
            <Button data-lab="save-fail" onClick={raiseRate} disabled={saving} aria-busy={saving} aria-describedby={saveError ? "rate-error" : undefined}>
              {saving && <RefreshCw aria-hidden className="animate-spin motion-reduce:animate-none" />}
              {saving ? "Saving" : "Raise by $10"}
            </Button>
          </div>
          {saveError && (
            <div role="alert" className="text-destructive flex items-center gap-2 text-sm">
              <AlertCircle aria-hidden className="size-4 shrink-0" />
              <span id="rate-error" className="flex-1 text-pretty">{saveError}</span>
              <Button variant="outline" size="sm" data-lab="retry" onClick={raiseRate}>Retry</Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="sync-online">Online</Label>
          <Switch id="sync-online" checked={!offline} onCheckedChange={goOnline} />
          <span hidden data-lab="offline" onClick={() => goOnline(offline)} />
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <p id="entries-label" className="text-sm font-medium">Time entries</p>
            <Button variant="ghost" size="sm" data-lab="reload" onClick={reload} disabled={feed === "loading"}><RefreshCw aria-hidden /> Reload</Button>
          </div>
          {feed === "loading" && (
            <ul aria-busy aria-labelledby="entries-label" className="grid gap-3">
              {[0, 1, 2].map((i) => (
                <li key={i} className="grid gap-1.5">
                  <span className="sr-only">Loading entry</span>
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-1/4" />
                </li>
              ))}
            </ul>
          )}
          {feed === "error" && (
            <div role="alert" className="flex flex-col items-center gap-2 py-4 text-center text-sm">
              <AlertCircle aria-hidden className="text-destructive size-5" />
              <p className="text-pretty">Couldn’t load time entries.</p>
              <Button variant="outline" size="sm" onClick={reload}>Try again</Button>
            </div>
          )}
          {feed === "loaded" && (
            <ul aria-labelledby="entries-label" className="grid gap-3">
              {entries.map((e) => (
                <li key={e.what} className="text-sm">
                  <p className="text-pretty"><span className="font-medium">{e.who}</span> {e.what}</p>
                  <p className="text-muted-foreground text-xs tabular-nums">{e.when}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
