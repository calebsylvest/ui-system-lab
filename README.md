# UI System Lab

A side-by-side comparison of UI design systems, component libraries and AI agent skill sets. One test app page was rebuilt once per system, then each version was judged blind and benchmarked against the untouched original.

**Live site:** [calebsylvest.github.io/ui-system-lab](https://calebsylvest.github.io/ui-system-lab/)

- **Compare** shows any two versions side by side, with theme, width, slow-motion and brand controls (primary color, font, density) and synced actions that play the same interaction in both.
- **Report** has the scores, performance numbers and a note for each system: what to look for, the problems found and how to improve.

## How it works

- **The test page.** Fieldwork is a fictional studio tool built with React 19, Vite, Tailwind v4 and stock shadcn/ui (new-york). It has dashboard cards, tabs, a task list, overlays, async and failure states, a messy data table, a three-step form, an AI chat panel and settings. Every version keeps the same data and features.
- **Applying a system.** One AI agent per system, reading only that system's own docs. Agents could change look, motion and copy, but not remove features or data. Each logged its changes in `variants-src/<id>/CHANGES.md`.
- **Judging.** Three blind judges (product design, design engineering, and accessibility and UX writing) scored anonymized builds on five axes, with the original page at 3: Visual, Interaction, Accessibility, Fidelity and App fit.
- **Performance.** Headless Chromium with the CPU slowed 4×, median of 3 runs of a scripted session that uses every section. JavaScript counts only what loads at startup and fonts count only what the browser downloads. Scores are relative to the original, not real-world numbers.

## Systems tested

| System | Type | Repo | Owner |
|---|---|---|---|
| shadcn/ui (baseline) | Component library | [shadcn-ui/ui](https://github.com/shadcn-ui/ui) | shadcn · [@shadcn](https://x.com/shadcn) |
| kemiljk skills | Agent rule set | [kemiljk/skills](https://github.com/kemiljk/skills) | Karl Koch · [@_kejk](https://x.com/_kejk) |
| taste-skill | Agent rule set | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | Leon Lin · [@lexnlin](https://x.com/lexnlin) |
| Interface skills | Agent rule set | [jakubkrehel/skills](https://github.com/jakubkrehel/skills) | Jakub Krehel · [@jakubkrehel](https://x.com/jakubkrehel) |
| Make interfaces feel better | Agent rule set | [jakubkrehel/make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better) | Jakub Krehel · [@jakubkrehel](https://x.com/jakubkrehel) |
| UI Craft | Agent rule set | [olzn/ui-craft](https://github.com/olzn/ui-craft) | Oscar Lozano · [abstract.systems](https://abstract.systems) |
| ui-skills | Agent rule set | [ibelick/ui-skills](https://github.com/ibelick/ui-skills) | Julien Thibeaut · [@ibelick](https://x.com/ibelick) |
| userinterface.wiki | Agent rule set | [raphaelsalaja/userinterface-wiki](https://github.com/raphaelsalaja/userinterface-wiki) | Raphael Salaja · [@raphaelsalaja](https://x.com/raphaelsalaja) |
| Emil Kowalski skills | Agent rule set | [emilkowalski/skills](https://github.com/emilkowalski/skills) | Emil Kowalski · [@emilkowalski](https://x.com/emilkowalski) |
| Fluid Functionalism | Component library | [mickadesign/fluid-functionalism](https://github.com/mickadesign/fluid-functionalism) | Micka · [@micka_design](https://x.com/micka_design) |
| Magic UI | Effect components | [magicuidesign/magicui](https://github.com/magicuidesign/magicui) | Dillion Verma · [@dillionverma](https://x.com/dillionverma) |
| libraries.dev | Effect packages | [Jakubantalik/Libraries.dev](https://github.com/Jakubantalik/Libraries.dev) | Jakub Antalik · [@jakubantalik](https://x.com/jakubantalik) |

Fluid Functionalism was updated on Nov 5, 2026 to pick up the creator's fixes from this lab's feedback. Its scores are still from the original judging.

### Not included

- [transitions.dev](https://transitions.dev): its recipes are only on its website, which the build environment couldn't reach.
- [Stageshow](https://benji.org/stageshow): built for animated landing-page mockups, not for improving a working app screen.
- [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills): general engineering skills; its one frontend guide overlaps with the dedicated systems.
- [mattpocock/skills](https://github.com/mattpocock/skills): engineering workflow skills (TDD, tickets, PRs), not UI.

## Repo layout

- `baseline/` — the untouched starting point. Make a new variant with `cp -r baseline variants-src/<id>`.
- `variants-src/<id>/` — one Vite app per system. Each keeps `public/lab-bridge.js` and its `<script>` tag in `index.html`, which lets the viewer set theme, brand overrides and synced actions.
- `site/` — the viewer (`index.html`, a fragment) and the built variants in `site/variants/<id>/`. Built variants are committed because Pages deploys them as they are.
- `scripts/build-all.sh` — builds the baseline and every variant into `site/variants/`.
- `scripts/wrap.py` — wraps the viewer fragment in a full HTML document.
- `bench/` — the Playwright benchmark (`bench.cjs`), idle-CPU and downloaded-font checks, the synced-action test and the Report code (`report-v2.js`, `report-v2.css`, applied with `apply-report-v2.py`).
- `review/` — the final review (`final.json`), metrics, the blind-judging brief and scores (`blind/`) and earlier rounds (`history/`).
- `notes/` — a private working copy of the viewer with round history and a real-device benchmark page.

## Running it

```sh
./scripts/build-all.sh                 # build every version into site/variants/
python3 -m http.server 4174 -d site    # then open http://localhost:4174
node bench/bench.cjs <id> review/out/<id> 3   # benchmark one version (serve site/ on 4174 first)
```

Pushing to `main` deploys the site with GitHub Pages (`.github/workflows/pages.yml`).
