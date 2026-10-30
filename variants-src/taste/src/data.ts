export type Project = {
  id: string
  name: string
  client: string
  status: "On track" | "At risk" | "Paused" | "Done"
  progress: number
  due: string
  team: string[]
}

export const projects: Project[] = [
  { id: "p1", name: "Spring catalog redesign", client: "Hollis & Pine", status: "On track", progress: 64, due: "Nov 14", team: ["MR", "JO", "AK"] },
  { id: "p2", name: "Checkout flow audit", client: "Northwind Outfitters", status: "At risk", progress: 38, due: "Nov 3", team: ["CS", "LT"] },
  { id: "p3", name: "Donor portal v2", client: "Riverbend Food Bank", status: "On track", progress: 81, due: "Dec 1", team: ["AK", "PN", "JO", "MR"] },
  { id: "p4", name: "Menu boards", client: "Hearthside Bakery", status: "Paused", progress: 22, due: "—", team: ["LT"] },
  { id: "p5", name: "Annual report site", client: "Calder Foundation", status: "Done", progress: 100, due: "Oct 20", team: ["PN", "CS"] },
  { id: "p6", name: "Onboarding emails", client: "Tandem Health", status: "On track", progress: 47, due: "Nov 21", team: ["JO", "LT", "CS"] },
]

export type Invoice = {
  number: string
  client: string
  issued: string
  amount: number
  status: "Paid" | "Sent" | "Overdue" | "Draft"
}

export const invoices: Invoice[] = [
  { number: "INV-1042", client: "Hollis & Pine", issued: "Oct 28", amount: 8400, status: "Sent" },
  { number: "INV-1041", client: "Calder Foundation", issued: "Oct 21", amount: 12650, status: "Paid" },
  { number: "INV-1040", client: "Northwind Outfitters", issued: "Oct 2", amount: 5200, status: "Overdue" },
  { number: "INV-1039", client: "Riverbend Food Bank", issued: "Sep 30", amount: 3900, status: "Paid" },
  { number: "INV-1038", client: "Tandem Health", issued: "Sep 24", amount: 7150, status: "Paid" },
  { number: "INV-1043", client: "Hearthside Bakery", issued: "—", amount: 1800, status: "Draft" },
]

export const activity = [
  { who: "Maya R.", initials: "MR", what: "moved Spring catalog redesign to Review", when: "12 min ago" },
  { who: "Jonah O.", initials: "JO", what: "commented on Donor portal v2", when: "1 hr ago" },
  { who: "Lena T.", initials: "LT", what: "uploaded 14 files to Menu boards", when: "3 hr ago" },
  { who: "Chris S.", initials: "CS", what: "sent invoice INV-1042 to Hollis & Pine", when: "Yesterday" },
]

export const faqs = [
  { q: "How are billable hours rounded?", a: "Time entries round up to the nearest 15 minutes when an invoice is generated. The raw entries stay unchanged, so you can export exact times at any point." },
  { q: "Can clients see project progress?", a: "Only if you share a client view. Shared views show milestones and approved files, never internal comments or rates." },
  { q: "What happens when a project is paused?", a: "Paused projects stop sending reminders and drop out of the weekly summary. Nothing is deleted, and you can resume at any time." },
  { q: "How do I move a project to another workspace?", a: "Open the project menu and choose Move. Files, comments and time entries move with it; invoices stay with the original workspace." },
]

// Pale pill pairs: colour says good or bad, neutral states stay grey (app-screens.md 7.6).
export const statusVariant = {
  "On track": "positive",
  "At risk": "negative",
  Paused: "neutral",
  Done: "neutral",
  Paid: "positive",
  Sent: "neutral",
  Overdue: "negative",
  Draft: "outline",
} as const

// Each person keeps one hue everywhere they appear. Hues are chosen so that people listed next
// to each other (a project team, the activity feed) sit at least 60 degrees apart.
export const personHue: Record<string, number> = { MR: 20, JO: 140, AK: 210, PN: 80, CS: 330, LT: 45 }

// Totals are computed from the rows, never typed in twice (app-screens.md 2.1).
export const unpaidInvoices = invoices.filter((i) => i.status !== "Paid")
export const outstandingTotal = unpaidInvoices.reduce((s, i) => s + i.amount, 0)
export const overdueInvoices = invoices.filter((i) => i.status === "Overdue")
export const overdueTotal = overdueInvoices.reduce((s, i) => s + i.amount, 0)
export const projectCounts = {
  active: projects.filter((p) => p.status === "On track" || p.status === "At risk").length,
  paused: projects.filter((p) => p.status === "Paused").length,
  done: projects.filter((p) => p.status === "Done").length,
}
console.assert(outstandingTotal === 15400, "Outstanding must match the assistant's $15,400")
console.assert(unpaidInvoices.length === 3, "Three unpaid invoices")
console.assert(overdueTotal === 5200, "Overdue must match INV-1040")
console.assert(projectCounts.active + projectCounts.paused + projectCounts.done === projects.length, "Project counts must cover every project")
