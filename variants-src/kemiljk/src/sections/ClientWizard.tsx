import { useRef, useState } from "react"
import { Check } from "lucide-react"
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
type Field = "name" | "email" | "rate"
const empty: Form = { name: "", contact: "", email: "", rate: "", currency: "USD", terms: "net30", notes: "" }
const steps = ["Details", "Billing", "Review"]
const stepFields: Field[][] = [["name", "email"], ["rate"], []]
const fieldId: Record<Field, string> = { name: "wiz-name", email: "wiz-email", rate: "wiz-rate" }

const symbol = (currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).formatToParts(0).find((p) => p.type === "currency")?.value ?? currency
const moneyFmt = (n: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: currency === "JPY" ? 0 : 2 }).format(n)
// People paste "1,200" or "$140"; accept them rather than calling a real number invalid.
const parseRate = (s: string) => s.replace(/[\s,$€£¥]/g, "")
// A sanity ceiling per currency: ¥15,000 an hour is ordinary, $15,000 an hour is a typo.
const rateCap = (currency: string) => (currency === "JPY" ? 300000 : 2000)

// Error copy says what to do next, with an example, in the same voice as round 1's Settings form.
function validate(f: Form): Partial<Record<Field, string>> {
  const e: Partial<Record<Field, string>> = {}
  if (!f.name.trim()) e.name = "Enter the client’s name."
  const email = f.email.trim()
  if (!email) e.email = "Enter a billing email, like billing@studio.com."
  else if (!email.includes("@")) e.email = "Add an @ to the email, like billing@studio.com."
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Add the domain after the @, like studio.com."
  const raw = parseRate(f.rate)
  if (!raw) e.rate = "Enter an hourly rate."
  else if (!/^\d+(\.\d+)?$/.test(raw)) e.rate = "Enter the rate as a number, like 140."
  else if (Number(raw) <= 0) e.rate = "Enter a rate above 0."
  else if (Number(raw) > rateCap(f.currency)) e.rate = `Enter a rate up to ${moneyFmt(rateCap(f.currency), f.currency)} an hour. Check for an extra zero.`
  return e
}

