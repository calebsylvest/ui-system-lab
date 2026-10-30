import { useEffect, useState } from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

// ask-sonner: `theme` defaults to "light" and does not track the page. Dark mode here
// is a `.dark` class on <html>, so follow that class.
const htmlTheme = () => (document.documentElement.classList.contains("dark") ? "dark" : "light")
function useHtmlTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(htmlTheme)
  useEffect(() => {
    const mo = new MutationObserver(() => setTheme(htmlTheme()))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => mo.disconnect()
  }, [])
  return theme
}

const Toaster = (props: ToasterProps) => (
  <Sonner theme={useHtmlTheme()} className="toaster group" style={{ "--normal-bg": "var(--popover)", "--normal-text": "var(--popover-foreground)", "--normal-border": "var(--border)" } as React.CSSProperties} {...props} />
)
export { Toaster }
