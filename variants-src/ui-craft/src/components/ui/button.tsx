import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium select-none transition-[color,background-color,border-color,box-shadow,scale] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        md: "h-9 px-4 py-2 has-[>svg:first-child]:pl-3 has-[>[data-slot=icon-swap]:first-child]:pl-3 has-[>svg:last-child]:pr-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg:first-child]:pl-2.5 has-[>[data-slot=icon-swap]:first-child]:pl-2.5 has-[>svg:last-child]:pr-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg:first-child]:pl-5 has-[>svg:last-child]:pr-5",
        icon: "size-9 active:scale-[0.96]",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
)

type ButtonProps = React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & {
  asChild?: boolean
  /** Shows a spinner, sets aria-busy and blocks repeat clicks. Default: false. */
  loading?: boolean
}

/** Defaults: variant "default", size "md", type "button" (never submits a form by accident). */
function Button({ className, variant, size, asChild = false, loading = false, type, disabled, children, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp data-slot="button" data-loading={loading || undefined} aria-busy={loading || undefined}
      type={asChild ? type : (type ?? "button")} disabled={asChild ? disabled : disabled || loading}
      className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {loading && !asChild ? <><Loader2 className="animate-spin" />{children}</> : children}
    </Comp>
  )
}

export { Button, buttonVariants }
