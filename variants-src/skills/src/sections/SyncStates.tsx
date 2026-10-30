import { useRef, useState } from "react"
import { AlertCircle, Loader2, RefreshCw, WifiOff } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"

type Feed = "idle" | "loading" | "error" | "loaded"

const entries = [
  { who: "Maya R.", what: "logged 2.5 h on Spring catalog redesign", when: "9:42 AM" },
  { who: "Jonah O.", what: "logged 4 h on Donor portal v2", when: "9:10 AM" },
  { who: "Lena T.", what: "logged 1 h on Menu boards", when: "Yesterday" },
]

// better-writing: whole strings, plural rules and Intl number formatting
const plural = new Intl.PluralRules("en-US")
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const changesPending = (n: number) => (plural.select(n) === "one" ? `${n} change will sync when you reconnect.` : `${n} changes will sync when you reconnect.`)
const changesSynced = (n: number) => (plural.select(n) === "one" ? `${n} queued change synced` : `${n} queued changes synced`)

// Round-2 section: async states. An optimistic save that fails and rolls back,
// an offline mode that queues changes, and a reload that can fail.
export function SyncStates() {
  const [rate, setRate] = useState(135)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [rateStatus, setRateStatus] = useState("")
  const attempts = useRef(0)
  const raiseRef = useRef<HTMLButtonElement>(null)
  const reloadRef = useRef<HTMLButtonElement>(null)
  const [offline, setOffline] = useState(false)
  const [queued, setQueued] = useState(0)
  const [feed, setFeed] = useState<Feed>("loaded")
  const [failNext, setFailNext] = useState(true)

  function raiseRate() {
    if (saving) return // pending button is aria-disabled; ignore repeat clicks
    const previous = rate
    const nextRate = rate + 10
    setRate(nextRate) // optimistic
    setSaveError(null)
    if (offline) { setQueued((q) => q + 1); setRateStatus(`Rate set to ${money.format(nextRate)}. It will sync when you reconnect.`); return }
    setSaving(true)
    setRateStatus("Saving rate…")
    attempts.current++
    const fails = attempts.current % 2 === 1 // first try fails, retry succeeds
    setTimeout(() => {
      setSaving(false)
      if (fails) {
        setRate(previous) // roll back
        setRateStatus("")
        // better-writing: say what didn't happen, what the screen now shows, and the next step
        setSaveError(`${money.format(nextRate)} not saved, so the rate is back to ${money.format(previous)}. The server didn’t respond. Retry to save it again.`)
      } else {
        setRateStatus(`Rate saved: ${money.format(nextRate)}`)
        toast.success("Rate saved", { description: `Default hourly rate is now ${money.format(nextRate)}.` })
      }
    }, 1100)
  }

  // The Retry button leaves with the error, so focus goes to the Raise button, which now shows the save in progress.
  function retry() {
    raiseRef.current?.focus()
    raiseRate()
  }

  function goOnline(on: boolean) {
    setOffline(!on)
    if (on && queued > 0) {
      toast.success(changesSynced(queued))
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

  const feedStatus = feed === "loading" ? "Loading time entries…" : feed === "error" ? "" : feed === "loaded" ? "Time entries loaded" : ""

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sync</CardTitle>
        <CardDescription>Saving, failing, retrying and working offline.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {/* Stable live region: rendered empty first, so the banner's text is announced when it appears */}
        <div role="status">
          {offline && (
            <div className="bg-muted flex items-start gap-2 rounded-md px-3 py-2 text-sm">
              <WifiOff className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p className="flex-1 text-pretty tabular-nums">You’re offline. {queued ? changesPending(queued) : "Changes will sync when you reconnect."}</p>
            </div>
          )}
        </div>

        <div className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Default hourly rate</p>
              <p className="text-2xl font-semibold tabular-nums">{money.format(rate)}</p>
            </div>
            {/* aria-disabled, not disabled: the pending button keeps focus (round-1 Save pattern) */}
            <Button ref={raiseRef} data-lab="save-fail" onClick={raiseRate} aria-disabled={saving || undefined}>
              {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
              {saving ? "Saving rate…" : "Raise by $10"}
            </Button>
          </div>
          <p role="status" className="sr-only">{rateStatus}</p>
          {/* Stable alert region; the error text is inserted into it */}
          <div role="alert">
            {saveError && (
              <div className="flex flex-wrap items-start gap-x-2 gap-y-3 text-sm">
                <AlertCircle className="text-destructive mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <p className="text-destructive min-w-0 flex-1 basis-48 text-pretty tabular-nums">{saveError}</p>
                <Button variant="outline" size="sm" data-lab="retry" onClick={retry}>Retry</Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="grid gap-0.5">
            <Label htmlFor="sync-online">Online</Label>
            <p id="sync-online-desc" className="text-muted-foreground text-sm">Turn off to queue changes until you reconnect.</p>
          </div>
          <Switch id="sync-online" aria-describedby="sync-online-desc" checked={!offline} onCheckedChange={goOnline} />
          <span hidden data-lab="offline" onClick={() => goOnline(offline)} />
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-medium">Time entries</h3>
            <Button ref={reloadRef} variant="ghost" size="sm" data-lab="reload" onClick={reload} aria-disabled={feed === "loading" || undefined}>
              {/* Spinner keeps running under reduced motion (loading indicator); the label stays for a static cue */}
              <RefreshCw className={feed === "loading" ? "animate-spin" : undefined} aria-hidden="true" /> Reload
            </Button>
          </div>
          <p role="status" className="sr-only">{feedStatus}</p>
          <div aria-busy={feed === "loading"} className="grid gap-3">
            {feed === "loading" &&
              [0, 1, 2].map((i) => (
                // Sized to the loaded row (20px + 16px lines) so nothing jumps when entries arrive
                <div key={i} className="grid gap-1 py-0.5" aria-hidden="true">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              ))}
            {feed === "error" && (
              <div role="alert" className="flex flex-col items-center gap-2 py-4 text-center text-sm">
                <AlertCircle className="text-destructive size-5" aria-hidden="true" />
                <p className="text-pretty">Time entries not loaded. Check your connection and try again.</p>
                {/* This button leaves when loading starts; focus moves to Reload, which shows the spinner */}
                <Button variant="outline" size="sm" onClick={() => { reloadRef.current?.focus(); reload() }}><RefreshCw aria-hidden="true" /> Try again</Button>
              </div>
            )}
            {feed === "loaded" && (
              <ul className="grid gap-3">
                {entries.map((e) => (
                  <li key={e.what} className="text-sm">
                    <p className="text-pretty"><span className="font-medium">{e.who}</span> {e.what}</p>
                    <p className="text-muted-foreground text-xs tabular-nums">{e.when}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
