# CHANGES — olzn/ui-craft

This variant applies the olzn/ui-craft suite to the Fieldwork baseline. The `ui-craft` router classifies this as "make this UI better / visual polish" on an existing UI, so the route was:
**surface-details (lead) → surface-copy → surface-interaction → surface-motion → surface-typography → surface-colour → system-components**, plus system-tokens (surface-details hands the shadow scale to it) and a quick look at system-patterns' feedback rules where surface-details defers to it. Shared references read: `quality.md`, `composition.md`, `accessibility.md`, `design-philosophy.md`, plus each skill's own references (`interface-polish.md`, `polish-recipes.md`, `api-polish.md`) and `learnings.md` files.

Content, data, sections and features are unchanged except where noted.

## Changes

### Tokens and colour (`src/index.css`)
- **Elevation scale (Derek Briggs method)** `--elev-xs…xl`, mapped onto Tailwind `shadow-*`. Each one starts with a 1px ring layer, and in dark mode that ring is white alpha. *system-tokens › Shadow; surface-details › "Box-shadow instead of borders".*
- **Motion tokens** `--ease-default` `cubic-bezier(0.16,1,0.3,1)`, `--ease-enter`, `--ease-exit`. Tailwind's default transition is now 150ms on `--ease-default`, and `ease-out`/`ease-in` point at the suite's curves. *surface-motion › Easing/Duration; system-tokens › Motion tokens.*
- **Brand + status primitives in OKLCH** (clay brand, green/amber/red) with chroma tapered at the light and dark ends, mapped to semantic tokens `--brand`, `--success(-surface)`, `--warning(-surface)`, `--danger(-surface)`, `--selection`. Components only use the semantic tokens. *surface-colour › Scales, Semantic mapping; system-tokens › Three-layer model.*
- **Focus ring** `--ring` now uses the brand colour. It is solid, has more than 3:1 contrast in both themes, and replaces the faint `ring/50`. *surface-colour › Non-text 3:1.*
- **Muted text** in light mode went from L 0.556 to 0.52. The old value fell below 4.5:1 on `--muted` surfaces. *surface-colour › Contrast.*
- **Dark-mode text** went from pure white (0.985) to off-white (0.94). *surface-colour › Dark mode rules.*
- **Base layer:** `scrollbar-gutter: stable` *(surface-details learnings)*, `-webkit-text-size-adjust`, the tap highlight replaced by a pressed state, antialiasing, `optimizeLegibility`, `kern/liga/calt`, `text-wrap: balance` on headings and card/dialog titles, `pretty` on paragraphs and descriptions. *surface-typography › Rendering, OpenType.*
- **`::selection`** styled with brand tokens. *surface-details › Style ::selection.*
- **`hit-area` utility.** A ::after pseudo-element sized by `--hit`, default 44px. *surface-details/interface-polish › Hit Areas.*
- **`animate-enter` keyframe.** 240ms with ease-enter and a 6px rise. *surface-motion › Entrances.*
- **Global `prefers-reduced-motion`** collapses motion to instant. *surface-motion › Reduced Motion.*

### Typography (`src/index.css`, `package.json`)
- **New dependency: `@fontsource-variable/instrument-sans@5.3.0`**, used as `--font-sans` (one variable family at two weights). The suite treats an unpaired system or Inter font as the generic default. It asks for a deliberate typeface that is self-hosted, subsetted and loaded with `font-display: swap`, and Fontsource gives exactly that without leaving the Vite stack. Only the `wght` axis is imported, about 30 KB for the Latin subset. *surface-typography › Loading, Pairing; design-philosophy › Taste.*
- **`tabular-nums`** on stat values, invoice numbers, dates and amounts, due dates, progress %, selection count, star count and the rate input. *surface-typography › Numeric figures; system-patterns › Tables.*