// Round-3 section: a multi-step form. Inline validation on blur, Next unavailable until
// the step is valid, a guard against discarding unsaved changes, and a success state.
//
// Validation timing: an error appears when you leave a field (or press Next), and clears the
// moment the value becomes valid. It never appears while you are still typing a fresh value.
export function ClientWizard() {
  const [form, setForm] = useState<Form>(empty)
  const [step, setStep] = useState(0)
  const [flagged, setFlagged] = useState<Partial<Record<Field, boolean>>>({})
  const [confirm, setConfirm] = useState(false)
  const [done, setDone] = useState(false)
  const stepHeading = useRef<HTMLHeadingElement>(null)
  const successHeading = useRef<HTMLHeadingElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const discarded = useRef(false)

  const errors = validate(form)
  const stepValid = stepFields[step].every((k) => !errors[k])
  const dirty = JSON.stringify(form) !== JSON.stringify(empty)
  const show = (k: Field) => (flagged[k] ? errors[k] : undefined)

  const focusLater = (get: () => HTMLElement | null | undefined) => requestAnimationFrame(() => get()?.focus())

  function set(k: keyof Form, v: string) {
    const nf = { ...form, [k]: v }
    setForm(nf)
    // Reward early: a flagged field clears as soon as it is fixed.
    if (k in fieldId && flagged[k as Field] && !validate(nf)[k as Field]) setFlagged((f) => ({ ...f, [k]: false }))
  }
  const blur = (k: Field) => () => setFlagged((f) => ({ ...f, [k]: !!errors[k] }))

  function goToStep(s: number) {
    setStep(s)
    focusLater(() => stepHeading.current)
  }

  function next() {
    if (!stepValid) {
      // Next stays focusable, so pressing it explains what's missing instead of doing nothing.
      const missing = stepFields[step].filter((k) => errors[k])
      setFlagged((f) => ({ ...f, ...Object.fromEntries(missing.map((k) => [k, true])) }))
      focusLater(() => document.getElementById(fieldId[missing[0]]))
      return
    }
    if (step < 2) goToStep(step + 1)
    else {
      setDone(true)
      focusLater(() => successHeading.current)
    }
  }
  function reset() { setForm(empty); setStep(0); setFlagged({}); setDone(false); setConfirm(false) }
  function cancel() { if (dirty) setConfirm(true); else reset() }
  function discard() {
    discarded.current = true
    reset()
  }

  const termsLabel = termsOptions.find((t) => t.value === form.terms)?.label
  const currencyLabel = currencies.find((c) => c.value === form.currency)?.label
  const rateText = errors.rate ? form.rate : `${moneyFmt(Number(parseRate(form.rate)), form.currency)} an hour`
  const errorProps = (k: Field) => ({
    "aria-invalid": !!show(k),
    "aria-describedby": show(k) ? `${fieldId[k]}-error` : undefined,
    "aria-required": true,
  })
  const errorText = (k: Field) => (show(k) ? <p id={`${fieldId[k]}-error`} className="text-destructive text-sm">{show(k)}</p> : null)
  const missing = (text: string) => <span className="text-muted-foreground">{text}</span>

  return (
    <Card>
      <CardHeader>
        <CardTitle>New client</CardTitle>
        <CardDescription>Details, then billing, then a review. Nothing is saved until you add the client.</CardDescription>
      </CardHeader>
      <span hidden data-lab="wizard-fill" onClick={() => { setDone(false); setForm({ ...empty, name: "Juniper & Vale Ceramics", contact: "Ines Duarte", email: "billing@junipervale.example", rate: "140" }); setFlagged({}); setStep(0) }} />
      <span hidden data-lab="wizard-invalid" onClick={() => {
        const nf = { ...form, email: "ines.junipervale" }
        const e = validate(nf)
        setDone(false); setStep(0); setForm(nf); setFlagged((f) => ({ ...f, email: !!e.email, name: !!e.name }))
      }} />
      <span hidden data-lab="wizard-next" onClick={next} />
      <span hidden data-lab="wizard-back" onClick={() => setStep((s) => Math.max(0, s - 1))} />
      <span hidden data-lab="wizard-cancel" onClick={cancel} />

      {done ? (
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <span className="bg-success/12 text-success grid size-10 place-items-center rounded-full">
            <Check aria-hidden className="size-5" />
          </span>
          <div className="grid gap-1">
            <h4 ref={successHeading} tabIndex={-1} className="font-medium text-balance [overflow-wrap:anywhere] outline-none">{form.name.trim()} is set up</h4>
            <p className="text-muted-foreground max-w-prose text-sm text-pretty [overflow-wrap:anywhere]">
              Invoices go to {form.email.trim()} in {form.currency}, on {termsLabel} terms.
            </p>
          </div>
          <Button variant="outline" onClick={reset}>Add another client</Button>
        </CardContent>
      ) : (
        <form noValidate onSubmit={(e) => { e.preventDefault(); next() }} className="contents">
          <CardContent className="grid gap-5">
            <ol aria-label="Steps" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {steps.map((s, i) => (
                <li key={s} className={cn("flex items-center gap-2", i === step ? "text-foreground font-medium" : "text-muted-foreground")} aria-current={i === step ? "step" : undefined}>
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-6 place-items-center rounded-full border text-xs tabular-nums transition-colors",
                      i === step && "border-primary bg-primary text-primary-foreground",
                      i < step && "border-success/30 bg-success/12 text-success",
                    )}
                  >
                    {i < step ? <Check className="size-3.5" /> : i + 1}
                  </span>
                  {s}
                  {i < step && <span className="sr-only">, done</span>}
                </li>
              ))}
            </ol>

            <h4 ref={stepHeading} tabIndex={-1} className="font-medium outline-none">
              <span className="sr-only">Step {step + 1} of 3: </span>{steps[step] === "Review" ? "Check the details" : steps[step] === "Details" ? "Who is the client?" : "How do you bill them?"}
            </h4>

            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid content-start gap-2">
                  <Label htmlFor="wiz-name">Client name</Label>
                  <Input id="wiz-name" autoComplete="organization" value={form.name} onChange={(e) => set("name", e.target.value)} onBlur={blur("name")} {...errorProps("name")} />
                  {errorText("name")}
                </div>
                <div className="grid content-start gap-2">
                  <Label htmlFor="wiz-contact">Contact person <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input id="wiz-contact" autoComplete="name" value={form.contact} onChange={(e) => set("contact", e.target.value)} />
                </div>
                <div className="grid content-start gap-2 sm:col-span-2">
                  <Label htmlFor="wiz-email">Billing email</Label>
                  <Input id="wiz-email" type="email" autoComplete="email" spellCheck={false} value={form.email} onChange={(e) => set("email", e.target.value)} onBlur={blur("email")} {...errorProps("email")} />
                  {errorText("email")}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Currency comes first, because the rate field shows its symbol and limit. */}
                <div className="grid content-start gap-2">
                  <Label htmlFor="wiz-currency">Currency</Label>
                  <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
                    <SelectTrigger id="wiz-currency" className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{currencies.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid content-start gap-2">
                  <Label htmlFor="wiz-rate">Hourly rate</Label>
                  <div className="relative">
                    <span aria-hidden className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">{symbol(form.currency)}</span>
                    <Input id="wiz-rate" inputMode="decimal" autoComplete="off" value={form.rate} onChange={(e) => set("rate", e.target.value)} onBlur={blur("rate")} {...errorProps("rate")} className="pr-10 pl-7 tabular-nums" />
                    <span aria-hidden className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm">/hr</span>
                  </div>
                  {errorText("rate")}
                </div>
                <div className="grid content-start gap-2">
                  <Label htmlFor="wiz-terms">Payment terms</Label>
                  <Select value={form.terms} onValueChange={(v) => set("terms", v)}>
                    <SelectTrigger id="wiz-terms" className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{termsOptions.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2 sm:col-span-3">
                  <Label htmlFor="wiz-notes">Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Textarea id="wiz-notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="PO numbers, billing contacts, anything finance should know" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4 text-sm">
                <section aria-labelledby="wiz-review-details" className="grid gap-2 rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h5 id="wiz-review-details" className="font-medium">Details</h5>
                    <Button type="button" variant="ghost" size="sm" className="-my-1 h-7" onClick={() => goToStep(0)}>Edit<span className="sr-only"> details</span></Button>
                  </div>
                  <dl className="grid gap-x-6 gap-y-1.5 sm:grid-cols-[8rem_1fr]">
                    <dt className="text-muted-foreground">Client</dt><dd className="[overflow-wrap:anywhere]">{form.name.trim() || missing("Not added")}</dd>
                    <dt className="text-muted-foreground">Contact</dt><dd className="[overflow-wrap:anywhere]">{form.contact.trim() || missing("Not added")}</dd>
                    <dt className="text-muted-foreground">Billing email</dt><dd className="[overflow-wrap:anywhere]">{form.email.trim() || missing("Not added")}</dd>
                  </dl>
                </section>
                <section aria-labelledby="wiz-review-billing" className="grid gap-2 rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h5 id="wiz-review-billing" className="font-medium">Billing</h5>
                    <Button type="button" variant="ghost" size="sm" className="-my-1 h-7" onClick={() => goToStep(1)}>Edit<span className="sr-only"> billing</span></Button>
                  </div>
                  <dl className="grid gap-x-6 gap-y-1.5 sm:grid-cols-[8rem_1fr]">
                    <dt className="text-muted-foreground">Rate</dt><dd className="tabular-nums">{form.rate ? rateText : missing("Not added")}</dd>
                    <dt className="text-muted-foreground">Currency</dt><dd>{currencyLabel}</dd>
                    <dt className="text-muted-foreground">Terms</dt><dd>{termsLabel}</dd>
                    <dt className="text-muted-foreground">Notes</dt><dd className="whitespace-pre-wrap [overflow-wrap:anywhere]">{form.notes.trim() || missing("None")}</dd>
                  </dl>
                </section>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-wrap justify-between gap-2">
            <Button ref={cancelRef} type="button" variant="ghost" data-lab="wizard-cancel-btn" onClick={cancel}>Cancel</Button>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {!stepValid && <p id="wiz-next-hint" className="text-muted-foreground text-sm">Fill in the required fields to continue.</p>}
              {step > 0 && <Button type="button" variant="outline" onClick={() => goToStep(step - 1)}>Back</Button>}
              <Button
                type="submit"
                aria-disabled={!stepValid}
                aria-describedby={!stepValid ? "wiz-next-hint" : undefined}
                className="aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:active:scale-100"
              >
                {step === 2 ? "Add client" : "Next"}
              </Button>
            </div>
          </CardFooter>
        </form>
      )}

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent
          onCloseAutoFocus={(e) => {
            // Discard returns you to the empty first field; Keep editing returns you to Cancel.
            e.preventDefault()
            if (discarded.current) document.getElementById("wiz-name")?.focus()
            else cancelRef.current?.focus()
            discarded.current = false
          }}
        >
          <DialogHeader>
            <DialogTitle>Discard this client?</DialogTitle>
            <DialogDescription className="[overflow-wrap:anywhere]">
              The details you entered{form.name.trim() ? ` for ${form.name.trim()}` : ""} haven’t been saved. Discarding clears the form and can’t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(false)}>Keep editing</Button>
            <Button variant="destructive" onClick={discard}>Discard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
