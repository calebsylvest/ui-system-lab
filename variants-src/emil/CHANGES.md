# Fieldwork — Emil Kowalski skills variant

Applies `emilkowalski/skills`: `emil-design-eng` (core polish philosophy + `ui-cheatsheet.md` / `performance-cheatsheet.md`), then the web animation skills `find-animation-opportunities`, `improve-animations` (AUDIT.md), `review-animations` (STANDARDS.md), `animate` (RECIPES.md), `animation-performance`, with `animation-vocabulary` and `ask-sonner` as reference. The planner skills are read-only, so their plans were implemented directly here. No new dependencies: `animate` Hard Rule 5 ("cheapest tool that works") rules out adding Motion when CSS transitions, `@starting-style` and tw-animate-css keyframes cover everything.

## Changes

| File(s) | Change | Skill · rule |
| --- | --- | --- |
| `src/index.css` | Added motion tokens `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`, `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)` in `@theme`. These override Tailwind's weak built-ins, so every existing `ease-out` utility gets the strong curve. | emil-design-eng · "use custom easing curves"; animate Hard Rule 3 · extend tokens, don't fork them |
| `src/index.css` | `--default-transition-timing-function: ease`, so bare `transition-colors` hover/colour changes use `ease`. | emil-design-eng · easing tree "hover/color change → ease" |
| `src/index.css`, `button.tsx`, `TopNav.tsx` | New `pressable` utility: `scale(0.97)` on `:active`, transform 160ms strong ease-out, colours 150ms ease. Replaces `transition-all` on Button. Also on the avatar menu trigger. | emil-design-eng · "Buttons must feel responsive"; review-animations · `transition: all` escalation |
| `Controls.tsx`, `src/index.css` | The destructive "Delete" button is now hold-to-confirm: a `clip-path: inset(0 100% 0 0)` overlay fills over 2s linear while held (pointer or Space/Enter), snaps back in 200ms ease-out on release, and fires a "Deleted" toast when the fill completes. Label is unchanged; `aria-description` explains the hold. | emil-design-eng · Hold-to-delete pattern + asymmetric timing; find-animation-opportunities · Feedback gaps; animate RECIPES · Hold to confirm |
| `tooltip.tsx` | Provider delay 0 → 400ms. Enter animation only on Radix `data-state=delayed-open` (125ms ease-out, opacity + `scale(0.97)` from the trigger origin). `instant-open` (moving between neighbouring tooltips) gets no animation. Removed the slide-in offsets. Exit is a 100ms fade. | emil-design-eng · "Tooltips: skip delay on subsequent hovers"; RECIPES · Tooltip |
| `dropdown-menu.tsx`, `select.tsx` | 200ms strong ease-out enter, 150ms exit, opacity + `scale(0.95)` from the Radix transform-origin. Removed the `slide-in-from-*` translate. | animate · dropdown budget 150–250ms, origin-aware; AUDIT §7 · exit faster than enter |
| `dialog.tsx` | Modal plus backdrop: 250ms ease-out enter, 150ms exit, `scale(0.96)`. Stays centred. | RECIPES · Modal (modals exempt from origin rule) |
| `accordion.tsx`, `src/index.css` | Content keyframes now animate height and opacity together (200ms open, 150ms close, strong ease-out). Removed `transition-all` from the trigger. Chevron uses 200ms ease-out so it stays in sync with the content. | RECIPES · Accordion; STANDARDS · no `transition: all` |
| `switch.tsx` | `transition-all` → background-colour/box-shadow 150ms ease. Thumb transform 150ms ease-out. | review-animations · `transition: all`; animation-performance Hard Rule 4 |
| `progress.tsx` | `transition-all` → `transition-transform 250ms ease-in-out` (the indicator is already a translate). | animation-performance · composite-only properties |
| `Settings.tsx` | Saving spinner spins in 600ms instead of 1s. | emil-design-eng · Perceived performance: "a fast-spinning spinner makes loading feel faster" |
| `States.tsx`, `src/index.css` | When Recent files finishes loading, the rows enter via `@starting-style` (opacity + `translateY(8px)`, 300ms ease-out) with a 50ms stagger. The thumbnail square got `shrink-0`. | find-animation-opportunities · Teleporting state + Group entrances; emil-design-eng · `@starting-style`, stagger 30–80ms; ui-cheatsheet · flex-shrink:0 |
| `Assistant.tsx`, `src/index.css` | Assistant replies and the "Thinking…" row enter with opacity + `translateY(4px) scale(0.97)` from bottom-left, 200ms ease-out. The user's own message stays instant, because it echoes a keyboard action (Enter). The thread now scrolls to the newest message (smooth, instant under reduced motion). | emil-design-eng · "Never animate keyboard-initiated actions" + "Preventing jarring changes"; "unseen details compound" |
| `Workspace.tsx`, `src/index.css` | The invoice "N selected" bar fades in (150ms). The toast text "Sent 1 reminder(s)" is now pluralised with `Intl.PluralRules` (helper `plural()` in `lib/utils.ts`). | find-animation-opportunities · Teleporting state; ui-cheatsheet · "Count reads '1 members'" |
| `Stats.tsx`, `Workspace.tsx`, `Controls.tsx` | `tabular-nums` on stat values, invoice amounts, project %, star count and selected count. | ui-cheatsheet · "Numbers jitter when they change" |
| `PageHeader.tsx`, `Stats.tsx` | `-0.02em` tracking on the h1 and stat values. `max-w-[65ch]` on the header and empty-state paragraphs. | ui-cheatsheet · large headings / 65ch line length |
| `sonner.tsx` | Toaster `theme` follows the `.dark` class on `<html>` through a MutationObserver. It was stuck on Sonner's default `light` in dark mode. | ask-sonner · Troubleshooting "Dark mode ignored" |
| `src/index.css` | `prefers-reduced-motion`: popover/dialog/tooltip scale and translate set to identity (fades stay). `@starting-style` entrances keep opacity and drop transform. Switch thumb, progress and chevron move instantly. Accordion becomes a fade. Press scale and the hold fill stay, because they are feedback/progress rather than travel. | emil-design-eng · "Reduced motion means fewer and gentler animations, not zero" |
| `App.tsx` | Footer right text → "Variant: Emil Kowalski skills". | lab rule |

