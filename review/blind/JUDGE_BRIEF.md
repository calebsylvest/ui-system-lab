# Blind judging brief

You are one of three independent judges. Eleven anonymous variants (codes A–M, no I/L) of the same app page
were each produced by applying a different UI design system to one baseline. Judge how much each variant
IMPROVES the page over the baseline. You don't know which system made which variant; don't try to guess,
and don't read anything outside the paths below.

## The page
"Fieldwork", a design-studio project tool (React + Tailwind + shadcn/ui). Sections: top nav, header, stat cards,
project/invoice/activity tabs, a task list (add/complete/reorder/sort/remove with undo), quick actions (side panel,
filter popover, people picker, ⌘K command menu), sync states (save that fails then Retry, offline banner, reload),
a ledger table with deliberately messy data (long/non-ASCII names, missing values, huge/negative amounts; search,
filter, sort, pagination, empty state), a 3-step new-client form (validation, unsaved-changes guard), controls,
an AI chat panel, empty/loading states, and settings.

## Evidence (only these)
- Screenshots: `/home/claude/uilab/review-blind/<code>/` and `/home/claude/uilab/review-blind/baseline/`:
  light.png, dark.png, phone.png (full page), r2.png (task/quick actions/sync after a failed save + offline),
  r3.png (ledger sorted + form with a bad email), r3-empty.png (ledger no-results), ov-*.png (side panel,
  command menu, picker, dialog, project menu, discard-changes dialog), brand-yellow.png (a yellow primary and
  compact density forced on through the shadcn CSS variables; some variants use their own tokens and won't follow).
- Live pages: `http://localhost:4175/<code>/index.html` and `http://localhost:4175/baseline/index.html`
  (`?theme=dark` for dark). Node + Playwright are installed (`require('playwright')`, `chromium.launch()`).
  Trigger identical actions from the page itself:
  `page.evaluate(n => window.postMessage({type:'lab:action', name:n}, '*'), 'task-sort')`.
  Names: dialog, menu, sheet, popover, combobox, command, close, tab, toast, task-add, task-complete, task-move,
  task-sort, task-remove, save-fail, retry, offline, reload, ledger-sort, ledger-next, ledger-filter, ledger-empty,
  ledger-clear, wizard-fill, wizard-invalid, wizard-next, wizard-back, wizard-cancel.
  Use real keyboard input (Tab, Enter, Escape) to check focus; use a context with `reducedMotion: 'reduce'` to
  check motion; sample `document.getAnimations()` or element transforms during actions to check motion quality.
  Put your scripts in `/home/claude/uilab/review-blind/tools-<your judge number>/`. Don't modify anything else.

## Scoring (1–5; the baseline is 3 on every axis by definition)
- visual: hierarchy, typography, spacing, color, both themes, phone layout
- interaction: motion quality and restraint, feedback, state changes, overlays, list/table behavior
- accessibility: focus visibility and management, keyboard paths, contrast, semantics, errors, reduced motion
- fidelity: everything still works as intended, no regressions, no new bugs (verify, don't assume)
- productFit: fits an everyday work tool (not a marketing page); content and edge cases handled well
A 5 is a clear, verified improvement on most of the axis; a 1 is clearly worse than baseline.

## Output
Write `/home/claude/uilab/review-blind/judge-<your judge number>.json`:
{ "judge": n, "lens": "...", "variants": { "<code>": { "scores": {visual, interaction, accessibility, fidelity, productFit},
  "notes": "2–3 plain sentences", "best": "the single best thing", "issues": ["verified problems, 0–4"] } },
  "ranking": ["codes best to worst"] }
Score every code A–M (11 variants). Be skeptical, evidence-based and consistent across variants.
