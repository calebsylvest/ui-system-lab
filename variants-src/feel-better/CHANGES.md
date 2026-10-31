# Fieldwork: "make-interfaces-feel-better" variant

This variant applies Jakub Krehel's *make-interfaces-feel-better* skill (SKILL.md plus typography, surfaces, animations, icons and performance references) to the untouched shadcn/ui baseline. It did a full review of every component and section, then made only the changes the skill's rules call for. The content, data, copy, sections and interactions are the same as the baseline. All changes use Tailwind classes and the existing components. **No new dependencies were added.** There is no motion library in `package.json`, so the skill's CSS-only patterns (cross-fade, CSS stagger) are used.

## Changes

### Typography
| Change | File(s) | Principle |
| --- | --- | --- |
| `-webkit-font-smoothing: antialiased` / `-moz-osx-font-smoothing: grayscale` applied once on `html` | `src/index.css` | 8. Font smoothing |
| `text-wrap: balance` on `h1–h3`; `text-wrap: pretty` on `p, li, figcaption, blockquote` (base layer) | `src/index.css` | 10. Text wrapping |
| `text-balance` on `CardTitle` and `text-pretty` on `CardDescription`, because those are `div`s that the base rule doesn't reach. The accordion questions inherit balance from Radix's `h3` header | `card.tsx` | 10. Text wrapping |
| `text-pretty` on chat bubbles and accordion answers | `Assistant.tsx`, `accordion.tsx` | 10. Text wrapping |
| `tabular-nums` on stat values, the project `%`, the invoice Issued and Amount columns, the "N selected" counter, the Star counter, and the hourly-rate number input | `Stats.tsx`, `Workspace.tsx`, `Controls.tsx`, `Settings.tsx` | 9. Tabular numbers (dashboards, table columns, counters) |

### Surfaces
| Change | File(s) | Principle |
| --- | --- | --- |
| Added the skill's exact shadow-as-border tokens (`--surface-shadow`, `--surface-shadow-hover`). Light mode uses three layers and dark mode uses a single white ring. They are exposed as the `shadow-border` / `shadow-border-hover` utilities | `src/index.css` | 3. Shadows for elevation, borders for structure |
| Card: `border shadow-sm` changed to `shadow-border` | `card.tsx` | 3 |
| Outline button: `border shadow-xs` (and `dark:border-input`) changed to `shadow-border`, plus `hover:shadow-border-hover` | `button.tsx` | 3 (bordered buttons, hover lift) |
| Bold/Italic/Underline group container: `border` changed to `shadow-border` | `Controls.tsx` | 3 |
| Dropdown, Select, Dialog: solid `border` changed to a transparent 1px ring (`ring-black/6`, `dark:ring-white/8`, which match the token ring values). Their existing `shadow-md`/`shadow-lg` elevation stays | `dropdown-menu.tsx`, `select.tsx`, `dialog.tsx` | 3 (elevated elements) |
| Toasts: `--normal-border` set to transparent. The 1px ring now comes from a `--toast-shadow` box-shadow, with a light and a dark variant | `sonner.tsx`, `src/index.css` | 3 |
| Concentric radius in TabsList (`rounded-lg`, 10px, with `p-[3px]`): triggers changed to `rounded-[calc(var(--radius)-3px)]` (7px) | `tabs.tsx` | 1. Concentric radius |
| Concentric radius in Dropdown/Select popovers (`p-1`, rounded-sm items, 6px): container changed from `rounded-md` to `rounded-lg` (6 + 4 = 10px) | `dropdown-menu.tsx`, `select.tsx` | 1 |
| Concentric radius in the format toggle group (`rounded-md`, 8px, with `p-0.5`): inner buttons changed to `rounded-sm` (6px) | `Controls.tsx` | 1 |
| Concentric radius in the assistant composer: Mic and Send sit 8px inside the textarea, so the buttons are now `rounded-sm` (6px) and the textarea is `rounded-xl` (6 + 8 = 14px) | `Assistant.tsx` | 1 |
| Optical alignment: icon-side padding = text-side padding − 2px for each size (default 16→14, sm 12→10, lg 24→22), via `has-[>svg:first-child]` and `has-[>svg:last-child:not(:first-child)]`. This replaces shadcn's symmetric `has-[>svg]:px-*` | `button.tsx` | 2. Optical alignment |
| Hit areas: a `::after` pseudo-element extends every Button to at least 40×40 (dense desktop), centered | `button.tsx` | 16. Minimum hit area |
| Hit areas (collision rule): the format toggles touch each other, so they extend vertically only (`after:min-w-0`). Mic and Send are 4px apart, so their width is capped at 36px (`after:min-w-9`) so the areas don't overlap | `Controls.tsx`, `Assistant.tsx` | 16 (never overlap) |
| Hit areas: avatar menu trigger, Switch and Dialog close (×) get 40×40. Tabs triggers and nav links get 40px height (nav links also get ±8px horizontally, within their 16px gaps) | `TopNav.tsx`, `switch.tsx`, `dialog.tsx`, `tabs.tsx` | 16 |
| Hit areas: Checkbox gets 36×36, not 40. Invoice table rows are about 37px tall, so 40px would overlap the next row's checkbox | `checkbox.tsx` | 16 (collision rule wins) |