## Not implemented, and why

- **Radix popovers still use keyframes, not transitions.** Radix Presence only waits for CSS *animations* before unmounting, so a transition-based exit would be cut off. These surfaces aren't fired rapidly, so the interruptibility rule matters less here. Sonner (the rapidly-fired surface) already uses transitions.
- **Tab change animation and a clip-path tab indicator.** The tabs are core navigation, used tens of times a day, and the content is functional data. Rejected by the frequency and function gates.
- **Page-load stagger on the stat cards or project grid.** This is a dashboard people open daily, so it should stay crisp. Rejected by the frequency gate.
- **Checkbox check animation, toggle-button morphs.** Used tens of times a day; at 16px the motion would be imperceptible.
- **Shake on the "Enter a project name" error, blur crossfade on Save ↔ Saving.** Neither has a stated purpose strong enough to pass the gate. The blur trick is a fix for crossfades that look wrong, and there's no crossfade here.
- **Layout shift when the invoice selection bar appears.** The only fix is animating height, which the skills tolerate only for accordions. I added a fade only.
- **Sonner `richColors`, custom toast styling.** These are options, not rules. Sonner's default motion is already the reference implementation.
- **Hover gating `@media (hover: hover)`.** There's no hover *motion* on the page, only colour changes.
- **`will-change`.** animation-performance: add it only once you've observed a shift.
- **Hold-to-confirm on the project menu "Delete".** A hold doesn't fit a menu item. I applied it to the standalone button only.

## Agent notes

This system is strongest on motion craft. It gives exact curves, duration budgets per element, and a frequency/purpose gate that produces as many "don't animate this" decisions as additions. That kept the dashboard restrained instead of turning it into a showcase. It's thin outside motion: the UI cheatsheet is 11 one-liners, and there's no guidance on colour, spacing, type scale, or layout, so the visual design is basically still baseline shadcn. Some rules pull against each other or are vague in practice. For example, "on-screen movement → ease-in-out" conflicts with a switch thumb that is a direct response to a click. The skills also assume Base UI's `data-starting-style` and `--transform-origin`, so they don't say how to handle Radix's keyframe-only exit requirement. On motion it is very opinionated, with prescriptive numbers and hard "never" rules; on everything else it says almost nothing.

## Round 2

Same tokens as round 1 (`--ease-out`, `--ease-in-out`, `--ease-drawer`), the same `pressable` buttons, and the same `enter-*` @starting-style utilities. No new dependency. The task list needed layout (reorder) and exit animation. `animate` Step 3 lists Motion for that, but it lists WAAPI first ("programmatic control with CSS performance, no library"), and Hard Rule 5 says to use the cheapest tool that works. A 100-line FLIP hook covers it, so I didn't add Motion. WAAPI also keeps everything in `document.getAnimations()`, which means the lab's slow-motion control slows it too. Motion's JS-driven layout animations would ignore that control, and `animation-performance` cites shared-layout animations dropping frames.

