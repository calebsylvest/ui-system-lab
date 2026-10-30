import { useEffect, useRef, useState } from "react"
import { ArrowUp, Bot, Mic, MicOff, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type Msg = { role: "user" | "assistant"; text: string }

// Minimal typing for the Web Speech API (not in lib.dom). Dictation only renders where it exists,
// so the mic button never promises something the browser can't do.
type Recognition = { lang: string; interimResults: boolean; start(): void; stop(): void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null }
const SpeechRecognition = (globalThis as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition }).SpeechRecognition
  ?? (globalThis as unknown as { webkitSpeechRecognition?: new () => Recognition }).webkitSpeechRecognition

const replies = [
  "Northwind Outfitters is the risk this week. The checkout audit is at 38% with 4 days left, and INV-1040 is 28 days overdue. I’d send a reminder and move the due date to Nov 7.",
  "You logged 42.5 billable hours. Donor portal v2 took the most time at 14 hours, followed by the spring catalog at 11.",
  "Three invoices are unpaid, totaling $15,400. One is overdue.",
]

const suggestions = ["Which project needs attention?", "Summarize my hours", "What’s unpaid?"]

export function Assistant() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "user", text: "What changed since Monday?" },
    { role: "assistant", text: "Two projects moved forward. Spring catalog redesign went to Review, and Donor portal v2 passed 80%. Menu boards is still paused." },
  ])
  const [input, setInput] = useState("")
  const [thinking, setThinking] = useState(false)
  const n = useRef(0)
  const log = useRef<HTMLDivElement>(null)
  const rec = useRef<Recognition | null>(null)
  const [listening, setListening] = useState(false)

  // Keep the newest message in view; respect reduced motion.
  useEffect(() => {
    const el = log.current
    if (!el) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" })
  }, [msgs, thinking])

  function dictate() {
    if (!SpeechRecognition) return
    if (listening) { rec.current?.stop(); return }
    const r = new SpeechRecognition()
    r.lang = "en-US"
    r.interimResults = false
    r.onresult = (e) => setInput((v) => (v ? v + " " : "") + e.results[0][0].transcript)
    r.onend = () => setListening(false)
    rec.current = r
    setListening(true)
    r.start()
  }

  function send(text: string) {
    if (!text.trim() || thinking) return
    setMsgs((m) => [...m, { role: "user", text }])
    setInput("")
    setThinking(true)
    setTimeout(() => {
      setMsgs((m) => [...m, { role: "assistant", text: replies[n.current++ % replies.length] }])
      setThinking(false)
    }, 1600)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2" className="flex items-center gap-2"><Sparkles aria-hidden className="size-4" /> Ask Fieldwork</CardTitle>
        <CardDescription>Questions about your projects, hours and invoices.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div ref={log} role="log" aria-label="Conversation" aria-live="polite" className="grid max-h-80 gap-3 overflow-y-auto overscroll-contain">
          {msgs.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="ml-auto max-w-[80%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">{m.text}</div>
            ) : (
              <div key={i} className="flex max-w-[85%] items-start gap-2">
                <Avatar className="size-7"><AvatarFallback><Bot className="size-4" /></AvatarFallback></Avatar>
                <div className="rounded-lg bg-muted px-3 py-2 text-sm">{m.text}</div>
              </div>
            )
          )}
          {thinking && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Avatar aria-hidden className="size-7"><AvatarFallback><Bot className="size-4" /></AvatarFallback></Avatar>
              <span className="motion-safe:animate-pulse">Thinking…</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <Button key={s} variant="outline" size="sm" onClick={() => send(s)} disabled={thinking}>{s}</Button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="relative">
          <label htmlFor="assistant-input" className="sr-only">Message Fieldwork</label>
          <Textarea id="assistant-input" value={input} onChange={(e) => setInput(e.target.value)} aria-describedby="assistant-hint"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(input) } }}
            placeholder="Ask about a project, client or invoice" className="min-h-20 pr-24" />
          <div className="absolute bottom-2 right-2 flex gap-1">
            {SpeechRecognition && (
              <Button type="button" variant="ghost" size="icon" aria-label={listening ? "Stop dictation" : "Dictate"} aria-pressed={listening} onClick={dictate} className="size-8">
                {listening ? <MicOff /> : <Mic />}
              </Button>
            )}
            <Button type="submit" size="icon" aria-label="Send" className="size-8" disabled={!input.trim() || thinking}><ArrowUp /></Button>
          </div>
        </form>
        <p id="assistant-hint" className="-mt-2 text-xs text-muted-foreground">Enter to send, Shift+Enter for a new line.</p>
      </CardContent>
    </Card>
  )
}
