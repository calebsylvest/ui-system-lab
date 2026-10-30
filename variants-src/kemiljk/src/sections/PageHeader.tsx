import { useRef, useState } from "react"
import { useProjects } from "@/store"
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

const clientNames: Record<string, string> = {
  hollis: "Hollis & Pine",
  northwind: "Northwind Outfitters",
  riverbend: "Riverbend Food Bank",
  tandem: "Tandem Health",
}

export function PageHeader() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [error, setError] = useState(false)
  const [client, setClient] = useState("hollis")
  const nameRef = useRef<HTMLInputElement>(null)
  const { projects, add } = useProjects()

  // Derived from the same list the cards render, so the summary can't drift from what's on screen.
  const live = projects.filter((p) => p.status === "On track" || p.status === "At risk")
  const clients = new Set(live.map((p) => p.client)).size
  const paused = projects.filter((p) => p.status === "Paused").length
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`

  function create(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError(true)
      nameRef.current?.focus()
      return
    }
    add({ name: name.trim(), client: clientNames[client], status: "On track", progress: 0, due: "—", team: ["CS"] })
    setOpen(false)
    setName("")
    setError(false)
    toast.success(`Created “${name.trim()}”`, {
      description: "It’s first in your project list.",
      action: { label: "View", onClick: () => document.getElementById("workspace")?.scrollIntoView() },
    })
  }

  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="text-muted-foreground text-sm">{plural(live.length, "active project")} for {plural(clients, "client")}{paused > 0 && `, plus ${paused} paused`}.</p>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => toast("Export started", { description: "We’ll email you the CSV in a minute." })}>
          <Download /> Export
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus /> New project</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={create} className="grid gap-4">
              <DialogHeader>
                <DialogTitle>New project</DialogTitle>
                <DialogDescription>Give it a name and a client. You can add the team and budget later.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-2">
                <Label htmlFor="np-name">Project name</Label>
                <Input ref={nameRef} id="np-name" value={name} aria-invalid={error} aria-describedby={error ? "np-name-error" : undefined} autoComplete="off"
                  onChange={(e) => { setName(e.target.value); setError(false) }}
                  placeholder="e.g. Holiday landing page" />
                {error && <p id="np-name-error" className="text-destructive text-sm">Enter a project name.</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="np-client">Client</Label>
                <Select value={client} onValueChange={setClient}>
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
