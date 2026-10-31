import { useRef, useState } from "react"
import { Check } from "lucide-react"
import { toast } from "sonner"
import { currencies, termsOptions } from "@/data-r3"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

type Form = { name: string; contact: string; email: string; rate: string; currency: string; terms: string; notes: string }
const empty: Form = { name: "", contact: "", email: "", rate: "", currency: "USD", terms: "net30", notes: "" }
const steps = ["Details", "Billing", "Review"]

const emailOk = (e: string) => /^\S+@\S+\.\S+$/.test(e.trim())

// Empty review values: a dash visually, words for screen readers.
function Missing() {
  return <><span aria-hidden="true">—</span><span className="sr-only">Not provided</span></>
}

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
  // Error text is linked to its field and announced when it appears.
  const describe = (k: keyof Form) => (show(k) ? `wiz-${k}-error` : undefined)
  const fieldError = (k: keyof Form) =>
    show(k) && <p id={`wiz-${k}-error`} role="alert" className="text-destructive text-sm text-pretty">{show(k)}</p>

  // A disabled Next has to say why. List what is still missing on this step.
  const missing = step === 0
    ? [errors.name && "a client name", errors.email && (form.email.trim() ? "a valid billing email" : "a billing email")]
    : step === 1 ? [errors.rate && (form.rate.trim() ? "a valid hourly rate" : "an hourly rate")] : []
  const missingText = missing.filter(Boolean).join(" and ")

  // Steps swap whole blocks of the form, which can drop focus to <body>. Put it somewhere sensible.
  const nameRef = useRef<HTMLInputElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const doneRef = useRef<HTMLParagraphElement>(null)
  const refocus = (el: () => HTMLElement | null) => requestAnimationFrame(() => {
    const target = el()
    if (target && !target.hasAttribute("disabled")) target.focus()
  })

  function next() {
    if (!stepValid) return
    if (step < 2) setStep(step + 1)
    else {
      setDone(true)
      toast.success(`Added ${form.name.trim()}`)
      refocus(() => doneRef.current)
    }
  }
  function back() {
    setStep(step - 1)
    // On step 1 the Back button disappears, so focus moves to Next.
    if (step === 1) refocus(() => nextRef.current)
  }
  function reset() { setForm(empty); setStep(0); setTouched({}); setDone(false); setConfirm(false) }
  function addAnother() { reset(); refocus(() => nameRef.current) }
  function cancel() { if (dirty) setConfirm(true); else reset() }

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">New client</CardTitle>
        <CardDescription>Three steps. Your entries stay until you save or discard them.</CardDescription>
      </CardHeader>
      <span hidden data-lab="wizard-fill" onClick={() => { setDone(false); setForm({ ...empty, name: "Juniper & Vale Ceramics", contact: "Ines Duarte", email: "billing@junipervale.example", rate: "140" }); setStep(0) }} />
      <span hidden data-lab="wizard-invalid" onClick={() => { setDone(false); setStep(0); setForm((f) => ({ ...f, email: "ines.junipervale" })); setTouched((t) => ({ ...t, email: true, name: true })) }} />
      <span hidden data-lab="wizard-next" onClick={next} />
      <span hidden data-lab="wizard-back" onClick={() => setStep((s) => Math.max(0, s - 1))} />
      <span hidden data-lab="wizard-cancel" onClick={cancel} />

      {done ? (
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <Check aria-hidden="true" className="size-6" />
          <div className="max-w-prose min-w-0">
            <p ref={doneRef} tabIndex={-1} className="font-medium text-balance break-words outline-none">{form.name.trim()} is set up</p>
            <p className="text-muted-foreground text-sm text-pretty break-words">Invoices go to {form.email.trim()} on {termsOptions.find((t) => t.value === form.terms)?.label} terms.</p>
          </div>
          <Button variant="outline" onClick={addAnother}>Add another client</Button>
        </CardContent>
      ) : (
        <>
          <CardContent className="grid gap-5">
            <ol aria-label="Steps" className="flex gap-4 text-sm tabular-nums">
              {steps.map((s, i) => (
                <li key={s} className={cn(i === step ? "font-medium" : "text-muted-foreground")} aria-current={i === step ? "step" : undefined}>
                  {i + 1}. {s}{i < step && <span className="sr-only"> (done)</span>}
                </li>
              ))}
            </ol>
            <p role="status" className="sr-only">Step {step + 1} of {steps.length}: {steps[step]}</p>

            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="wiz-name">Client name</Label>
                  <Input ref={nameRef} id="wiz-name" value={form.name} onChange={(e) => set("name")(e.target.value)} onBlur={blur("name")} aria-invalid={!!show("name")} aria-required="true" aria-describedby={describe("name")} />
                  {fieldError("name")}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="wiz-contact">Contact person (optional)</Label>
                  <Input id="wiz-contact" value={form.contact} onChange={(e) => set("contact")(e.target.value)} />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="wiz-email">Billing email</Label>
                  <Input id="wiz-email" type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} onBlur={blur("email")} aria-invalid={!!show("email")} aria-required="true" aria-describedby={describe("email")} />
                  {fieldError("email")}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="wiz-rate">Hourly rate</Label>
                  <Input id="wiz-rate" inputMode="decimal" className="tabular-nums" value={form.rate} onChange={(e) => set("rate")(e.target.value)} onBlur={blur("rate")} aria-invalid={!!show("rate")} aria-required="true" aria-describedby={describe("rate")} />
                  {fieldError("rate")}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="wiz-currency">Currency</Label>
                  <Select value={form.currency} onValueChange={set("currency")}>
                    <SelectTrigger id="wiz-currency" className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent className="motion-reduce:animate-none">{currencies.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="wiz-terms">Payment terms</Label>
                  <Select value={form.terms} onValueChange={set("terms")}>
                    <SelectTrigger id="wiz-terms" className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent className="motion-reduce:animate-none">{termsOptions.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2 sm:col-span-3">
                  <Label htmlFor="wiz-notes">Notes (optional)</Label>
                  <Textarea id="wiz-notes" value={form.notes} onChange={(e) => set("notes")(e.target.value)} placeholder="PO numbers, billing contacts, anything finance should know" />
                </div>
              </div>
            )}

            {step === 2 && (
              <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_minmax(0,1fr)]">
                <dt className="text-muted-foreground">Client</dt><dd className="break-words">{form.name || <Missing />}</dd>
                <dt className="text-muted-foreground">Contact</dt><dd className="break-words">{form.contact || <Missing />}</dd>
                <dt className="text-muted-foreground">Billing email</dt><dd className="break-all">{form.email || <Missing />}</dd>
                <dt className="text-muted-foreground">Rate</dt><dd className="tabular-nums">{form.rate ? `${form.rate} ${form.currency} / hour` : <Missing />}</dd>
                <dt className="text-muted-foreground">Terms</dt><dd>{termsOptions.find((t) => t.value === form.terms)?.label}</dd>
                <dt className="text-muted-foreground">Notes</dt><dd className="text-pretty break-words whitespace-pre-line">{form.notes || <Missing />}</dd>
              </dl>
            )}
            {!stepValid && missingText && (
              <p id="wiz-next-hint" className="text-muted-foreground text-sm text-pretty">To continue, enter {missingText}.</p>
            )}
          </CardContent>
          <CardFooter className="justify-between gap-2">
            <Button variant="ghost" data-lab="wizard-cancel-btn" onClick={cancel}>Cancel</Button>
            <div className="flex gap-2">
              {step > 0 && <Button variant="outline" onClick={back}>Back</Button>}
              <Button ref={nextRef} onClick={next} disabled={!stepValid} aria-describedby={!stepValid && missingText ? "wiz-next-hint" : undefined}>{step === 2 ? "Add client" : "Next"}</Button>
            </div>
          </CardFooter>
        </>
      )}

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent className="motion-reduce:animate-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard this client?</AlertDialogTitle>
            <AlertDialogDescription>You’ve entered details that haven’t been saved. Discarding clears the form.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={reset}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
