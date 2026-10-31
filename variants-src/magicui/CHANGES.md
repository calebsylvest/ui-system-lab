# Magic UI variant

Magic UI (magicuidesign/magicui) applied to the Fieldwork baseline. Components were installed with the shadcn CLI from a local copy of the Magic UI registry (`npx shadcn@4.23.0 add http://localhost:8788/r/<item>.json`), so the generated files in `src/components/ui/` are the registry's own source. Existing shadcn components were not overwritten. Motion is kept to load-in and hover/state feedback; nothing loops while idle. The app is wrapped in `<MotionConfig reducedMotion="user">` so transform animations respect `prefers-reduced-motion`.

New dependencies: `motion` (all motion components), `next-themes` (pulled in by magic-card; only used by its unused "orb" mode).

## Components used

- **blur-fade** (`App.tsx`): wraps each section. Header, stats and workspace fade/blur in on load with a short 80 ms stagger; the lower sections (Controls + Assistant, States, Settings) use `inView` so they reveal once as you scroll. Gives the page a soft entrance without any persistent motion.
- **number-ticker** (`sections/Stats.tsx`): the four KPI values count up from 0 (42.5 h, $15,400, $5,200, 78%). Prefix/suffix stay static outside the ticker; the ticker's hard-coded `text-black dark:text-white` and `tracking-wider` are overridden to card tokens. An `sr-only` span carries the final value so screen readers never hear the intermediate numbers.
- **magic-card** (`sections/Workspace.tsx`, Projects tab): wraps each project card for a cursor-following spotlight and border glow on hover. Colors are passed as props from the neutral tokens (`--accent` spotlight, `--foreground` color-mix border) instead of the default purple/pink. One local edit to the generated file: its fill uses `var(--card)` / `bg-card` / `var(--border)` instead of `--color-background` / `--color-border`, so project cards match the other cards in dark mode (where card and background differ).
- **animated-shiny-text** (`sections/Assistant.tsx`): the assistant's "Thinking…" indicator gets a shimmer sweep (sped up to 1.6 s). It only exists while a reply is pending, so it reads as a status, not decoration. Marked `role="status"`.

## Considered and rejected

- **border-beam** on the Assistant card while thinking: doubled up with the shimmer in the same card; one state cue is enough.
- **animated-list** for the Activity tab: drips items in one at a time on a timer, which delays real content in a product view.
- **shimmer-button / shiny-button / rainbow-button** for "New project": the page already has a clear primary button; a glowing CTA belongs on a marketing hero, not a toolbar.
- **animated-circular-progress-bar** for Utilization: would break the consistency with the linear Progress bars on the other stat and the project cards.
- **avatar-circles** for project teams: built around image URLs plus a "+N" bubble; the existing initial avatars already stack.
- **text-animate / word-rotate / typing-animation / aurora-text** on the page title: a "Projects" heading in a work tool should not perform.
- **dot-pattern / grid-pattern / particles / flickering-grid / animated-theme-toggler**: ambient backgrounds compete with dense data; the theme is driven by the lab bridge.

## Agent notes

Magic UI is very good at what it is built for: polished, drop-in motion pieces that install cleanly through the shadcn CLI and inherit Tailwind tokens, so the few pieces that fit an app (blur-fade, number-ticker, magic-card) took minutes to wire in. It is thin as a product UI system: it has no form, table, navigation or feedback components, so it only ever layers on top of shadcn/ui rather than replacing anything. Several components hard-code colors (`text-black dark:text-white`, purple/pink gradients, `neutral-600`) or assume Next.js (`"use client"`, `next-themes`), which needed overrides or a small source edit to sit on the app's tokens. None of the components handle `prefers-reduced-motion` on their own. For a product UI it works best as a sparing accent layer; most of the catalogue (heroes, marquees, globes, ambient backgrounds) is landing-page material.

## Round 2

Installed from the local Magic UI registry with the shadcn CLI: **animated-list** and **shine-border** (CLI added the `--animate-shine` token and `shine` keyframes to `src/index.css`). No new npm dependencies (both use `motion`, already present). Same rule as round 1: motion only as feedback on a state change, nothing loops while the page is idle.

- **Tasks list enter/exit/reorder** (`sections/Tasks.tsx`): each row is wrapped in `AnimatedListItem` (the item half of animated-list) inside `AnimatePresence initial={false}`. Added tasks spring in, removed ones scale/fade out, and the item's `layout` prop makes move up/down, sort and removal slide the neighbours instead of jumping. Rule: Magic UI's "keep motion intentional" + use the component API as shipped. `<ul>/<li>` became `role="list"` / `role="listitem"` divs because the motion wrapper sits between them. Rows got `bg-card` so they stay opaque while overlapping during layout moves. All data-lab hooks unchanged.
- **Command menu** (`components/ui/command.tsx`, `CommandDialog`): a `ShineBorder` with a neutral token colour (`color-mix(var(--foreground) 35%)`) and the default slow 14 s sweep. It exists only while the ⌘K menu is open, and the component gates it with `motion-safe:`. Rule: "1 core component + 1 supporting effect"; this is the supporting effect for round 2.
- **Hourly rate** (`sections/SyncStates.tsx`): the value is a `NumberTicker` (startValue 135, so no count-up on load). The optimistic +$10 and the rollback after a failed save both show as movement, so the user sees the change undone. An `sr-only` span carries the settled value, as in Stats.
- **Reloaded time entries** (`sections/SyncStates.tsx`): rows mount in a short `BlurFade` (0.25 s, 50 ms stagger, 4 px), the same entrance language as the page sections, so they settle in after the skeleton.
- **Fix, number-ticker reduced motion** (`components/ui/number-ticker.tsx`): `MotionConfig reducedMotion="user"` doesn't reach `useSpring`, so the ticker now checks `useReducedMotion()` and `jump()`s straight to the value. This covers the Stats tiles and the new rate.
- **Fix, below-fold sections invisible until scrolled** (`App.tsx`): removed `inView` from the lower BlurFades. Every section now fades in on load with a short stagger (0.24–0.32 s), so nothing stays at opacity 0 for full-page screenshots, anchor jumps or the lab viewer.

