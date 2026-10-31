import { useEffect, useRef, useState } from "react"
import { Check } from "lucide-react"
import { toast } from "sonner"
import { currencies, termsOptions } from "@/data-r3"
import { cn } from "@/lib/utils"
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
// Accept free text, validate after: "$1,200" and " 140 " are rates, not errors
const parseRate = (v: string) => Number(v.replace(/[\s,$€£¥]/g, "") || NaN)
const stepFields: (keyof Form)[][] = [["name", "email"], ["rate"], []]

// Round-3 section: a multi-step form. Validation runs when the user tries to advance (and on blur for fields
// that already hold text), a guard against discarding unsaved changes, and a success state.
export function ClientWizard() {
  const [form, setForm] = useState<Form>(empty)
  const [step, setStep] = useState(0)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [confirm, setConfirm] = useState(false)
  const [done, setDone] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  // Set by the step handlers only, so first render and lab-only state resets never steal focus
  const navigated = useRef(false)

  const errors: Partial<Record<keyof Form, string>> = {}
  if (!form.name.trim()) errors.name = "Enter the client’s name."
  if (!form.email.trim()) errors.email = "Enter a billing email, like billing@client.com."
  else if (!emailOk(form.email)) errors.email = "Enter the full email address, like billing@client.com."
  const rate = parseRate(form.rate)
  if (!form.rate.trim()) errors.rate = "Enter an hourly rate, like 140."
  else if (Number.isNaN(rate)) errors.rate = "Enter the rate as a number, like 140."
  else if (!(rate > 0)) errors.rate = "Enter a rate above 0."
  else if (rate > 2000) errors.rate = "Enter a rate of 2,000 or less. Check for an extra zero."

  const stepValid = stepFields[step].every((k) => !errors[k])
  const dirty = JSON.stringify(form) !== JSON.stringify(empty)
  const set = (k: keyof Form) => (v: string) => setForm((f) => ({ ...f, [k]: v }))
  // Blur checks a field only once it holds text: tabbing past an empty field doesn't scold. Empty required
  // fields are reported when the user tries to advance.
  const blur = (k: keyof Form) => () => { if (form[k].trim()) setTouched((t) => ({ ...t, [k]: true })) }
  const show = (k: keyof Form) => (touched[k] ? errors[k] : undefined)
  // aria-invalid only while an error shows; aria-describedby points at the error, or the hint when there is one
  const fieldProps = (k: keyof Form, hint?: boolean) => ({
    "aria-invalid": show(k) ? true : undefined,
    "aria-describedby": show(k) ? `wiz-${k}-error` : hint ? `wiz-${k}-hint` : undefined,
  })
  const errorText = (k: keyof Form) => (show(k) ? <p id={`wiz-${k}-error`} className="text-destructive text-sm text-pretty">{show(k)}</p> : null)

  // Each step change moves focus into the new step (its first field, or the review/success heading). Without it,
  // Back unmounting on step 1 and the success state replacing the form both dropped focus to <body>.
  useEffect(() => {
    if (!navigated.current) return
    navigated.current = false
    cardRef.current?.querySelector<HTMLElement>("[data-step-focus]")?.focus()
  }, [step, done])

  function next(e?: React.FormEvent) {
    e?.preventDefault()
    if (!stepValid) {
      // better-accessibility: never disable submit to gate validation. Show every error on this step and focus
      // the first invalid field, which is itself the announcement.
      const fields = stepFields[step]
      setTouched((t) => ({ ...t, ...Object.fromEntries(fields.map((f) => [f, true])) }))
      const firstBad = fields.find((f) => errors[f])
      requestAnimationFrame(() => document.getElementById(`wiz-${firstBad}`)?.focus())
      return
    }
    navigated.current = true
    if (step < 2) setStep(step + 1)
    else {
      setDone(true)
      toast.success(`“${form.name.trim()}” added`)
    }
  }
  function back() { navigated.current = true; setStep((s) => Math.max(0, s - 1)) }
  function reset() { setForm(empty); setStep(0); setTouched({}); setDone(false); setConfirm(false) }
  function addAnother() { navigated.current = true; reset() }
  function cancel() { if (dirty) setConfirm(true); else reset() }

  const terms = termsOptions.find((t) => t.value === form.terms)?.label
  const rateText = Number.isNaN(rate) || !form.rate.trim()
    ? form.rate
    : `${new Intl.NumberFormat("en-US", { style: "currency", currency: form.currency }).format(rate)} per hour`

  return (
    <Card ref={cardRef}>
      <CardHeader>
        <CardTitle>New client</CardTitle>
        <CardDescription className="text-pretty">Three steps. Your entries stay until you add the client or discard them.</CardDescription>
      </CardHeader>
      <span hidden data-lab="wizard-fill" onClick={() => { setDone(false); setForm({ ...empty, name: "Juniper & Vale Ceramics", contact: "Ines Duarte", email: "billing@junipervale.example", rate: "140" }); setStep(0) }} />
      <span hidden data-lab="wizard-invalid" onClick={() => { setDone(false); setStep(0); setForm((f) => ({ ...f, email: "ines.junipervale" })); setTouched((t) => ({ ...t, email: true, name: true })) }} />
      <span hidden data-lab="wizard-next" onClick={() => next()} />
      <span hidden data-lab="wizard-back" onClick={back} />
      <span hidden data-lab="wizard-cancel" onClick={cancel} />

      {done ? (
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <Check aria-hidden="true" className="size-6" />
          <div className="grid gap-1">
            <h3 tabIndex={-1} data-step-focus className="font-medium text-balance [overflow-wrap:anywhere]">{form.name.trim()} is set up</h3>
            <p className="text-muted-foreground text-sm text-pretty [overflow-wrap:anywhere]">
              {form.terms === "receipt"
                ? `Invoices go to ${form.email.trim()} and are due on receipt.`
                : `Invoices go to ${form.email.trim()} on ${terms} terms.`}
            </p>
          </div>
          <Button variant="outline" onClick={addAnother}>Add another client</Button>
        </CardContent>
      ) : (
        <form onSubmit={next} noValidate className="contents">
          <CardContent className="grid gap-6">
            <ol aria-label="Steps" className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {steps.map((s, i) => (
                <li key={s} className={cn("flex items-center gap-1.5", i === step ? "font-medium" : "text-muted-foreground")} aria-current={i === step ? "step" : undefined}>
                  {i < step ? <Check aria-hidden="true" className="size-4" /> : <span aria-hidden="true" className="tabular-nums">{i + 1}.</span>}
                  {s}
                  {i < step && <span className="sr-only"> (done)</span>}
                </li>
              ))}
            </ol>

            {step === 0 && (
              <fieldset className="grid gap-4 sm:grid-cols-2">
                <legend className="sr-only">Details</legend>
                <div className="grid content-start gap-2">
                  <Label htmlFor="wiz-name">Client name</Label>
                  <Input id="wiz-name" data-step-focus name="clientName" autoComplete="off" required value={form.name} onChange={(e) => set("name")(e.target.value)} onBlur={blur("name")} {...fieldProps("name")} />
                  {errorText("name")}
                </div>
                <div className="grid content-start gap-2">
                  <Label htmlFor="wiz-contact">Contact person (optional)</Label>
                  <Input id="wiz-contact" name="contactName" autoComplete="off" value={form.contact} onChange={(e) => set("contact")(e.target.value)} />
                </div>
                <div className="grid content-start gap-2 sm:col-span-2">
                  <Label htmlFor="wiz-email">Billing email</Label>
                  <Input id="wiz-email" name="billingEmail" type="email" autoComplete="off" spellCheck={false} required placeholder="billing@client.com" value={form.email} onChange={(e) => set("email")(e.target.value)} onBlur={blur("email")} {...fieldProps("email")} />
                  {errorText("email")}
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <fieldset className="grid gap-4 sm:grid-cols-3">
                <legend className="sr-only">Billing</legend>
                <div className="grid content-start gap-2">
                  <Label htmlFor="wiz-rate">Hourly rate</Label>
                  <Input id="wiz-rate" data-step-focus name="hourlyRate" type="text" inputMode="decimal" autoComplete="off" required placeholder="140" className="tabular-nums" value={form.rate} onChange={(e) => set("rate")(e.target.value)} onBlur={blur("rate")} {...fieldProps("rate", true)} />
                  {show("rate") ? errorText("rate") : <p id="wiz-rate-hint" className="text-muted-foreground text-sm">Up to 2,000 per hour.</p>}
                </div>
                <div className="grid content-start gap-2">
                  <Label htmlFor="wiz-currency">Currency</Label>
                  <Select value={form.currency} onValueChange={set("currency")}>
                    <SelectTrigger id="wiz-currency" className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{currencies.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid content-start gap-2">
                  <Label htmlFor="wiz-terms">Payment terms</Label>
                  <Select value={form.terms} onValueChange={set("terms")}>
                    <SelectTrigger id="wiz-terms" className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{termsOptions.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2 sm:col-span-3">
                  <Label htmlFor="wiz-notes">Notes (optional)</Label>
                  <Textarea id="wiz-notes" name="notes" value={form.notes} onChange={(e) => set("notes")(e.target.value)} placeholder="Put PO 4471 on every invoice." />
                </div>
              </fieldset>
            )}

            {step === 2 && (
              <div className="grid gap-3">
                <h3 tabIndex={-1} data-step-focus className="text-sm font-medium">Check these details, then add the client.</h3>
                <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_minmax(0,1fr)]">
                  <dt className="text-muted-foreground">Client</dt><dd className="[overflow-wrap:anywhere]">{form.name.trim()}</dd>
                  <dt className="text-muted-foreground">Contact</dt><dd className="[overflow-wrap:anywhere]">{form.contact.trim() || "Not added"}</dd>
                  <dt className="text-muted-foreground">Billing email</dt><dd className="[overflow-wrap:anywhere]">{form.email.trim()}</dd>
                  <dt className="text-muted-foreground">Rate</dt><dd className="tabular-nums">{rateText}</dd>
                  <dt className="text-muted-foreground">Terms</dt><dd>{terms}</dd>
                  <dt className="text-muted-foreground">Notes</dt><dd className="whitespace-pre-line text-pretty [overflow-wrap:anywhere]">{form.notes.trim() || "None"}</dd>
                </dl>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-between gap-2">
            <Button type="button" variant="ghost" data-lab="wizard-cancel-btn" onClick={cancel}>Cancel</Button>
            <div className="flex gap-2">
              {step > 0 && <Button type="button" variant="outline" onClick={back}>Back</Button>}
              {/* Never disabled: an invalid step shows its errors and focuses the first one */}
              <Button type="submit">{step === 2 ? "Add client" : "Next"}</Button>
            </div>
          </CardFooter>
        </form>
      )}

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard this client?</DialogTitle>
            <DialogDescription className="text-pretty">The details you’ve entered haven’t been added. Discarding clears the form and can’t be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(false)}>Keep editing</Button>
            <Button variant="destructive" onClick={reset}>Discard client</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
