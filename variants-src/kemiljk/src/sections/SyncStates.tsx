import { useRef, useState } from "react"
import { AlertCircle, CloudOff, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"

type Feed = "idle" | "loading" | "error" | "loaded"

const entries = [
  { who: "Maya R.", what: "logged 2.5 h on Spring catalog redesign", when: "9:42 AM", at: "09:42" },
  { who: "Jonah O.", what: "logged 4 h on Donor portal v2", when: "9:10 AM", at: "09:10" },
  { who: "Lena T.", what: "logged 1 h on Menu boards", when: "Yesterday", at: "" },
]

const plural = (n: number, one: string, many = one + "s") => `${n} ${n === 1 ? one : many}`

// Async states with an explicit contract (interaction-contracts):
// - The rate updates optimistically, is labelled as pending until the server answers, rolls back on failure
//   with the attempted value named, and Retry re-sends the same change without retyping.
// - Offline changes are accepted locally and said to be queued, not saved.
// - Busy buttons use aria-disabled, not disabled, so keyboard focus is never dropped mid-action.
export function SyncStates() {
  const [rate, setRate] = useState(135)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const attempts = useRef(0)
  const raiseRef = useRef<HTMLButtonElement>(null)
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
        setSaveError(`Couldn’t save $${nextRate}. The server didn’t respond, so your rate is still $${previous}.`)
      } else {
        toast.success(`Hourly rate is now $${nextRate}`)
      }
    }, 1100)
  }

  function retry() {
    // The alert (and this button) disappear when the retry starts, so keep focus on the action's home.
    raiseRef.current?.focus()
    raiseRate()
  }

  function goOnline(on: boolean) {
    setOffline(!on)
    if (on && queued > 0) {
      toast.success(`Synced ${plural(queued, "queued change")}`)
      setQueued(0)
    }
  }

  function reload() {
    if (feed === "loading") return
    setFeed("loading")
    setTimeout(() => {
      setFeed(failNext ? "error" : "loaded")
      setFailNext(!failNext)
    }, 1200)
  }

  const rateNote = saving ? "Saving…" : offline && queued ? "Saved on this device. Syncs when you reconnect." : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sync</CardTitle>
        <CardDescription>Your default rate and the team’s latest time entries.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        {/* Persistent live region: inserting a role=status node with its text already inside is often not announced. */}
        <div role="status">
          {offline && (
            <div className="border-warning/40 bg-warning/10 flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <CloudOff className="text-warning size-4 shrink-0" aria-hidden />
              <span className="flex-1">
                You’re offline.{" "}
                {queued ? `${plural(queued, "change")} will sync when you reconnect.` : "Changes will sync when you reconnect."}
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-medium" id="rate-label">Default hourly rate</h4>
              <p className="flex items-baseline gap-2">
                <span className={"text-2xl font-semibold tabular-nums transition-colors " + (saving ? "text-muted-foreground" : "")}>${rate}</span>
                <span className="text-muted-foreground text-xs">/hr</span>
              </p>
              <p className="text-muted-foreground min-h-4 text-xs" aria-live="polite">{rateNote}</p>
            </div>
            <Button
              ref={raiseRef}
              data-lab="save-fail"
              onClick={raiseRate}
              aria-disabled={saving || undefined}
              className="aria-disabled:cursor-progress aria-disabled:opacity-60"
            >
              {saving && <RefreshCw className="animate-spin motion-reduce:animate-none" aria-hidden />}
              {saving ? "Saving…" : "Raise by $10"}
            </Button>
          </div>
          {saveError && (
            <div role="alert" className="border-destructive/30 bg-destructive/5 text-destructive flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <AlertCircle className="size-4 shrink-0" aria-hidden />
              <span className="flex-1 text-pretty">{saveError}</span>
              <Button variant="outline" size="sm" data-lab="retry" onClick={retry}>Retry</Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="grid gap-0.5">
            <Label htmlFor="sync-online">Online</Label>
            <p id="sync-online-help" className="text-muted-foreground text-xs">
              {offline ? "Changes stay on this device until you reconnect." : "Changes save to the studio account."}
            </p>
          </div>
          <Switch id="sync-online" checked={!offline} onCheckedChange={goOnline} aria-describedby="sync-online-help" />
          <span hidden data-lab="offline" onClick={() => goOnline(offline)} />
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Time entries</h4>
            <Button
              variant="ghost"
              size="sm"
              data-lab="reload"
              onClick={reload}
              aria-disabled={feed === "loading" || undefined}
              className="aria-disabled:cursor-progress aria-disabled:opacity-60"
            >
              <RefreshCw className={feed === "loading" ? "animate-spin motion-reduce:animate-none" : ""} aria-hidden /> Reload
            </Button>
          </div>
          <div aria-busy={feed === "loading"} className="grid min-h-34 content-start gap-3">
            {feed === "loading" && (
              <>
                <p role="status" className="sr-only">Loading time entries…</p>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="grid gap-1.5" aria-hidden>
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </>
            )}
            {feed === "error" && (
              <div role="alert" className="flex flex-col items-center gap-2 py-4 text-center text-sm">
                <AlertCircle className="text-destructive size-5" aria-hidden />
                <p>Couldn’t load time entries. The server didn’t respond.</p>
                <Button variant="outline" size="sm" onClick={reload}>Try again</Button>
              </div>
            )}
            {feed === "loaded" && (
              <ol className="grid gap-3">
                {entries.map((e) => (
                  <li key={e.what} className="text-sm">
                    <p><span className="font-medium">{e.who}</span> {e.what}</p>
                    {e.at ? <time className="text-muted-foreground block text-xs" dateTime={e.at}>{e.when}</time> : <span className="text-muted-foreground block text-xs">{e.when}</span>}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
