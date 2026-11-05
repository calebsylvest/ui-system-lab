import { useState } from "react"
import { Check, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { currencies, termsOptions } from "@/data-r3"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { InputField, InputGroup } from "@/components/ui/input-group"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { fontWeights } from "@/lib/font-weight"
import { useSize } from "@/lib/size-context"
import { cn } from "@/lib/utils"

type Form = { name: string; contact: string; email: string; rate: string; currency: string; terms: string; notes: string }
const empty: Form = { name: "", contact: "", email: "", rate: "", currency: "USD", terms: "net30", notes: "" }
const steps = ["Details", "Billing", "Review"]

const emailOk = (e: string) => /^\S+@\S+\.\S+$/.test(e.trim())

// A label for controls that aren't InputFields (Select, Textarea), drawn like InputField's
// own label: body role, muted, normal weight, inset one notch (pl-2.5) so every label in the
// form starts on the same line.
function FieldLabel({ htmlFor, id, children }: { htmlFor?: string; id?: string; children: string }) {
  const size = useSize()
  return (
    <label htmlFor={htmlFor} id={id} className={cn(size.text, "text-muted-foreground pl-2.5")} style={{ fontVariationSettings: fontWeights.normal }}>
      {children}
    </label>
  )
}

// Round-3 section: a multi-step form. Inline validation on blur, Next disabled until
// the step is valid, a guard against discarding unsaved changes, and a success state.
//
// Fluid treatment (see CHANGES.md, Round 3): InputGroup/InputField (fluid hover between fields,
// Base UI Field wiring for label + aria-describedby + aria-invalid, built-in error line), bordered
// Fluid Select, Fluid Dialog size "sm", Button variants ghost/tertiary/primary/secondary, step
// labels shift weight with the ghost-span pattern, all text through type roles.
export function ClientWizard() {
  const [form, setForm] = useState<Form>(empty)
  const [step, setStep] = useState(0)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [confirm, setConfirm] = useState(false)
  const [done, setDone] = useState(false)
  const size = useSize()

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
  // onBlurCapture, not onBlur: InputField spreads extra props onto its control after its own
  // onBlur, so passing onBlur would replace the handler that clears its focused look.
  const blur = (k: keyof Form) => () => setTouched((t) => ({ ...t, [k]: true }))
  const show = (k: keyof Form) => (touched[k] ? errors[k] : undefined)
  const termsLabel = termsOptions.find((t) => t.value === form.terms)?.label

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

  const dt = cn(size.type.body, "text-muted-foreground")
  const dd = cn(size.type.body, "text-foreground min-w-0 [overflow-wrap:anywhere]")

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
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center" role="status">
          <Check className="text-foreground size-6" strokeWidth={1.5} aria-hidden />
          <div className="grid gap-1">
            <p className={cn(size.type.title, "text-foreground [overflow-wrap:anywhere]")} style={{ fontVariationSettings: fontWeights.semibold }}>{form.name.trim()} is set up</p>
            <p className={cn(size.type.body, "text-muted-foreground [overflow-wrap:anywhere]")}>Invoices go to {form.email.trim()} on {termsLabel} terms.</p>
          </div>
          <Button variant="tertiary" onClick={reset}>Add another client</Button>
        </CardContent>
      ) : (
        <>
          <CardContent className="grid gap-5">
            <ol className="flex gap-4" aria-label="Steps">
              {steps.map((s, i) => {
                const current = i === step
                return (
                  <li key={s} aria-current={current ? "step" : undefined} className={cn(size.type.body, "inline-grid")}>
                    {/* Ghost-span: an invisible semibold copy reserves the width, so the
                        current step turning semibold never nudges its neighbours. */}
                    <span className="invisible col-start-1 row-start-1" style={{ fontVariationSettings: fontWeights.semibold }} aria-hidden>{i + 1}. {s}</span>
                    <span
                      className={cn("col-start-1 row-start-1 transition-colors duration-80", current ? "text-foreground" : "text-muted-foreground")}
                      style={{ fontVariationSettings: current ? fontWeights.semibold : fontWeights.normal }}
                    >
                      {i + 1}. {s}
                    </span>
                  </li>
                )
              })}
            </ol>
            <p className="sr-only" aria-live="polite">Step {step + 1} of 3: {steps[step]}</p>

            {step === 0 && (
              <InputGroup className="w-full max-w-md">
                <InputField index={0} id="wiz-name" label="Client name" value={form.name} onChange={set("name")} onBlurCapture={blur("name")} error={show("name")} autoComplete="organization" />
                <InputField index={1} id="wiz-contact" label="Contact person (optional)" value={form.contact} onChange={set("contact")} autoComplete="name" />
                <InputField index={2} id="wiz-email" type="email" label="Billing email" value={form.email} onChange={set("email")} onBlurCapture={blur("email")} error={show("email")} autoComplete="email" />
              </InputGroup>
            )}

            {step === 1 && (
              <div className="grid w-full max-w-md gap-3">
                <InputGroup className="w-full">
                  <InputField index={0} id="wiz-rate" inputMode="decimal" label="Hourly rate" value={form.rate} onChange={set("rate")} onBlurCapture={blur("rate")} error={show("rate")} />
                </InputGroup>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-1">
                    <FieldLabel htmlFor="wiz-currency">Currency</FieldLabel>
                    <Select value={form.currency} onValueChange={set("currency")}>
                      <SelectTrigger id="wiz-currency" variant="bordered" className="w-full" />
                      <SelectContent>{currencies.map((c, i) => <SelectItem key={c.value} index={i} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1">
                    <FieldLabel htmlFor="wiz-terms">Payment terms</FieldLabel>
                    <Select value={form.terms} onValueChange={set("terms")}>
                      <SelectTrigger id="wiz-terms" variant="bordered" className="w-full" />
                      <SelectContent>{termsOptions.map((t, i) => <SelectItem key={t.value} index={i} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-1">
                  <FieldLabel htmlFor="wiz-notes">Notes (optional)</FieldLabel>
                  <Textarea id="wiz-notes" className={size.field} value={form.notes} onChange={(e) => set("notes")(e.target.value)} placeholder="PO numbers, billing contacts, anything finance should know" />
                </div>
              </div>
            )}

            {step === 2 && (
              <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr]">
                <dt className={dt}>Client</dt><dd className={dd}>{form.name || "—"}</dd>
                <dt className={dt}>Contact</dt><dd className={dd}>{form.contact || "—"}</dd>
                <dt className={dt}>Billing email</dt><dd className={dd}>{form.email || "—"}</dd>
                <dt className={dt}>Rate</dt><dd className={cn(dd, "tabular-nums")}>{form.rate ? `${form.rate} ${form.currency} / hour` : "—"}</dd>
                <dt className={dt}>Terms</dt><dd className={dd}>{termsLabel}</dd>
                <dt className={dt}>Notes</dt><dd className={cn(dd, "whitespace-pre-wrap")}>{form.notes || "—"}</dd>
              </dl>
            )}
          </CardContent>
          <CardFooter className="justify-between gap-2">
            <Button variant="ghost" data-lab="wizard-cancel-btn" onClick={cancel}>Cancel</Button>
            <div className="flex gap-2">
              {step > 0 && <Button variant="tertiary" onClick={() => setStep(step - 1)}>Back</Button>}
              <Button variant="primary" onClick={next} disabled={!stepValid}>{step === 2 ? "Add client" : "Next"}</Button>
            </div>
          </CardFooter>
        </>
      )}

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Discard this client?</DialogTitle>
            <DialogDescription>You’ve entered details that haven’t been saved. Discarding clears the form.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirm(false)}>Keep editing</Button>
            <Button variant="destructive" leadingIcon={Trash2} onClick={reset}>Discard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
