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

## Round 2

Installed from the local @fluid registry (`--overwrite`, after diffing every dependency it would rewrite:
all were identical to the round-1 copies apart from stripped header comments): **command-menu**, **combobox**,
**banner** (+ `tabs-subtle` as a command-menu dependency). New npm dependency: `@radix-ui/react-popover`
(combobox's anchor). `src/index.css` gained the banner's `--info/--success/--warning` tokens and the
scroll-fade `@property` rules; nothing else changed.

### Tasks (`src/sections/Tasks.tsx`)
| Change | Rule |
|---|---|
| Sort: Button `tertiary` + `compact`, `leadingIcon`, `active` while sorted (fixes TS error from `outline`/`sm`) | Button has 4 variants / 2 sizes; `active` = engaged state |
| Add field: `InputGroup` / `InputField` with `labelHidden` ("New task" stays the accessible name) | Forms → input-group; inline fields hide the label but keep it for AT |
| Add: `secondary` with `leadingIcon={Plus}` | Icons via the icon slot (4px closer to the edge) |
| Rows: one `useFluidHover` list + `FluidHoverHighlight`, rows touch (gap 0) on the 36px control height | Fluid Hover: one highlight per list; Sizes: one control height for rows |
| Enter = opacity on `spring.moderate`, exit = `spring.moderate.exit`, `layout` reorder on `spring.moderate`, `AnimatePresence mode="popLayout"` so siblings close the gap | Motion tiers; exits one tier quicker; transform/opacity only (reduced motion drops the slide, keeps the fade) |
| Check square drawn like CheckboxItem (16px outline, 5px radius, border hands off to a self-drawing check 0.08s/0.04s); it is a real `role="checkbox"` button whose name is the task title | CheckboxGroup craft; a11y (no nested interactive row) |
| Move/remove: ghost `icon-compact` with icon children | Button icon-only sizes take children |
| Text through type roles (body/caption/micro tokens) | Typography: never raw px |

### Quick actions (`src/sections/QuickActions.tsx`)
| Change | Rule |
|---|---|
| ⌘K: Fluid `CommandMenuDialog` + `CommandMenu` (groups from `item.group`, `mod+n` shortcut cap, footer hints). The hand-written keydown listener was removed: the dialog binds `mod+k` itself (Ctrl+K off Mac) | "Action palette → command-menu" |
| Trigger shows `<CommandMenuShortcut keys="mod+k" />` instead of a hard-coded "⌘K" | Platform-correct shortcut caps |
| People picker: Fluid `Combobox` (type-to-filter field, gliding selection marker) replacing Popover + cmdk; avatars kept by passing initials through the `icon` slot; `data-lab="combobox"` is on the field, `aria-label="Assignee"` | "Forms → combobox" |
| Filter popover: statuses as `CheckboxGroup` (merged selection blocks); Clear ghost/Apply primary, both `compact`; Apply now closes the popover; trigger `active` while open | CheckboxGroup; Button `active` for a held-open popup |
| Side panel fields: `InputGroup` with two `InputField`s (Notes keeps the shadcn Textarea, as in round 1). Footer order Cancel (tertiary) → Save (primary) | Forms → input-group; strongest action at the trailing edge |
| All `outline` buttons → `tertiary` (fixes the TS errors) | Button variants |

### Sync (`src/sections/SyncStates.tsx`)
| Change | Rule |
|---|---|
| Raise by $10 uses `loading` (morphing spinner, width held) + an sr-only live "Saving the new rate" | Button loading craft; honest feedback |
| Save failure → `Banner status="error"` with a primary `Retry` BannerAction (`data-lab="retry"` kept). Copy now says the rate was rolled back to the previous value | Banner for status messages; honest feedback |
| Offline → `Banner status="warning"` with `icon={WifiOff}`, `role="status"` kept (polite, like baseline) | Banner; its row opens/collapses so content below never jumps |
| Feed error → `Banner status="error"` with "Try again" action | Banner |
| Online: Fluid `Switch` with its built-in label (fixes the `onCheckedChange` TS error) | Switch is a whole labeled row |
| Skeleton rows built to the exact box of real rows (20px + 16px lines), `aria-hidden`, list `aria-busy`; skeletons and reloaded rows fade on `spring.moderate`, 0.04s stagger; first paint doesn't animate | Reveal: "build each skeleton the exact size of its real block", product = fade only |
| Rate in the display role, semibold via `fontVariationSettings`, tabular figures | Typography roles & weights |

### Primitives
- `popover.tsx`: rewritten on `@radix-ui/react-popover` with the library popup treatment — `Elevated offset={2} shadowLevel={3}`, `popupMotionClass` side-aware origin, `spring.fast` in / exit tween out, portal kept mounted through the exit.
- `sheet.tsx`: rewritten to mirror Fluid Dialog — surface 4 steps up (re-provided), slide + fade on `spring.slow` / `spring.slow.exit`, same overlay, ghost icon ✕, title/description in the title/body roles. Width 400px = Dialog `sm`.
- `command.tsx` (cmdk) left as shipped but now unused — CommandMenu and Combobox replace it.

### Not done, and why
- No Fluid Sheet exists; I restyled the shadcn Sheet rather than forcing a centered `xl` Dialog, because the section is testing a side panel.
- `reveal` not installed: its `skeleton` dependency is missing from the offline registry, so the swap/fade is hand-rolled with the same tiers.
- Task-row hover stays on even though rows can change place; the docs skip-list is about rows moving *while you scroll*, here they move only on an explicit action.
- No visual check in a browser from this session (no reachable preview); `npm run build` passes.
