// Vite shim: Fluid's Card imports next/link. A plain anchor is enough here.
import { forwardRef, type AnchorHTMLAttributes } from "react"
const Link = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { prefetch?: boolean }>(
  ({ prefetch: _p, ...props }, ref) => <a ref={ref} {...props} />
)
export default Link
