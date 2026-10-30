import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckboxGroup, CheckboxItem } from "@/components/ui/checkbox-group"
import { InputField, InputGroup } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

const terms = [["receipt", "Due on receipt"], ["net15", "Net 15"], ["net30", "Net 30"], ["net60", "Net 60"]]

export function Settings() {
  const [studio, setStudio] = useState("Fieldwork Studio")
  const [email, setEmail] = useState("billing@fieldwork")
  const [rate, setRate] = useState("135")
  const [term, setTerm] = useState("net30")
  const [reminders, setReminders] = useState(true)
  const [weekly, setWeekly] = useState(false)
  const [round, setRound] = useState(true)
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
            <InputGroup>
              <InputField index={0} label="Studio name" value={studio} onChange={setStudio} />
              <InputField index={1} label="Billing email" value={email} onChange={setEmail}
                error={invalid ? "Enter a full email address, like billing@studio.com." : undefined} />
            </InputGroup>
            <div className="grid content-start gap-4">
              <InputGroup>
                <InputField index={0} label="Default hourly rate" value={rate} onChange={setRate} />
              </InputGroup>
              <div className="grid gap-2">
                <Label>Payment terms</Label>
                <Select value={term} onValueChange={setTerm}>
                  <SelectTrigger variant="bordered" />
                  <SelectContent>
                    {terms.map(([v, l], i) => <SelectItem key={v} index={i} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Separator />
          <div className="grid gap-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-muted-foreground text-sm">Email clients 3, 7 and 14 days after the due date.</p>
              <Switch label="Overdue reminders" checked={reminders} onToggle={() => setReminders(!reminders)} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-muted-foreground text-sm">Monday morning digest of hours and budgets.</p>
              <Switch label="Weekly summary" checked={weekly} onToggle={() => setWeekly(!weekly)} />
            </div>
            <CheckboxGroup checkedIndices={round ? new Set([0]) : new Set<number>()}>
              <CheckboxItem index={0} label="Round time entries up to 15 minutes" checked={round} onToggle={() => setRound(!round)} />
            </CheckboxGroup>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button type="button" variant="ghost">Discard</Button>
          <Button type="submit" variant="primary" loading={saving}>
            {saving ? "Saving" : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
