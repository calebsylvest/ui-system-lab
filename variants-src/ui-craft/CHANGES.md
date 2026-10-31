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

## Round 2

The router classifies the new sections as composite workflows (a mutable list, overlays, async states), so the route was **system-patterns (lead: lists, feedback, optimistic updates, modal/search patterns) → surface-interaction (frequency) → surface-motion (+ polish-recipes) → surface-details (+ interface-polish) → surface-copy / system-naming → system-components**. All round-1 tokens are reused: elevation scale, `--ease-*` curves, the outline focus ring, `hit-area`, `animate-enter`, the danger/warning/success tokens and `IconSwap`.

### New dependency
- **`motion@^14.9.0`**. surface-motion asks for exit animations on everything that enters (`AnimatePresence`) and for a library before hand-rolled FLIP code ("Use these before rolling your own"). The task list needs enter, exit and reorder motion, which CSS can't do without delaying unmounts. Round 1 skipped Motion because icon swaps alone didn't justify it, and icon swaps still use the CSS `IconSwap`. Same version as the other variants that use it.

### Primitives (`src/components/ui/*`)
- **popover.tsx:**
  - The border is replaced by `shadow-lg` and `rounded-lg`, the same as menus. *surface-details › Box-shadow.*
  - Motion is 150ms ease-out in and 100ms ease-in out, about 70%. It grows from the Radix transform-origin. *surface-motion › Exit patterns, transform-origin.*
  - `max-h` comes from the available height, with `overscroll-contain`.
- **sheet.tsx:**
  - Durations went from 500ms in / 300ms out to 300 / 200. The old values broke the 300ms cap for large surfaces and had the exit slower than the 70% rule.
  - Both directions use the suite curves, and the overlay is paired with the panel (same duration and easing).
  - `shadow-xl` replaces the side border.
  - Safe-area padding on the edge that touches the device frame.
  - The close button is now the round-1 dialog close: 32px with a 44px hit area, a hover state and the outline focus ring.
  - The header has `pr-12` so the title clears the close button.
  - The footer order matches DialogFooter.
  - *surface-motion › Duration, Paired motion; surface-details › Hit areas, Safe areas.*
- **dialog.tsx:** additive props. `overlayClassName` lets the overlay's motion follow its content's, and `showCloseButton` defaults to true.
- **command.tsx:**
  - **CommandDialog** opens instantly with no entrance animation and only fades out over 100ms, for both the content and the overlay. *surface-interaction › Frequency: "Command-K palettes should appear instantly".*
  - It is anchored at `top-[15vh]` instead of being vertically centred, so the box no longer jumps as results filter. *surface-details › Layout shift.*
  - Escape clears the query first and closes on the second press, using shared search state through context. *system-patterns › Search.*
  - Arrow keys wrap (`loop`).
  - The sr-only title and description were moved *inside* DialogContent. Before, they were outside it, so Radix couldn't link them as the dialog's name.
  - The title changed to "Command menu".
  - **CommandInput:** the wrapper is a `<label>`, so clicking the search icon focuses the input. The icon is `aria-hidden` and `pointer-events-none`. Text is 16px below `sm` (iOS zoom). Spellcheck is off. *surface-details › Input decorations, iOS input zoom.*
  - **Radii:** `Command` inherits its container's radius. Items are 6px, which is concentric in both the popover (10 − 4) and the dialog (14 − 8). *surface-details › Concentric radius.*
  - The highlight stays instant because it is keyboard-driven and high-frequency.
  - **CommandShortcut** is now a `<kbd>`, and the empty state uses muted, pretty-wrapped text.
- **lib/platform.ts (new):** `modKey` shows ⌘ on Apple platforms and "Ctrl " elsewhere. *surface-details/interface-polish › Shortcuts and platform labels.*

