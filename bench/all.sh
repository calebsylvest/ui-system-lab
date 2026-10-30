#!/usr/bin/env bash
cd "$(dirname "$0")/.."
for v in baseline fluid skills feel-better libraries ui-craft taste uiwiki ibelick emil kemiljk magicui; do
  node bench/bench.cjs $v review/out/$v 3 >> review/bench.log 2>&1
done
echo DONE >> review/bench.log
