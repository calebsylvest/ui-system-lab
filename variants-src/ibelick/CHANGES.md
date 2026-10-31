# Changes: ui-skills (ibelick)

This variant applies [ibelick/ui-skills](https://github.com/ibelick/ui-skills) to the Fieldwork baseline, in this order: `baseline-ui` (the deslop pass), then `fixing-accessibility`, then `fixing-motion-performance`. I skimmed `ui-skills-root` (a router that picks skills through a CLI) and borrowed the audit method from `improve-ui` (contradiction check and proof gate). Content, data, sections and features are the same as the baseline, with two exceptions: the one copy fix below, and a confirmation step added in front of the existing Delete actions. No npm dependencies were added. `AlertDialog` comes from the `radix-ui` package the project already has.

## Changes

### baseline-ui
| Change | File(s) | Rule |
| --- | --- | --- |
| Added `text-balance` to headings: h1, CardTitle, DialogTitle, AlertDialogTitle, AccordionTrigger | PageHeader.tsx, ui/card.tsx, ui/dialog.tsx, ui/alert-dialog.tsx, ui/accordion.tsx | Typography: "MUST use `text-balance` for headings" |
| Added `text-pretty` to body copy: CardDescription, DialogDescription, page subtitle, chat bubbles, activity lines, empty-state copy, switch descriptions, accordion answers | ui/card.tsx, ui/dialog.tsx, ui/accordion.tsx, sections/* | Typography: "`text-pretty` for body/paragraphs" |
| Added `tabular-nums` to all data: stat values and notes, invoice number/date/amount, due dates, progress %, star count, selection count, file sizes, rate input | Stats, Workspace, Controls, States, Settings, PageHeader | Typography: "MUST use `tabular-nums` for data" |
| Removed `tracking-widest` from DropdownMenuShortcut | ui/dropdown-menu.tsx | Typography: "NEVER modify letter-spacing" |
| Truncated project card titles, client names and file names | Workspace.tsx, States.tsx | Typography: "SHOULD use truncate or line-clamp for dense UI" |
| Destructive actions (project menu "Delete", Controls "Delete") now open an AlertDialog with Cancel and a destructive confirm. New `ui/alert-dialog.tsx` follows the same shadcn new-york pattern on Radix. The project menu is `modal={false}` so the menu and the dialog don't fight over focus and pointer-events | ui/alert-dialog.tsx (new), Workspace.tsx, Controls.tsx | Interaction: "MUST use an AlertDialog for destructive or irreversible actions"; Components: "use the project's existing primitives first / never mix primitive systems" |
| Toaster offsets use `env(safe-area-inset-*)`. Added `viewport-fit=cover` so `env()` resolves, and gave the sticky header `pt-[env(safe-area-inset-top)]` | ui/sonner.tsx, index.html (viewport meta only; bridge script untouched), TopNav.tsx | Interaction: "MUST respect safe-area-inset for fixed elements" |
| Conditional class strings go through `cn()` | TopNav.tsx, Controls.tsx | Stack: "MUST use cn utility for class logic" |
| Footer right-hand text set to "Variant: ui-skills (ibelick)" | App.tsx | Lab rule |

### improve-ui (audit method, then implemented)
| Change | File(s) | Rule |
| --- | --- | --- |
| Subtitle "6 active projects across 6 clients" changed to "6 projects across 6 clients, 4 in progress": the data has one Paused and one Done project | PageHeader.tsx | §3 "direct contradiction in user-facing presentation or content within the same task" |

### fixing-accessibility
| Change | File(s) | Rule |
| --- | --- | --- |
| Search input got `aria-label` and `type="search"` (it only had a placeholder) | TopNav.tsx | 1: "every input… must be labeled" |
| Assistant textarea got an sr-only `<Label>` | Assistant.tsx | 1: "every input… must be labeled" |
| Main nav got `aria-label="Main"`; the active link got `aria-current="page"` | TopNav.tsx | 4 semantics |
| Account avatar button got a visible `focus-visible` ring matching the other controls | TopNav.tsx | 2: "focus must be visible" |
| Card titles render as real `h2`s through a new optional `as` prop on CardTitle (default stays `div`), giving an h1 then h2 outline. Stat values use `as="p"` because they are numbers, not headings | ui/card.tsx, all sections | 4: "do not skip heading levels" (there were no headings below h1) |
| Activity feed and Recent files are now `ul`/`li` | Workspace.tsx, States.tsx | 4: "lists must use ul or ol with li" |
| Empty checkbox column header got sr-only "Select" | Workspace.tsx | 4: "tables must use th for headers" |
| New-project name field: `aria-required`, plus `aria-describedby` and `role="alert"` on the error | PageHeader.tsx | 5: errors linked via aria-describedby, required announced; 6: critical errors use aria-live |
| Billing email: `type="email"`, form `noValidate` (keeps the custom inline error), helper/error text linked with `aria-describedby` and `aria-live="polite"` | Settings.tsx | 5: "helper text must be associated with inputs" |
| Switch descriptions linked via `aria-describedby` | Settings.tsx | 5 |
| Save button `aria-busy` while saving | Settings.tsx | 6: "loading states should use aria-busy or status text" |
| Chat log: `role="log"`, `aria-live="polite"`, accessible name, keyboard-focusable scroll region; "Thinking…" is `role="status"`; sr-only "You:" and "Fieldwork:" speaker prefixes; bot avatars `aria-hidden` | Assistant.tsx | 6 announcements; 2 keyboard access; 1 decorative icons aria-hidden |
| Recent-files list has `aria-busy` during loading, plus sr-only "Loading file" per skeleton row | States.tsx | 6 |
| Invoice selection count is `role="status"` | Workspace.tsx | 6 |
| Every Progress bar has an `aria-label` that includes its value | Stats.tsx, Workspace.tsx | 1: accessible names |
| Decorative avatars and file thumbnails `aria-hidden` | Workspace.tsx, States.tsx | 1 |

### fixing-motion-performance (and baseline-ui Animation)
| Change | File(s) | Rule |
| --- | --- | --- |
| Accordion no longer animates `height` (`animate-accordion-up/down`). Opened content now fades in with `fade-in-0`; the chevron still rotates via transform | ui/accordion.tsx | baseline "NEVER animate layout properties"; motion §2 "prefer downgrading technique over removing motion" |
| `transition-all` replaced with explicit properties: Button gets color/bg/border/shadow, Switch track gets `transition-colors`, AccordionTrigger transition removed (it only toggles an underline) | ui/button.tsx, ui/switch.tsx, ui/accordion.tsx | motion §2 "default to transform and opacity"; baseline "animate only compositor props" |
| Progress indicator: `transition-all` became `transition-transform duration-200 ease-out` (it moves with translateX) | ui/progress.tsx | baseline "ease-out on entrance", "≤200ms"; motion §2 |
| `motion-reduce:` opt-outs on Skeleton pulse, the Save spinner, the Progress transition, the accordion fade and the chevron rotation | ui/skeleton.tsx, Settings.tsx, ui/progress.tsx, ui/accordion.tsx | baseline "SHOULD respect prefers-reduced-motion"; a11y §8 |

## Found but not implemented
- **Pause looping animations off-screen** (baseline MUST): the Skeleton `animate-pulse` is an opacity-only CSS loop during a transient loading state. An IntersectionObserver hook would be a lot of JS for a demo skeleton, and the reduced-motion opt-out covers the user-facing concern.
- **"Limit accent color to one per view" and "use theme tokens"**: the liked Heart uses `text-red-500`. Remapping it to `--destructive` would give a "like" a danger meaning, so I left it.
- **Arbitrary values** (`rounded-[4px]`, `h-[1.15rem]`, `max-w-[80%]`): these already existed in the baseline, and baseline-ui allows custom values that already exist.
- **z-index scale**: the page already uses Tailwind's defaults (`z-40`, `z-50`), so no change was needed.
- **motion/react, Base UI**: neither was required. Nothing needs JS animation, and the project's primitive system is Radix ("use existing primitives first; never mix systems").
- **Disabled submit must explain why** (Assistant send and suggestion chips): they are disabled only while empty or while "Thinking…", and the `role="status"` thinking line now announces that. No extra copy was added.
- **Like button label toggles Like/Liked alongside `aria-pressed`**: the redundancy is minor, and the skill has no rule on it. Left as is to keep content identical.
- **Top nav links as `ul`/`li`**: a flat link row inside a labelled `<nav>` is acceptable, so I skipped it.
- **improve-ui findings for hierarchy, density and prominence** need rendered evidence under its own rules, which this pass didn't have, so I reported none.
- **ui-skills CLI**: not used. I read the skills straight from the clone.

## Agent notes
ui-skills is a set of terse, checklist-style constraints that are easy to apply mechanically and easy to verify in a diff: `text-balance`/`text-pretty`, `tabular-nums`, no `tracking-*`, no `transition-all`, AlertDialog for destructive actions, safe-area insets. It is good at removing small tells and at catching motion and a11y slips in shadcn defaults (the accordion height animation, `transition-all` everywhere, unlabeled inputs). It gave almost no visual direction. It says nothing about color, spacing rhythm, type scale or hierarchy beyond "use Tailwind defaults", so the page looks nearly the same and is mostly better underneath. Some rules are absolute ("NEVER animate layout properties", "MUST pause loops off-screen") but give no guidance on proportionate fixes, and improve-ui is deliberately the opposite: so evidence-strict that, without rendered evidence, it surfaces almost nothing. Overall it is highly opinionated about implementation hygiene and close to neutral on aesthetics.

## Round 2

Same skill order as round 1 (`baseline-ui`, then `fixing-accessibility`, then `fixing-motion-performance`, with improve-ui's contradiction check). Round-1 conventions reused: CardTitle `as="h2"`, `text-balance`/`text-pretty`, `tabular-nums` on data, no `tracking-*`, `cn()` for conditional classes, decorative avatars `aria-hidden`, `motion-reduce:` opt-outs, `aria-busy` with sr-only "Loading…" rows, lists as `ul`/`li`. No new dependencies. All `data-lab` hooks and the required accessible names are kept ("Filter…" and "Command menu" names now carry extra context after the original words).

### baseline-ui
| Change | File(s) | Rule |
| --- | --- | --- |
| `text-balance` on SheetTitle and the filter legend; `text-pretty` on SheetDescription, CommandEmpty, empty-state, offline banner, error copy, entry lines and the assignment summary | ui/sheet.tsx, ui/command.tsx, Tasks, QuickActions, SyncStates | Typography: `text-balance` headings, `text-pretty` body |
| `tabular-nums` on open-task count, due dates, filter count, sheet meta line ("due Nov 14 · 64%"), budget input, hourly rate, queued count, entry times | Tasks, QuickActions, SyncStates | Typography: "MUST use `tabular-nums` for data" |
| Removed `tracking-widest` from CommandShortcut (same fix as DropdownMenuShortcut in round 1) | ui/command.tsx | Typography: "NEVER modify letter-spacing" |
| Task titles, the picker trigger name and picker items `truncate` (task rows got `min-w-0`/`shrink-0` so the controls never wrap; full title in `title`) | Tasks, QuickActions | Typography: "SHOULD use truncate… for dense UI" |
| Task title done-state class goes through `cn()` instead of string concatenation | Tasks | Stack: "MUST use cn utility for class logic" |
| Sheet panel and its close button respect `env(safe-area-inset-*)` on the edge they're pinned to | ui/sheet.tsx | Interaction: "MUST respect safe-area-inset for fixed elements" |
| Sheet animation 500ms open / 300ms close with `ease-in-out` became `duration-200`, `ease-out` on enter, `ease-in` on exit; the inert `transition` class was dropped | ui/sheet.tsx | Animation: "NEVER exceed 200ms for interaction feedback", "SHOULD use ease-out on entrance" |
| Pluralization: "1 open tasks" → "1 open task"; Apply toast "Showing 1 statuses" → "Showing 1 status" | Tasks, QuickActions | improve-ui §3 contradiction in user-facing content (honest copy) |

### fixing-accessibility
| Change | File(s) | Rule |
| --- | --- | --- |
| Card titles are `h2` (This week, Sync, Quick actions) | Tasks, SyncStates, QuickActions | 4: "do not skip heading levels" |
| Move buttons named per row ("Move “X” up/down"), matching the existing per-row Remove/Mark-done names | Tasks | 1: accessible names (otherwise a dozen identical "Move up" buttons) |
| After Move up/down or Remove, focus returns to the same control (or the opposite arrow at the list edge, or the next row's Remove, or the new-task field when the list empties) instead of dropping to `<body>` | Tasks | 2/3: keyboard access, restore focus |
| sr-only `role="status"` announces Added / Removed (with "Undo is available in the notification") / Restored / Moved | Tasks | 6: "toasts must not be the only way to convey critical information" |
| Due date gets an sr-only "Due" prefix; avatar initials are `aria-hidden` with sr-only "Assigned to XX" | Tasks | 1: decorative visuals hidden, meaning kept as text |
| Filter checkboxes grouped in a `fieldset`/`legend` with the helper text linked via `aria-describedby`; checkbox ids no longer contain spaces | QuickActions | 4: prefer native semantics; 5: helper text associated |
| Filter trigger reads "Filter (2 selected)" to screen readers instead of a bare "Filter 2" | QuickActions | 1: meaningful names |
| People-picker combobox labelled "Assignee: Maya Reyes" (visible name kept inside the label); picker search and ⌘K search inputs got `aria-label`; selected person announced "(current assignee)" with the check icon hidden | QuickActions | 1: every input/control labeled; 7: state not by visuals alone |
| ⌘K hint is a `kbd` hidden from AT; the button exposes `aria-keyshortcuts="Meta+K Control+K"`; the dialog title is now "Command menu" to match its trigger | QuickActions | 1 / 6 |
| CommandDialog's sr-only title/description moved inside `DialogContent` so they label the dialog and aren't left in the page while it's closed | ui/command.tsx | 3: focus and dialogs (labelled modal) |
| Raise button `aria-busy` while saving and `aria-describedby` → the inline error when a save fails | SyncStates | 6: loading via aria-busy; 5: errors linked |
| Time entries are a `ul` labelled by "Time entries"; skeleton state is `aria-busy` with sr-only "Loading entry" per row; load failure is `role="alert"` | SyncStates | 4: lists; 6: loading states, critical errors via live region |
| Decorative icons (WifiOff, AlertCircle, RefreshCw, Search, sheet X) explicitly `aria-hidden` | SyncStates, ui/command.tsx, ui/sheet.tsx | 1: decorative icons aria-hidden |

### fixing-motion-performance (and baseline-ui Animation)
| Change | File(s) | Rule |
| --- | --- | --- |
| Sheet keeps its transform slide (compositor-only) but at 200ms; overlay and panel get `motion-reduce:animate-none` | ui/sheet.tsx | motion §2 "prefer downgrading technique over removing motion"; baseline reduced motion |
| Popover zoom/slide/fade (transform + opacity, tw-animate default 150ms) kept; `motion-reduce:animate-none` added | ui/popover.tsx | §2 default to transform/opacity; a11y §8 |
| Saving spinner `motion-reduce:animate-none` (same as round-1 Settings spinner) | SyncStates | baseline "SHOULD respect prefers-reduced-motion" |

### Found but not implemented
- **Enter/exit/reorder motion on task rows**: baseline-ui says "NEVER add animation unless it is explicitly requested". The section has none, so I added none. If it were requested, the rules point to a FLIP transform/opacity transition (motion §3), not height animation.
- **AlertDialog for task Remove**: removal is reversible through Undo, so the "destructive or irreversible" rule doesn't apply; the sr-only status covers the toast-only concern.
- **"Applies to the project grid."** The filter doesn't actually filter the grid. It's a lab stub shared by every variant, and wiring it up would change behavior outside the new sections, so I left the copy.
- **Moving rows while sorted** swaps them in the unsorted order and turns sorting off. That's baseline behavior, so I kept it.
- **Sort toggle's label changes with `aria-pressed`** (same as round 1's Like/Liked): left it to keep content identical.
- **Dialog's close button `focus:` ring vs Button's `focus-visible:`**: kept stock so it matches round-1's untouched Dialog close.
- **The `useEffect` ⌘K listener** is a real subscription, not derivable render state, so the "no useEffect for render logic" rule doesn't apply.
- **CommandShortcut "⌘N"** is a stock hint with no handler. The skill has no rule on it.

## Round 3

Same order as rounds 1 and 2: `baseline-ui`, then `fixing-accessibility`, then `fixing-motion-performance`, with improve-ui's contradiction check. I reused the earlier conventions: CardTitle `as="h2"`, `text-balance`/`text-pretty`, `tabular-nums` on data, `cn()` for conditional classes, decorative icons `aria-hidden`, `motion-reduce:animate-none`, sr-only `role="status"` announcements, and rAF focus restoration (the same approach as Tasks in round 2). No new dependencies. I only edited `Ledger.tsx` and `ClientWizard.tsx`. All `data-lab` hooks and hidden spans are unchanged.

### baseline-ui
| Change | File | Rule |
| --- | --- | --- |
| `tabular-nums` on invoice IDs, hours, amounts, due dates, the total, "Page X of Y", step numbers, the rate input and the review rate | Ledger, ClientWizard | Typography: "MUST use `tabular-nums` for data" |
| Hours use a fixed two decimals with thousands separators (`9,512.00`, `62.50`), so the right-aligned column lines up the way the currency column does. The data is unchanged; only the display changed | Ledger | Typography: tabular data (alignment is what `tabular-nums` is for) |
| Hours and Amount sort buttons are right-aligned with their numbers (`text-right` th, `-mr-3`). Before, the header was left-aligned over a right-aligned column | Ledger | Deslop "fix… hierarchy… small layout issues" |
| Long names and projects still `truncate` with `title`. On the review and success screens, user-entered text gets `break-words` (and `whitespace-pre-line` for notes); the dl's value column is `minmax(0,1fr)` so a long unbroken name can't push the grid wider | Ledger, ClientWizard | Typography: "SHOULD use truncate… for dense UI" |
| `text-balance` on the empty-state title and the success line; `text-pretty` on the empty-state copy, errors, the Next hint, notes and success copy | Ledger, ClientWizard | Typography |
| The discard-changes confirm is now an `AlertDialog` (round-1 `ui/alert-dialog.tsx`) with Cancel ("Keep editing") as the safe default focus, replacing a plain `Dialog` | ClientWizard | Interaction: "MUST use an AlertDialog for destructive or irreversible actions" |
| Empty-state copy no longer reads `Nothing matches “”` when only the status filter is set: it says "No invoices have the status X." instead. Its one action stays "Clear filters" | Ledger | Design: "MUST give empty states one clear next action"; improve-ui §3 contradiction in user-facing copy |
| Conditional classes (sort icon opacity, header alignment, step state) go through `cn()` | Ledger, ClientWizard | Stack: "MUST use cn utility" |

### fixing-accessibility
| Change | File | Rule |
| --- | --- | --- |
| **Sort headers were a component declared inside render**, so every click remounted the button and dropped keyboard focus to `<body>`. They're now a render helper, so focus stays on the sort button. `aria-sort` is unchanged | Ledger | 2/3: keyboard access, focus |
| Paging to the first or last page disables the button just pressed, so focus moves to Previous/Next. "Clear filters" unmounts the empty state, so focus moves to the search field | Ledger | 3: restore focus |
| sr-only `role="status"` announces "N entries, page X of Y" or "No invoices match" when search, filter, sort or page changes | Ledger | 6: announcements / status text |
| sr-only `<caption>` names the table and its current sort and page; pagination is `<nav aria-label="Ledger pages">` | Ledger | 4: semantics |
| The totals row is in a `<tfoot>`, and its label is a `th scope="row"` reading "Total for N entries" (was "N entries"). It's the total of every filtered row, not just the visible page, and the old label didn't say so | Ledger | 4: tables use th; improve-ui §3 (the total next to a 6-row page looked like a page sum) |
| Missing values (project, hours, due) still show "—", but it's `aria-hidden` with sr-only "No project" / "No hours" / "No due date". Empty review values read "Not provided" | Ledger, ClientWizard | 1: meaningful names; decorative visuals hidden |
| Search is `type="search"`; search, sort-arrow, chevron and check icons are `aria-hidden` | Ledger, ClientWizard | 1: decorative icons aria-hidden; 4 native semantics |
| Name, email and rate are `aria-required`; their errors have ids linked through `aria-describedby` and are `role="alert"` (the same pattern as round-1 New project) | ClientWizard | 5: errors linked, required announced; 6: critical errors via live region |
| **Disabled Next now explains why**: "To continue, enter a client name and a billing email." lists only what's still missing on this step, says "a valid…" once the field has content, and is linked to Next via `aria-describedby` | ClientWizard | 5: "disabled submit actions must explain why"; 7: disabled not by opacity alone |
| Step list labelled "Steps"; past steps get sr-only "(done)"; sr-only `role="status"` announces "Step 2 of 3: Billing" on each change | ClientWizard | 4/6 |
| Focus: Back from step 2 to step 1 removes the Back button, so focus moves to Next. Finishing moves focus to the success line (`tabIndex=-1`). "Add another client" moves it to the name field. The success panel repeats the toast's message, so the toast isn't the only feedback | ClientWizard | 3: restore focus; 6: "toasts must not be the only way…" |

### fixing-motion-performance
| Change | File | Rule |
| --- | --- | --- |
| `motion-reduce:animate-none` on the status/currency/terms `SelectContent` and on the discard `AlertDialogContent` (zoom + fade). I added it at the call sites so the shared primitives used by rounds 1 and 2 stay untouched | Ledger, ClientWizard | baseline "SHOULD respect prefers-reduced-motion"; a11y §8 |
| No new animation: no row/sort/page transitions, no step slide | — | baseline "NEVER add animation unless explicitly requested" |

### Found but not implemented
- **Next stays natively `disabled`** (not focusable), as the brief specifies. The hint is visible text in reading order, so screen-reader users reach it without focusing the button.
- **Truncated client/project names show in full only via `title`** (hover-only). Screen readers get the full text, but keyboard-only sighted users don't. A focusable Tooltip on every cell would add a tab stop per row, so I skipped it.
- **The table's horizontal scroll container isn't focusable**: at narrow widths, tabbing to the sort and pagination buttons scrolls it, and making it focusable would mean changing the shared `ui/table.tsx`.
- **Negative and zero amounts** show as `-$450.00` / `$0.00` (Intl defaults). The Credit badge already says what the negative is, and the skill has no rule on sign or accounting format.
- **Rate on the review step** stays `140 USD / hour` (raw input plus code) instead of Intl currency, to keep the baseline's copy. The skill has no formatting rule beyond `tabular-nums`.
- **`autoComplete` attributes and inline validation timing (blur)**: no rule in these skills calls for changing them.
- **AlertDialog overlay fade** has no reduced-motion opt-out because the overlay is rendered inside the shared primitive. Opacity-only fades are the "downgraded" form the motion skill prefers anyway.
