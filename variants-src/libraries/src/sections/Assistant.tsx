import { useRef, useState } from "react"
import { ArrowUp, Mic, Sparkles } from "lucide-react"
import { BorderBeam } from "border-beam"
import { ThinkingOrb } from "thinking-orbs"
import { BotAvatar } from "bot-avatars"
import { VoiceBeam } from "voice-glow"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { simulatedVoiceLevel, useIsDark, useReducedMotion } from "@/lib/effects"

type Msg = { role: "user" | "assistant"; text: string }

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
  const [dictating, setDictating] = useState(false)
  const n = useRef(0)
  const isDark = useIsDark()
  const reduced = useReducedMotion()
  const surface = isDark ? "dark" : "light"

  function toggleDictation() {
    if (dictating) {
      // Simulated transcript: the viewer has no microphone, so dictation is a demo.
      setDictating(false)
      setInput((v) => v || "Which invoices are overdue?")
    } else {
      setDictating(true)
    }
  }

  function send(text: string) {
    if (!text.trim() || thinking) return
    setMsgs((m) => [...m, { role: "user", text }])
    setInput("")
    setDictating(false)
    setThinking(true)
    setTimeout(() => {
      setMsgs((m) => [...m, { role: "assistant", text: replies[n.current++ % replies.length] }])
      setThinking(false)
    }, 3200)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sparkles className="size-4" /> Ask Fieldwork</CardTitle>
        <CardDescription>Questions about your projects, hours and invoices.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid max-h-80 gap-3 overflow-y-auto pt-4" aria-busy={thinking}>
          {msgs.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="ml-auto max-w-[80%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">{m.text}</div>
            ) : (
              <div key={i} className="flex max-w-[85%] items-start gap-2">
                <BotAvatar type="clover" size={32} aria-hidden="true" className="shrink-0" />
                <div className="rounded-lg bg-muted px-3 py-2 text-sm">{m.text}</div>
              </div>
            )
          )}
          {thinking && (
            <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex size-8 shrink-0 items-center justify-center">
                <ThinkingOrb state="breathing" size={20} aria-hidden="true" />
              </span>
              Thinking…
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <Button key={s} variant="outline" size="sm" onClick={() => send(s)} disabled={thinking}>{s}</Button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(input) }}>
          <BorderBeam size="line" active={thinking && !reduced} theme={surface} strength={0.9} borderRadius={8}>
          <VoiceBeam level={simulatedVoiceLevel} active={dictating} theme={surface} borderRadius={8} className="rounded-md">
          <div className="relative rounded-md">
          <Textarea id="assistant-input" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input) } }}
            placeholder="Ask about a project, client or invoice" aria-busy={thinking}
            className="min-h-20 pr-24 focus-visible:ring-0 focus-visible:inset-ring-[3px] focus-visible:inset-ring-ring/50" />
          <div className="absolute bottom-2 right-2 z-[5] flex gap-1">
            <Button type="button" variant={dictating ? "secondary" : "ghost"} size="icon" aria-label={dictating ? "Stop dictation" : "Dictate"} aria-pressed={dictating} onClick={toggleDictation} disabled={thinking} className="size-8"><Mic /></Button>
            <Button type="submit" size="icon" aria-label="Send" className="size-8" disabled={!input.trim() || thinking}><ArrowUp /></Button>
          </div>
          </div>
          </VoiceBeam>
          </BorderBeam>
          <p role="status" className="sr-only">{dictating ? "Listening (simulated, no microphone)" : ""}</p>
        </form>
      </CardContent>
    </Card>
  )
}