### Tasks (`src/sections/Tasks.tsx`)
- **Enter/exit/reorder motion:**
  - Uses `AnimatePresence initial={false} mode="popLayout"` with `motion.li layout`.
  - Rows enter in 200ms on the entrance curve with a 4px drop, because new tasks come from the input above.
  - Rows exit in 140ms on the exit curve (70%) with a small downward fade.
  - Siblings slide into place on a no-bounce 300ms spring, which covers sort, move, add and remove.
  - Rows present on first render don't animate.
  - *surface-motion › AnimatePresence, Exit patterns, Skip default mount motion.*
- **Reduced motion:** `MotionConfig reducedMotion="user"` in `RoundTwo.tsx`, because the global CSS rule can't reach Motion's JS animations. *surface-motion › Reduced Motion.*
- **Focus management:**
  - Removing a row with the keyboard moves focus to the next row's Remove button (or the previous row's), or to the input if the list is empty.
  - Moving a row to an edge, which disables its button, moves focus to the opposite arrow.
  - Before, focus fell to `<body>`. *surface-details learnings › focus return when trigger is removed; Inactive regions.*
- **⌘/Ctrl+Backspace** removes the focused row. It is exposed via `aria-keyshortcuts` and a platform-labelled `title`. *surface-details › "⌘+Backspace deletes in lists".*
- **Moving while sorted:** the move now starts from the order on screen. Before, the list jumped back to the manual order and then swapped. Data and features are unchanged. *surface-details › Jumping scroll position / predictable lists.*
- **Sort toggle:** keeps one label, "Sort by due date". `aria-pressed`, the secondary variant and an IconSwap to a check carry the state. Before, the label flipped to "Sorted by due date". *system-naming › "label the setting, not the click".*
- **Rows:**
  - Rows touch, with padding instead of `gap-1`, so there are no dead zones. They are borderless with a hover/focus-within tint; nested bordered boxes inside a card were noise.
  - The title is now the checkbox's `<label>`. That makes the whole title a full-height target, and the checkbox's accessible name becomes the task title (its state is announced by the checkbox). It replaces the "Mark … done" aria-label.
  - *surface-details › No dead zones; Labels focus inputs.*
- **Small fixes:**
  - Due dates use `tabular-nums`.
  - Avatars are `aria-hidden`, with an sr-only "Assigned to {name}" and a `title`.
  - Long titles wrap with `min-w-0`.
  - Icon buttons are 28→32px and muted until hovered.
- **Copy:**
  - "1 open task" is now pluralised correctly.
  - The empty state reads "Nothing left for this week. Add a task above to plan ahead." *surface-copy › Empty states.*
  - The new-task input has `autocomplete="off"`, the allowed exception for misleading suggestions.
  - A polite live region announces added tasks.
- **Kept:** remove with an Undo toast, which is what system-patterns prescribes for reversible actions (no confirmation dialog).

### Quick actions (`src/sections/QuickActions.tsx`)
- **Sheet keeps entered data:**
  - The fields are controlled with a draft separate from the saved project. Escape or a backdrop click keeps the draft; only Cancel discards it. Before, every close threw edits away, including Save.
  - An inline "Unsaved changes" hint appears while the draft is dirty.
  - The sheet is a real `<form>`, so Enter saves. The title reflects the saved name.
  - The success toast names the project. A toast is fine here because the sheet closes, which leaves no inline location.
  - *surface-details › Preserve entered data; Inputs live inside a form.*
  - Field tweaks: `inputMode="numeric"`, `min=0` and tabular figures on budget; spellcheck on for notes.
- **Filter popover:**
  - Checkboxes already applied live, so the "Apply" button, which only fired a toast, is now "Done" and closes the popover. *surface-details › Toggles take effect immediately; system-patterns › Toast only for background info.*
  - "Clear" is disabled when there's nothing to clear.
  - The group is a `fieldset`/`legend`.
  - Each row is a full-width label with no dead zones and a concentric 6px radius.
  - The helper text says changes apply right away.
  - The count is a tabular chip, and the trigger is announced as "Filter, N active".
