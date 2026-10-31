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

## Round 2

Same run as round 1 (app-screens.md, framed-sheet, IBM Plex, one teal data hue, pale pills). This time
`lint.mjs --app` **did run** on the new files (0 FAIL, 0 WARN after fixes). `inspect.mjs --app` still could
not: no Chrome/Chromium on this machine, so again no screenshots, no `ragged-row`/`panel-void` measurement
and no critique loop.

| Change | Files | Rule |
| --- | --- | --- |
| Motion tokens `--ease-ui` (ease-out), `--ease-travel` (in-out), `--ease-exit`; `row-in` / `row-out` keyframes; notice border token `--notice-border` (light and dark) | `src/index.css` | motion.md §3–4 (curves, durations, leaving ≈70% of arriving); app-screens.md §11 notice |
| Task list: the boxed rows became 48px rows split by the lighter row rule; people as their tinted initials (`PersonAvatar`); due dates on one right edge with only "Today" in ink; three row actions kept in one fixed grey trailing column at the same pitch; on a phone the due date moves to a subline | `sections/Tasks.tsx` | §7.1, 7.3, 7.4, 7.5, 7.8, §12; "its people as themselves" |
| Task motion: an added or undone row arrives (240ms ease-out), a removed row leaves (160ms ease-in) before it is dropped, moved/sorted rows travel to their new place (FLIP, 280ms in-out). No entrance on first render; reduced motion skips the FLIP | `sections/Tasks.tsx`, `index.css` | §2.8 "motion is feedback… a row arriving", motion.md §3 |
| "1 open tasks" pluralised, done count added to the subline (from rows) | `sections/Tasks.tsx` | §2.1 counts from rows |
| Add button is 38px to match the field; Sort shows its pressed state as the grey active pill; empty list is one sentence in a 38px dashed box | `sections/Tasks.tsx` | §8.3 one height per row; §3.2 active pill; §11 empty keeps its frame |
| Popover: radius 8, 6px offset, faint drop + hairline (floats), 200ms open / 150ms close on `ease-ui`, 4px slide instead of 8px | `ui/popover.tsx` | §9.4/§13 shadows only on what floats; motion.md §3 menus 150–250ms |
| Side panel repeats the style's move: a second white sheet inset 8px from the window, 16px corners, 1px edge, 400px wide, soft drop; 320ms in / 220ms out; 32px ghost close; header/footer on the 24px pad with a rule over the footer, Save at the right | `ui/sheet.tsx` | framed-sheet signature; motion.md §3 drawers 250–450ms; §8.3 |
| Panel content: status pill, progress in the brand hue with the % in ink, due date and team in a tinted well; budget field shows its unit ("hours") inside the field, tied with `aria-describedby`; save toast names the project | `sections/QuickActions.tsx` | §6.4 hue on the main data element; §7.9 key-value well; round-1 rate field |
| Filter popover: each status is the same pale pill as the project grid with its project count, on 36px rows; Clear is disabled when nothing is selected; Apply's toast now says what is shown ("Showing projects that are On track or At risk", or "No status filter…") instead of "Showing 2 statuses" | `sections/QuickActions.tsx` | §7.6 one status mark; §2.1 counts from rows; honest feedback |
| People picker: tinted initials, role as a grey second column, ink check; trigger chevron grey | `sections/QuickActions.tsx` | "its people as themselves"; §7.5 ink only on identity |
| "Assigned to… Filtering by…" sentence became a key-value well (label left, value right, 32px rows), `aria-live` | `sections/QuickActions.tsx` | §7.9 key-value well |
| ⌘K hint is a `<kbd>` in the text face (no mono, no tracking) | `sections/QuickActions.tsx`, `ui/command.tsx` | §13 mono for IDs only; round 1 removed tracked shortcut letters |
| Command menu: 560px, sits at 16% from the top so typing never moves it; 48px search with a 14px grey icon; 36px rows with the grey active pill as the highlight; 12px grey sentence-case group headings; rule between groups. Dialog title/description moved **inside** the dialog content (they were outside it, so Radix had no accessible title) and renamed "Command menu" to match the button | `ui/command.tsx` | §7.2, §7.8 selected = active fill, §8.1; a11y fix |
| Sync: the rate reads as a KPI (grey label over a 28px/400 value, "/ h" grey suffix). The button keeps the name "Raise by $10" while saving (spinner + `aria-busy`); a grey "Saving…" stamp sits beside the value | `sections/SyncStates.tsx` | §5 KPIs; §11 honest states; stable accessible name |
| Failed save: one sentence saying what failed and what the value is now ("…so the rate is back to $135"), red only on the small icon, Retry as an ink text button | `sections/SyncStates.tsx` | §11 error inside the block, negative colour only on a small icon |
| Offline: the one quiet amber notice (`#fffbeb`, `#fde68a` border, 13px `#92400e`); the Online switch became a settings switch row with a status pill ("Synced" / "Offline" / "2 queued") and a description tied by `aria-describedby`; "Not synced yet" stamp beside a queued rate | `sections/SyncStates.tsx` | §11 stale notice; §8.2 switch row |
| Time entries: tinted initials, 48px rows on the row rule, time right-aligned; a freshness stamp "Updated 9:41 AM" (real clock); one frame (3×48px) for every state, so loading shows flat bars at the real sizes (avatar, line, time) and the error is one line "Couldn’t load time entries. Last updated …" with a text button | `sections/SyncStates.tsx` | §11 loading, error, stale data; "no shift of the layout" |
| Card gutter 16px → 24px | `sections/RoundTwo.tsx` | framed-sheet: one gutter for every row |

