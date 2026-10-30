import { useState } from "react"
import { Download, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { InputField, InputGroup } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"

const clients = [
  ["hollis", "Hollis & Pine"],
  ["northwind", "Northwind Outfitters"],
  ["riverbend", "Riverbend Food Bank"],
  ["tandem", "Tandem Health"],
]

export function PageHeader() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [client, setClient] = useState("hollis")
  const [error, setError] = useState(false)

  function create(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError(true)
      return
    }
    setOpen(false)
    setName("")
    setError(false)
    toast.success(`Created “${name.trim()}”`, { description: "It’s in your project list now." })
  }

  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="text-muted-foreground text-sm">6 active projects across 6 clients. 42.5 hours logged this week.</p>
      </div>
      <div className="flex gap-2">
        <Button variant="tertiary" leadingIcon={Download} onClick={() => toast("Export started", { description: "We’ll email you the CSV in a minute." })}>
          Export
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button variant="primary" leadingIcon={Plus}>New project</Button>} />
          <DialogContent size="sm">
            <form onSubmit={create} className="grid gap-4">
              <DialogHeader>
                <DialogTitle>New project</DialogTitle>
                <DialogDescription>Give it a name and a client. You can add the team and budget later.</DialogDescription>
              </DialogHeader>
              <InputGroup>
                <InputField index={0} label="Project name" value={name}
                  onChange={(v) => { setName(v); setError(false) }}
                  placeholder="e.g. Holiday landing page"
                  error={error ? "Enter a project name." : undefined} />
              </InputGroup>
              <div className="grid gap-2">
                <Label>Client</Label>
                <Select value={client} onValueChange={setClient}>
                  <SelectTrigger variant="bordered" />
                  <SelectContent>
                    {clients.map(([v, l], i) => <SelectItem key={v} index={i} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="np-notes">Notes</Label>
                <Textarea id="np-notes" placeholder="Scope, links, anything the team should know" />
              </div>
              <DialogFooter>
                <DialogClose render={<Button type="button" variant="ghost">Cancel</Button>} />
                <Button type="submit" variant="primary">Create project</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
