import { useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export function Settings() {
  const [email, setEmail] = useState("billing@fieldwork")
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const invalid = !/^\S+@\S+\.\S+$/.test(email.trim())
  // better-accessibility: validate on submit, not while the user is still typing
  const showError = submitted && invalid

  function save(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return // pending button is aria-disabled; ignore repeat clicks
    setSubmitted(true)
    if (invalid) {
      emailRef.current?.focus() // focus is the announcement; the error sits beside the field
      return
    }
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success("Changes saved")
    }, 1200)
  }

  return (
    <Card>
      <form onSubmit={save} noValidate className="contents">
        <CardHeader>
          <CardTitle>Workspace settings</CardTitle>
          <CardDescription>These apply to every project and invoice in Fieldwork Studio.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="ws-name">Studio name</Label>
              <Input id="ws-name" name="studioName" autoComplete="organization" defaultValue="Fieldwork Studio" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ws-email">Billing email</Label>
              <Input id="ws-email" ref={emailRef} name="billingEmail" type="email" autoComplete="email" spellCheck={false}
                value={email} onChange={(e) => setEmail(e.target.value)}
                aria-invalid={showError} aria-describedby="ws-email-hint" />
              {showError
                ? <p id="ws-email-hint" className="text-destructive text-sm">Enter a full email address, like billing@studio.com.</p>
                : <p id="ws-email-hint" className="text-muted-foreground text-sm">Invoices are sent from this address.</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ws-rate">Default hourly rate</Label>
              <Input id="ws-rate" name="hourlyRate" type="text" inputMode="decimal" defaultValue={135} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ws-terms">Payment terms</Label>
              <Select defaultValue="net30">
                <SelectTrigger id="ws-terms" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="receipt">Due on receipt</SelectItem>
                  <SelectItem value="net15">Net 15</SelectItem>
                  <SelectItem value="net30">Net 30</SelectItem>
                  <SelectItem value="net60">Net 60</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="ws-reminders">Overdue reminders</Label>
                <p id="ws-reminders-desc" className="text-muted-foreground text-sm">Email clients 3, 7 and 14 days after the due date.</p>
              </div>
              <Switch id="ws-reminders" aria-describedby="ws-reminders-desc" defaultChecked />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="ws-weekly">Weekly summary</Label>
                <p id="ws-weekly-desc" className="text-muted-foreground text-sm">Monday morning digest of hours and budgets.</p>
              </div>
              <Switch id="ws-weekly" aria-describedby="ws-weekly-desc" />
            </div>
            {/* Wrapping label: checkbox and text share one hit target, no dead zone */}
            <Label className="w-fit">
              <Checkbox id="ws-round" defaultChecked />
              Round time entries up to 15&nbsp;minutes
            </Label>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button type="button" variant="ghost">Discard</Button>
          <Button type="submit" aria-disabled={saving || undefined}>
            {saving && <Loader2 className="animate-spin" />}
            {saving ? "Saving changes…" : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
