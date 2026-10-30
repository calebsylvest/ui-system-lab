import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex h-5 flex-none items-center justify-center rounded-sm border border-transparent px-1.5 text-xs leading-none font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-pill-negative text-pill-negative-ink",
        outline: "border-input text-muted-foreground",
        positive: "bg-pill-positive text-pill-positive-ink",
        negative: "bg-pill-negative text-pill-negative-ink",
        warning: "bg-pill-warning text-pill-warning-ink",
        neutral: "bg-pill-neutral text-pill-neutral-ink",
      },
    },
    defaultVariants: { variant: "default" },
  }
)
function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}
export { Badge }
