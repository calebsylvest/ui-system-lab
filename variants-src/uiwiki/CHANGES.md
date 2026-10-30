# Fieldwork: userinterface.wiki variant

The baseline page reviewed against raphaelsalaja/userinterface-wiki (`skills/SKILL.md`, `skills/AGENTS.md`, `skills/rules/*.md`, 152 rules) with the findings implemented. Content, data, sections and features are unchanged. The only additions are the "Interface sounds" switch, which the audio rules need before sound can ship, and the footer text. No new npm dependencies: everything uses Tailwind v4, CSS and the Web Audio API.

## Changes

### Tokens and global CSS (`src/index.css`)
- **Shadow scale, `--elev-0..3`, mapped onto Tailwind's `shadow-xs/sm/md/lg`.** Layered shadows from one top-down light source. Cards use 1, menus, selects and tooltips use 2, the dialog uses 3. The shadow colour is a deep neutral, not `#000`, and dark mode has its own values. Rules: `visual-layered-shadows`, `visual-shadow-direction`, `visual-shadow-matches-elevation`, `visual-no-pure-black-shadow`.
- **Button shadow, `--button-shadow` and `--button-text-shadow` exposed as `shadow-button`.** Six layers: a 0.5px cut shadow, an inset ambient highlight, an inset top highlight and three depth shadows, plus a text shadow. Separate values for dark mode. Rule: `visual-button-shadow-anatomy`.
- **Borders.** `--border` and `--input` are now alpha colours in light mode. Dark mode already used alpha. Rule: `visual-border-alpha-colors`.
- **Body type.** Antialiased smoothing, `font-synthesis: none` and `font-optical-sizing: auto`. Contextual alternates are left on. Rules: `type-antialiased-on-retina`, `type-no-font-synthesis`, `type-optical-sizing-auto`, `type-opentype-contextual-alternates`.
- **Line wrapping.** `text-wrap: balance` on h1–h3, card titles and the dialog title. `text-wrap: pretty` on paragraphs and descriptions. Rules: `type-text-wrap-balance-headings`, `type-text-wrap-pretty`.
- **Underlines.** Global `text-underline-offset: 4px` plus `skip-ink` on links, the accordion trigger and buttons. Rule: `type-underline-offset`.
- **Selection and placeholder.** A global `::selection` replaces the per-input `selection:` classes. A single `::placeholder` rule replaces the per-component `placeholder:` classes. Rules: `native-selection-styling`, `native-placeholder-styling`.
- **Toast timing.** Sonner's toast transitions are cut from 400ms to 250ms with an ease-out curve. Rules: `timing-under-300ms`, `duration-max-300ms`.

### Components (`src/components/ui/`)
- **`button.tsx`**
  - `transition-all` becomes an explicit list of colour and transform properties at 150ms ease-out. `box-shadow` is not in the list, so focus rings appear instantly.
  - Added `active:scale-[0.98]`, turned off under reduced motion.
  - The primary and destructive buttons get `shadow-button`, a gradient you can barely see and the text shadow.
  - Rules: `physics-active-state`, `physics-subtle-deformation`, `duration-press-hover`, `timing-consistent`, `visual-animate-shadow-pseudo` (shadows are no longer transitioned), `none-keyboard-navigation`, `visual-button-shadow-anatomy`.
- **`tabs.tsx`**
  - The list padding goes from `p-[3px]` to `p-1`, back on the spacing scale.
  - Triggers use `rounded-sm`, so the inner radius is the list's `rounded-lg` minus the 4px padding.
  - Triggers get the same 150ms press scale as buttons.
  - Rules: `visual-consistent-spacing-scale`, `visual-concentric-radius`, `physics-active-state`.
- **`dropdown-menu.tsx`**
  - The entrance animation is removed and only the exit fade and zoom remain, with ease-in.
  - Pointer events are off while the menu exits.
  - Menus are `rounded-lg` around `p-1`, so the `rounded-sm` items are concentric.
  - Rules: `none-context-menu-entrance` / `timing-no-entrance-context-menu` (the "…" project menu and the account menu act as context menus), `easing-exit-ease-in`, `presence-disable-interactions`, `visual-concentric-radius`.
- **`select.tsx`**
  - Ease-out on open and ease-in on close.
  - Pointer events are off while it closes.
  - `rounded-lg` content for concentric items.
  - The trigger stops transitioning `box-shadow`.
  - Rules: `easing-entrance-ease-out`, `easing-exit-ease-in`, `presence-disable-interactions`, `visual-concentric-radius`.
