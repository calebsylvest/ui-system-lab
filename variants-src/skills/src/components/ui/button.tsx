import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[background-color,color,box-shadow,scale] duration-150 ease-out [-webkit-tap-highlight-color:transparent] disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // min-h, not h: labels survive 200% text resize. Icon side gets 2px less padding (optical alignment).
        default: "min-h-9 px-4 py-2 has-[>svg:first-child]:ps-3.5",
        sm: "min-h-8 rounded-md gap-1.5 px-3 has-[>svg:first-child]:ps-2.5",
        lg: "min-h-10 rounded-md px-6 has-[>svg:first-child]:ps-5.5",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

// better-ui: pressed buttons scale to 0.96 (never when disabled), gated behind reduced motion
const tapScale = "motion-safe:enabled:not-aria-disabled:active:scale-[0.96]"

function Button({ className, variant, size, asChild = false, static: isStatic = false, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean; static?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size }), !isStatic && variant !== "link" && tapScale, className)} {...props} />
}

export { Button, buttonVariants }
