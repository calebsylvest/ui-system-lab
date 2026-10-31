// Data for the round-3 sections (ledger table and new-client form).
// Deliberately messy: very long names, missing values, huge and negative numbers,
// non-ASCII text and an unbroken string, so each system's edge-case handling shows.
export type LedgerRow = {
  id: string
  client: string
  project: string | null
  hours: number | null
  amount: number
  status: "Paid" | "Sent" | "Overdue" | "Draft" | "Credit"
  due: string | null
  dueOrder: number
}

export const ledger: LedgerRow[] = [
  { id: "L-2041", client: "Hollis & Pine", project: "Spring catalog redesign", hours: 62.5, amount: 8437.5, status: "Sent", due: "Nov 14", dueOrder: 14 },
  { id: "L-2040", client: "The Riverbend Community Food Bank & Neighborhood Pantry Network of North Texas", project: "Donor portal v2", hours: 118, amount: 15930, status: "Paid", due: "Oct 30", dueOrder: -1 },
  { id: "L-2039", client: "Northwind Outfitters", project: "Checkout flow audit", hours: 38.25, amount: 5163.75, status: "Overdue", due: "Oct 2", dueOrder: -29 },
  { id: "L-2038", client: "Zoë Ångström Design Büro", project: "Brand refresh (Phase 2 — typography, iconography and motion guidelines)", hours: 24, amount: 3240, status: "Draft", due: null, dueOrder: 999 },
  { id: "L-2037", client: "Calder Foundation", project: "Annual report site", hours: 9512, amount: 1284500, status: "Paid", due: "Oct 20", dueOrder: -11 },
  { id: "L-2036", client: "Tandem Health", project: null, hours: null, amount: -450, status: "Credit", due: null, dueOrder: 998 },
  { id: "L-2035", client: "Hearthside Bakery", project: "Menu boards", hours: 0, amount: 0, status: "Draft", due: "Dec 1", dueOrder: 31 },
  { id: "L-2034", client: "accounts-payable+invoices@verylongcompanydomainname-holdings.example", project: "Onboarding emails", hours: 14.75, amount: 1991.25, status: "Sent", due: "Nov 21", dueOrder: 21 },
  { id: "L-2033", client: "Northwind Outfitters", project: "Holiday landing page", hours: 31, amount: 4185, status: "Overdue", due: "Sep 28", dueOrder: -33 },
  { id: "L-2032", client: "株式会社 Kumo Studio", project: "App icon set", hours: 12, amount: 1620, status: "Paid", due: "Sep 15", dueOrder: -46 },
  { id: "L-2031", client: "Hollis & Pine", project: "Lookbook print run", hours: 45.5, amount: 6142.5, status: "Paid", due: "Sep 1", dueOrder: -60 },
  { id: "L-2030", client: "Riverbend Food Bank", project: "Volunteer sign-up flow", hours: 20, amount: 2700, status: "Sent", due: "Nov 7", dueOrder: 7 },
  { id: "L-2029", client: "O’Connor-Vasquez Partners LLP", project: "Pitch deck", hours: 7.5, amount: 1012.5, status: "Overdue", due: "Oct 12", dueOrder: -19 },
  { id: "L-2028", client: "Tandem Health", project: "Welcome sequence", hours: 16, amount: 2160, status: "Paid", due: "Aug 30", dueOrder: -62 },
]

export const currencies = [
  { value: "USD", label: "US dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British pound (GBP)" },
  { value: "JPY", label: "Japanese yen (JPY)" },
]

export const termsOptions = [
  { value: "receipt", label: "Due on receipt" },
  { value: "net15", label: "Net 15" },
  { value: "net30", label: "Net 30" },
  { value: "net60", label: "Net 60" },
]
