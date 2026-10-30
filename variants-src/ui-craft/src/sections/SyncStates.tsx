import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, type Transition } from "motion/react"
import { AlertCircle, Check, CloudOff, Loader2, RefreshCw, WifiOff } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type Feed = "idle" | "loading" | "error" | "loaded"
type SaveState = "idle" | "saving" | "saved" | "queued"

const entries = [
  { who: "Maya R.", what: "logged 2.5 h on Spring catalog redesign", when: "9:42 AM" },
  { who: "Jonah O.", what: "logged 4 h on Donor portal v2", when: "9:10 AM" },
  { who: "Lena T.", what: "logged 1 h on Menu boards", when: "Yesterday" },
]

const enterT: Transition = { duration: 0.2, ease: [0, 0, 0.2, 1] }
const exitT: Transition = { duration: 0.14, ease: [0.4, 0, 1, 1] }

// Round-2 section: async states. An optimistic save that fails and rolls back,
// an offline mode that queues changes, and a reload that can fail.
export function SyncStates() {
  const [rate, setRate] = useState(135)
  const [saving, setSaving] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const [saveError, setSaveError] = useState<string | null>(null)
  const attempts = useRef(0)
  const [offline, setOffline] = useState(false)
  const [queued, setQueued] = useState(0)
  const [feed, setFeed] = useState<Feed>("loaded")
  const [failNext, setFailNext] = useState(true)
  const [reloaded, setReloaded] = useState(false) // skip entrance motion on first render

  const raiseRef = useRef<HTMLButtonElement>(null)
  const retryRef = useRef<HTMLButtonElement>(null)
  const reloadRef = useRef<HTMLButtonElement>(null)
  const feedRetryRef = useRef<HTMLButtonElement>(null)
  const restoreFocus = useRef<null | "save" | "feed">(null)

  // Buttons disable while busy, which drops keyboard focus to <body>. When the request settles,
  // put focus on the control that is now relevant: Retry on failure, the trigger on success.
  useEffect(() => {
    const which = restoreFocus.current
    if (!which || (which === "save" && saving) || (which === "feed" && feed === "loading")) return
    restoreFocus.current = null
    const lost = document.activeElement === document.body || document.activeElement === null
    if (!lost) return
    if (which === "save") (saveError ? retryRef : raiseRef).current?.focus()
    else (feed === "error" ? feedRetryRef : reloadRef).current?.focus()
  }, [saving, saveError, feed])

  // Inline "Saved" fades back to idle after 2s (same as Settings in round 1).
  useEffect(() => {
    if (saveState !== "saved") return
    const t = setTimeout(() => setSaveState("idle"), 2000)
    return () => clearTimeout(t)
  }, [saveState])

  function raiseRate() {
    if (saving) return
    const previous = rate
    const nextRate = rate + 10
    setRate(nextRate) // optimistic
    setSaveError(null)
    if (offline) { setQueued((q) => q + 1); setSaveState("queued"); return }
    const el = document.activeElement
    if (el === raiseRef.current || el === retryRef.current) restoreFocus.current = "save"
    setSaving(true)
    setSaveState("saving")
    attempts.current++
    const fails = attempts.current % 2 === 1 // first try fails, retry succeeds
    setTimeout(() => {
      setSaving(false)
      if (fails) {
        setRate(previous) // roll back
        setSaveState("idle")
        // What happened, what we did about it, how to recover (surface-copy › Errors).
        setSaveError(`Couldn’t save $${nextRate}. The server didn’t respond, so the rate is back to $${previous}.`)
      } else {
        // Important outcome, confirmed next to the value instead of in a toast (system-patterns › Feedback).
        setSaveState("saved")
      }
    }, 1100)
  }

  function goOnline(on: boolean) {
    setOffline(!on)
    if (on && queued > 0) {
      // Background sync finishing is the textbook toast case; the inline status also clears.
      toast.success(`Synced ${queued} queued change${queued === 1 ? "" : "s"}`)
      setQueued(0)
      setSaveState("saved")
    }
  }

  function reload() {
    if (document.activeElement === reloadRef.current || document.activeElement === feedRetryRef.current) restoreFocus.current = "feed"
    setReloaded(true)
    setFeed("loading")
    setTimeout(() => {
      setFeed(failNext ? "error" : "loaded")
      setFailNext(!failNext)
    }, 1200)
  }

  const status = {
    idle: null,
    saving: <><Loader2 className="size-3.5 animate-spin" /> Saving…</>,
    saved: <><Check className="text-success size-3.5" /> Saved</>,
    queued: <><CloudOff className="size-3.5" /> Queued. Syncs when you’re back online.</>,
  }[saveState]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sync</CardTitle>
        <CardDescription>Saving, failing, retrying and working offline.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        {/* System-wide condition, so a banner (system-patterns › Feedback). Warning tokens + icon + text,
            never colour alone. Height and opacity animate together so the content below doesn't snap. */}
        <AnimatePresence initial={false}>
          {offline && (
            <motion.div
              key="offline"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto", transition: enterT }}
              exit={{ opacity: 0, height: 0, transition: exitT }}
              className="-mb-5 overflow-hidden"
            >
              <div role="status" className="bg-warning-surface text-warning mb-5 flex items-start gap-2 rounded-lg px-3 py-2 text-sm">
                <WifiOff aria-hidden className="mt-0.5 size-4 shrink-0" />
                <span className="flex-1 tabular-nums">You’re offline. {queued ? `${queued} change${queued === 1 ? "" : "s"} will sync when you reconnect.` : "Changes will sync when you reconnect."}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium" id="rate-label">Default hourly rate</p>
              <p className="text-2xl font-semibold tabular-nums">${rate}</p>
              {/* Status sits next to the value it describes; fixed height so it never shifts the layout. */}
              <p className="text-muted-foreground flex h-5 items-center gap-1.5 text-xs" role="status" aria-live="polite">{status}</p>
            </div>
            {/* Optimistic: the value updates at once, so the button keeps its label and only blocks repeats. */}
            <Button ref={raiseRef} data-lab="save-fail" onClick={raiseRate} disabled={saving} aria-busy={saving || undefined}>
              Raise by $10
            </Button>
          </div>
          {saveError && (
            // Concentric: 14px outer = 8px button radius + 6px padding.
            <div role="alert" className="animate-enter bg-danger-surface text-danger flex items-center gap-2 rounded-xl p-1.5 pl-3 text-sm">
              <AlertCircle aria-hidden className="size-4 shrink-0" />
              <span className="flex-1 text-pretty">{saveError}</span>
              <Button ref={retryRef} variant="outline" size="sm" data-lab="retry" onClick={raiseRate}>Retry</Button>
            </div>
          )}
        </div>

        <div className="grid gap-1">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="sync-online">Online</Label>
            <Switch id="sync-online" checked={!offline} onCheckedChange={goOnline} aria-describedby="sync-online-help" />
            <span hidden data-lab="offline" onClick={() => goOnline(offline)} />
          </div>
          <p id="sync-online-help" className="text-muted-foreground text-xs">Turn off to queue changes locally.</p>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium" id="feed-label">Time entries</p>
            <Button ref={reloadRef} variant="ghost" size="sm" data-lab="reload" onClick={reload} disabled={feed === "loading"} aria-busy={feed === "loading" || undefined}>
              <RefreshCw className={cn(feed === "loading" && "animate-spin")} /> Reload
            </Button>
          </div>
          {/* min-h equals three loaded rows, so skeleton, error and content all occupy the same space. */}
          <div className="grid min-h-[132px] content-start gap-3" aria-labelledby="feed-label" aria-busy={feed === "loading"}>
            <p className="sr-only" aria-live="polite">{feed === "loading" ? "Loading time entries" : feed === "loaded" && reloaded ? "Time entries updated" : ""}</p>
            {feed === "loading" &&
              [0, 1, 2].map((i) => (
                // Mirrors a loaded row: a 20px text-sm line and a 16px text-xs line.
                <div key={i} aria-hidden>
                  <div className="flex h-5 items-center"><Skeleton className="h-3.5 w-4/5" /></div>
                  <div className="flex h-4 items-center"><Skeleton className="h-3 w-1/4" /></div>
                </div>
              ))}
            {feed === "error" && (
              <div role="alert" className="animate-enter flex flex-col items-center gap-2 py-4 text-center text-sm">
                <AlertCircle aria-hidden className="text-danger size-5" />
                <p>Couldn’t load time entries. Check your connection, then retry.</p>
                <Button ref={feedRetryRef} variant="outline" size="sm" onClick={reload}>Retry</Button>
              </div>
            )}
            {feed === "loaded" &&
              entries.map((e) => (
                <div key={e.what} className={cn("text-sm", reloaded && "animate-enter")}>
                  <p><span className="font-medium">{e.who}</span> {e.what}</p>
                  <p className="text-muted-foreground text-xs tabular-nums">{e.when}</p>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
