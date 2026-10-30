import * as React from "react"
import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card" className={cn("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm", className)} {...props} />
}
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-header" className={cn("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto]", className)} {...props} />
}
// Titles are real headings. Pick the level that fits the outline of the page; h3 is the default
// because most cards sit inside a section that already has an h2.
type HeadingTag = "h2" | "h3" | "h4"
function CardTitle({ className, as: Tag = "h3", ...props }: React.ComponentProps<"h3"> & { as?: HeadingTag }) {
  return <Tag data-slot="card-title" className={cn("leading-snug font-semibold text-pretty", className)} {...props} />
}
function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="card-description" className={cn("text-muted-foreground text-sm text-pretty", className)} {...props} />
}
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-action" className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)} {...props} />
}
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-6", className)} {...props} />
}
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-footer" className={cn("flex items-center px-6", className)} {...props} />
}
export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