No new dependencies.

### Not applied, and why

- **Inspector and screenshot critique**: no Chrome on this machine. Lint ran and is clean.
- **"Applies to the project grid"** in the filter popover is untrue (the filter does nothing to the grid), but
  wiring it up would change behaviour across variants, so the copy stays.
- **Error button "Try again"** kept instead of the skill's "Retry", so the page has only one button named
  Retry (the `data-lab="retry"` save retry) and the viewer's name lookups stay unambiguous.
- **Row actions as one kebab** (§7.8 prefers a single trailing action): move up / move down / remove stay as
  three visible buttons, because the test exercises each directly and they need to be keyboard-reachable
  without a menu. They are grey and in one fixed column.
- **A refresh that keeps old values** (§11 prefers keeping the data on screen and updating the stamp): the
  brief asks for a skeleton on Reload, so the skeleton stays, sized to the real rows.
- **Command scrim**: kept the round-1 dialog's `bg-black/50` for the sheet and the menu rather than adding a
  second scrim colour.
- **Hover-revealed row actions**: not done; they would vanish on touch screens.

## Round 3

Same run (app-screens.md, framed-sheet, IBM Plex, one teal data hue, pale pills). `lint.mjs --app` ran on
every section: 0 FAIL; the only WARN is round 1's invoice-ID mono in `Workspace.tsx` (the Ledger's ID cell
carries `taste-skill-ignore`, since §7.4 and §13 allow mono for IDs). `inspect.mjs` still can't run (no Chrome),
so nothing was screenshotted or measured, and the focus fixes below were checked by reading the code, not in a browser.

