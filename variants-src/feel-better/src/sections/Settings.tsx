import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
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
  const invalid = !/^\S+@\S+\.\S+$/.test(email)

  function save(e: React.FormEvent) {
    e.preventDefault()
    if (invalid) {
      toast.error("Couldn’t save settings", { description: "Fix the billing email and try again." })
      return
    }
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success("Settings saved")
    }, 1200)
  }

  return (
    <Card>
      <form onSubmit={save} className="contents">
        <CardHeader>
          <CardTitle>Workspace settings</CardTitle>
          <CardDescription>These apply to every project and invoice in Fieldwork Studio.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="ws-name">Studio name</Label>
              <Input id="ws-name" defaultValue="Fieldwork Studio" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ws-email">Billing email</Label>
              <Input id="ws-email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={invalid} />
              {invalid
                ? <p className="text-destructive text-sm">Enter a full email address, like billing@studio.com.</p>
                : <p className="text-muted-foreground text-sm">Invoices are sent from this address.</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ws-rate">Default hourly rate</Label>
              <Input id="ws-rate" type="number" defaultValue={135} className="tabular-nums" />
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
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            {saving ? "Saving" : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
