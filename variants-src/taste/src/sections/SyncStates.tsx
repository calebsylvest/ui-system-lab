import { useRef, useState } from "react"
import { AlertCircle, RefreshCw, WifiOff } from "lucide-react"
import { toast } from "sonner"
import { PersonAvatar } from "@/components/person"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type Feed = "idle" | "loading" | "error" | "loaded"

const entries = [
  { who: "Maya R.", initials: "MR", what: "logged 2.5 h on Spring catalog redesign", when: "9:42 AM" },
  { who: "Jonah O.", initials: "JO", what: "logged 4 h on Donor portal v2", when: "9:10 AM" },
  { who: "Lena T.", initials: "LT", what: "logged 1 h on Menu boards", when: "Yesterday" },
]

const clock = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })

// Round-2 section: async states. An optimistic save that fails and rolls back,
// an offline mode that queues changes, and a reload that can fail.
// taste-skill (app-screens.md 11): states stay inside the block. The rate reads as a KPI (label over
// value, the unit as a grey suffix, 5); saving shows as a quiet stamp beside the value, and a failed
// save says what failed and what the value is now, with a Retry text button. Offline is the one quiet
// amber notice, with the switch as a settings row (8.2). The feed keeps its frame and pitch in every
// state: flat bars at the real sizes while loading, one sentence and the time it was last good on
// error, a freshness stamp when loaded.
export function SyncStates() {
  const [rate, setRate] = useState(135)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const attempts = useRef(0)
  const [offline, setOffline] = useState(false)
  const [queued, setQueued] = useState(0)
  const [feed, setFeed] = useState<Feed>("loaded")
  const [failNext, setFailNext] = useState(true)
  const [updated, setUpdated] = useState(clock)
  // Keyboard stays in reading order (SKILL 9). Raise and Reload stay focusable while busy
  // (aria-disabled, the handlers already ignore repeat presses), so pressing them, or Retry / Try again
  // (which leave with the error), never drops focus to the page body.
  const raiseRef = useRef<HTMLButtonElement>(null)
  const reloadRef = useRef<HTMLButtonElement>(null)

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
        setSaveError(`Couldn’t save $${nextRate}. The server didn’t respond, so the rate is back to $${previous}.`)
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
    if (feed === "loading") return
    setFeed("loading")
    setTimeout(() => {
      const fails = failNext
      setFeed(fails ? "error" : "loaded")
      if (!fails) setUpdated(clock())
      setFailNext(!failNext)
    }, 1200)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sync</CardTitle>
        <CardDescription>Saving, failing, retrying and working offline.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        {offline && (
          <div role="status" className="bg-pill-warning text-pill-warning-ink border-notice-border flex items-start gap-2 rounded-md border px-3 py-2 text-[13px]">
            <WifiOff className="mt-0.5 size-3.5 shrink-0" />
            <span className="flex-1">You’re offline. {queued ? `${queued} change${queued === 1 ? "" : "s"} will sync when you reconnect.` : "Changes will sync when you reconnect."}</span>
          </div>
        )}

        <div className="grid gap-2">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-muted-foreground text-sm">Default hourly rate</p>
              <p className="flex items-baseline gap-2" aria-live="polite">
                <span className="text-[28px] leading-9">${rate}<span className="text-muted-foreground text-base"> / h</span></span>
                {saving && <span className="text-muted-foreground text-xs">Saving…</span>}
                {!saving && offline && queued > 0 && <span className="text-muted-foreground text-xs">Not synced yet</span>}
              </p>
            </div>
            {/* The label stays "Raise by $10" while saving; the stamp beside the value carries the state. */}
            <Button ref={raiseRef} data-lab="save-fail" onClick={raiseRate} aria-disabled={saving} aria-busy={saving} className="aria-disabled:opacity-60 aria-disabled:cursor-not-allowed">
              {saving && <RefreshCw className="animate-spin" />}
              Raise by $10
            </Button>
          </div>
          {saveError && (
            <div role="alert" className="flex items-start gap-2 text-sm">
              <AlertCircle className="text-negative mt-0.5 size-4 shrink-0" />
              <span className="flex-1">{saveError}</span>
              <Button variant="ghost" size="sm" data-lab="retry" className="-my-1 underline-offset-4 hover:underline" onClick={() => { raiseRef.current?.focus(); raiseRate() }}>Retry</Button>
            </div>
          )}
        </div>

        <div className="border-rule flex items-center justify-between gap-4 border-y py-3">
          <div className="grid gap-0.5">
            <span className="flex items-center gap-2">
              <Label htmlFor="sync-online">Online</Label>
              {offline
                ? <Badge variant="warning">{queued ? `${queued} queued` : "Offline"}</Badge>
                : <Badge variant="neutral">Synced</Badge>}
            </span>
            <span id="sync-online-help" className="text-muted-foreground text-sm">Turn off to queue changes and sync them later.</span>
          </div>
          <Switch id="sync-online" checked={!offline} onCheckedChange={goOnline} aria-describedby="sync-online-help" />
          <span hidden data-lab="offline" onClick={() => goOnline(offline)} />
        </div>

        <div className="grid gap-1">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Time entries</p>
              <p className="text-muted-foreground text-xs">{feed === "loading" ? "Updating…" : `Updated ${updated}`}</p>
            </div>
            <Button ref={reloadRef} variant="ghost" size="sm" data-lab="reload" onClick={reload} aria-disabled={feed === "loading"} className="aria-disabled:opacity-60 aria-disabled:cursor-not-allowed">
              <RefreshCw className={cn(feed === "loading" && "animate-spin")} /> Reload
            </Button>
          </div>
          {/* One frame for every state: three 48px rows, so nothing jumps when the data lands. */}
          <ul className="min-h-36" aria-busy={feed === "loading"} aria-label="Time entries">
            {feed === "loading" &&
              [0, 1, 2].map((i) => (
                <li key={i} className="border-rule flex h-12 items-center gap-3 border-b last:border-b-0" aria-hidden="true">
                  <Skeleton className="size-6 rounded-full" />
                  <Skeleton className={cn("h-3.5", ["w-3/5", "w-1/2", "w-2/5"][i])} />
                  <Skeleton className="ml-auto h-3 w-12" />
                </li>
              ))}
            {feed === "error" && (
              <li className="flex min-h-36 items-center gap-2 text-sm">
                <AlertCircle className="text-negative size-4 shrink-0" />
                <span className="flex-1">Couldn’t load time entries. Last updated {updated}.</span>
                <Button variant="ghost" size="sm" className="underline-offset-4 hover:underline" onClick={() => { reloadRef.current?.focus(); reload() }}>Try again</Button>
              </li>
            )}
            {feed === "loaded" &&
              entries.map((e) => (
                <li key={e.what} className="border-rule flex min-h-12 items-center gap-3 border-b py-2 text-sm last:border-b-0">
                  <PersonAvatar initials={e.initials} className="size-6" />
                  <p className="min-w-0 flex-1"><span className="font-medium">{e.who}</span> {e.what}</p>
                  <span className="text-muted-foreground shrink-0 text-xs">{e.when}</span>
                </li>
              ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
