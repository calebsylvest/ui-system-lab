import { useEffect, useRef, useState } from "react"
import { AlertCircle, Check } from "lucide-react"
import { toast } from "sonner"
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

const emailOk = (e: string) => /^\S+@\S+\.\S+$/.test(e.trim())

// A field's error: 13px, the negative colour with a small icon, tied to the field (8.1, 11).
function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null
  return (
    <p id={id} className="text-negative flex items-start gap-1.5 text-[13px] leading-5">
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      {children}
    </p>
  )
}

// Round-3 section: a multi-step form. Inline validation on blur, Next disabled until
// the step is valid, a guard against discarding unsaved changes, and a success state.
// taste-skill (app-screens.md 8.1, 7.9, 11; SKILL "limits visible beside the field"): labels above
// 38px fields, 16px between fields; errors appear on blur and clear as soon as the value is fixed;
// the rate's limit and unit sit in and beside the field; a disabled Next says why; the review is a
// key-value well; the discard confirmation names the client. Focus follows the step for keyboard users.
export function ClientWizard() {
  const [form, setForm] = useState<Form>(empty)
  const [step, setStep] = useState(0)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [confirm, setConfirm] = useState(false)
  const [done, setDone] = useState(false)
  // Where focus goes after the next render, when a button the user pressed has left or been disabled.
  const focusNext = useRef<"heading" | "name" | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)

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
  const describe = (...ids: (string | false | undefined)[]) => ids.filter(Boolean).join(" ") || undefined

  // A disabled control says why it is disabled (8.1).
  const missing =
    step === 0
      ? [errors.name && "a client name", errors.email && (form.email.trim() ? "a valid billing email" : "a billing email")].filter(Boolean)
      : step === 1 && errors.rate
        ? [form.rate.trim() ? "an hourly rate between 0 and 2,000" : "an hourly rate"]
        : []
  const why = missing.length ? `Add ${missing.join(" and ")} to continue.` : ""

  const termsLabel = termsOptions.find((t) => t.value === form.terms)?.label
  const rateText = form.rate.trim() && rate > 0
    ? `${rate.toLocaleString("en-US", { style: "currency", currency: form.currency })} / h`
    : ""

  useEffect(() => {
    const target = focusNext.current
    focusNext.current = null
    if (target === "heading") headingRef.current?.focus({ preventScroll: true })
    if (target === "name") nameRef.current?.focus({ preventScroll: true })
  })

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
  // The buttons the user presses move focus with them; the viewer's hidden hooks do not steal it.
  const nextFromButton = () => { focusNext.current = "heading"; next() }
  const backFromButton = () => { focusNext.current = "heading"; setStep((s) => Math.max(0, s - 1)) }
  const againFromButton = () => { focusNext.current = "name"; reset() }

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
        // Success stays inside the block, on the card's one left edge (11, 4.2).
        <CardContent className="grid justify-items-start gap-4">
          <div className="bg-muted grid w-full gap-1 rounded-lg px-4 py-3">
            <h3 ref={headingRef} tabIndex={-1} className="flex items-center gap-2 text-sm font-medium outline-none">
              <Check className="text-positive size-4 shrink-0" aria-hidden="true" />
              {form.name.trim()} is set up
            </h3>
            <p className="text-muted-foreground pl-6 text-sm">
              Invoices go to <span className="text-foreground [overflow-wrap:anywhere]">{form.email.trim()}</span> on {termsLabel} terms.
            </p>
          </div>
          <Button variant="outline" onClick={againFromButton}>Add another client</Button>
        </CardContent>
      ) : (
        <>
          <CardContent className="grid gap-6">
            {/* Steps: the current one in ink, done ones with a check, the rest grey. No brand hue on chrome. */}
            <ol className="flex items-center gap-3 text-[13px]" aria-label="Steps">
              {steps.map((s, i) => (
                <li key={s} className={cn("flex items-center gap-3", i < steps.length - 1 && "flex-1")} aria-current={i === step ? "step" : undefined}>
                  <span className={cn("flex items-center gap-2 whitespace-nowrap", i === step ? "text-foreground font-medium" : "text-muted-foreground")}>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-5 flex-none items-center justify-center rounded-full text-[11px] font-medium",
                        i === step && "bg-primary text-primary-foreground",
                        i < step && "bg-secondary text-foreground",
                        i > step && "border-input border",
                      )}
                    >
                      {i < step ? <Check className="size-3" /> : i + 1}
                    </span>
                    {s}
                    {i < step && <span className="sr-only">, done</span>}
                  </span>
                  {i < steps.length - 1 && <span aria-hidden="true" className="bg-border h-px min-w-4 flex-1" />}
                </li>
              ))}
            </ol>

            <div className="grid gap-4">
              <h3 ref={headingRef} tabIndex={-1} className="text-sm font-medium outline-none">
                <span className="sr-only">Step {step + 1} of 3: </span>{["Client details", "Billing", "Review and add"][step]}
              </h3>

              {step === 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid content-start gap-2">
                    <Label htmlFor="wiz-name">Client name</Label>
                    <Input ref={nameRef} id="wiz-name" autoComplete="organization" value={form.name} onChange={(e) => set("name")(e.target.value)} onBlur={blur("name")} aria-invalid={!!show("name")} aria-describedby={describe(show("name") && "wiz-name-error")} />
                    <FieldError id="wiz-name-error">{show("name")}</FieldError>
                  </div>
                  <div className="grid content-start gap-2">
                    <Label htmlFor="wiz-contact">Contact person <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input id="wiz-contact" autoComplete="name" value={form.contact} onChange={(e) => set("contact")(e.target.value)} />
                  </div>
                  <div className="grid content-start gap-2 sm:col-span-2">
                    <Label htmlFor="wiz-email">Billing email</Label>
                    <Input id="wiz-email" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email")(e.target.value)} onBlur={blur("email")} aria-invalid={!!show("email")} aria-describedby={describe(show("email") && "wiz-email-error")} />
                    <FieldError id="wiz-email-error">{show("email")}</FieldError>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="grid content-start gap-2">
                    <Label htmlFor="wiz-rate">Hourly rate</Label>
                    {/* The unit inside the field, the limit beside it, both tied to it (round-1 rate field). */}
                    <div className="relative">
                      <Input id="wiz-rate" inputMode="decimal" value={form.rate} onChange={(e) => set("rate")(e.target.value)} onBlur={blur("rate")} aria-invalid={!!show("rate")} aria-describedby={describe("wiz-rate-unit", show("rate") ? "wiz-rate-error" : "wiz-rate-help")} className="pr-20 text-right" />
                      <span id="wiz-rate-unit" className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm">{form.currency} / h</span>
                    </div>
                    {show("rate")
                      ? <FieldError id="wiz-rate-error">{show("rate")}</FieldError>
                      : <p id="wiz-rate-help" className="text-muted-foreground text-[13px] leading-5">More than 0, up to 2,000.</p>}
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
                  <div className="grid content-start gap-2 sm:col-span-3">
                    <Label htmlFor="wiz-notes">Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Textarea id="wiz-notes" value={form.notes} onChange={(e) => set("notes")(e.target.value)} placeholder="PO numbers, billing contacts, anything finance should know" />
                  </div>
                </div>
              )}

              {step === 2 && (
                // Key-value well: tinted, radius 8, 32px rows, label left, value right (7.9).
                <dl className="bg-muted grid rounded-lg px-4 py-1 text-sm">
                  {([
                    ["Client", form.name.trim()],
                    ["Contact", form.contact.trim()],
                    ["Billing email", form.email.trim()],
                    ["Rate", rateText],
                    ["Terms", termsLabel],
                    ["Notes", form.notes.trim()],
                  ] as const).map(([k, v]) => (
                    <div key={k} className="border-border/60 flex min-h-8 items-baseline justify-between gap-6 border-b py-1.5 last:border-b-0">
                      <dt className="text-muted-foreground flex-none">{k}</dt>
                      <dd className={cn("min-w-0 text-right", k === "Billing email" ? "[overflow-wrap:anywhere]" : "break-words whitespace-pre-line")}>
                        {v ? v : <span className="text-muted-foreground" aria-label="None">—</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-rule flex-wrap justify-between gap-x-2 gap-y-3 border-t pt-4">
            <Button variant="ghost" data-lab="wizard-cancel-btn" onClick={cancel}>Cancel</Button>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {why && <p id="wiz-why" className="text-muted-foreground mr-1 text-[13px]">{why}</p>}
              {step > 0 && <Button variant="outline" onClick={backFromButton}>Back</Button>}
              <Button onClick={nextFromButton} disabled={!stepValid} aria-describedby={why ? "wiz-why" : undefined}>{step === 2 ? "Add client" : "Next"}</Button>
            </div>
          </CardFooter>
        </>
      )}

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            {/* A destructive confirmation names the object and says the consequence in words (8.2). */}
            <DialogTitle className="[overflow-wrap:anywhere]">{form.name.trim() ? `Discard “${form.name.trim()}”?` : "Discard this client?"}</DialogTitle>
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