- **`dialog.tsx`**
  - The overlay and the content both run at 200ms (the overlay was 150ms), with ease-out in and ease-in out.
  - The content ignores pointer events while it closes.
  - The 16px close button gets a `::after` that grows its hit area by 8px on each side.
  - Rules: `nested-consistent-timing`, `easing-entrance-ease-out`, `easing-exit-ease-in`, `presence-disable-interactions`, `ux-fitts-target-size`, `ux-fitts-hit-area`, `pseudo-hit-target-expansion`.
- **`tooltip.tsx`.** Ease-out in, ease-in out, the elevation-2 shadow, and no pointer events while closing. Rules: `easing-entrance-ease-out`, `easing-exit-ease-in`, `visual-shadow-matches-elevation`, `presence-disable-interactions`.
- **`accordion.tsx`.** Opening uses ease-out and closing uses ease-in. The chevron uses ease-out. The trigger transitions colour only, not `all`. Rules: `easing-entrance-ease-out`, `easing-exit-ease-in`, `duration-small-state`.
- **`checkbox.tsx`.** `relative` plus `after:-inset-2` takes the 16px box to a 32px target, which matters most in the invoice table. Colour transition only. Rules: `ux-fitts-target-size`, `pseudo-hit-target-expansion`, `pseudo-position-relative-parent`.
- **`switch.tsx`.** A pseudo-element grows the 18px-tall track to a 34px target. The track and thumb run 200ms ease-out, which counts as a small state change. Rules: `ux-fitts-hit-area`, `duration-small-state`.
- **`progress.tsx`.** `transition-all` becomes `transition-transform` with linear easing, the one place linear is allowed. Rule: `easing-linear-only-progress`.
- **`input.tsx`, `textarea.tsx`, `badge.tsx`, `table.tsx`.** Colour transitions at an explicit 150ms. `box-shadow` is no longer transitioned. Rules: `timing-consistent`, `duration-press-hover`, `visual-animate-shadow-pseudo`.
- **`animated-width.tsx` (new).**
  - An outer span animates its width. An inner span is measured with a ResizeObserver attached through a callback ref.
  - Width falls back to `auto` while the measured width is still 0.
  - `overflow: hidden`, 200ms ease-out with a 50ms delay, and nothing under reduced motion.
  - Rules: `container-two-div-pattern`, `container-callback-ref`, `container-use-resize-observer`, `container-guard-initial-zero`, `container-overflow-hidden`, `container-transition-delay`.

### Sound (`src/lib/sound.ts`, new)
- **Generated in code, no audio files.**
  - The tones come from the browser's built-in Web Audio API, created on the fly.
  - One AudioContext is shared, resumed if suspended, and its nodes are disconnected once a sound ends.
  - Each envelope sets its starting value, then ramps down exponentially to 0.001.
  - Rules: `context-reuse-single`, `context-resume-suspended`, `context-cleanup-nodes`, `envelope-set-initial-value`, `envelope-exponential-decay`, `envelope-no-zero-target`.
- **Three sounds.**
  - "success" is a rising sine.
  - "error" is a softer falling triangle wave.
  - "click" is an 8ms noise burst through a 4kHz band-pass filter with Q 3. It plays only as a preview when you turn sounds on.
  - Rules: `design-oscillator-for-tonal`, `design-noise-for-percussion`, `design-filter-for-character`, `param-click-duration`, `param-filter-frequency-range`, `param-q-value-range`, `appropriate-no-punishing`, `weight-match-action`.
- **Volume and reduced motion.** Volume is 0.3 or lower, below 1.0. Nothing plays when `prefers-reduced-motion` is set. Rules: `impl-default-subtle`, `param-reasonable-gain`, `a11y-reduced-motion-check`.
- **Off by default.** The "Interface sounds" switch in Workspace settings turns sound on, and the choice is stored in localStorage behind a try/catch. Rule: `a11y-toggle-setting`.
- **Where sounds play.** Only on confirmations and errors: creating a project, saving settings or failing to, the success and error toasts, the promise toast resolving, and sending reminders. Each sound accompanies a toast. Nothing plays on hover, typing or keyboard navigation. Rules: `appropriate-confirmations-only`, `appropriate-errors-warnings`, `a11y-visual-equivalent`, `appropriate-no-decorative`, `appropriate-no-high-frequency`.

### Sections (`src/sections/`, `src/App.tsx`)
- **Tabular numbers.** Applied to stat values and notes, due dates, progress percentages, invoice numbers, issued dates and amounts, the selected count, the star count and the hourly rate. Invoice IDs also get `slashed-zero`, since they are code-like identifiers. Files: `Stats.tsx`, `Workspace.tsx`, `Controls.tsx`, `PageHeader.tsx`, `Settings.tsx`. Rules: `type-tabular-nums-for-data`, `type-slashed-zero`.
- **`TopNav.tsx`.**
  - Each nav link gets a `::after` that grows its hit area, plus a 150ms colour transition.
  - The avatar menu button gets a press scale of 0.96.
  - Rules: `ux-fitts-hit-area`, `pseudo-hit-target-expansion`, `physics-active-state`.
