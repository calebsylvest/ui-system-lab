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
