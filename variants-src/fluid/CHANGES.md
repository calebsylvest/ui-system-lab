# Fluid Functionalism variant — changes from baseline

Installed from the @fluid registry (mickadesign/fluid-functionalism, served locally because
fluidfunctionalism.com is not reachable from this machine's sandbox), Radix flavor, `--overwrite`.

## System wiring
- `FluidProvider` + `MotionConfig reducedMotion="user"` wrap the app.
- Inter Variable with the `opsz` axis (`@fontsource-variable/inter/opsz.css`) — needed for the
  weight-shift hover on labels. Body font switched from system to Inter.
- Fluid tokens, springs, surfaces and type scale merged into `src/index.css`.
- `next/link` shimmed to a plain anchor (Fluid's Card imports it; this is a Vite app).

## Component swaps
| Baseline (shadcn) | Fluid |
|---|---|
| Button outline / link / destructive | tertiary / ghost / secondary + trash icon (Fluid has 4 variants: primary, secondary, tertiary, ghost) |
| Button sm / lg | compact (Fluid has 2 sizes: 36px default, 28px compact) |
| Saving spinner built by hand | `loading` prop (morphing spinner) |
| Tooltip / TooltipTrigger / TooltipContent | `<Tooltip content>` (spring, single wrapper) |
| DropdownMenu* | Dropdown + MenuItem (fluid hover glides between items) |
| Dialog | Fluid Dialog, size "sm", spring enter/exit |
| Tabs / TabsTrigger / TabsContent | Tabs / TabItem / TabPanel (sliding indicator) |
| Project cards | CardGroup columns={3} — 2-D fluid hover across the grid |
| Badge solid/outline | Badge `variant="dot"` with status colors |
| Table | Fluid Table, row hover highlight glides between rows |
| Inputs + labels | InputGroup / InputField (animated labels, inline errors) |
| Select | Fluid Select (bordered), animated popup, typeahead |
| Switch + separate label | Fluid Switch with built-in label |
| Checkbox (settings) | CheckboxGroup / CheckboxItem |
| Accordion | Fluid Accordion (spring chevron + height) |
| Chat bubbles | ChatMessage |
| "Thinking…" text | ThinkingIndicator (morphing SVG + cycling text) |
| Textarea composer | InputMessage (auto-resize, built-in send) |

## Kept from baseline (Fluid ships no equivalent)
Avatar, Progress, Skeleton, Label, Textarea, Separator, the search Input, the invoice-row Checkbox, Sonner toasts.

## Noticeable side effects
- Standalone Fluid Cards are borderless by design, so Stats/Controls/Settings lost their card frames.
- Bundle grew (~780 KB JS vs ~470 KB) — motion + pdf.js pulled in by input-message's file thumbnails.
