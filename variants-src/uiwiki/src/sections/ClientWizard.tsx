import { useState } from "react"
import { Check } from "lucide-react"
import { toast } from "sonner"
import { currencies, termsOptions } from "@/data-r3"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { AnimatedWidth } from "@/components/ui/animated-width"
import { playSound } from "@/lib/sound"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type Form = { name: string; contact: string; email: string; rate: string; currency: string; terms: string; notes: string }
const empty: Form = { name: "", contact: "", email: "", rate: "", currency: "USD", terms: "net30", notes: "" }
const steps = ["Details", "Billing", "Review"]

const emailOk = (e: string) => /^\S+@\S+\.\S+$/.test(e.trim())
// ux-postels-accept-messy-input: "$140", "1,200", "140/hr" and "140 per hour" all read as a number.
const parseRate = (v: string) => Number(v.trim().replace(/^[$€£¥]\s*/, "").replace(/\s*(\/\s*(h|hr|hour)|per\s+hour)\.?$/i, "").replace(/,/g, "").replace(/\s*[$€£¥]$/, ""))

// Round-3 section: a multi-step form. Inline validation on blur, Next disabled until
// the step is valid, a guard against discarding unsaved changes, and a success state.
export function ClientWizard() {
  const [form, setForm] = useState<Form>(empty)
  const [step, setStep] = useState(0)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [confirm, setConfirm] = useState(false)
  const [done, setDone] = useState(false)

  const errors: Partial<Record<keyof Form, string>> = {}
  if (!form.name.trim()) errors.name = "Enter the client’s name."
  if (!form.email.trim()) errors.email = "Enter a billing email."
  else if (!emailOk(form.email)) errors.email = "That email is missing an @ or a domain."
  const rate = parseRate(form.rate)
  if (!form.rate.trim()) errors.rate = "Enter an hourly rate."
  else if (Number.isNaN(rate)) errors.rate = "Enter the rate as a number, like 140."
  else if (!(rate > 0)) errors.rate = "Rate must be more than 0."
  else if (rate > 2000) errors.rate = "Rate looks too high. Check for an extra zero."

  const stepValid = step === 0 ? !errors.name && !errors.email : step === 1 ? !errors.rate : true
  const dirty = JSON.stringify(form) !== JSON.stringify(empty)
  const set = (k: keyof Form) => (v: string) => setForm((f) => ({ ...f, [k]: v }))
  const blur = (k: keyof Form) => () => setTouched((t) => ({ ...t, [k]: true }))
  const show = (k: keyof Form) => (touched[k] ? errors[k] : undefined)

  function next() {
    if (!stepValid) return
    if (step < 2) setStep(step + 1)
    else {
      // Save the cleaned values, not the raw input (ux-postels-accept-messy-input).
      setForm((f) => ({ ...f, name: f.name.trim(), contact: f.contact.trim(), email: f.email.trim(), rate: String(rate), notes: f.notes.trim() }))
      setDone(true)
      toast.success(`Added ${form.name.trim()}`)
      playSound("success") // appropriate-confirmations-only, a11y-visual-equivalent (paired with the toast and success state)
    }
  }
  function reset() { setForm(empty); setStep(0); setTouched({}); setDone(false); setConfirm(false) }
  function cancel() { if (dirty) setConfirm(true); else reset() }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New client</CardTitle>
        <CardDescription>Three steps. Your entries stay until you save or discard them.</CardDescription>
      </CardHeader>
      <span hidden data-lab="wizard-fill" onClick={() => { setDone(false); setForm({ ...empty, name: "Juniper & Vale Ceramics", contact: "Ines Duarte", email: "billing@junipervale.example", rate: "140" }); setStep(0) }} />
      <span hidden data-lab="wizard-invalid" onClick={() => { setDone(false); setStep(0); setForm((f) => ({ ...f, email: "ines.junipervale" })); setTouched((t) => ({ ...t, email: true, name: true })) }} />
      <span hidden data-lab="wizard-next" onClick={next} />
      <span hidden data-lab="wizard-back" onClick={() => setStep((s) => Math.max(0, s - 1))} />
      <span hidden data-lab="wizard-cancel" onClick={cancel} />

      {done ? (
        <CardContent role="status" className="animate-in fade-in-0 zoom-in-95 flex flex-col items-center gap-3 py-8 text-center duration-200 ease-out motion-reduce:animate-none">
          <span className="bg-primary text-primary-foreground grid size-10 place-items-center rounded-full shadow-sm"><Check aria-hidden className="size-5" /></span>
          <div>
            <p className="font-medium">{form.name.trim()} is set up</p>
            <p className="text-muted-foreground text-sm break-words">Invoices go to {form.email.trim()} on {termsOptions.find((t) => t.value === form.terms)?.label} terms.</p>
          </div>
          <Button variant="outline" onClick={reset}>Add another client</Button>
        </CardContent>
      ) : (
        <>
          <CardContent className="grid gap-5">
            {/* ux-goal-gradient-progress: step count, a progress bar and checked-off steps. */}
            <div className="grid gap-2">
              <div className="flex items-baseline justify-between gap-4 text-sm">
                <ol className="flex flex-wrap gap-4" aria-label="Steps">
                  {steps.map((s, i) => (
                    <li key={s} className={"flex items-center gap-1.5 transition-colors duration-150 ease-out " + (i === step ? "font-medium" : "text-muted-foreground")} aria-current={i === step ? "step" : undefined}>
                      <span aria-hidden className={"grid size-5 place-items-center rounded-full border text-xs tabular-nums transition-colors duration-150 ease-out " + (i < step ? "bg-primary text-primary-foreground border-transparent" : i === step ? "border-foreground" : "")}>
                        {i < step ? <Check className="size-3" /> : i + 1}
                      </span>
                      <span className="sr-only">{i < step ? "Completed: " : ""}Step {i + 1}: </span>{s}
                    </li>
                  ))}
                </ol>
                <span className="text-muted-foreground tabular-nums" aria-hidden>Step {step + 1} of {steps.length}</span>
              </div>
              <Progress value={((step + 1) / steps.length) * 100} aria-label={`Step ${step + 1} of ${steps.length}`} className="h-1" />
            </div>

            {step === 0 && (
              <div className="animate-in fade-in-0 duration-150 ease-out motion-reduce:animate-none grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="wiz-name">Client name</Label>
                  <Input id="wiz-name" value={form.name} onChange={(e) => set("name")(e.target.value)} onBlur={blur("name")} aria-invalid={!!show("name")} aria-describedby={show("name") ? "wiz-name-error" : undefined} />
                  {show("name") && <p id="wiz-name-error" className="text-destructive animate-in fade-in-0 text-sm duration-150 ease-out motion-reduce:animate-none">{show("name")}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="wiz-contact">Contact person (optional)</Label>
                  <Input id="wiz-contact" value={form.contact} onChange={(e) => set("contact")(e.target.value)} />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="wiz-email">Billing email</Label>
                  <Input id="wiz-email" type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} onBlur={blur("email")} aria-invalid={!!show("email")} aria-describedby={show("email") ? "wiz-email-error" : undefined} />
                  {show("email") && <p id="wiz-email-error" className="text-destructive animate-in fade-in-0 text-sm duration-150 ease-out motion-reduce:animate-none">{show("email")}</p>}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="animate-in fade-in-0 duration-150 ease-out motion-reduce:animate-none grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="wiz-rate">Hourly rate</Label>
                  <Input id="wiz-rate" inputMode="decimal" placeholder="140" className="tabular-nums" value={form.rate} onChange={(e) => set("rate")(e.target.value)} onBlur={blur("rate")} aria-invalid={!!show("rate")} aria-describedby={show("rate") ? "wiz-rate-error" : undefined} />
                  {show("rate") && <p id="wiz-rate-error" className="text-destructive animate-in fade-in-0 text-sm duration-150 ease-out motion-reduce:animate-none">{show("rate")}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="wiz-currency">Currency</Label>
                  <Select value={form.currency} onValueChange={set("currency")}>
                    <SelectTrigger id="wiz-currency" className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{currencies.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="wiz-terms">Payment terms</Label>
                  <Select value={form.terms} onValueChange={set("terms")}>
                    <SelectTrigger id="wiz-terms" className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{termsOptions.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2 sm:col-span-3">
                  <Label htmlFor="wiz-notes">Notes (optional)</Label>
                  <Textarea id="wiz-notes" value={form.notes} onChange={(e) => set("notes")(e.target.value)} placeholder="PO numbers, billing contacts, anything finance should know" />
                </div>
              </div>
            )}

            {step === 2 && (
              <dl className="animate-in fade-in-0 duration-150 ease-out motion-reduce:animate-none grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
                <dt className="text-muted-foreground">Client</dt><dd className="break-words">{form.name.trim() || "—"}</dd>
                <dt className="text-muted-foreground">Contact</dt><dd className="break-words">{form.contact.trim() || "—"}</dd>
                <dt className="text-muted-foreground">Billing email</dt><dd className="break-all">{form.email.trim() || "—"}</dd>
                <dt className="text-muted-foreground">Rate</dt><dd className="tabular-nums">{form.rate ? `${rate.toLocaleString("en-US")} ${form.currency} / hour` : "—"}</dd>
                <dt className="text-muted-foreground">Terms</dt><dd>{termsOptions.find((t) => t.value === form.terms)?.label}</dd>
                <dt className="text-muted-foreground">Notes</dt><dd className="break-words whitespace-pre-line">{form.notes.trim() || "—"}</dd>
              </dl>
            )}
          </CardContent>
          <CardFooter className="justify-between gap-2">
            <Button variant="ghost" data-lab="wizard-cancel-btn" onClick={cancel}>Cancel</Button>
            <div className="flex gap-2">
              {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
              <Button onClick={next} disabled={!stepValid}><AnimatedWidth>{step === 2 ? "Add client" : "Next"}</AnimatedWidth></Button>
            </div>
          </CardFooter>
        </>
      )}

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard this client?</DialogTitle>
            <DialogDescription>What you’ve entered will be cleared. This can’t be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(false)}>Keep editing</Button>
            <Button variant="destructive" onClick={reset}>Discard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
