// Data for the round-2 sections (tasks, quick actions, sync states).
export type Task = { id: string; title: string; who: string; due: string; dueOrder: number; done: boolean }

export const initialTasks: Task[] = [
  { id: "t1", title: "Send catalog proofs to Hollis & Pine", who: "MR", due: "Today", dueOrder: 0, done: false },
  { id: "t2", title: "Fix tab order in checkout audit report", who: "CS", due: "Nov 3", dueOrder: 3, done: false },
  { id: "t3", title: "Book photographer for menu boards", who: "LT", due: "Nov 12", dueOrder: 12, done: false },
  { id: "t4", title: "Review donor portal copy with Riverbend", who: "JO", due: "Nov 1", dueOrder: 1, done: true },
  { id: "t5", title: "Draft onboarding email #3", who: "PN", due: "Nov 7", dueOrder: 7, done: false },
]

// Canned tasks used by the Add button so every variant adds the same thing.
export const extraTasks = [
  { title: "Export final logo files for Calder", who: "AK", due: "Nov 5", dueOrder: 5 },
  { title: "Call Tandem about the welcome sequence", who: "CS", due: "Nov 2", dueOrder: 2 },
  { title: "Archive old menu board drafts", who: "LT", due: "Nov 20", dueOrder: 20 },
]

export const people = [
  { id: "MR", name: "Maya Reyes", role: "Designer" },
  { id: "JO", name: "Jonah Okafor", role: "Engineer" },
  { id: "AK", name: "Ari Kim", role: "Designer" },
  { id: "CS", name: "Chris Sutton", role: "Studio lead" },
  { id: "LT", name: "Lena Torres", role: "Producer" },
  { id: "PN", name: "Priya Nair", role: "Writer" },
]

export const commands = [
  { group: "Projects", items: ["New project", "Open Spring catalog redesign", "Open Checkout flow audit", "Archive project"] },
  { group: "Invoices", items: ["Create invoice", "Send reminders", "Export invoices as CSV"] },
  { group: "Go to", items: ["Clients", "Time", "Reports", "Settings"] },
]
