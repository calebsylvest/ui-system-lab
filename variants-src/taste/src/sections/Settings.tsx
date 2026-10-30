import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
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

  // settings-two-column (library/app.json): a label column beside a filled panel, sections split
  // by a full-width rule. No card around it: frame, sheet and panel are already three levels.
  const panel = "bg-muted rounded-lg p-4"
  return (
    <section aria-labelledby="ws-title" className="grid gap-6">
      <div>
        <h2 id="ws-title" className="text-lg leading-7 font-semibold">Workspace settings</h2>
        <p className="text-muted-foreground text-sm">These apply to every project and invoice in Fieldwork Studio.</p>
      </div>
      <form onSubmit={save} className="grid">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] lg:gap-6">
          <div className="lg:pt-3">
            <h3 className="text-base font-medium">Studio and billing</h3>
            <p className="text-muted-foreground text-sm">The name, sender address, rate and terms used on new invoices.</p>
          </div>
          <div className={`${panel} grid gap-4 sm:grid-cols-2`}>
            <div className="grid content-start gap-2">
              <Label htmlFor="ws-name">Studio name</Label>
              <Input id="ws-name" defaultValue="Fieldwork Studio" />
            </div>
            <div className="grid content-start gap-2">
              <Label htmlFor="ws-email">Billing email</Label>
              <Input id="ws-email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={invalid} aria-describedby="ws-email-help" />
              {invalid
                ? <p id="ws-email-help" className="text-negative text-sm">Enter a full email address, like billing@studio.com.</p>
                : <p id="ws-email-help" className="text-muted-foreground text-sm">Invoices are sent from this address.</p>}
            </div>
            <div className="grid content-start gap-2">
              <Label htmlFor="ws-rate">Default hourly rate</Label>
              <div className="relative">
                <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">$</span>
                <Input id="ws-rate" type="number" defaultValue={135} className="pl-6 pr-12" />
                <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm">/ h</span>
              </div>
            </div>
            <div className="grid content-start gap-2">
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
        </div>
        <Separator className="my-8" />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] lg:gap-6">
          <div className="lg:pt-3">
            <h3 className="text-base font-medium">Reminders and time</h3>
            <p className="text-muted-foreground text-sm">How Fieldwork follows up on invoices and rounds logged hours.</p>
          </div>
          <div className={`${panel} grid gap-4`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="ws-reminders">Overdue reminders</Label>
                <p className="text-muted-foreground mt-1 text-sm">Email clients 3, 7 and 14 days after the due date.</p>
              </div>
              <Switch id="ws-reminders" defaultChecked />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="ws-weekly">Weekly summary</Label>
                <p className="text-muted-foreground mt-1 text-sm">Monday morning digest of hours and budgets.</p>
              </div>
              <Switch id="ws-weekly" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="ws-round" defaultChecked />
              <Label htmlFor="ws-round">Round time entries up to 15 minutes</Label>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost">Discard</Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            {saving ? "Saving" : "Save changes"}
          </Button>
        </div>
      </form>
    </section>
  )
}
