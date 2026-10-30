import { useRef, useState } from "react"
import { Download, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"

export function PageHeader() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [error, setError] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  function create(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError(true)
      nameRef.current?.focus()
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
        <Button variant="outline" onClick={() => toast("Export started", { description: "We’ll email you the CSV when it’s ready." })}>
          <Download /> Export
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus /> New project</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={create} noValidate className="grid gap-4">
              <DialogHeader>
                <DialogTitle>New project</DialogTitle>
                <DialogDescription>Give it a name and a client. You can add the team and budget later.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-2">
                <Label htmlFor="np-name">Project name</Label>
                <Input id="np-name" ref={nameRef} required autoComplete="off" value={name} aria-invalid={error} aria-describedby={error ? "np-name-error" : undefined}
                  onChange={(e) => { setName(e.target.value); setError(false) }}
                  placeholder="e.g. Holiday landing page" />
                {error && <p id="np-name-error" className="text-destructive text-sm">Enter a project name.</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="np-client">Client</Label>
                <Select defaultValue="hollis">
                  <SelectTrigger id="np-client" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hollis">Hollis & Pine</SelectItem>
                    <SelectItem value="northwind">Northwind Outfitters</SelectItem>
                    <SelectItem value="riverbend">Riverbend Food Bank</SelectItem>
                    <SelectItem value="tandem">Tandem Health</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="np-notes">Notes</Label>
                <Textarea id="np-notes" placeholder="Scope, links, anything the team should know" />
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit">Create project</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