| File(s) | Change | Skill · rule |
| --- | --- | --- |
| `src/lib/use-flip-list.ts` (new) | WAAPI FLIP for rows marked `data-flip-id`. Moves are `translateY` only, 250ms strong ease-in-out. Removed rows leave as an inert clone in an overlay layer (opacity plus `scale(0.97)`, 150ms strong ease-out, exit faster than enter). Snapshots read the *visual* position, so a second click mid-move picks up from wherever the row is instead of restarting. Under reduced motion there is no movement, and exits keep their fade. Easing comes from the CSS tokens. | animate Step 3 (WAAPI) + RECIPES "Programmatic, without a library"; easing tree "moving on screen → ease-in-out"; animation-performance · transform only; STANDARDS · interruptible, exit < enter; Hard Rule 3 · extend tokens |
| `Tasks.tsx` | Move up/down, Sort by due date, completing a task while sorted (it drops to the bottom), Remove and Undo all FLIP now, so rows no longer jump into place. | find-animation-opportunities · Teleporting state / list items added-removed; purpose: spatial consistency |
| `Tasks.tsx`, `index.css` | Rows added with the **Add** button, or restored by **Undo**, enter via a new `.enter-row`: `@starting-style` opacity plus `scale(0.97)` from the top edge, 200ms ease-out. Rows on first paint don't animate. A task submitted with **Enter** appears instantly, with no FLIP, the same call as the Assistant composer in round 1. | emil-design-eng · "Never animate keyboard-initiated actions", never `scale(0)`; frequency gate (no page-load motion) |
| `use-flip-list.ts`, `Tasks.tsx` | Focus is restored after a reorder or removal. React moving or removing the focused row dropped focus to `<body>`. Focus now goes back to the same control, or the nearest enabled one when "Move up" becomes disabled at the top, then to the next row, then to the input. | emil-design-eng · "unseen details compound" / handle edge cases invisibly |
| `Tasks.tsx` | Rows get `bg-card`, so a fading clone and a sliding row never show through each other. "1 open tasks" now uses the round-1 `plural()` helper. | animate "feel-check" on overlap; ui-cheatsheet · "1 members" |
| `popover.tsx` | Same treatment as round-1 dropdowns: 200ms strong ease-out in, 150ms out, `scale(0.95)` from the Radix transform-origin, slide offsets removed. Applies to both the Filter popover and the people picker. | animate · dropdown budget, origin-aware; AUDIT §7 |
| `sheet.tsx` | Drawer recipe: `translateX(100%)` with `--ease-drawer`, 500ms in and 250ms out. Backdrop fades on the same clock. Removed `transition ease-in-out`, a broad property list that included transform. | RECIPES · Drawer / Modal backdrop; STANDARDS · exit faster; no broad transition lists |
| `dialog.tsx`, `command.tsx` | New `instant` prop on `DialogContent`. The ⌘K command menu opens and closes with **no animation**, whether you press ⌘K or click. cmdk item highlight stays instant. | animate Step 1 · "command palette toggle … No animation. Ever." (Raycast) |
| `QuickActions.tsx` | "Command menu" button gets `aria-keyshortcuts="Meta+K Control+K"`. The accessible name is unchanged. | the shortcut was only visual |
| `SyncStates.tsx` | Both spinners (Saving, and Reload's icon, which now spins while loading) run at 600ms like round 1. The rate uses `tabular-nums` and `-0.02em` tracking, like the stat values. | Perceived performance: "fast-spinning spinner"; ui-cheatsheet · numbers jitter |
| `SyncStates.tsx` | The save error alert, the offline banner and the load-error block fade in (150ms `enter-fade`). After a **Reload**, time entries stagger in exactly like round-1 Recent files (`enter-rise`, 50ms). First paint stays still. Pluralisation uses `plural()`. | find-animation-opportunities · Teleporting state, Group entrances (30–80ms) |
| `index.css` | Reduced motion: popover joins the "no scale/translate" list. The sheet becomes a pure fade. `.enter-row` keeps opacity and drops scale. | "Fewer and gentler, not zero" |

### Not done, and why

- **Motion (`motion.dev`).** WAAPI does the job with no bundle cost; see the intro above.
- **NumberFlow on the hourly rate (rollback).** Rejected. The `role="alert"` message already explains the rollback, and one number doesn't justify a dependency (cheapest tool).
- **Shake on save failure.** Same reasoning as round 1: no purpose strong enough.
- **Card height animation when rows are added or removed, or when the offline banner and alert appear.** Height is tolerated only for accordions. FLIP covers the rows inside; the card edge still snaps.
- **Exit animations for the banner, alert and error state.** These are conditional renders, so animating them out would need a library or delayed unmounts. They're system responses, where fast is right.
- **Checkbox or strikethrough animation on completing a task.** Tens of times a day, at 16px. Same call as round 1.
- **Drag to reorder / dnd kit.** That's a feature change, not motion polish; the buttons stay.
- **Sonner restyle or `richColors`.** The Undo toast uses Sonner's `action`, which is exactly what ask-sonner prescribes. Round 1 already fixed the theme.
- **Feel-check owed.** The 250ms ease-in-out on a clicked reorder starts slowly by design, and the overlap of the exit clone (150ms) with the rows sliding up (250ms) is the "opacity + height, no formula" case. Both should be checked at 2–5× in the lab's slow motion.
