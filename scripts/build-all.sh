#!/usr/bin/env bash
# Build baseline and every variant into site/variants/<id>/
set -euo pipefail
cd "$(dirname "$0")/.."
build() {
  local src="$1" id="$2"
  echo "== $id"
  (cd "$src" && npm run build >/dev/null)
  rm -rf "site/variants/$id" && mkdir -p site/variants && cp -r "$src/dist" "site/variants/$id"
}
build baseline baseline
for d in variants-src/*/; do [ -d "$d" ] && build "$d" "$(basename "$d")"; done
echo "Done. Preview: npx serve site"