### Animations
| Change | File(s) | Principle |
| --- | --- | --- |
| Scale on press: `active:not-disabled:scale-[0.96]` on every Button (behind `motion-safe:`), with a `static` prop to opt out. `static` is used on the text-only Link button. The avatar menu trigger also gets scale 0.96 | `button.tsx`, `Controls.tsx`, `TopNav.tsx` | 12. Scale on press |
| Accordion open/close changed from `accordion-down/up` keyframes to an interruptible CSS transition on `grid-template-rows` (0fr↔1fr, 200ms ease-out). Uses `forceMount` plus `invisible` when closed so hidden answers leave the tab order and the accessibility tree. `motion-reduce:transition-none` | `accordion.tsx` | 4. Interruptible animations |
| Like ↔ Liked: the outline Heart and the filled Heart are both kept in the DOM and cross-fade with the exact values (scale 0.25↔1, opacity 0↔1, blur 4px↔0, 300ms `cubic-bezier(0.2,0,0,1)`). The label and color change still give a static cue | `Controls.tsx` | 7. Contextual icon animations; 18. Outline default, fill active; 19. Motion is never the only cue |
| Page header split into title, description and actions, with a 100ms stagger (opacity, 12px translateY, 4px blur, 400ms ease-out). It runs once on load and is skipped under reduced motion | `PageHeader.tsx`, `src/index.css` | 5. Split and stagger enter |
| Recent files: the loaded rows stagger in at 100ms steps when loading finishes (a loading/success-state entrance) | `States.tsx` | 5 |
| Dialog enter: opacity, a 12px rise and a 4px blur over 300ms, ease-out. Dialog exit is softer and shorter: opacity, a 12px lift and a 4px blur over 150ms, ease-out. This replaces zoom-95 at 200ms both ways. The overlay uses the same 300/150 timing | `dialog.tsx` | 6. Subtle exit animations (exit shorter than enter, ease-out both) |
| Tooltip, Dropdown, Select: zoom and slide removed, so they are opacity-only (150ms in, 100ms out, ease-out). They open on every hover or click | `tooltip.tsx`, `dropdown-menu.tsx`, `select.tsx` | 19. Motion restraint (high-frequency gets ≤150ms opacity) |
| `ease-out` and 150ms set explicitly on the Switch thumb and the accordion chevron | `switch.tsx`, `accordion.tsx` | 6 (ease-out) |

### Icons
| Change | File(s) | Principle |
| --- | --- | --- |
| Dropdown item icons get `stroke-[1.5]`, because they sit beside regular (400) text. The whole menu surface uses one weight | `dropdown-menu.tsx` | 17. Match icon stroke to text weight |
| Select chevron and check, and the header search icon, use `strokeWidth={1.5}` (beside regular text and placeholder) | `select.tsx`, `TopNav.tsx` | 17 |
| Button icons stay at lucide's 2px, which matches the buttons' font-medium (500) label | (no change) | 17 |

### Performance
| Change | File(s) | Principle |
| --- | --- | --- |
| `transition-all` removed everywhere. Replacements: Button uses `transition-[color,background-color,box-shadow,scale]`, Switch `[background-color,box-shadow]`, the accordion trigger `[color,box-shadow]`, and Progress `transition-transform` | `button.tsx`, `switch.tsx`, `accordion.tsx`, `progress.tsx` | 14. Never `transition: all` |