- **People picker:**
  - The trigger has an sr-only "Assignee:" prefix and `aria-haspopup="listbox"`.
  - Avatars are `aria-hidden`.
  - The popover matches the trigger width via `--radix-popover-trigger-width`.
  - cmdk has `label="Assignee"`. Role is a search keyword.
  - Arrow keys wrap.
  - Empty copy: "No one matches that name."
- **Command menu button:**
  - The shortcut shows ⌘K or Ctrl K by platform, as a `<kbd>` chip.
  - `aria-keyshortcuts` is set.
  - The global shortcut also accepts uppercase K (Caps Lock or Shift).
- **Command empty state** now suggests a next step: "No commands match. Try a project name or “invoice”." *surface-copy › Empty states.*
- **The summary line** is `aria-live="polite"`.

### Sync (`src/sections/SyncStates.tsx`)
- **Optimistic save made honest:**
  - The button keeps its "Raise by $10" label and only blocks repeats (`disabled` + `aria-busy`), since the value has already updated.
  - A fixed-height inline status line under the value shows "Saving…", then "Saved" with a check for 2s, or "Queued. Syncs when you're back online." while offline.
  - This replaces the success toast, the same pattern as Settings in round 1. *system-patterns › Optimistic updates, "Important outcomes are inline"; surface-details › Feedback near its trigger.*
- **Failure:**
  - The error now says what happened and what was rolled back: "Couldn't save $145. The server didn't respond, so the rate is back to $135." *surface-copy › Errors.*
  - It sits on a danger-surface strip with an icon. The strip is concentric with its Retry button (14 = 8 + 6).
  - It uses `animate-enter`.
  - Keyboard focus that was dropped by the disabled button goes to Retry on failure and back to Raise on success.
- **Offline banner:**
  - Warning tokens, icon plus text. *system-patterns › Banner for system-wide state; surface-colour › colour never alone.*
  - It enters and exits through `AnimatePresence` (opacity + height, 200/140ms) so the content below doesn't snap. Height is a layout property, but here it beats an instant jump. The grid gap collapses with it.
- **Online switch:** gets helper text ("Turn off to queue changes locally.") linked by `aria-describedby`. The background-sync toast is kept: a background process finishing is the textbook toast case.
- **Reload:**
  - The refresh icon spins in place instead of a separate spinner, and the button is `aria-busy`.
  - The skeleton rows mirror loaded rows exactly (20px + 16px lines).
  - The results area has `min-h` equal to three loaded rows, so the skeleton, error and content states don't shift the layout. *system-patterns › Skeletons mirror content; interface-polish › Skeletons that match final dimensions.*
  - Reloaded content and errors fade in with `animate-enter`; the first render stays still.
  - `aria-busy` on the region and a polite sr-only live message.
  - Focus returns to Retry or Reload as above.
- **Error copy and naming:**
  - "Couldn't load time entries. Check your connection, then retry."
  - The button changed from "Try again" to **"Retry"**, so the same command has the same label in both places. *system-naming › consistency; surface-copy › Errors.*

### Not done, and why
- **Roving tabindex with ↑/↓ across task rows:** surface-details asks for it, but each row holds a checkbox and three buttons, which makes it a grid widget. Doing it properly (`role="grid"`) is a larger behavior change than this round allows. ⌘Backspace and focus management were done instead.
- **44px hit areas on the task row icon buttons:** they sit flush (32px each), so expanded areas would overlap. This is the same exception as the round-1 toolbar.
- **A confirm-on-dismiss warning for the dirty sheet:** system-patterns suggests warning on backdrop close with unsaved data. Keeping the draft is less intrusive and avoids a stacked modal, which the same skill forbids.
- **Escape clearing the query in the people picker:** this is implemented for the command dialog only. In a small popover picker, Escape closing it is the expected behavior.
- **Animated number for the rate (number-flow):** skipped, same reason as round 1.
- **Staggered entrance for reloaded rows:** skipped. surface-interaction's frequency rule beats surface-motion's stagger suggestion for a feed that is reloaded often.
- **Deep-linking the sheet, filters or command state in the URL:** system-patterns recommends it, but the page has no router, so it would be a feature change.
- **Visual check:** as in round 1, verification was the build, oxlint (0 errors) and a diff confirming all 13 `data-lab` hooks match the baseline. No screenshots.

