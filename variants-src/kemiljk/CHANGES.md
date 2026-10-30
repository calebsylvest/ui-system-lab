# Fieldwork — kemiljk skills variant

This variant applies Karl Koch's `kemiljk/skills` to the baseline Fieldwork screen. The README puts the skills in phases (Intent, Platform, Feel, Bridge, Shipping), and that is the order of this pass. `dxe` is the orchestrator and was not run. Its core rubric (`dxe/references/dxe-core.md`) set the precedence: intent first, then semantics and accessibility, then feel, then production trust.

## Skills used

- `subtractive-design` and `humane-functionalism` (Intent, plus the Danish functionalist lens)
- `semantic-html-first` and `modern-css-html` (Platform)
- `fluid-design`, `interface-affordances` and `product-delight` (Feel)
- `design-engineering` (Bridge)
- `interaction-contracts` and `real-content-design` (the README's focused lenses for behaviour nobody had defined and for placeholder content)

Skipped as instructed: native skills, `hiring-manager-bar`, `dxe`, `ai-output-judgement`, `write-first-design`, `prototype-to-production`. Also not used: `design-system-evolution`, `design-for-repetition`, `intentional-craft` (the brief did not call for them).

## Changes

### Tokens and theming (`src/index.css`)
- The duplicated `:root` / `.dark` token blocks are now one set of `light-dark()` tokens. The `.dark` class now only sets `color-scheme: dark`, so native controls such as scrollbars and number spinners follow the theme too. Dark mode is still the `.dark` class on `<html>`. Lightning CSS compiles the tokens to a variable fallback, which was checked in the built CSS. (modern-css-html)
- The focus ring is now a blue hue instead of a grey that looked like a border, so keyboard focus is easy to tell apart from structure. (humane-functionalism: perceptual comfort; interface-affordances: focus is part of the affordance)
- New semantic tokens `--success`, `--warning` and `--like` replace the raw `text-red-500`. (design-engineering: tokens over one-off values)
- Added `scroll-padding-top` so in-page jumps clear the sticky header.
- Smooth scrolling now applies only under `prefers-reduced-motion: no-preference`.
- Under reduced motion, a rule drops tw-animate's scale and translate on dialogs and menus but keeps the fades. (fluid-design #10: "reduce, not delete")
- Added CSS for the native FAQ disclosure. The height animation is progressive enhancement, gated with `@supports (interpolate-size)`. (modern-css-html)
- Added a View Transition group timing for project cards. (fluid-design)

### Components (`src/components/ui/`)
- `button.tsx`
  - `transition-all` is now a list of specific properties. (fluid-design: reject `transition: all`)
  - Added a small `active:scale` press response, turned off under reduced motion.
  - Added a generic `aria-pressed` style, so toggles look different at rest and when on. (interface-affordances)
- `progress.tsx`: `transition-all` is now `transition-transform`. (fluid-design: animate only compositor-friendly properties)
- `badge.tsx`: new `success`, `warning` and `muted` variants. (humane-functionalism: emphasis follows meaning)
- `card.tsx`
  - `CardTitle` now renders a real heading, `h3` by default, with an explicit `as` prop for `h2`/`h4`. (semantic-html-first; this uses explicit composition, not `asChild`)
  - `CardDescription` is now a `<p>`.

### Data (`src/data.ts`)
- `statusVariant` is remapped so emphasis follows urgency:
  - "On track" is quiet.
  - "At risk" is amber.
  - "Done" and "Paid" are soft green.
  - "Overdue" is the only solid red.
  - "Paused" and "Draft" have dashed outlines.
- The baseline made "Done" solid black, the loudest badge, for the state that needs no attention. (humane-functionalism: perceptual comfort; subtractive-design: fewer competing accents)

### Shared state (`src/store.tsx`, `src/lib/transition.ts`, `src/App.tsx`): new files
- The project list now lives in one context. "New project" really adds the card. Before, its toast said "It's in your project list now" and nothing was added. (interaction-contracts: confirmation must match reality; design-engineering: one source of truth)
- `withTransition()` wraps list changes in `document.startViewTransition`, so the surrounding cards slide into place when one is added, duplicated, archived or restored. It falls back to an instant update without support or under reduced motion. (fluid-design #5/#7; modern-css-html: native first)
- `App.tsx`: added the provider, `id="main"` for the skip link, and the footer text "Variant: kemiljk skills".

### Top nav (`src/sections/TopNav.tsx`)
- Below `md`, the primary links used to disappear with no replacement. They now wrap to a scrollable second row. Search used to be hidden below `sm` and is now always visible. (humane-functionalism: no hidden essential actions; interface-affordances)
- The current page uses `aria-current="page"` and gets a visible underline, not only a weight change. (interface-affordances; semantic-html-first)
- Search now sits in a `form role="search"` with a real label and `type="search"`. A `/` shortcut focuses it, with a visible key hint. (semantic-html-first; product-delight)
- The unread count used to appear only in a hover tooltip. It is now a visible badge and part of the button's accessible name. (interface-affordances: essential information can't depend on hover)
- The avatar menu button now has a visible focus ring and `type="button"`.
- Menu shortcuts:
  - Removed the `⇧P` hint. It did nothing, and Shift+P is a capital P, so it would clash with typing.
  - `⌘,` / `Ctrl+,` now really jumps to Workspace settings, and so does the Settings menu item. (interface-affordances: visual cues must match behaviour)
- Added a skip link. (semantic-html-first)

### Page header (`src/sections/PageHeader.tsx`)
- The subtitle is derived from the data. The baseline claimed "6 active projects across 6 clients", but one project is Done and one is Paused. It now reads "4 active projects for 4 clients, plus 1 paused". The baseline also repeated "42.5 hours logged", which the stats row already shows, so that part is removed. (real-content-design; subtractive-design: copy repeating the UI)
- New project dialog:
  - The Client select is now controlled, so the chosen client is saved.
  - On a validation error, focus moves to the name field, and the error is linked with `aria-describedby`.
  - The success toast has a "View" action. (interaction-contracts: failure and recovery)
- Export changed from outline to ghost, so "New project" is the one clear primary action. (subtractive-design)

### Stats (`src/sections/Stats.tsx`)
- Rebuilt as a `<dl>` with `dt`/`dd`, under an sr-only `h2`. The baseline used card titles (heading-like) for the numbers. (semantic-html-first)
- Outstanding and overdue amounts are computed from the invoice list, and the note now says the outstanding total includes a draft. (real-content-design; design-engineering)
- Only the overdue figure is coloured. Progress bars have accessible labels, and numbers use tabular figures.

### Workspace (`src/sections/Workspace.tsx`)
- Wrapped in a labelled `section` with `id="workspace"`. The tabs show counts.
- Project actions:
  - **Rename** used to do nothing. It now opens a dialog with the current name selected, Save/Cancel, and an inline error.
  - **Duplicate** really inserts a copy.
  - **Archive** and **Delete** remove the card right away with a working **Undo** that puts it back in place. The baseline's Undo was a no-op, and Delete did nothing. (interaction-contracts: cancel vs undo; humane-functionalism: forgiving recovery)
- Project cards:
  - Rendered as a `ul`/`li` list.
  - The percentage now sits next to its progress bar, not at the far side of the footer.
  - The team avatars have a group label, since the initials alone were never announced.
  - The avatar ring uses the card colour, which fixes the ring colour in dark mode.
  - "Due —" now reads "No due date", and Done reads "Finished Oct 20". (real-content-design: treat absence deliberately)
- An empty state appears if every project is removed. (real-content-design)
- Invoices:
  - The bulk-action bar is always present. With nothing selected it says what selection is for, so the action can be found and the table no longer jumps. (interface-affordances; fluid-design: layout continuity)
  - Added a select-all checkbox with an indeterminate state.
  - Reminders go only to Sent and Overdue invoices. The bar and the toast say which ones were skipped, and plurals are correct. (interaction-contracts; real-content-design)
  - Added a table caption and `scope="col"`. A missing issue date reads "Not sent". Amounts use tabular figures.
- Activity is an `<ol>` with `<time>`.

### Controls (`src/sections/Controls.tsx`)
- Star is now a real toggle (`aria-pressed`, ±1). It used to count up forever on every click. (interaction-contracts)
- The promise-toast button is disabled while a sync is pending and shows "Syncing…" with a spinner, so repeated clicks can't stack duplicate syncs. (interaction-contracts: repeated submission)
- The formatting toggles are a labelled `role="group"`. The heart uses the `--like` token.

### Assistant (`src/sections/Assistant.tsx`)
- The message list is a `role="log"` live region and scrolls to the newest message. Before, replies landed below the fold of the scroll box. (product-delight: anticipate; semantic-html-first)
- The textarea has a real label and a visible hint "Enter to send, Shift+Enter for a new line". Enter does not send while an IME is composing. (humane-functionalism: human fit)
- The Mic button did nothing. It now runs real dictation through the Web Speech API, with a pressed state and a Stop label. It only appears in browsers that support the API. (interface-affordances: visual cues must match real behaviour)

### States (`src/sections/States.tsx`)
- The card descriptions "Empty state", "Loading state" and "Accordion" named the pattern, not the content.
  - Archived: removed (the empty message already explains it).
  - Recent files: "Uploaded by the team this week".
  - Questions: "Billing, sharing and project basics".
  
  (subtractive-design; real-content-design)
- "View active projects" was a button that did nothing. It is now a link to the workspace, styled with `buttonVariants`. (semantic-html-first: going somewhere means `a[href]`)
- The loading state sets `aria-busy` and has an sr-only status. The grey placeholder squares are now file-type icons. (real-content-design: no fake filler)
- The FAQ accordion is now native `<details name="faq">`, an exclusive accordion with no JS. Find-in-page can reach collapsed answers, and the chevron rotates. The `accordion.tsx` component is left unused. (semantic-html-first; modern-css-html)

### Settings (`src/sections/Settings.tsx`)
- **Discard** used to do nothing. It now resets every field and is disabled until something changes. Saving clears the changed state. (interaction-contracts)
- An invalid save moves focus to the email field. The help and error text are linked with `aria-describedby`, and the field uses `type="email"` and `autoComplete`.
- The hourly rate shows `$` and `/hr` units, `inputMode="decimal"`, `min` and `step`. (real-content-design: units)
- `id="settings"` is the target for `⌘,`, and the button text is "Saving…".

## Findings not implemented
- **Popover API and anchor positioning instead of Radix menus, selects and tooltips** (modern-css-html, semantic-html-first). The Radix primitives already render real buttons and listboxes with correct keyboard support. Rebuilding them would be a large change, and anchor positioning still needs a fallback in Safari.
- **Spring physics through Motion** (fluid-design). Nothing on the page can be dragged or gestured, so CSS transitions and View Transitions cover it. Adding the `motion` dependency wasn't justified.
- **Linking the "Archived projects" empty state to archived cards.** Archive removes a card with Undo, but there is no persistent archive list. Building one would add a new feature.
- **Profile menu item** still does nothing. There is no profile surface to send it to, and a fake page would be invented content.
- **Notifications panel.** The bell shows the count but opens nothing, as in the baseline. There are no notification data.
- **Velocity-gated hover** (fluid-design). There are no hover-dense surfaces.
- **Rendered verification.** The build passes, but no browser was available here to check rendering, contrast, reduced motion or keyboard order. Per the dxe evidence rules, every finding here is `confirmed-source`, not `confirmed-rendered`.

## Agent notes
The system is strongest at catching dishonest UI: toasts that claim something happened, an Undo that undoes nothing, buttons that look interactive and do nothing, a Discard that discards nothing, and meta-labels standing in for content. `interaction-contracts` and `interface-affordances` turned those into concrete fixes.

It is mostly a set of lenses with decision rules, not a visual language. It specifies no type scale, spacing system, palette or component look, so the aesthetic changes here came from my reading of "perceptual comfort" and "subtractive". `humane-functionalism` is the most articulate skill but also the most abstract. The Danish designer framing gives good checks, but little to build directly.

It is quite opinionated about the platform: native elements, `light-dark()`, `<details>`, View Transitions, no `transition: all`, and reduced motion meaning reduce, not delete. It is deliberately unopinionated about style.
