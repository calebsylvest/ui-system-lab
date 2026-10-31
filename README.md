# UI System Lab

One test page ("Fieldwork", shadcn/ui defaults) rebuilt under different UI systems, compared in a viewer.

- `baseline/` — the untouched starting point. Copy it to make a variant: `cp -r baseline variants-src/<id>`.
- `variants-src/<id>/` — one Vite app per system. Each must keep `public/lab-bridge.js` and its `<script>` tag in `index.html`.
- `site/` — the viewer (`index.html`) plus built variants under `site/variants/<id>/`.
- `scripts/build-all.sh` — builds every app into `site/variants/`.

Each variant should log what it changed in `CHANGES.md`.

## Review
- `review/review.json` — scores, verdicts and ranking (shown in the viewer's Report tab).
- `review/out/<id>/` — screenshots (light, dark, phone) and benchmark metrics.
- `bench/` — the Playwright benchmark (`bench/all.sh`, serve `site/` on port 4174 first).

## Publishing
- Public report: `site/index.html` (final results only). Private notes with history and the real-device benchmark: `notes/index.html` (open with `#history` or `#bench`).
- Both are fragments; `python3 scripts/wrap.py <fragment> <out.html>` makes the full document that gets published with the `site/variants` files.
- Blind judging: `review/blind/` (brief, three judges' scores, and the code-to-system key).