## Deliberately left alone
| Item | Why |
| --- | --- |
| Borders on Input, Textarea, Select trigger, Checkbox, Switch | Form-control outlines are listed as "use borders (accessibility)" |
| Header `border-b`, footer `border-t`, accordion item and table row dividers, Separator | These are structural dividers, which the skill says to keep |
| Active Tabs trigger border (dark), the `border-2 border-background` cut-out on stacked avatars, outline Badge border | The first is a state border. The other two define the shape or separate overlapping items rather than fake depth |
| Card and Dialog radius relative to the inputs inside them | Their 24px padding is at the skill's "treat as separate surfaces" threshold, and the inputs don't touch the corners |
| Invoice table rows inside the `p-2` card (square row hover vs. 14px card) | `<tr>` backgrounds can't take a radius cleanly. Changing table structure is out of scope for a polish pass |
| Popovers still use keyframes, not transitions | Radix `Presence` only waits for `animationend` before unmounting. A transition would lose the exit entirely. They are now short opacity fades, so interruption is a non-issue |
| Checkbox tick, Save-button spinner, "Thinking…" row, new chat messages, invoice selection bar | These are high-frequency or conditionally mounted. Motion restraint calls for instant feedback, and the CSS cross-fade needs a two-state icon pair these don't have |
| Tab panel switching, table row hover (`transition-colors`, 150ms) | High-frequency. They are already instant or use a ≤150ms color change |
| Sonner's own toast enter/exit motion | Third-party animation. Only its border treatment was changed |
| `will-change` | The skill says add it only when first-frame stutter is observed. None was observed |
| Image outlines | The page has no `<img>` elements. Avatars are text fallbacks, and the file tiles are flat placeholders |
| Font family | The skill says not to change the project's typeface |
| `initial={false}` on `AnimatePresence` | No Motion library or `AnimatePresence` is used. The CSS cross-fade doesn't animate on first render anyway |
| RTL icon flipping | The page is LTR only (`lang="en"`, no `dir`) |
| Footer copy "Baseline: shadcn/ui defaults, no polish applied" and the `<title>` | Copy is kept identical for a fair comparison. `index.html` and `public/lab-bridge.js` are untouched |

## Round 2

Applied the same rules and tokens to the new sections (`Tasks`, `QuickActions`, `SyncStates`) and the new primitives (`popover`, `sheet`, `command`). **No new dependencies.** The CSS-only motion patterns from round 1 are reused, plus one new keyframe (`.enter-item`) for single-row entrances. All `data-lab` hooks and accessible names are unchanged.

