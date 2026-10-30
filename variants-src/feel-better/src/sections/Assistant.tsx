import { useRef, useState } from "react"
import { ArrowUp, Bot, Mic, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

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
  const n = useRef(0)

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
        <CardTitle className="flex items-center gap-2"><Sparkles className="size-4" /> Ask Fieldwork</CardTitle>
        <CardDescription>Questions about your projects, hours and invoices.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid max-h-80 gap-3 overflow-y-auto">
          {msgs.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="ml-auto max-w-[80%] rounded-lg bg-primary px-3 py-2 text-sm text-pretty text-primary-foreground">{m.text}</div>
            ) : (
              <div key={i} className="flex max-w-[85%] items-start gap-2">
                <Avatar className="size-7"><AvatarFallback><Bot className="size-4" /></AvatarFallback></Avatar>
                <div className="rounded-lg bg-muted px-3 py-2 text-sm text-pretty">{m.text}</div>
              </div>
            )
          )}
          {thinking && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Avatar className="size-7"><AvatarFallback><Bot className="size-4" /></AvatarFallback></Avatar>
              Thinking…
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <Button key={s} variant="outline" size="sm" onClick={() => send(s)} disabled={thinking}>{s}</Button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="relative">
          <Textarea id="assistant-input" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input) } }}
            placeholder="Ask about a project, client or invoice" className="min-h-20 rounded-xl pr-24" />
          <div className="absolute bottom-2 right-2 flex gap-1">
            <Button type="button" variant="ghost" size="icon" aria-label="Dictate" className="size-8 rounded-sm after:min-w-9"><Mic /></Button>
            <Button type="submit" size="icon" aria-label="Send" className="size-8 rounded-sm after:min-w-9" disabled={!input.trim() || thinking}><ArrowUp /></Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
