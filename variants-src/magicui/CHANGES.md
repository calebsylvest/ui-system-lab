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
