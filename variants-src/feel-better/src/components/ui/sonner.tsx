import { Toaster as Sonner, type ToasterProps } from "sonner"
const Toaster = (props: ToasterProps) => (
  <Sonner className="toaster group" style={{ "--normal-bg": "var(--popover)", "--normal-text": "var(--popover-foreground)", "--normal-border": "transparent" } as React.CSSProperties}
    toastOptions={{ style: { boxShadow: "var(--toast-shadow)" } }} {...props} />
)
export { Toaster }
