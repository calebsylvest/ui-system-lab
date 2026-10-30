import { Toaster as Sonner, type ToasterProps } from "sonner"
const Toaster = (props: ToasterProps) => (
  <Sonner className="toaster group"
    offset={{ bottom: "max(24px, env(safe-area-inset-bottom))", right: "max(24px, env(safe-area-inset-right))" }}
    mobileOffset={{ bottom: "max(16px, env(safe-area-inset-bottom))", right: "max(16px, env(safe-area-inset-right))", left: "max(16px, env(safe-area-inset-left))" }} style={{ "--normal-bg": "var(--popover)", "--normal-text": "var(--popover-foreground)", "--normal-border": "var(--border)" } as React.CSSProperties} {...props} />
)
export { Toaster }
