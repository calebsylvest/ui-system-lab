# libraries.dev effects variant

Applied with the `libraries-dev` agent skill's decision rules (`skills/libraries-dev/SKILL.md`) and the per-package references/llms docs. Installed: `border-beam@1.4.1 thinking-orbs@0.3.2 bot-avatars@0.2.2 liquid-gooey@0.2.2 voice-glow@0.3.0 img-fx@0.5.1 three@0.187.0`.

Shared helpers in `src/lib/effects.ts`: `useIsDark()` (watches the `.dark` class on `<html>` live), `useReducedMotion()` (the border-beam docs' recipe), and `simulatedVoiceLevel()` (syllable-like 0-1 level for voice-glow).

**Theme.** thinking-orbs, bot-avatars and img-fx follow the `.dark` class by themselves. Their `auto` mode reads an ancestor `.dark`/`data-theme` first. border-beam and voice-glow are different: their `theme="auto"` follows only `prefers-color-scheme` (checked in `dist/index.d.ts` and `index.es.js`), so both get `theme={isDark ? "dark" : "light"}` from `useIsDark()`. The liquid fill is a CSS token (`--tab-indicator`) that has a separate value under `.dark`.

**Timing change.** The simulated assistant reply now waits 3.2 s (was 1.6 s). The skill's wait table says waits under 2 s get "Nothing. No orb, no beam", 2 s or more get Thinking orbs, and more than 3 s also get a Border beam. Streaming model replies count as long waits. So the timer was raised to match a real reply. A 1.6 s flash would break the author's rule.

## Used

| Package | Where | Props / variant | Why (doc guidance) |
| --- | --- | --- | --- |
| `thinking-orbs` | `Assistant.tsx`, "Thinking…" row (replaces the Bot icon avatar there) | `state="breathing" size={20} aria-hidden` next to the text label, row is `role="status"` | "Any loading state, usually beside a text label"; `breathing` = idle "Thinking…"/reasoning; size 20 is the inline-text preset. Reduced motion → package draws one static frame. |
| `border-beam` | `Assistant.tsx`, the composer (wraps the textarea + buttons) | `size="line"`, `active={thinking && !reduced}`, `strength={0.9}`, explicit theme | Skill rule: "An input that loads after the user submits text (search, ask, command bar) → Border beam `line`, active from submit until results arrive." Rotate types don't handle reduced motion, so it's gated with the docs' hook. |
| `voice-glow` | `Assistant.tsx`, the same composer, inside the beam | `<VoiceBeam level={simulatedVoiceLevel} active={dictating} borderRadius={6}>`; the Dictate button is now a toggle (`aria-pressed`, label swaps, `sr-only` status) | "Anything voice or recording related → Voice"; "Voice mode in an AI chat composer". The viewer iframe has no mic, so it uses the documented `level` getter ("a getter is called once per animation frame, with no re-render") instead of `useMicrophone`. Stopping dictation fills a demo transcript. Controls sit at `z-[5]` per the docs' "Content hidden under the bloom" note. Reduced motion is handled by the package (idle breathing/flow stop; meter stays). |
| `bot-avatars` | `Assistant.tsx`, assistant message avatars (replaces lucide `Bot` in shadcn `Avatar`) | `type="clover" size={32} aria-hidden`, idle `state="default"` | "Anything avatar related for a bot or agent"; fit signal "Bot / BotIcon (lucide-react) … as an assistant avatar → `<BotAvatar size={32} />`". These messages are finished, so they show the idle state. The thread got `pt-4` so the hop isn't clipped by the scroll container ("Clipping the hop"). Reduced motion → still pose (package). |
| `img-fx` | `States.tsx`, "Recent files" loading skeleton: the three 40px file thumbnails only (text lines stay `Skeleton`) | `preset="sweep-gradient" strength={0.5} paused={reduced}` | Fit signal: "`<Skeleton` … `bg-muted` on image containers → `sweep-gradient` and `strength={0.5}` for a quieter loader"; "Not for text or list loading", so only the media tiles. No reduced-motion handling in the package, so `paused={reduced}` (nothing is revealed, so pausing never blocks a reveal). One shared WebGL context for all three. |
| `liquid-gooey` | `Workspace.tsx` tab bar → new `src/components/LiquidTabsList.tsx` | `<Liquid fill="var(--tab-indicator)">` + `<Liquid.Item effect="move" move={{ stretch: 0.6, trail: 0.35 }}>` on a sliding indicator measured from the active Radix trigger | Docs recipe "Tab indicator that stretches between tabs (move)" and fit signal "tab bars with a sliding indicator → `move` indicator". The skill's rule is "Shapes … that should merge, melt or morph → Gooey". Triggers sit above the liquid and drop their own active background (`.liquid-tabs` rule in `index.css`). "Move … follows motion you drive, so gate your own … CSS animation": the indicator's transition is `none` under reduced motion. |

**Stacking.** The skill says "never two effects on the same element". Beam and voice glow wrap the same composer, but they never show at the same time. Dictate is disabled while thinking, and sending stops dictation. Each one renders no layers when inactive. The textarea focus ring was changed to an inset ring, because both wrappers clip with `overflow: hidden` ("Most types clip … an outside focus ring gets cut").

## Skipped

- **`metal-fx`**: no spot on the page matches the author's rules. The rules name "A large h1 or key headline", "Badges ('New', 'Pro')" and "A CTA that sells something ('Get Pro', 'Upgrade')". Fieldwork has no badge or sales CTA, and the `text-2xl` "Projects" page title isn't a hero headline. The other spot the docs suggest is the composer send button (circle variant), but it sits inside the beam/voice-wrapped composer. That would break "Don't stack effects … on neighbouring elements". Adding a "Pro" badge or an upgrade CTA would change the page's content. It would also add a second WebGL renderer.
- **voice-glow `processing`**: the docs describe it, but the published `voice-glow@0.3.0` types mark it as Pro ("the Pro processing state"), and it isn't in the free props. The beam already covers the post-submit wait.

## Build

`npm run build` passes. JS bundle `dist/assets/index-*.js` 1,397.76 kB (401.98 kB gzip), CSS 41.05 kB. Most of the growth comes from `three`, which `img-fx` needs. It could be code-split with `React.lazy` if that matters.

## Fixes after review
- LiquidTabsList: the `Liquid` wrapper's inline `position: relative` overrode `absolute inset-0`, so the indicator didn't show. Pinned it with an inline `position: absolute; inset: 0`.
- Composer: BorderBeam and VoiceBeam now get `borderRadius={8}` to match the textarea, which stops them clipping its side borders.

## Round 2

I checked the three new sections against the skill's decision rules and each package's "When to use", "When not to use" and "Detecting a fit" tables. None of the new spots meets an author rule. The skill says "No clear match → … Do not force an effect", so I added **no new effects and no new dependencies**. That also leaves the round-1 idle cost unchanged: no new canvas, WebGL context or SVG filter loop.

### Changed

| File | Change | Rule |
| --- | --- | --- |
| `src/sections/SyncStates.tsx` | The "Time entries" block gets `aria-busy={feed === "loading"}` while the skeleton shows. | Matches round 1's `aria-busy` on the States loading region. Skill, apply step 6: "Keep accessibility intact." |

### Not done, and why

- **Thinking orbs / Border beam on Save ("Raise by $10", Retry) and Reload.** The save takes 1.1 s and the reload 1.2 s. Both are small fetches or optimistic updates. Wait table: "Under 2 s → Nothing. No orb, no beam". thinking-orbs fit table: "Waits under 2 s: optimistic updates, cached or local reads, quick toggles → Nothing. Do not add an orb". The docs also say "A flash of an orb reads as a glitch." In round 1 I raised the assistant's timer because a streaming model reply really is a long wait. A rate save and a feed reload aren't, so I kept the timers the same. The `RefreshCw animate-spin` in the save button stays, as round 1 kept Settings' `Loader2`: it isn't agent or chat code, so the orb's "replace spinner" signal doesn't apply.
- **img-fx / orbs on the Reload skeleton.** img-fx is "Not for text or list loading". thinking-orbs: "Page or route skeletons. The orb says 'an agent is busy', not 'layout is loading'." The rows are text only, so they stay `Skeleton`.
- **liquid-gooey on the task list (add / remove / reorder / sort).** The package has no list or reorder recipe. `bend` is for a row "that should bow while it is **dragged**". This list is reordered with Move up/down buttons, and adding drag would add behaviour. Making every row a `move` item would put a filled liquid surface under each row. With the 4 px row gap and `blur={6}`, neighbours bridge (the "blur ≈ gap" rule), so the list would melt into one blob. The docs also list "Dense lists or grids of many items" under "When not to use". The per-row up/down/remove button cluster could be a `morph` toolbar, but that means one filter group per row, the same dense-list problem. The other `move` recipe (a segmented control / sliding indicator) would only fit if "Sort by due date" became a two-segment control. That's a UI change no rule asks for, so the toggle button stays.
- **Border beam `line` on the ⌘K CommandDialog / people-picker search.** The rule is "an input that loads after the user submits text … active from submit until results arrive". cmdk filters the list synchronously as you type, so there is never a wait to signal.
- **bot-avatars in the people picker / task rows.** These are human assignees, and the package is for "a bot or agent".
- **metal-fx.** Still no headline, badge or sales CTA (same reasoning as round 1).
- **voice-glow.** Nothing voice-related in the new sections.
- **Primitives (`popover.tsx`, `sheet.tsx`, `command.tsx`).** Left stock, the way round 1 left the stock primitives (the system ships effects, not tokens or primitives). Their `tw-animate-css` enter/exit runs only while an overlay opens or closes.

### Build

`npm run build` passes. JS 1,434.17 kB (411.86 kB gzip). Same dependencies as round 1; the growth comes from the round-2 sections and `cmdk`, which were already copied in.

## Round 3

I checked the Ledger and the New client wizard against the skill's decision rules (wait table, "By element" list) and each package's "Where it goes", "When not to use" and "Detecting a fit" tables. No spot meets an author rule. The skill says "No clear match → … Do not force an effect", so round 3 adds **no effects, no code changes and no new dependencies**. `Ledger.tsx`, `ClientWizard.tsx`, `RoundThree.tsx` and `data-r3.ts` are left exactly as copied. All `data-lab` hooks are untouched. Idle cost is the same as round 1: no new canvas, WebGL context, SVG filter or rAF loop.

### Not done, and why

- **Border beam `line` on the Ledger search.** The rule is "An input that loads after the user submits text … active from submit until results arrive". The ledger filters an in-memory array in a `useMemo` on every keystroke, so there's no wait. Wait table: "Under 2 s → Nothing. No orb, no beam". This is the same call as the round-2 ⌘K search.
- **Thinking orbs anywhere.** Nothing in either section waits. Sorting, paging and filtering are synchronous, and "Add client" sets `done` straight away. The orb is for "an agent is busy", and "A flash of an orb reads as a glitch."
- **Liquid metal on the status badges (Paid / Overdue / Credit).** The badge rule names promotional pills ("New", "Pro"; fit signal `<Badge>New</Badge>`), not status labels. "When not to use: Dense lists, table rows or repeated cards." Also: "Destructive or low-priority actions" (Overdue is a destructive-variant badge). Up to six metal badges in one table would also break "keep metal elements apart".
- **Liquid metal on the totals amount or the "Ledger" / "New client" titles.** These are card titles and a table cell, not "a hero `h1` or key headline". This matches rounds 1-2, where the `text-2xl` page title was skipped too.
- **Border beam / bot-avatars / metal on table rows.** All three docs list per-row use under "When not to use" ("every row of a list or table", "Dense tables", "table rows").
- **Border beam `pulse-inner` on "Next" / "Add client".** The pulse type is for "Highlighting a component … a CTA button". But a pulse breathes all the time, the brief rules out always-on animation, and "Static emphasis that never changes state" is listed under "When not to use". The primary button already carries the emphasis. Also, "Add client" is not a CTA "that sells something", so it gets no metal button either.
- **Liquid-gooey `move` indicator on the wizard's step list.** The recipe is for "segmented-control or tab indicator that should trail and stretch as it moves". The step list is a plain `<ol>` with `aria-current="step"` and no indicator or clickable segments. Adding a sliding pill would be a new UI element that no rule asks for. It would also be a second gooey group on the page next to the Workspace tabs.
- **Bot-avatars on the success state ("… is set up").** Empty-state mascots are for agent pages ("No runs yet", "Your agent is ready"). A client record isn't a bot or agent, so the `Check` icon stays.
- **Error copy, validation timing, number formatting, truncation, aria-sort, `aria-describedby` on field errors.** This system ships effects only. It has no rules on tables, typography, forms or error copy, so I left these as baseline. The same goes for round 1, where stock primitives were left alone. The skill's only accessibility rule ("Keep accessibility intact") applies to the effects it adds, and none were added.

### Build

`npm run build` passes. Same dependencies as rounds 1-2.
