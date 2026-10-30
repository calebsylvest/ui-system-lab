# Fieldwork, styled with taste-skill (tasteskill v2)

The skill (`skills/taste-skill/SKILL.md`) sorts work into **pages** and **app screens**. Fieldwork is an
app screen, so I followed `references/app-screens.md` (its own run, rules and tokens) and not the page
run. The skill's scripts (`draw.mjs`, `lint.mjs`, `inspect.mjs`) were blocked from running on this machine, so
I picked the style by hand from `library/app.json`. For kind `smb-admin` it offers `accent-ladder` and
`framed-sheet`. I chose **framed-sheet**: a studio lead checks this every day for projects and
invoices, which fits a B2B admin tool better than a creator home. I kept its one move (a tinted
L-frame with the work on a white sheet). The screen's one question is *"Which projects and invoices
need attention this week?"*. Its one finding is *Checkout flow audit is at risk and INV-1040 is 28 days overdue*.

## Changes

| Change | Files | Rule |
| --- | --- | --- |
| New tokens: tinted frame `#f2f4f1`, white sheet, ink `#131416`, grey `#5d5f60`, borders `#e8eaec` / rules `#f0f1f2` / controls `#cdced1`, one data hue `--brand #1b6c80`, positive/negative and pale pill pairs; radii 8 / 6 / 4 (sheet 16) | `src/index.css` | framed-sheet tokens; §9.2 "lines in three steps"; §9.4 bimodal radius |
| Dark mode rebuilt as true neutrals (#0a0a0a frame, #111 sheet, #b4b4b4 secondary, lifted teal and red), still on `.dark` | `src/index.css` | §9.3: no navy or slate, elevation by lightness |
| The frame tinted a field green-grey instead of the dealt `#f9fbfc`. This is the product's "face" | `src/index.css` | framed-sheet `identity[0]`; "Give the product a face" |
| IBM Plex Sans (400/500/600) as the one face; IBM Plex Mono only for invoice IDs; tabular figures on everything | `src/main.tsx`, `src/index.css`, `Workspace.tsx` | framed-sheet font; §9.1 one grotesk, second face with one job; §7.4 IDs in mono |
| Shell: the top nav became a 228px sidebar plus a 48px top bar on one tint with no rule between them; the page sits on a white sheet inset 8px from the right and bottom, 16px corners, 1px edge, no shadow. Grid sum written in a comment | `App.tsx`, `sections/Sidebar.tsx` (new), `sections/TopNav.tsx` | framed-sheet shell blueprint; §2.4 grid arithmetic |
| Product mark (three furrows in the brand hue) plus name and workspace switcher at the top of the sidebar; the assistant uses the mark instead of a bot icon / sparkles | `Sidebar.tsx`, `Assistant.tsx` | §3.2 "the product is named"; mark "drawn for this product" |
| Active nav item is a neutral grey pill; icons are 16px outline at 1.6 stroke, in grey | `Sidebar.tsx` | §3.2 active item; §9.4 icons |
| Phone and tablet: the sidebar folds into the top bar, and the nav and search open in a full-screen sheet (the existing Dialog) | `TopNav.tsx` | §12 navigation folds; framed-sheet `phone` |
| Title 22/600 noun; the line under it carries the finding, then counts computed from data (fixes "6 active", which was false: 1 paused, 1 done) | `PageHeader.tsx`, `data.ts` | §2.2 one finding under the title; §2.1 totals from rows |
| KPIs: four tiles became one container split by 1px lines. Label above value, value 28px at 400, unit as a grey suffix, overdue note in negative red. Totals computed from invoices, with `console.assert`s | `Stats.tsx`, `data.ts` | §5 KPIs; §2.1 data that adds up; "colour says good or bad" |
| Buttons: no shadows, 32px default (28 / 36), near-black primary, grey secondary, outlined-red destructive, small press offset as feedback | `ui/button.tsx` | §8.3; §13 shadows only on what floats; §8.2 destructive as outline in the negative colour |
| Status badges are pale tint pairs (positive / negative / neutral), 20px, 4px radius, never squeezed | `ui/badge.tsx`, `data.ts` | §7.6 |
| Tabs became underline tabs on a full-width rule with a 2px ink indicator | `ui/tabs.tsx` | §4.4 |
| Project cards: no shadow, 24px gap, brand hue on progress fills (red when at risk, grey when paused or done), percent right-aligned, "No due date" instead of "Due —" | `Workspace.tsx`, `ui/card.tsx`, `ui/progress.tsx` | §6.4 hue on the main data element; §11 honest states; §13 peer cards with no icon |
| People get stable initials on a pale tint of their own hue. Neighbours on a team or in the feed sit 60° or more apart | `components/person.tsx` (new), `data.ts`, `index.css` | "its people and objects as themselves" |
| Table: 12px grey sentence-case headers, the header rule is the strongest line, lighter row rules, 48px rows, no hover fill, selected row uses the grey pill fill, client column widest, amounts right-aligned. On a phone, client and date move to a second line | `ui/table.tsx`, `Workspace.tsx` | §7.1–7.5, §7.8, §12 |
| Inputs, selects and textareas: 38px, white even on grey panels, no shadow | `ui/input.tsx`, `ui/select.tsx`, `ui/textarea.tsx` | §8.1 |
| Settings now use the two-column pattern: label column beside a filled panel, a full-width rule between sections, no card. Added two short section titles with descriptions (the pattern needs a label column). The rate field shows `$` and `/ h`. Help text is tied with `aria-describedby` | `Settings.tsx` | `settings-two-column` pattern; §8.2; SKILL "limits visible beside the field" |
| Empty state: icon removed; one sentence in a dashed box inside the kept frame, with the action pinned to the foot | `States.tsx` | §11 empty sections; §4.2 stretched cards pin only an action |
| Loading: no pulse; flat bars at the real sizes; file rows use one plain 16px grey icon instead of grey boxes | `States.tsx`, `ui/skeleton.tsx` | §11 loading; §13 "icons in boxes repeated down a list" |
| Tooltip arrow removed; no tracked shortcut letters | `ui/tooltip.tsx`, `ui/dropdown-menu.tsx` | §6.4 tooltips without an arrow; no tracked caps |
| Liked heart uses `--negative` instead of Tailwind red | `Controls.tsx` | one red, tokens only |
| Reduced-motion fallback | `index.css` | §2.8 motion is feedback only |
| Footer moved inside the sheet; right text is now "Variant: taste-skill" | `App.tsx` | lab rule |

New dependencies: `@fontsource/ibm-plex-sans` and `@fontsource/ibm-plex-mono`. The style deals IBM Plex,
and the skill requires the dealt face to actually load. Google Fonts can't be reached at build time.

## Not applied, and why

- **Scripts and the gate** (`draw.mjs --app`, `lint.mjs --app`, `inspect.mjs --app`): running them was
  blocked here. I read the style from `library/app.json` by hand. I couldn't take screenshots, so I
  skipped the critique and fix loop (§2.7) and couldn't measure `ragged-row`/`panel-void`. The
  Controls/Assistant and States rows may still end at different heights inside their stretched cards.
- **The whole page run** (direction draw, idea sentence, copy deck, ≥4 real pictures, archival imagery,
  scroll scenes, the ≥8 moving elements, "one live thing"): these are rules for websites. The app chapter
  says the page run does not apply and that app screens have no motion floor.
- **A signature element only this product has** (power flow, sell-out strip…): I couldn't invent
  one without adding data or features. The face comes from the frame tint, the mark and the tinted
  people instead.
- **A chart**: there is no time-series data, so I drew none (§6.1 allows "a few numbers, no chart").
- **"Second line is about the data, never the interface"**: the Controls card and the "Empty state / Loading
  state / Accordion" descriptions are test-page labels the comparison depends on, so I kept them.
- **Two-line rows for tables below 640px**: partly done. Columns move to a subline, but the
  checkbox column stays as a table.
- **One view per settings area / hash routes, "nav items are other screens"**: links stay `href="#"`,
  and Settings stays a section on this one page so the content stays the same across variants.
- **Disabled controls "say why"**: opacity went from 50% to 60%, but no reasons were added. That would be new copy.

## Agent notes

The skill is very good at product-screen detail: it gives measured, specific defaults for nav pills, KPI
strips, table headers, pill colour pairs, row pitch and empty/loading states, and its "colour on data,
not chrome" rule changes a shadcn baseline a lot with few edits. It's strongly opinionated (it bans
eyebrows, mono labels, shadows and gradients, and picks the face and palette), but the app chapter relaxes
the page bans sensibly and gives reasons. It's thinnest where it relies on its own tools: picking a style,
the inspector and the screenshot critique all depend on scripts, so a hand-applied run loses the measurement
loop it stresses most. Its library and blueprints are also generated around dashboards and overviews, so a
mixed component-showcase page like this one (button galleries, toasts, FAQ) falls between its patterns.
