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