Not done:
- **AnimatedList container**: it reveals children one at a time on a timer, which delays real tasks (same reason it was rejected for Activity in round 1). Only its item wrapper is used.
- **The 0→1 scale on AnimatedListItem** was left as shipped rather than editing the registry source. It's a fast spring (stiffness 350, damping 40). Under reduced motion the scale/layout transforms are dropped and only the opacity fade remains.
- **Sheet, popovers, people picker**: left as stock shadcn. Magic UI has no overlay, form or combobox components, and adding an effect there would just be decoration.
- **Offline banner / save error**: no effect. These are alerts; Magic UI's border-beam/shine would compete with `role="alert"` content and loop while the state persists.
- **"Saving" label**: kept the spinner. AnimatedShinyText is already the page's "pending" cue in Assistant, but inside a primary button its muted shimmer had poor contrast.

## Round 3

No new registry installs and no new npm dependencies. Magic UI has no table, form, stepper or validation components, so the new sections stay stock shadcn and get the two pieces already on the page, used the same way as in rounds 1 and 2: **number-ticker** for a value that changes because of a user action, **blur-fade** (0.25 s, 4 px, the round-2 "reloaded rows" setting) for content that swaps in. Nothing loops; both respect reduced motion.

- **Ledger totals** (`sections/Ledger.tsx`): the total is a `NumberTicker` (2 decimals) that starts at the first total, so no count-up on load. It only moves when search or the status filter changes the sum. An `sr-only` span carries the formatted value, as in Stats and the hourly rate. Rule: "keep motion intentional" / round-2 rate precedent.
- **Ledger empty state** (`sections/Ledger.tsx`): "No invoices match" fades in with `BlurFade`; the heading is `role="status"` so the empty result is announced. Rule: skill's accessibility check (meaningful text).
- **Ledger numbers and missing values** (`sections/Ledger.tsx`): `tabular-nums` on Hours, Amount, Due and the total (the ticker's own convention), credits use a typographic minus (−$450.00) in a muted color, and missing project/hours/due show a muted dash with an `sr-only` label ("No project", "No hours", "No due date") instead of a bare "—". Long names and the email-as-name keep the baseline truncate + `title`. Rule: accessibility / readability checks in the skill.
- **Wizard steps** (`sections/ClientWizard.tsx`): each step's fields sit in a `BlurFade` keyed on the step, so Next/Back swap with the page's entrance language. The success state fades in the same way. Rule: 1 core component, reused.
- **Wizard errors** (`sections/ClientWizard.tsx`): inline errors get ids and are linked with `aria-describedby` on the invalid field; the step list has `aria-label="Steps"`; the success check icon is `aria-hidden`. Step grids use `items-start` so an error under one field no longer shifts the label of its neighbour. Copy unchanged. Rule: skill's accessibility check.
- **Mount** (`App.tsx`): the round-3 wrapper came in with `<BlurFade inView>`, the same bug fixed in round 2 (content stays invisible until scrolled). Changed to `delay={0.28}` like the other sections.

### Round-2 review fixes
- **Idle requestAnimationFrame loop** (`components/ui/number-ticker.tsx`): cause was the ticker's shipped `useSpring({ damping: 60, stiffness: 100 })`. It is about 3x overdamped, so for $15,400 the spring's tail kept animating (and rewriting `textContent`, forcing layout) for roughly 8 s after load, long after the digits looked settled. Measured with headless Chromium: 60 rAF/s from 2 s to 7 s after load before; 0 rAF/s at every sample after. Replaced the spring with a finite `animate()` tween (1.1 s, ease-out `[0.16, 1, 0.3, 1]`) and only write to the DOM when the formatted text changes. Side fixes in the same file: the first paint is formatted (was the raw number), a ticker that is off-screen when its value changes now jumps instead of staying stale (`useInView({ once })` never fired for the below-fold totals), and the change listener subscribes before the jump effect so reduced motion shows the final value on mount.
- **Reorder slides under reduced motion** (`components/ui/animated-list.tsx`): `MotionConfig reducedMotion="user"` drops transform keyframes but not `layout` projection. `AnimatedListItem` now reads `useReducedMotion()` and, when set, drops `layout` and the scale and uses a 0.12 s opacity fade. Verified: 0 transformed frames during a move under `reducedMotion: 'reduce'`, still 40 without it.

Not done:
- **Row motion on sort/page** in the ledger: rows are `<tr>`, and blur-fade/animated-list wrap in a `<div>`. Animating rows would need custom `motion.tr` code that isn't Magic UI, and a re-sort that slides 6 rows is slower to read than an instant one.
- **Confetti** on "client added": decoration on a routine admin action, and it adds `canvas-confetti`.
- **Shimmer/shiny button** for "Add client", **border-beam/shine-border** on the wizard card: same reason as round 1 (CTA glow belongs on marketing pages), and shine/beam loop while visible.
- **Animated error text**: errors appear instantly; delaying them with a fade would slow feedback.
- Bundle note: importing `animate` adds about 6 KB gzip to the JS.