## Round 3

The router puts a data table and a multi-step form under **system-patterns** (lead: Tables, Forms, Multi-step forms, Search, Modal dismiss), then **surface-copy** (errors, empty states, confirmation body), **surface-details** (+ interface-polish: forms, text overflow, layout shift, focus return, disabled-button explanations), **surface-typography** (numeric figures) and **surface-colour** (status mapping). The round-1/2 tokens are reused as-is: semantic status badges, the outline focus ring, `hit-area`, `animate-enter`, `tabular-nums`, the danger/success surfaces and the hairline table rows. There are no new dependencies and no primitive changes.

### Ledger (`src/sections/Ledger.tsx`)
- **Numbers:**
  - `tabular-nums` on ID, hours, amount, due and total.
  - Negative amounts use a true minus sign (U+2212), so the credit reads "−$450.00", not "-$450.00". Zero amounts are muted.
  - Hours use `Intl.NumberFormat`, so the huge value shows as "9,512".
  - Number headers are right-aligned with the sort arrow on the inside, so each label lines up with its column's digits.
  - *surface-typography › Numeric figures; system-patterns › Tables "right-align numbers"; surface-details › Optical alignment.*
- **Missing values:** a muted "—" is `aria-hidden`, with an sr-only "No project", "No hours" or "No due date", because a bare dash is read as "dash". *accessibility.md / surface-details › Decorative HTML hidden.*
- **Truncation:**
  - Long, non-ASCII and email-as-name clients, and long projects, truncate to one line with a `title` holding the full text, so one row can't grow the table. The full text stays in the DOM for screen readers.
  - Project text is muted so the client column leads.
  - *interface-polish › Text overflow.*
- **Status colour:** Paid = success and Overdue = danger, the same as the round-1 mapping. Draft is a muted outline. The text label always stays. *surface-colour › Status, colour never alone.*
- **Sorting:**
  - Behaviour change: a new column now sorts ascending, the same column toggles to descending, and a third click returns to the original order. Before, Hours, Amount and Due started descending.
  - The active column shows a solid arrow and full-contrast label. Inactive columns show a faint ↕ only on hover or focus. `aria-sort` is kept.
  - *system-patterns › Tables "Clicking a different column sorts by it in ascending order", "visible indicator on the active column".*
