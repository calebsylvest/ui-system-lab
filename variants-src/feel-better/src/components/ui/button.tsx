import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,box-shadow,scale] duration-150 ease-out after:absolute after:top-1/2 after:left-1/2 after:h-full after:min-h-10 after:w-full after:min-w-10 after:-translate-1/2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline: "bg-background shadow-border hover:shadow-border-hover hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // Optical alignment: icon-side padding = text-side padding - 2px
        default: "h-9 px-4 py-2 has-[>svg:first-child]:pl-3.5 has-[>[data-icon]:first-child]:pl-3.5 has-[>svg:last-child:not(:first-child)]:pr-3.5",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg:first-child]:pl-2.5 has-[>[data-icon]:first-child]:pl-2.5 has-[>svg:last-child:not(:first-child)]:pr-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg:first-child]:pl-5.5 has-[>[data-icon]:first-child]:pl-5.5 has-[>svg:last-child:not(:first-child)]:pr-5.5",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

// Scale on press: always 0.96, never on disabled buttons, skipped for reduced motion.
const tapScale = "motion-safe:active:not-disabled:scale-[0.96]"

function Button({ className, variant, size, asChild = false, static: isStatic = false, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean; static?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size }), !isStatic && tapScale, className)} {...props} />
}

export { Button, buttonVariants }
