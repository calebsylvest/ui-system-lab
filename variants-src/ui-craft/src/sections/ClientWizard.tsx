import { useEffect, useRef, useState } from "react"
import { Check, CircleAlert } from "lucide-react"
import { currencies, termsOptions } from "@/data-r3"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type Form = { name: string; contact: string; email: string; rate: string; currency: string; terms: string; notes: string }
const empty: Form = { name: "", contact: "", email: "", rate: "", currency: "USD", terms: "net30", notes: "" }
const steps = ["Details", "Billing", "Review"]
const stepFields: (keyof Form)[][] = [["name", "email"], ["rate"], []]

// Error copy (surface-copy › Errors): say exactly what is missing and show the fix, no blame.
function emailError(raw: string) {
  const e = raw.trim()
  if (!e) return "Enter a billing email."
  if (/\s/.test(e)) return "Remove the spaces from the email."
  if (!e.includes("@")) return "Add an @ and a domain, like billing@studio.com."
  const [local, domain = ""] = e.split("@")
  if (!local) return "Add the part before the @, like billing@studio.com."
  if (!/\S+\.\S+/.test(domain)) return "Add a full domain after the @, like studio.com."
  return undefined
}

// One field's message slot. Always rendered and polite-live, so an error that appears on blur is
// announced even though focus has moved on; aria-describedby ties it to the input (accessibility.md).
function FieldMessage({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  return (
    <p id={id} aria-live="polite" className={cn("flex min-h-5 items-start gap-1.5 text-sm text-pretty", error ? "text-destructive" : "text-muted-foreground")}>
      {error ? <><CircleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0" />{error}</> : hint}
    </p>
  )
}

const Optional = () => <span className="text-muted-foreground font-normal">(optional)</span>
const NotAdded = () => <span className="text-muted-foreground">Not added</span>

// Round-3 section: a multi-step form. Inline validation on blur, Next disabled until
// the step is valid, a guard against discarding unsaved changes, and a success state.
export function ClientWizard() {
  const [form, setForm] = useState<Form>(empty)
  const [step, setStep] = useState(0)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [confirm, setConfirm] = useState(false)
  const [done, setDone] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const focusOnChange = useRef(false)

  const errors: Partial<Record<keyof Form, string>> = {}
  if (!form.name.trim()) errors.name = "Enter the client’s name."
  errors.email = emailError(form.email)
  const rate = Number(form.rate)
  if (!form.rate.trim()) errors.rate = "Enter an hourly rate."
  else if (Number.isNaN(rate)) errors.rate = "Enter the rate as a number, like 140."
  else if (!(rate > 0)) errors.rate = "Enter a rate above 0."
  else if (rate > 2000) errors.rate = "That’s over 2,000 an hour. Check for an extra zero."

  const stepValid = step === 0 ? !errors.name && !errors.email : step === 1 ? !errors.rate : true
  const dirty = JSON.stringify(form) !== JSON.stringify(empty)
  // Errors appear on first blur, then update as the user types, so they clear the moment the
  // input is fixed (system-patterns › Validation timing, "on blur + on submit"; learnings › onTouched).
  const set = (k: keyof Form) => (v: string) => setForm((f) => ({ ...f, [k]: v }))
  const blur = (k: keyof Form) => () => setTouched((t) => ({ ...t, [k]: true }))
  const show = (k: keyof Form) => (touched[k] ? errors[k] : undefined)
  const field = (k: keyof Form, hint?: string) => ({
    "aria-invalid": !!show(k) || undefined,
    "aria-describedby": show(k) || hint ? `wiz-${k}-msg` : undefined,
  })

  const termsLabel = termsOptions.find((t) => t.value === form.terms)?.label
  const rateText = (() => {
    if (!form.rate.trim() || Number.isNaN(rate)) return null
    try { return new Intl.NumberFormat("en-US", { style: "currency", currency: form.currency }).format(rate) } catch { return `${form.rate} ${form.currency}` }
  })()

  // Moving between steps unmounts the focused control (Back on step 1, the fields themselves), so put
  // focus on the new step's first field, or its heading on Review/success (surface-details › focus return).
  useEffect(() => {
    if (!focusOnChange.current) return
    focusOnChange.current = false
    const el = root.current?.querySelector<HTMLElement>("[data-step-focus]")
    el?.focus({ preventScroll: true })
  }, [step, done])
  const goTo = (s: number) => { focusOnChange.current = true; setStep(s) }

  function next() {
    if (!stepValid) {
      // Reached only through the replay hook (the button is disabled): reveal this step's errors and
      // focus the first invalid field, as an on-submit pass would (system-patterns › Error display).
      setTouched((t) => ({ ...t, ...Object.fromEntries(stepFields[step].map((k) => [k, true])) }))
      const first = stepFields[step].find((k) => errors[k])
      if (first) document.getElementById(`wiz-${first}`)?.focus({ preventScroll: true })
      return
    }
    if (step < 2) goTo(step + 1)
    else { focusOnChange.current = true; setDone(true) }
  }
  function reset() { focusOnChange.current = true; setForm(empty); setStep(0); setTouched({}); setDone(false); setConfirm(false) }
  function cancel() { if (dirty) setConfirm(true); else reset() }

  const blocker = step === 0
    ? [errors.name && "the client’s name", errors.email && "a valid billing email"].filter(Boolean).join(" and ")
    : step === 1 ? (errors.rate ? "an hourly rate" : "") : ""

  return (
    <Card ref={root}>
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
        // Success is confirmed inline where the form was, not in a toast (system-patterns › Submit behaviour).
        <CardContent className="animate-enter flex flex-col items-center gap-3 py-8 text-center">
          <span aria-hidden className="bg-success-surface text-success grid size-10 place-items-center rounded-full"><Check className="size-5" /></span>
          <div role="status" className="grid max-w-md gap-1">
            <p data-step-focus tabIndex={-1} className="font-medium break-words text-balance outline-none">{form.name.trim()} is set up</p>
            <p className="text-muted-foreground text-sm text-pretty">Invoices go to <span className="break-all">{form.email.trim()}</span> on {termsLabel} terms.</p>
          </div>
          <Button variant="outline" onClick={reset}>Add another client</Button>
        </CardContent>
      ) : (
        // A real form, so Enter advances; noValidate keeps the designed inline errors instead of browser bubbles.
        <form noValidate onSubmit={(e) => { e.preventDefault(); next() }} className="contents">
          <CardContent className="grid gap-6">
            {/* Progress: numbered markers + names + "Step n of 3"; completed steps get a check, so state
                is never carried by colour alone (system-patterns › Multi-step forms; surface-colour). */}
            <nav aria-label="Progress">
              <p className="sr-only">Step {step + 1} of {steps.length}: {steps[step]}</p>
              <ol className="flex items-center gap-2 text-sm">
                {steps.map((s, i) => (
                  <li key={s} aria-current={i === step ? "step" : undefined} className="flex items-center gap-2">
                    {i > 0 && <span aria-hidden className={cn("h-px w-6 sm:w-10", i <= step ? "bg-foreground/40" : "bg-border")} />}
                    <span aria-hidden className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-full text-xs font-medium tabular-nums transition-colors",
                      i < step && "bg-success-surface text-success",
                      i === step && "bg-foreground text-background",
                      i > step && "text-muted-foreground shadow-xs",
                    )}>
                      {i < step ? <Check className="size-3.5" /> : i + 1}
                    </span>
                    <span className={cn(i === step ? "text-foreground font-medium" : "text-muted-foreground")}>
                      {s}{i < step && <span className="sr-only"> (done)</span>}
                    </span>
                  </li>
                ))}
              </ol>
            </nav>

            {step === 0 && (
              <fieldset className="grid max-w-2xl gap-x-4 gap-y-2 sm:grid-cols-2">
                <legend className="sr-only">Client details</legend>
                <div className="grid gap-2">
                  <Label htmlFor="wiz-name">Client name</Label>
                  {/* autocomplete off: these describe the client, not the user, so the browser's own
                      name/email suggestions would be wrong (surface-details › Forms exception). */}
                  <Input id="wiz-name" data-step-focus required autoComplete="off" value={form.name} onChange={(e) => set("name")(e.target.value)} onBlur={blur("name")} {...field("name")} />
                  <FieldMessage id="wiz-name-msg" error={show("name")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="wiz-contact">Contact person <Optional /></Label>
                  <Input id="wiz-contact" autoComplete="off" value={form.contact} onChange={(e) => set("contact")(e.target.value)} />
                  <FieldMessage id="wiz-contact-msg" />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="wiz-email">Billing email</Label>
                  <Input id="wiz-email" type="email" inputMode="email" required autoComplete="off" value={form.email} onChange={(e) => set("email")(e.target.value)} onBlur={blur("email")} {...field("email", "hint")} />
                  <FieldMessage id="wiz-email-msg" error={show("email")} hint="Where invoices and receipts are sent." />
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <fieldset className="grid max-w-2xl gap-x-4 gap-y-2 sm:grid-cols-3">
                <legend className="sr-only">Billing</legend>
                <div className="grid gap-2">
                  <Label htmlFor="wiz-rate">Hourly rate</Label>
                  <div className="relative">
                    <Input id="wiz-rate" data-step-focus required inputMode="decimal" autoComplete="off" value={form.rate} onChange={(e) => set("rate")(e.target.value)} onBlur={blur("rate")} {...field("rate", "hint")} className="pr-12 tabular-nums" />
                    {/* Unit shown inside the field and follows the currency picker; decorative, so clicks pass through. */}
                    <span aria-hidden className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm">{form.currency}</span>
                  </div>
                  <FieldMessage id="wiz-rate-msg" error={show("rate")} hint="Per hour, before tax." />
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
                  <Label htmlFor="wiz-notes">Notes <Optional /></Label>
                  <Textarea id="wiz-notes" spellCheck value={form.notes} onChange={(e) => set("notes")(e.target.value)} placeholder="PO numbers, billing contacts, anything finance should know" />
                </div>
              </fieldset>
            )}

            {step === 2 && (
              <section aria-labelledby="wiz-review-title" className="grid max-w-2xl gap-3">
                <h3 id="wiz-review-title" data-step-focus tabIndex={-1} className="text-sm font-medium outline-none">Check the details before adding this client</h3>
                <dl className="grid gap-x-6 gap-y-2.5 text-sm sm:grid-cols-[auto_minmax(0,1fr)]">
                  <dt className="text-muted-foreground">Client</dt><dd className="break-words">{form.name.trim() || <NotAdded />}</dd>
                  <dt className="text-muted-foreground">Contact</dt><dd className="break-words">{form.contact.trim() || <NotAdded />}</dd>
                  <dt className="text-muted-foreground">Billing email</dt><dd className="break-all">{form.email.trim() || <NotAdded />}</dd>
                  <dt className="text-muted-foreground">Rate</dt><dd className="tabular-nums">{rateText ? <>{rateText} per hour <span className="text-muted-foreground">({form.currency})</span></> : <NotAdded />}</dd>
                  <dt className="text-muted-foreground">Terms</dt><dd>{termsLabel}</dd>
                  <dt className="text-muted-foreground">Notes</dt><dd className="break-words whitespace-pre-wrap">{form.notes.trim() || <NotAdded />}</dd>
                </dl>
              </section>
            )}
          </CardContent>
          <CardFooter className="flex-wrap justify-between gap-2">
            <Button variant="ghost" data-lab="wizard-cancel-btn" onClick={cancel}>Cancel</Button>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {/* Disabled buttons explain themselves inline, never in a tooltip (surface-details › Accessibility). */}
              {!stepValid && blocker && (
                <p id="wiz-next-why" className="text-muted-foreground text-sm">Add {blocker} to continue.</p>
              )}
              {step > 0 && <Button variant="outline" onClick={() => goTo(step - 1)}>Back</Button>}
              <Button type="submit" disabled={!stepValid} aria-describedby={!stepValid && blocker ? "wiz-next-why" : undefined}>
                {step === 2 ? "Add client" : "Next"}
              </Button>
            </div>
          </CardFooter>
        </form>
      )}

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard this client?</DialogTitle>
            {/* Confirmation body names the object and the consequence (surface-copy › Confirmation Dialogues). */}
            <DialogDescription className="break-words">
              {form.name.trim() ? <>The details you’ve entered for {form.name.trim()} haven’t been saved.</> : <>The details you’ve entered haven’t been saved.</>} Discarding clears the form and can’t be undone.
            </DialogDescription>
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