### Components (`src/components/ui/*`)
- **button.tsx**
  - Defaults to `type="button"`. *system-components › Native defaults.*
  - New `loading` prop that shows a spinner, sets `aria-busy` and disables the button. *system-components › Standard props/Quality contract.*
  - Size `default` renamed to `md`, so sizes are sm/md/lg. *system-components › Prop conventions.*
  - `transition-all` replaced by an explicit property list. *surface-motion › transition: all ban.*
  - Press feedback: `active:scale-[0.97]`, and 0.96 for icon buttons. *surface-motion › Press feedback.*
  - `select-none`. *surface-details.*
  - Optical padding: the icon side gets less padding than the text side. *surface-details › Optical alignment.*
- **All focusable primitives** (button, input, textarea, select, checkbox, switch, tabs, accordion, dialog close): the 3px translucent `ring` was replaced with `outline-2 outline-offset-2 outline-ring`, which follows the border radius. Invalid fields get a destructive-coloured outline. *surface-details › Focus rings follow radius.*
- **card.tsx, dropdown-menu.tsx, select.tsx, dialog.tsx:**
  - Flat 1px borders replaced by the elevation scale: cards `shadow-sm`, menus `shadow-lg`, dialog `shadow-xl`. Table rows and separators keep hairlines. *surface-details › Box-shadow; interface-polish › Hairlines.*
  - Menu and select item radii made concentric with the container (outer − padding). *surface-details › Concentric radius.*
- **dialog / dropdown / select / tooltip motion:**
  - Entrances ease out and exits ease in.
  - Exits are about 70% of the entrance time (200→150, 150→100).
  - The overlay is paired with the content's timing.
  - The dialog exits to a subtle 0.97 scale.
  - *surface-motion › Exit patterns; polish-recipes › Paired motion.*
- **dialog.tsx close button:** now a real 32px button with a 44px hit area, hover state and focus outline. Before, it was a 16px icon at 70% opacity. *surface-details › Hit areas.*
- **tooltip.tsx:** 250ms initial delay; tooltips opened after the delay was skipped show without animation (`data-state=instant-open`); 150ms in / 100ms out; 4px offset. *surface-details › Tooltips.*
- **badge.tsx:**
  - New `success`/`warning` variants.
  - `destructive` is now a soft tint (danger text on a danger surface) instead of white on red.
  - All of these are above 5:1 in both themes, and every badge keeps its text label, so colour is never the only signal.
  - *surface-colour › Status, Colour blindness.*
- **tabs.tsx:** trigger radius made concentric with the list (`radius-lg − 3px`); `select-none`; no `transition-all`.
- **checkbox.tsx:** 32px expanded hit area. This is not 44px, so it can't overlap the next table row.
- **switch / progress / accordion:** `transition-all` replaced by specific properties.
- **input.tsx:** `spellCheck` is off by default. *surface-details › Forms.*
- **New `icon-swap.tsx`:** a CSS-only cross-fade (opacity + scale + 2px blur) between two mounted icons. No motion library was added. *surface-motion › Icon swap; polish-recipes › CSS-only icon swaps.*

### Sections
- **data.ts:** status → badge mapping is now On track/Paid = success, At risk = warning, Overdue = destructive, Done = secondary. Before, "At risk" and "Overdue" looked the same. Only presentation changed; the data is the same. *surface-colour › Semantic mapping.*
- **TopNav.tsx:**
  - Search is now a `<form role="search">` with `type="search"` and an aria-label. The icon is `pointer-events-none`, so clicking it reaches the input. *surface-details › Forms, Input decorations.*
  - `aria-current="page"` on the active link.
  - 44px hit area on the bell; 40px on the avatar so the two don't overlap.
  - The avatar trigger got `type="button"`, a press state and a focus outline.
- **PageHeader.tsx:**
  - Project name is `required`, and the form is `noValidate` so the designed inline error still shows.
  - On error, focus moves to the field, and the error is linked with `aria-describedby`. *system-patterns › On submit error.*
  - Export toast copy changed from "in a minute" to "when it's ready". *surface-copy › No false reassurance.*
- **Settings.tsx:**
  - Saving uses `Button loading`.
  - Success is confirmed inline: the button's icon swaps Save → Check and the label reads "Saved" for 2s. An sr-only live region announces it. This replaces the success toast.
  - An invalid submit focuses the email field, whose error is already inline, instead of showing an error toast.
  - *surface-details › Feedback near its trigger; system-patterns › "Important outcomes are inline".*
  - Email field: `type="email"`, `autocomplete`, `aria-describedby`. Rate field: `inputMode="decimal"`, `min=0`.