| Change | Files | Rule |
| --- | --- | --- |
| Header: the subline carries the finding computed from the rows in view ("14 entries · 3 overdue, $10,361.25", with "match" when filtered); red only on the overdue fact | `sections/Ledger.tsx` | §2.2 one finding; §11 counts follow the view; red is a signal |
| Toolbar: one 32px search (14px icon 13px in, max 320px) and a 32px status select, one height | `Ledger.tsx` | §7.8 toolbar 30–36px; §8.1 one control height per context |
| Sort headers: plain 12px grey text buttons (not ghost buttons pulled -12px), the active column in ink, the glyph on the active column only; numeric headers right-aligned with the glyph on the left so the word sits flush with the figures. `aria-sort` and `ledger-sort-*` hooks kept | `Ledger.tsx` | §7.2 header, sort glyph on the active column only, numeric headers flush |
| Fixed-layout table: ID 84px in Plex Mono 13px; Client is the identity column and takes the remaining width (ink, 500, one line, ellipsis, full name in `title`). Long and non-ASCII names, and the email-as-name, truncate and never break inside a word | `Ledger.tsx` | §7.4 identity column widest, never cut mid-word; IDs in mono |
| Figures: hours and money right-aligned with 2 fixed decimals and thousands separators ("9,512.00", "$1,284,500.00"); negative credit as "-$450.00" in ink, no red; real zeros printed ("0.00", "$0.00"); missing values a grey dash. Amount is the key number in ink; hours, project and due are grey | `Ledger.tsx` | §7.4 fixed decimals, sign in the text; §7.5 ink on identity and key number, grey dash, zero printed |
| Status: pale pairs, Paid positive, Overdue negative, Sent/Credit neutral, Draft outline; one mark per row | `Ledger.tsx` | §7.6 |
| Due right-aligned in the last column, on the card's right edge | `Ledger.tsx` | §7.4 dates right-aligned where rows are compared; one right edge |
| Totals row: the table's strongest rule above it, "Total, 14 entries on all pages" in grey, sum in 600 on the amount's edge | `Ledger.tsx` | §7.2 strongest line; §2.1 totals from rows |
| Phone/tablet: project below md and due below sm move to a grey second line under the client instead of disappearing; hours hide below sm; the table scrolls inside its frame below 460px | `Ledger.tsx` | §12 fields move to a subline |
| Empty view keeps the table frame and header; one sentence in a 38px dashed box spans the columns ("No invoices match “zzzz”.") with Clear filters as an ink text button | `Ledger.tsx` | §11 an empty section keeps its frame and header |
| Pager: "1–6 of 14" range (live region) instead of "Page 1 of 3"; 28px outlined Previous/Next | `Ledger.tsx` | §7.8 full list: page with the range shown |
| Wizard steps: numbered 20px dots joined by hairlines; the current step an ink dot with ink label, done steps a grey dot with a check (and "done" for screen readers), future steps outlined and grey. No brand hue on chrome. `aria-current="step"` kept | `sections/ClientWizard.tsx` | §13 the accent on data, not chrome; §9.4 |
| Each step gets a 14/500 heading ("Client details", "Billing", "Review and add") with "Step n of 3" for screen readers | `ClientWizard.tsx` | SKILL §9 every section opens with a heading that names it |
| Fields: labels above, 8px to the 38px field, 16px between fields, "(optional)" in grey regular | `ClientWizard.tsx` | §8.1 |
| Errors: 13px negative text with a 14px icon, tied by `aria-describedby`; still shown on blur, and they clear the moment the value is fixed (errors are recomputed live once touched) | `ClientWizard.tsx` | §8.1; §11 negative only on a small icon / the fact |
| Rate field: right-aligned figure, the unit "USD / h" inside the field (follows the currency), and its limit "More than 0, up to 2,000." beside it, tied by `aria-describedby` | `ClientWizard.tsx` | SKILL "a limit that remains stays visible beside the field"; round-1 rate field |
| A disabled Next says why: a grey line beside it ("Add a client name and a billing email to continue.", computed from what's missing), tied by `aria-describedby` | `ClientWizard.tsx` | §8.1 disabled controls say why |
| Review is a key-value well (muted tint, radius 8, 32px rows, label left, value right); rate formatted in the chosen currency ("$140.00 / h"); missing values a grey dash; only the email may break anywhere | `ClientWizard.tsx` | §7.9 key-value well; §7.5; type.md overflow-wrap only on emails |
| Footer: a row rule above it, Cancel ghost at the left, Back outline and Next/Add client primary at the right, one height | `ClientWizard.tsx` | §8.3; round-2 sheet footer |
| Success stays inside the card on its left edge: a tinted well with a 16px positive check, "{name} is set up" and where invoices go, then "Add another client". No big centred icon | `ClientWizard.tsx` | §11 states inside the block; §4.2 one left edge; round 1 removed icons from states |
| Discard dialog names the client ("Discard “Juniper & Vale Ceramics”?") and says the consequence; Discard is the outlined-red destructive | `ClientWizard.tsx` | §8.2 destructive confirmation names the object |
| Round-3 wrapper gutter 16px → 24px | `sections/RoundThree.tsx` | framed-sheet: one gutter |

### Focus (round-2 reviewer finding, plus the same bug in round 3)

The skill's rule is SKILL.md §9 "every control works from the keyboard alone in reading order" and "visible
focus" (it has no rule specifically about focus after removal; I read losing focus to `<body>` as breaking it).

| Fix | Files |
| --- | --- |
| Removing a task moves focus to the next row's remove button (or the previous one, or the "New task" field when the list empties). Undo puts focus on the restored row. Moving a row to the top/bottom (which disables the arrow you pressed) hands focus to the other arrow | `sections/Tasks.tsx` |
| "Raise by $10" and "Reload" use `aria-disabled` while busy instead of `disabled` (handlers already ignore repeat presses), so pressing them no longer drops focus; Retry and Try again move focus to them before they unmount | `sections/SyncStates.tsx` |
| Ledger: Clear filters (which leaves with the empty state) returns focus to the search; a pager button that becomes disabled hands focus to the other one | `sections/Ledger.tsx` |
| Wizard: Next/Back move focus to the new step's heading (Back disappears on step 1, Next is disabled on an empty step); Add client focuses the success heading; Add another client focuses the name field. The viewer's hidden hooks don't move focus | `sections/ClientWizard.tsx` |

No new dependencies.

### Not applied, and why

- **ISO dates** (§7.4 prefers "2024-02-15" for compared rows): the data says "Nov 14" and data must stay the same; kept, right-aligned.
- **Copy icon after IDs, IDs truncated to 8 characters**: IDs are 6 characters; a copy action would be a new feature.
- **No pagination / "View all"**: §7.8 bans paging on overviews, but this is the full list and paging is a tested feature; the full-list house rule (range shown) applies instead.
- **Sticky header row** (full-list rule): the table shows 6 rows a page, so there is nothing to scroll past.
- **Shortening client names editorially** (§7.4): would change data; truncation with the full name in `title` instead.
- **Japanese name**: Plex Sans has no CJK; "株式会社" falls back to the system face. Loading Plex Sans JP would be a large new dependency for one cell.
- **Hours total in the totals row**: the baseline totals only money; left as is.
- **Wizard "Edit" links on review rows**: new behaviour; Back covers it.
