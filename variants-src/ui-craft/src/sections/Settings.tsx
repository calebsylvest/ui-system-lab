import { useEffect, useRef, useState } from "react"
import { Check, Save } from "lucide-react"
import { IconSwap } from "@/components/ui/icon-swap"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export function Settings() {
  const [email, setEmail] = useState("billing@fieldwork")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const invalid = !/^\S+@\S+\.\S+$/.test(email)

  useEffect(() => {
    if (!saved) return
    const t = setTimeout(() => setSaved(false), 2000)
    return () => clearTimeout(t)
  }, [saved])

  function save(e: React.FormEvent) {
    e.preventDefault()
    if (invalid) {
      // Error is already shown inline under the field; take the user straight to it.
      emailRef.current?.focus()
      return
    }
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
    }, 1200)
  }

  return (
    <Card>
      <form onSubmit={save} noValidate className="contents">
        <CardHeader>
          <CardTitle>Workspace settings</CardTitle>
          <CardDescription>These apply to every project and invoice in Fieldwork Studio.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="ws-name">Studio name</Label>
              <Input id="ws-name" autoComplete="organization" defaultValue="Fieldwork Studio" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ws-email">Billing email</Label>
              <Input id="ws-email" ref={emailRef} type="email" autoComplete="email" required value={email} onChange={(e) => { setEmail(e.target.value); setSaved(false) }} aria-invalid={invalid} aria-describedby="ws-email-help" />
              {invalid
                ? <p id="ws-email-help" className="text-destructive text-sm">Enter a full email address, like billing@studio.com.</p>
                : <p id="ws-email-help" className="text-muted-foreground text-sm">Invoices are sent from this address.</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ws-rate">Default hourly rate</Label>
              <Input id="ws-rate" type="number" inputMode="decimal" min={0} defaultValue={135} className="tabular-nums" />
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
          <Separator />
          <div className="grid gap-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="ws-reminders">Overdue reminders</Label>
                <p className="text-muted-foreground text-sm">Email clients 3, 7 and 14 days after the due date.</p>
              </div>
              <Switch id="ws-reminders" defaultChecked />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="ws-weekly">Weekly summary</Label>
                <p className="text-muted-foreground text-sm">Monday morning digest of hours and budgets.</p>
              </div>
              <Switch id="ws-weekly" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="ws-round" defaultChecked />
              <Label htmlFor="ws-round">Round time entries up to 15 minutes</Label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button type="button" variant="ghost">Discard</Button>
          <span className="sr-only" aria-live="polite">{saved ? "Settings saved" : ""}</span>
          <Button type="submit" loading={saving}>
            {!saving && <IconSwap active={saved} activeIcon={<Check />} inactiveIcon={<Save />} />}
            {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
