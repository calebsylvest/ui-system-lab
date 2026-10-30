import type { BadgeColor } from "@/components/ui/badge"

// Fluid badges are colored dots rather than shadcn's solid/outline variants.
export const statusColor: Record<string, BadgeColor> = {
  "On track": "green",
  "At risk": "red",
  Paused: "gray",
  Done: "blue",
  Paid: "green",
  Sent: "blue",
  Overdue: "red",
  Draft: "gray",
}