- **`Controls.tsx`.** The B/I/U group container goes from `rounded-md` to `rounded-lg` around the `rounded-md` buttons, so the radii are concentric. Rule: `visual-concentric-radius`.
- **`Assistant.tsx`.** The composer textarea goes to `rounded-xl` (14px). The Dictate and Send buttons inset 8px inside it go to `rounded-sm` (6px). Rule: `visual-concentric-radius`.
- **`Settings.tsx`.**
  - The billing email is trimmed before it is validated, and the cleaned value is saved.
  - Label/description pairs are wrapped in `grid gap-1`, so each switch's text sits tighter together than the gap between rows.
  - The "Save changes" / "Saving" label sits inside `AnimatedWidth`, so the button resizes smoothly.
  - Rules: `ux-postels-accept-messy-input`, `ux-proximity-grouping`, `container-no-excessive-use` (its own example of a good use is a loading button).
- **`App.tsx`.** The footer's right-hand text reads "Variant: userinterface.wiki".

## Findings not implemented
- **Motion/AnimatePresence rules** (`exit-*`, `presence-hook-in-child`, `presence-safe-to-remove`, `mode-*`, `nested-propagate-required`, `spring-*`, `physics-spring-for-overshoot`, `staging-one-focal-point`). The page has no Motion dependency, and Radix with tw-animate-css handles mount and unmount. Adding Motion only to satisfy these rules would break the "stay in stack" rule. The CSS-level parts, such as ease-in exits, shared timing and no pointer events while exiting, were applied.
- **Morphing icons** (`morphing-*`). There are no morphing icons.
- **Predictive prefetching** (`prefetch-*`). Nothing is fetched or routed, so there is nothing to prefetch.
- **View Transitions** (`transition-name-*`, `transition-over-js-library`, `transition-style-pseudo-elements`). There are no page or view transitions. Tab switching is instant, which `none-high-frequency` calls for anyway.
- **`a11y-volume-control`.** No volume slider. It would add a control nobody needs while sound is off by default; the volume is fixed at a quiet level.
- **`impl-preload-audio`, `impl-reset-current-time`.** Sounds are generated on the fly rather than loaded from files, so there is nothing to preload or rewind.
- **`native-backdrop-styling`.** Radix Dialog renders a portal and an overlay div, not a native `<dialog>`, so `::backdrop` doesn't apply. The overlay still dims the page (`staging-dim-background`).
- **Typography rules that don't apply.**
  - `type-font-display-swap`: no web fonts are loaded.
  - `type-variable-weight-continuous`: the system font stack isn't guaranteed to be variable.
  - `type-oldstyle-nums-for-prose`: system fonts mostly lack `onum`, and the prose numbers are data such as $15,400.
  - `type-disambiguation-stylistic-set` (ss02): font-specific.
  - `type-letter-spacing-uppercase`: there is no uppercase text.
  - `type-proper-fractions`, `type-justify-with-hyphens`, `pseudo-marker-styling`, `pseudo-first-line-styling`: nothing on the page uses them.
- **Content-level UX laws** (`ux-hicks-minimize-choices`, `ux-progressive-disclosure`, `ux-pareto-prioritize-features`, `ux-zeigarnik-show-incomplete`, `ux-cognitive-load-reduce`). Following them would mean hiding or removing features, such as collapsing the Controls showcase or adding banners. That breaks the comparison rule, so they were skipped. The page already meets `ux-doherty-*` (skeletons, spinner, immediate "Thinking…"), `ux-von-restorff-emphasis` and `ux-peak-end-finish-strong` (success toasts).
- **Arbitrary values left in place.** `h-[1.15rem]` on the switch and `rounded-[4px]` on the checkbox are sizes and radii, not spacing, so `visual-consistent-spacing-scale` doesn't cover them.

## Agent notes
The system is strongest on motion and interaction detail. It has exact duration bands, ease-in for exits and ease-out for entrances, active-state scale ranges, hit-target expansion and concentric radii, and almost all of it turns straight into Tailwind classes. Its audio rules are a complete, numeric recipe for synthesized sound. It is thin wherever it isn't Motion-specific. Many rules are one sentence with a toy example. Some are duplicated: `none-context-menu-entrance` and `timing-no-entrance-context-menu`, and `easing-natural-decay`, which is really an audio rule filed under easing. The 23 "Laws of UX" rules give no thresholds you could check, so they read as principles rather than a review checklist. It is very opinionated on numbers (300ms, 0.95–1.05, 32px, 5–15ms) but has no colour, type scale or spacing tokens of its own, so the page's look barely changes. The result is a quieter, more tactile, better-timed version of the baseline rather than a new visual identity.
