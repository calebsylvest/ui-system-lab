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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type Form = { name: string; contact: string; email: string; rate: string; currency: string; terms: string; notes: string }
const empty: Form = { name: "", contact: "", email: "", rate: "", currency: "USD", terms: "net30", notes: "" }
const steps = ["Details", "Billing", "Review"]

const emailOk = (e: string) => /^\S+@\S+\.\S+$/.test(e.trim())

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
  const rate = Number(form.rate)
  if (!form.rate.trim()) errors.rate = "Enter an hourly rate."
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
      setDone(true)
      toast.success(`Added ${form.name.trim()}`)
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
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <Check className="size-6" />
          <div>
            <p className="font-medium">{form.name.trim()} is set up</p>
            <p className="text-muted-foreground text-sm">Invoices go to {form.email.trim()} on {termsOptions.find((t) => t.value === form.terms)?.label} terms.</p>
          </div>
          <Button variant="outline" onClick={reset}>Add another client</Button>
        </CardContent>
      ) : (
        <>
          <CardContent className="grid gap-5">
            <ol className="flex gap-4 text-sm">
              {steps.map((s, i) => (
                <li key={s} className={i === step ? "font-medium" : "text-muted-foreground"} aria-current={i === step ? "step" : undefined}>
                  {i + 1}. {s}
                </li>
              ))}
            </ol>

            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="wiz-name">Client name</Label>
                  <Input id="wiz-name" value={form.name} onChange={(e) => set("name")(e.target.value)} onBlur={blur("name")} aria-invalid={!!show("name")} />
                  {show("name") && <p className="text-destructive text-sm">{show("name")}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="wiz-contact">Contact person (optional)</Label>
                  <Input id="wiz-contact" value={form.contact} onChange={(e) => set("contact")(e.target.value)} />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="wiz-email">Billing email</Label>
                  <Input id="wiz-email" type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} onBlur={blur("email")} aria-invalid={!!show("email")} />
                  {show("email") && <p className="text-destructive text-sm">{show("email")}</p>}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="wiz-rate">Hourly rate</Label>
                  <Input id="wiz-rate" inputMode="decimal" value={form.rate} onChange={(e) => set("rate")(e.target.value)} onBlur={blur("rate")} aria-invalid={!!show("rate")} />
                  {show("rate") && <p className="text-destructive text-sm">{show("rate")}</p>}
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
              <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
                <dt className="text-muted-foreground">Client</dt><dd>{form.name || "—"}</dd>
                <dt className="text-muted-foreground">Contact</dt><dd>{form.contact || "—"}</dd>
                <dt className="text-muted-foreground">Billing email</dt><dd className="break-all">{form.email || "—"}</dd>
                <dt className="text-muted-foreground">Rate</dt><dd>{form.rate ? `${form.rate} ${form.currency} / hour` : "—"}</dd>
                <dt className="text-muted-foreground">Terms</dt><dd>{termsOptions.find((t) => t.value === form.terms)?.label}</dd>
                <dt className="text-muted-foreground">Notes</dt><dd>{form.notes || "—"}</dd>
              </dl>
            )}
          </CardContent>
          <CardFooter className="justify-between gap-2">
            <Button variant="ghost" data-lab="wizard-cancel-btn" onClick={cancel}>Cancel</Button>
            <div className="flex gap-2">
              {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
              <Button onClick={next} disabled={!stepValid}>{step === 2 ? "Add client" : "Next"}</Button>
            </div>
          </CardFooter>
        </>
      )}

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard this client?</DialogTitle>
            <DialogDescription>You’ve entered details that haven’t been saved. Discarding clears the form.</DialogDescription>
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
