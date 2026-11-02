import json, sys
final = json.load(open("review/final.json"))
js = open("bench/report-v2.js").read()
css = open("bench/report-v2.css").read()
data = {
 "TAKEAWAYS": [
  {"icon": "trophy", "k": "Most improved", "v": "kemiljk skills", "d": "Handled messy data and edge cases in plain language, with no added weight. Two of three judges put it in their top two."},
  {"icon": "sparkles", "k": "Best redesign", "v": "taste-skill", "d": "The only system that gave the app a new look: a sidebar shell, a summary that leads with what needs attention, and clean contrast."},
  {"icon": "alert", "k": "Costliest", "v": "libraries.dev and Fluid", "d": "libraries.dev kept about a third of the main thread busy at idle. Fluid added about 108 KB of JavaScript and 332 KB of fonts, and lost input borders."},
 ],
 "SETUP": [
  {"icon": "page", "title": "The test page", "items": ["Fieldwork, a fictional studio tool built with React, Tailwind and stock shadcn/ui.", "Dashboard cards, tabs, a task list, overlays, async states, a messy data table, a 3-step form, an AI chat panel and settings.", "Same data and features in every version."]},
  {"icon": "layers", "title": "The systems", "items": ["8 agent rule sets, 1 component library and 2 effect packs.", "Chosen because each claims to make interfaces better, and each could run on this stack.", "4 others were left out; see Not included."]},
  {"icon": "bot", "title": "How each was applied", "items": ["One AI agent per system, reading only that system’s own docs.", "Agents could change look, motion and copy, but not remove features or data.", "Each logged every change and the rule behind it."]},
  {"icon": "scale", "title": "Judging", "items": ["Three judges with different lenses: product design, design engineering, and accessibility and UX writing.", "Blind: versions were labelled A to M with system names removed.", "Each scored five axes against the original at 3, using screenshots and live checks of focus, keyboard, motion and every state."]},
  {"icon": "gauge", "title": "Performance", "items": ["A scripted session that touches every section, run 3 times per version.", "Headless Chromium, CPU slowed 4×, no GPU.", "Scored relative to the original, not as real-world numbers."]},
  {"icon": "shield", "title": "Constraints and choices", "items": ["Built in a sandbox that couldn’t reach some sites, so registries were served from their GitHub sources.", "Agents couldn’t see the rendered page; judges did the visual checks.", "Scores are judgement: treat differences under about 0.2 as ties."]},
 ],
 "PERF_COLS": [
  {"k": "js", "label": "JS (gzip)", "tip": "Compressed JavaScript the page loads at startup. The original is 152 KB. Code split off to load only on demand, like Fluid’s pdf.js, isn’t counted."},
  {"k": "font", "label": "Font files", "tip": "Size of the font files the system added. Browsers only load the subsets a page uses."},
  {"k": "lcp", "label": "LCP", "tip": "Largest Contentful Paint: when the biggest visible element finished drawing. Lower is better."},
  {"k": "tbt", "label": "Blocking time", "tip": "Total time the main thread was blocked by long tasks during load, so the page couldn’t respond. Lower is better."},
  {"k": "p95", "label": "p95 frame", "tip": "95th-percentile frame time during the scripted session. 17 ms is a smooth 60 fps; 33 ms means some dropped frames under the 4× CPU slowdown."},
  {"k": "idle", "label": "Idle CPU", "tip": "Share of the main thread still busy when nobody touches the page. Anything above a few percent drains battery and slows other work."},
  {"k": "deps", "label": "Added dependencies", "tip": "Packages and fonts the system added to the project."},
 ],
 "PERF_NOTE_HTML": "<p>How heavy each version is compared with the original. Red marks a clear regression.</p><ul><li>Measured in headless Chromium with the CPU slowed 4× and no GPU, so absolute numbers run high. Compare each row with the original.</li><li>Each figure is the median of 3 runs of a scripted session that opens every overlay, edits the list, fails a save, sorts the table and walks the form.</li><li>Rule-set systems add almost nothing. The cost comes from libraries that ship their own components or animation engines.</li></ul>",
}
for path in sys.argv[1:]:
    s = open(path).read()
    a = s.index("const AXES = [")
    ends = [i for i in (s.find("\n// ---------- History", a), s.find("function openCompare(id)", a)) if i != -1]
    b = min(ends)
    s = s[:a] + js + s[b:]
    for k, v in data.items():
        if f"const {k} = " in s:
            i = s.index(f"const {k} = "); j = s.index(";\n", i); s = s[:i] + f"const {k} = " + json.dumps(v, ensure_ascii=False) + s[j:]
        else:
            s = s.replace("const LINKS = ", f"const {k} = " + json.dumps(v, ensure_ascii=False) + ";\nconst LINKS = ", 1)
    i = s.index("const REVIEW = "); j = s.index(";\n", i); s = s[:i] + "const REVIEW = " + json.dumps(final, ensure_ascii=False) + s[j:]
    if "/* report-v2 */" in s:
        i = s.index("/* report-v2 */"); j = s.index("/* /report-v2 */") + len("/* /report-v2 */"); s = s[:i] + s[j:]
    s = s.replace("</style>", "/* report-v2 */\n" + css + "/* /report-v2 */\n</style>", 1)
    open(path, "w").write(s)
    print("patched", path)
