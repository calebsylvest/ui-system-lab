import { useRef, useState } from "react"
import { Mic, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatMessage } from "@/components/ui/chat-message"
import { InputMessage } from "@/components/ui/input-message"
import { ThinkingIndicator } from "@/components/ui/thinking-indicator"

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
        <CardTitle><span className="inline-flex items-center gap-2"><Sparkles className="size-4" /> Ask Fieldwork</span></CardTitle>
        <CardDescription>Questions about your projects, hours and invoices.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
          {msgs.map((m, i) => (
            <ChatMessage key={i} from={m.role}>{m.text}</ChatMessage>
          ))}
          {thinking && <ThinkingIndicator />}
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <Button key={s} variant="tertiary" size="compact" onClick={() => send(s)} disabled={thinking}>{s}</Button>
          ))}
        </div>
        <InputMessage
          value={input}
          onValueChange={setInput}
          onSend={(text) => send(text)}
          placeholder="Ask about a project, client or invoice"
          disabled={thinking}
          rightSlot={<Button variant="ghost" size="icon-compact" aria-label="Dictate"><Mic /></Button>}
        />
      </CardContent>
    </Card>
  )
}