### Typography
| Change | File(s) | Principle |
| --- | --- | --- |
| `tabular-nums` on the live counters and values: open-task count, Filter count, hourly rate (`$135`), queued-change count, Budget (hours) number input | `Tasks.tsx`, `QuickActions.tsx`, `SyncStates.tsx` | 9. Tabular numbers |
| `text-pretty` on the save-error message and offline banner text (`span`s the base rule doesn't reach) | `SyncStates.tsx` | 10. Text wrapping |

### Surfaces
| Change | File(s) | Principle |
| --- | --- | --- |
| Task rows: `border` changed to `shadow-border`. They are boxed surfaces, not dividers | `Tasks.tsx` | 3. Shadows for elevation |
| Task rows: concentric radius. The move/remove buttons go to `rounded-sm` (6px) and sit 8px from the row edge (`py-2`), so the row is `rounded-xl` (14px) | `Tasks.tsx` | 1. Concentric radius |
| Task row icon buttons touch each other, so they extend vertically only (`after:min-w-0`). The row is 44px tall, so the 40px height doesn't reach the next row | `Tasks.tsx` | 16. Hit area (collision rule) |
| Popover: solid `border` changed to `ring-1 ring-black/6 dark:ring-white/8`, the same as Dropdown/Select/Dialog. Padding is now `p-3` and the radius is 20px, because the `rounded-md` (8px) Clear/Apply buttons sit in its bottom corners (8 + 12 = 20) | `popover.tsx` | 3, 1 |
| People picker popover (`p-0`): `rounded-lg`. `Command` default changed from `rounded-md` to `rounded-lg`, because items are `rounded-sm` (6px) inside the group's 4px padding (6 + 4 = 10) | `QuickActions.tsx`, `command.tsx` | 1 |
| Command dialog: `rounded-xl`. Items (6px) sit 8px from the edge (group `px-2`), so 6 + 8 = 14 | `command.tsx` | 1 |
| Sheet: `border-l/r/t/b` changed to the same transparent ring as Dialog. It's an elevated surface, and `shadow-lg` stays | `sheet.tsx` | 3 (elevated elements) |
| Sheet close (×): 40×40 hit area via `::after`, the same as Dialog close | `sheet.tsx` | 16 |
| Offline banner: `rounded-md border` changed to `rounded-lg shadow-border` | `SyncStates.tsx` | 3 |

### Animations
| Change | File(s) | Principle |
| --- | --- | --- |
| A new or Undo-restored task row enters once: opacity, a 12px rise and a 4px blur over 300ms, ease-out (`.enter-item`). Only rows created after load get the class, and it's cleared on `animationend` so reordering never replays it | `Tasks.tsx`, `index.css` | 5/6 enter values; 13. No animation on page load |
| A removed task row exits subtly: opacity, a 12px lift and a 4px blur over 150ms, ease-out. It's removed from state after that, and immediately under `prefers-reduced-motion`. The leaving row is `aria-hidden`, can't be clicked, and isn't counted or targeted by the lab hooks. The toast + Undo still give the static cue | `Tasks.tsx` | 6. Subtle exits (exit shorter than enter); 19. Motion isn't the only cue |
| Completed task title gets `transition-[color] 150ms ease-out` (the checkbox and line-through stay instant) | `Tasks.tsx` | 19. High-frequency gets ≤150ms color |
| Offline banner: it used to mount and unmount. Now it's an interruptible `grid-template-rows` 0fr↔1fr + opacity transition (200ms ease-out, the accordion pattern), because a Switch drives it and can flip mid-animation. Collapsed, it's `invisible` + `aria-hidden` and cancels its grid gap with `-mb-5`. `motion-reduce:transition-none` | `SyncStates.tsx` | 4. Interruptible animations |
| Time entries: after a Reload succeeds, the three rows stagger in at 100ms steps (the round-1 `.stagger-item`). Not on first render. The "Couldn't load" error block and the "No tasks" empty state get the same single fade-in-up | `SyncStates.tsx`, `Tasks.tsx` | 5. Stagger for success/empty states |
| Popover: zoom and slide removed, so it's opacity-only 150ms in / 100ms out, ease-out, the same as Dropdown/Select | `popover.tsx` | 19. Motion restraint |
| Sheet: `ease-in-out` 500ms in / 300ms out changed to `ease-out` 300ms in / 200ms out (overlay too). The full off-screen slide stays, because a drawer is the skill's "full exit when spatial context matters" case. The stray `transition` (the default property list) was removed | `sheet.tsx` | 6. Ease-out both ways, exit shorter; 14 |

### Icons
| Change | File(s) | Principle |
| --- | --- | --- |
| `stroke-[1.5]` on Command items (regular text), and on the Command search icon, the save-error AlertCircle and the offline WifiOff, which all sit beside 400-weight text | `command.tsx`, `SyncStates.tsx` | 17. Match stroke to text weight |
| "Sort by due date" toggle: the pressed state now shows on the button itself (`aria-pressed:bg-accent` + hover ring), not only in the label | `Tasks.tsx` | 18. States via CSS on one asset; 19. Static cue |

### Accessibility fix
| Change | File(s) | Why |
| --- | --- | --- |
| `CommandDialog`'s sr-only `DialogTitle`/`Description` moved inside `DialogContent`. Before, it rendered outside the dialog, so the ⌘K dialog had no accessible name and Radix warned | `command.tsx` | Honest naming for assistive tech, which the brief allows |

### Deliberately left alone (round 2)
| Item | Why |
| --- | --- |
| Move up/down and Sort reordering: no FLIP/layout animation | High-frequency, repeatable action. Restraint calls for instant feedback. The row's new position is the static cue, and CSS can't do layout animation without a library |
| Popover/Sheet still use keyframes, not transitions | Same reason as round 1: Radix `Presence` only waits for `animationend`, so a transition would lose the exit |
| Save-button spinner, "Saving" label, save-error row and Retry | These are conditionally mounted, short-lived state feedback. They're consistent with round 1's Save spinner, and color, icon and text are the cues |
| Combobox check mark and cmdk selection highlight | The selected item gets instant highlighting during keyboard navigation (high-frequency). The check is seen only when reopening |
| Copy ("Saving", "Try again", "No results found.") | The skill has no copy rules, so it's kept identical for comparison |
| Card padding vs. inner rows/inputs | Card padding is 24px, the skill's "separate surfaces" threshold, the same as round 1 |
| `will-change` on the task enter/exit | No first-frame stutter was observed |

## Round 3

Applied the same rules and tokens to the new `Ledger` and `ClientWizard` sections. **No new dependencies**, and no new CSS. The round-1 `.stagger-item` keyframe is reused. Data, copy, behavior and every `data-lab` hook (visible and hidden) are unchanged.

### Typography
| Change | File(s) | Principle |
| --- | --- | --- |
| `tabular-nums` on every numeric table column: ID, Hours, Amount, Due, the totals-row amount, the "N entries" count, and "Page X of Y". Sorting, filtering and paging change these values in place, so the digits now stay aligned and nothing shifts | `Ledger.tsx` | 9. Tabular numbers (table columns, counters) |
| `tabular-nums` on the Hourly rate input and the Review step's Rate value, the same as the round-1/2 rate inputs | `ClientWizard.tsx` | 9 |
| `text-pretty` on the Review step's Notes `dd`, which can wrap and which the base `p, li` rule doesn't reach. The error messages, the empty-state text and the success text are `p`s, so they already get `pretty` from the base layer | `ClientWizard.tsx` | 10. Text wrapping |

### Surfaces
| Change | File(s) | Principle |
| --- | --- | --- |
| Sort header buttons are optically aligned to their column. Left-aligned headers (Client, Due) keep `-ml-3`, so the label lines up with the cell text. Right-aligned numeric headers (Hours, Amount) now use `-mr-2.5`, which cancels the button's 10px icon-side padding so the sort arrow's edge sits on the digits' right edge. Before, the baseline's `-ml-3` pushed those headers 12px right of the numbers | `Ledger.tsx` | 2. Optical alignment |
| Hit areas: sort buttons (32px tall) get the Button `::after` up to 40px, which fits the 40px header cell. Previous and Next are wider than 40px and sit 4px apart, so their hit areas only extend vertically and don't overlap | `Ledger.tsx` (inherited from `button.tsx`) | 16. Hit area (collision rule) |

### Animations
| Change | File(s) | Principle |
| --- | --- | --- |
| Success state: the check icon, the "is set up" message and "Add another client" stagger in at 100ms steps (opacity, 12px rise, 4px blur, 400ms ease-out). This is the skill's named success-state case. It only mounts after "Add client", so nothing animates on load, and it's skipped under reduced motion | `ClientWizard.tsx` | 5. Split and stagger (success state); 13 |
| "No invoices match" empty state gets the same single fade-in-up as the round-2 empty and error states. It mounts once when results first hit zero, not on every keystroke | `Ledger.tsx` | 5 (empty state) |

### Icons
| Change | File(s) | Principle |
| --- | --- | --- |
| Ledger search icon: `strokeWidth={1.5}` beside 400-weight placeholder text, the same as the header search | `Ledger.tsx` | 17. Match stroke to text weight |
| Sort arrows and pagination chevrons stay at 2px, because they sit beside the buttons' 500-weight labels. The inactive sort icon stays the same SVG dimmed with `opacity-40` | (no change) | 17; 18. One SVG, states via CSS |
| Decorative icons (search, sort arrows, success check) are `aria-hidden`. `aria-sort` and the text carry the meaning | `Ledger.tsx`, `ClientWizard.tsx` | 19. Motion and icons are never the only cue |

### Accessibility fix
| Change | File(s) | Why |
| --- | --- | --- |
| Each inline error has an `id` and is tied to its input with `aria-describedby` while it shows (name, email, rate). Before, `aria-invalid` flagged the field, but screen readers never read the message | `ClientWizard.tsx` | Honest feedback, the same kind of a11y fix as round 2's CommandDialog naming. The brief allows it |

### Deliberately left alone (round 3)
| Item | Why |
| --- | --- |
| Row reordering on sort, page changes, filter results: no animation | High-frequency, repeatable actions. Restraint calls for instant feedback. The arrow icon, `aria-sort` and the page label are the static cues |
| Wizard step changes (Details → Billing → Review): no transition | Each Next/Back is a routine interaction, and the step list's `aria-current` and font weight are the static cue. Animating each step would charge the attention cost every time |
| Inline errors appearing on blur | Validation feedback should be instant. The red text, the input's destructive border and the message are the cues. Timing (on blur, Next disabled) is behavior, so it's unchanged |
| Number formatting (thousands separators on hours like `9512`, the hyphen-minus in `-$450.00`, mixed decimal places) | The skill has no number-formatting rules, only `tabular-nums`. The data and format stay as the baseline has them |
| Truncation of long client/project names (`max-w-* truncate` + `title`) | The skill has no truncation guidance. The baseline's handling stays |
| Dashed border on the empty state, outline Badge borders, table row dividers, Input/Textarea/Select borders | Structural and form-control borders, which the skill says to keep (same as rounds 1–2) |
| Discard dialog | It already uses the polished round-1 `Dialog` (ring, 300/150 enter/exit) |
| Card padding vs. the inner table, inputs and empty-state box | 24px padding, the "separate surfaces" threshold, the same as rounds 1–2 |
| Copy ("No invoices match", error messages, button labels) | The skill has no copy rules |
| `will-change` | No first-frame stutter was observed |
