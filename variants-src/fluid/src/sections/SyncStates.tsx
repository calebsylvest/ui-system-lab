import { useRef, useState } from "react"
import { motion } from "motion/react"
import { RefreshCw, WifiOff } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Banner, BannerAction, BannerActions, BannerDescription, BannerTitle } from "@/components/ui/banner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { spring } from "@/lib/springs"
import { fontWeights } from "@/lib/font-weight"

type Feed = "idle" | "loading" | "error" | "loaded"

const entries = [
  { who: "Maya R.", what: "logged 2.5 h on Spring catalog redesign", when: "9:42 AM" },
  { who: "Jonah O.", what: "logged 4 h on Donor portal v2", when: "9:10 AM" },
  { who: "Lena T.", what: "logged 1 h on Menu boards", when: "Yesterday" },
]

const body = "text-[length:var(--fs-body,13px)] leading-[var(--lh-body,20px)]"
const caption = "text-[length:var(--fs-caption,12px)] leading-[var(--lh-caption,16px)]"

// Round-2 section: async states. An optimistic save that fails and rolls back,
// an offline mode that queues changes, and a reload that can fail.
//
// Fluid treatment: Button `loading` (morphing spinner, width held) for the save, Banner for every
// error/offline message (it opens its own row and collapses it on dismiss, so nothing below jumps),
// the library Switch with its built-in label, and skeleton rows built to the exact size of the real
// rows, crossfaded on spring.moderate (product reveal: fade only, 0.04s sibling stagger).
export function SyncStates() {
  const [rate, setRate] = useState(135)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const attempts = useRef(0)
  const [offline, setOffline] = useState(false)
  const [queued, setQueued] = useState(0)
  const [feed, setFeed] = useState<Feed>("loaded")
  const [failNext, setFailNext] = useState(true)
  const reloaded = useRef(false)

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
        setSaveError(`The server didn’t respond, so the rate is back to $${previous}.`)
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
    reloaded.current = true
    setFeed("loading")
    setTimeout(() => {
      setFeed(failNext ? "error" : "loaded")
      setFailNext(!failNext)
    }, 1200)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sync</CardTitle>
        <CardDescription>Saving, failing, retrying and working offline.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <Banner open={offline} status="warning" icon={WifiOff} role="status">
          <BannerTitle>You’re offline</BannerTitle>
          <BannerDescription>
            {queued ? `${queued} change${queued === 1 ? "" : "s"} will sync when you reconnect.` : "Changes will sync when you reconnect."}
          </BannerDescription>
        </Banner>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className={`text-muted-foreground ${body}`}>Default hourly rate</p>
              <p className="text-[length:var(--fs-display,28px)] leading-[var(--lh-display,34px)] tabular-nums" style={{ fontVariationSettings: fontWeights.semibold }}>${rate}</p>
            </div>
            <Button data-lab="save-fail" onClick={raiseRate} loading={saving}>Raise by $10</Button>
          </div>
          <span className="sr-only" aria-live="polite">{saving ? "Saving the new rate" : ""}</span>
          <Banner open={!!saveError} status="error">
            <BannerTitle>Couldn’t save the new rate</BannerTitle>
            <BannerDescription>{saveError ?? ""}</BannerDescription>
            <BannerActions>
              <BannerAction variant="primary" data-lab="retry" onClick={raiseRate}>Retry</BannerAction>
            </BannerActions>
          </Banner>
        </div>

        <div className="-mx-3 flex items-center justify-between gap-4">
          <Switch id="sync-online" label="Online" checked={!offline} onToggle={() => goOnline(offline)} />
          <span hidden data-lab="offline" onClick={() => goOnline(offline)} />
        </div>

        <div className="flex flex-col gap-3" aria-busy={feed === "loading"}>
          <div className="flex items-center justify-between">
            <p className={body} style={{ fontVariationSettings: fontWeights.semibold }}>Time entries</p>
            <Button variant="ghost" size="compact" leadingIcon={RefreshCw} data-lab="reload" onClick={reload} disabled={feed === "loading"}>Reload</Button>
          </div>
          {feed === "loading" &&
            [0, 1, 2].map((i) => (
              <motion.div key={`s${i}`} aria-hidden className="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...spring.moderate, delay: i * 0.04 }}>
                <div className="flex h-5 items-center"><Skeleton className="h-3.5 w-4/5" /></div>
                <div className="flex h-4 items-center"><Skeleton className="h-3 w-1/4" /></div>
              </motion.div>
            ))}
          <Banner open={feed === "error"} status="error">
            <BannerTitle>Couldn’t load time entries</BannerTitle>
            <BannerActions>
              <BannerAction onClick={reload}>Try again</BannerAction>
            </BannerActions>
          </Banner>
          {feed === "loaded" &&
            entries.map((e, i) => (
              <motion.div key={e.what} initial={reloaded.current ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ ...spring.moderate, delay: i * 0.04 }}>
                <p className={body}><span style={{ fontVariationSettings: fontWeights.semibold }}>{e.who}</span> <span className="text-muted-foreground">{e.what}</span></p>
                <p className={`text-muted-foreground ${caption}`}>{e.when}</p>
              </motion.div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