- **Controls.tsx:**
  - The Like heart animates with an icon swap and uses the `brand` token instead of the hardcoded `text-red-500`.
  - The toolbar group radius is concentric (inner + 2px padding).
  - Hit area on the "Add" icon button.
  - Promise-toast error copy now says how to recover. *surface-copy › Errors.*
- **Workspace.tsx:**
  - Hit areas on the card menu buttons.
  - Tabular figures.
  - "reminder(s)" is now correctly pluralised. *surface-copy.*
- **Assistant.tsx:**
  - Messages that arrive after first render use `animate-enter`; the initial messages stay still. *polish-recipes › Skip default mount motion.*
  - The log scrolls itself to the newest message. *surface-details › Papercuts.*
  - `overscroll-contain`, plus `role="log"` with `aria-live`.
  - The composer textarea is `rounded-xl` and its inner buttons `rounded-sm`, so the radii are concentric: 14 − 8 = 6.
- **States.tsx:** decorative file thumbnails are `aria-hidden`.
- **main.tsx:** a MutationObserver on `<html>` turns off all transitions for one frame whenever `.dark` flips, so the theme swap doesn't flash. lab-bridge.js is untouched. *surface-details › Theme switching without transition flash.*
- **App.tsx:**
  - Footer now reads "Variant: olzn/ui-craft".
  - Toaster offsets respect `env(safe-area-inset-*)`. *surface-details › Safe areas.*

## Findings not implemented
- **Hover scoped to `(hover: hover)`, Radix menus opening on pointerdown, lucide icons `aria-hidden`:** already handled by Tailwind v4, Radix and lucide.
- **Hit areas on the B/I/U toolbar and the Mic/Send pair:** the buttons sit 0–4px apart, so expanded areas would overlap. The skill forbids overlap.
- **Font preload and `size-adjust` metric overrides (or the `fontaine` plugin from learnings):** this would need another plugin or hand-tuned metrics. Fontsource's `swap` + subsets cover most of it.
- **Tabular figures:** Instrument Sans's `tnum` support could not be checked locally (no brotli/fontTools on the VM).
- **Page-load stagger / scroll reveals:** surface-motion recommends them, but surface-interaction's frequency rule says a dashboard opened tens of times a day should stay quiet. I chose interaction.
- **Animated numbers (number-flow) and text morphing (torph):** would add dependencies only for polish.
- **Delete confirmation dialog, table sorting/pagination, ⌘K search, Cmd+Enter in the composer:** these come from system-patterns, which is off the polish route, and they would change features.
- **Validating before interaction:** the billing email shows an error on load. That stays, because it is the baseline's demo of the error state.
- **Z-index and breakpoint tokens:** Tailwind v4 `z-*` doesn't read a theme namespace, and the breakpoints already match the suite's scale.
- **sRGB fallbacks for OKLCH:** not needed for the evergreen browsers this page targets.
- **`displayName`:** the components are named function declarations, so DevTools already shows them.
- **Visual check:** I could not take screenshots. The browser pane could not reach the VM's preview server. Verification was the build plus inspecting the generated CSS.

## Agent notes
ui-craft is strongest as a checklist of specific, testable details: concentric radii, 44px hit areas, exit ≈ 70% of entrance, no `transition: all`, inline vs toast feedback. Almost every rule came with a concrete value or snippet. It was thin on visual direction. It tells you to avoid the "generic AI aesthetic" and to choose type deliberately, but it gives no help choosing a font or brand colour. Some rules conflict across skills: surface-motion wants staggered entrances while surface-interaction says frequent screens shouldn't animate, and system-patterns' own table cites "Settings saved" as a good toast while also saying success should "never only" be a toast. It is opinionated about mechanics (exact easing curves, Briggs shadows, OKLCH, outline focus rings) but deliberately neutral about aesthetics. Its routing protocol worked well for picking a starting point, though the shared reference files are duplicated in every skill folder.
