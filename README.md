# UI System Lab

One test page ("Fieldwork", shadcn/ui defaults) rebuilt under different UI systems, compared in a viewer.

- `baseline/` — the untouched starting point. Copy it to make a variant: `cp -r baseline variants-src/<id>`.
- `variants-src/<id>/` — one Vite app per system. Each must keep `public/lab-bridge.js` and its `<script>` tag in `index.html`.
- `site/` — the viewer (`index.html`) plus built variants under `site/variants/<id>/`.
- `scripts/build-all.sh` — builds every app into `site/variants/`.

Each variant should log what it changed in `CHANGES.md`.