- **Sort focus bug fixed:** `SortHead` was a component declared inside render, so every sort remounted the header button and keyboard focus fell to `<body>`. It is now a render function (oxlint's static-components warning). *surface-details › focus return.*
- **Search:**
  - It sits in a `<form role="search">` with `type="search"`, a real `<label>` and the icon `pointer-events-none`/`aria-hidden`.
  - An × "Clear search" button with a hit area appears while there is text, and Escape clears the query first.
  - `autocomplete="off"` and `enterkeyhint="search"`.
  - *system-patterns › Search "visible x… Escape clears the input first"; surface-details › Inputs live inside a form, Input decorations.*
- **Result count + clear-all above the table:**
  - The line reads "3 of 14 entries" and is polite-live, with a "Clear filters" button when filters are active.
  - It has a fixed height so it never shifts the table.
  - *system-patterns › Filtering "Show the result count", "A clear all option".*
- **Empty state:**
  - It now covers what, why and what next: "Nothing matches “zzzz”. Check the spelling or clear the filters to see all 14 entries."
  - There is a separate sentence for a status-only miss, and long queries `break-all`.
  - It sits on a muted tint, matching round 1's borderless approach, instead of a dashed border.
  - *surface-copy › Empty States; system-patterns › Search "suggestions… rather than a blank area".*
- **Totals:**
  - The totals row moved into a real `<tfoot>`.
  - It is labelled with what it sums: "Total · all 14 entries" or "Total · 3 matching entries". The sum covers every matching row, not only the visible page, and the old "14 entries" label didn't say so.
  - *surface-copy › honest feedback.*
- **Pagination:**
  - It shows "7–12 of 14 · Page 2 of 3" in tabular figures, inside `<nav aria-label="Ledger pages">`.
  - Reaching the first or last page disables the button that was pressed, so focus moves to the other button instead of falling to `<body>`.
  - *system-patterns › Pagination "current page indicator, total count"; surface-details › focus return.*
- **Layout stability:**
  - Rows are a fixed 40px, and the table area has `min-h-80` (header + 6 rows + total), so the last page (2 rows) and the empty state don't pull the pagination out from under the pointer.
  - The empty state fills the same height.
  - *surface-details › Layout shift.*
- **Responsive:**
  - The ID column is sticky (`left-0`, opaque card background, with a colour-mixed hover tint so it matches the row hover) for when the table scrolls sideways.
  - *system-patterns › Tables Responsive "horizontal scroll with sticky first column".*

### New client (`src/sections/ClientWizard.tsx`)
- **Real form:** `<form noValidate>`, so Enter advances a step. `required` is set on required fields, and the designed inline errors are kept, as in round 1's PageHeader. *surface-details › Inputs live inside a form, Use required.*
- **Validation timing:** unchanged (on blur, then live once touched, so errors clear as soon as the input is fixed). It now matches the suite's "onTouched" learning. If the replay hook calls Next on an invalid step, every field on that step is marked touched and focus goes to the first invalid one. *system-patterns › Validation timing, Error display.*
- **Error display:**
  - Each field has an always-mounted message slot. Its `min-h` stops errors from pushing the layout, and it is polite-live, so an error that appears on blur is announced after focus has moved.
  - The slot is linked by `aria-describedby`, and each error has a `CircleAlert` icon next to its text.
  - Helper text sits in the same slot when there's no error: "Where invoices and receipts are sent." and "Per hour, before tax."
  - *system-patterns › Error display "error icon"; surface-copy › Helper Text.*
- **Error copy:**
  - Email errors now name the actual problem. A value without "@" gets "Add an @ and a domain, like billing@studio.com.", which is the wording of round 1's Settings field. A value without a domain gets "Add a full domain after the @, like studio.com.", and a value with spaces gets "Remove the spaces from the email."
  - Rate: non-numbers used to get the misleading "must be more than 0" and now get "Enter the rate as a number, like 140." The other messages are "Enter a rate above 0." and "That’s over 2,000 an hour. Check for an extra zero."
  - *surface-copy › Errors "Be specific when the system knows the cause".*
- **Disabled Next explains itself:** inline text "Add the client’s name and a valid billing email to continue." sits next to the button and is linked with `aria-describedby`. The button stays disabled, as the brief requires. *surface-details › "Disabled buttons have inline explanation, not tooltip".*
- **Step indicator:**
  - `<nav aria-label="Progress">` with numbered markers, connector hairlines and names.
  - Completed steps show a check on a success surface, plus sr-only "(done)". The current step uses inverted foreground and `aria-current="step"`.
  - An sr-only line reads "Step 2 of 3: Billing".
  - Each step's fields are a `fieldset` with a legend.
  - *system-patterns › Multi-step forms "Show progress"; surface-colour › colour never alone.*
- **Focus between steps:**
  - Changing steps unmounts the focused control (for example Back on step 1), so focus moves to the new step's first field, the Review heading or the success heading. It uses `preventScroll` so the lab's replay doesn't scroll the page.
  - "Add another client" returns focus to Client name.
  - *surface-details › focus return.*
- **Autocomplete off** on client name, contact and email. These describe someone else, which is the exact exception the suite allows ("a field labelled email that asks for someone else's email"). *surface-details › Forms.*
- **Rate field:**
  - The currency code is shown inside the input, `aria-hidden` and `pointer-events-none`, and it follows the currency picker.
  - The field is `tabular-nums`. Notes keep spellcheck on because they're prose.
  - *surface-details › Input decorations.*
- **Review step:**
  - It has a focusable heading, "Check the details before adding this client".
  - The rate is formatted in the chosen currency ("$140.00 per hour (USD)").
  - Empty optional fields read "Not added" instead of a dash.
  - Long names and emails wrap (`break-words`/`break-all` with a `minmax(0,1fr)` column), and notes keep their line breaks.
  - *system-patterns › "final step shows a summary"; surface-copy.*
- **Success inline, toast removed:**
  - The success panel (check on a success surface, `role="status"`, `animate-enter`) already confirmed the outcome, so the extra `toast.success` was dropped. This is the same call as Settings in round 1.
  - *system-patterns › "Important outcomes are inline", "Never only a toast"; surface-details › Feedback near its trigger.*
- **Discard dialog body:**
  - It names the object and the consequence: "The details you’ve entered for Juniper & Vale Ceramics haven’t been saved. Discarding clears the form and can’t be undone."
  - The labels "Keep editing" and "Discard" are kept. Radix focuses "Keep editing" first and returns focus to Cancel when the dialog closes.
  - *surface-copy › Confirmation Dialogues.*
- **"(optional)"** is set in muted weight inside the label.
- **The form is capped at `max-w-2xl`** inside the card. *system-patterns › Layout "Forms: 480–640px".*

### Round-2 fix: reduced motion in Tasks (`src/sections/Tasks.tsx`, `src/sections/SyncStates.tsx`)
- The round-2 reviewer was right: `MotionConfig reducedMotion="user"` did **not** stop the task rows sliding on reorder under `prefers-reduced-motion`. The round-2 note claiming it did was wrong. `layout` animations (and `popLayout` positioning) still ran.
- Tasks now reads `useReducedMotion()` and, when it is set:
  - turns `layout` off;
  - skips the initial y-offset;
  - uses `{ duration: 0 }` for enter, exit and layout;
  - switches AnimatePresence to `mode="sync"`.
- State changes happen instantly, but rows still appear and disappear. This is surface-motion's recipe ("reduce them to instant state changes"). The offline banner in SyncStates also collapses its height animation to instant.
- MotionConfig stays as a belt-and-braces default for any other Motion use.
- *surface-motion › Reduced Motion.*

### Not done, and why
- **Page-size control (10/25/50):** system-patterns lists it, but with 14 rows it would be a feature addition. Same for URL-synced filters, sort and page: there is no router (same call as round 2).
- **Removable filter chips:** the query and status are already visible in their own controls. The result line plus "Clear filters" covers clear-all, and chips would duplicate the controls in a two-filter toolbar.
- **Wrapping or line-clamping long client names:** truncation with `title` keeps the dense table at one line per row. interface-polish reserves line-clamp for cards and descriptions.
- **Colouring credits green or overdue dates red:** the status badge already carries that meaning, and more colour in a dense table would be noise.
- **Edit links per section on Review:** Back already preserves data, and per-row jump links would add navigation paths.
- **Loading state on "Add client":** nothing is async, and a fake delay would be dishonest.
- **The wizard is a card, not a page:** system-patterns prefers a page/route for flows over 2–3 steps, but this is a page section and the brief keeps the structure.
- **Visual check:** as in rounds 1 and 2, verification was `npm run build` (passes), oxlint (0 errors, 1 pre-existing warning outside these files) and a diff confirming every `data-lab` hook in Ledger and ClientWizard matches the baseline. No screenshots.
