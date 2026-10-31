import { createContext, useContext, useState, type ReactNode } from "react"
import { projects as seed, type Project } from "@/data"
import { withTransition } from "@/lib/transition"

// One source of truth for the project list, so the header count, the "New project" dialog and the
// cards all describe the same thing (interaction-contracts: confirmation must match reality).
type Store = {
  projects: Project[]
  add: (p: Omit<Project, "id">) => void
  rename: (id: string, name: string) => void
  duplicate: (id: string) => void
  /** Removes a project and returns a function that puts it back where it was. */
  remove: (id: string) => () => void
}

const Ctx = createContext<Store | null>(null)
let nextId = 100

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState(seed)

  const store: Store = {
    projects,
    add: (p) => withTransition(() => setProjects((ps) => [{ ...p, id: `p${nextId++}` }, ...ps]), "projects"),
    rename: (id, name) => setProjects((ps) => ps.map((p) => (p.id === id ? { ...p, name } : p))),
    duplicate: (id) =>
      withTransition(() =>
        setProjects((ps) => {
          const i = ps.findIndex((p) => p.id === id)
          if (i < 0) return ps
          const copy = { ...ps[i], id: `p${nextId++}`, name: `${ps[i].name} (copy)` }
          return [...ps.slice(0, i + 1), copy, ...ps.slice(i + 1)]
        }),
      "projects"),
    remove: (id) => {
      const i = projects.findIndex((p) => p.id === id)
      const removed = projects[i]
      withTransition(() => setProjects((ps) => ps.filter((p) => p.id !== id)), "projects")
      return () => {
        if (!removed) return
        withTransition(() =>
          setProjects((ps) => (ps.some((p) => p.id === id) ? ps : [...ps.slice(0, i), removed, ...ps.slice(i)])),
        "projects")
      }
    },
  }

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useProjects() {
  const s = useContext(Ctx)
  if (!s) throw new Error("useProjects must be used inside ProjectsProvider")
  return s
}
