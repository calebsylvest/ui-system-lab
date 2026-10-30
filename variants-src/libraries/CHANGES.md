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
