const AXES = [
  ["visual", "Visual", "Hierarchy, typography, spacing and color, in light, dark and at phone width."],
  ["interaction", "Interaction", "Motion quality and restraint, feedback, overlays, list and table behavior."],
  ["accessibility", "Access.", "Focus visibility and management, keyboard paths, contrast, semantics, error messages, reduced motion."],
  ["fidelity", "Fidelity", "Everything still works as intended. Lower when the system introduced bugs or broke a layout."],
  ["productFit", "App fit", "Suits an everyday work tool rather than a marketing page. Handles real, messy content well."],
  ["performanceCost", "Perf. cost", "From the benchmark, not the judges. 5 means no measurable cost over the baseline; lower means more JavaScript, blocking time or idle CPU."],
];
const ICONS = {
  page: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  bot: '<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 8V4M8 4h8M9 13v2M15 13v2"/>',
  scale: '<path d="M12 3v18M7 21h10M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/><path d="m2 16 3-8 3 8c-.9.7-1.9 1-3 1s-2.1-.3-3-1zM16 16l3-8 3 8c-.9.7-1.9 1-3 1s-2.1-.3-3-1z"/>',
  gauge: '<path d="m12 14 4-4"/><path d="M3.3 19a10 10 0 1 1 17.4 0"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.7V17c0 .6-.5 1-1 1.2C7.9 18.8 7 20.2 7 22M14 14.7V17c0 .6.5 1 1 1.2 1.1.6 2 2 2 3.8M18 2H6v7a6 6 0 0 0 12 0z"/>',
  sparkles: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>',
  palette: '<circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 22a10 10 0 1 1 10-10c0 2.2-1.8 3-3.5 3H17a2 2 0 0 0-1.5 3.3A2 2 0 0 1 14 22z"/>',
  checks: '<path d="m3 6 1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17M11 6h10M11 12h10M11 18h10"/>',
  motion: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  boxes: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  wand: '<path d="m3 21 9-9M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M17.8 6.2 19 5M12.2 6.2 11 5"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
};
const icon = (k, cls) => '<svg class="ico ' + (cls || "") + '" viewBox="0 0 24 24" aria-hidden="true">' + ICONS[k] + "</svg>";
const GROUP_ICON = { "visual": "palette", "content": "checks", "motion": "motion", "component": "boxes", "effect": "wand" };
const groupIcon = (label) => { const l = label.toLowerCase(); return GROUP_ICON[Object.keys(GROUP_ICON).find((k) => l.includes(k))] || "layers"; };
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const nameOf = (id) => byId(id).name;
const linksOf = (id) => '<span class="links">' + (LINKS[id] || []).map(([l, u]) => '<a href="' + u + '" target="_blank" rel="noopener">' + esc(l) + "</a>").join("") + "</span>";
const groupOf = (id) => (REVIEW.groups.find((g) => g.ids.includes(id)) || {}).label || "Control";
const avgOf = (id) => { const sc = REVIEW.systems[id].scores; return AXES.reduce((a, [k]) => a + sc[k], 0) / AXES.length; };
const tone = (n) => (n >= 3.5 ? "up" : n <= 2.5 ? "down" : "flat");
const chip = (n) => '<span class="sc ' + tone(n) + '">' + n.toFixed(1) + "</span>";
const tip = (label, text, right) => '<span class="tip' + (right ? " tip-r" : "") + '" tabindex="0" data-tip="' + esc(text) + '">' + esc(label) + "</span>";

function buildReport() {
  if (reportInner.dataset.built) return;
  reportInner.dataset.built = "1";
  const order = REVIEW.ranking;
  const S = REVIEW.systems;
  const base = METRICS.baseline;
  const maxJs = Math.max(...Object.values(METRICS).map((m) => m.jsGz));
  let h = "";

  // Intro: headline, takeaways, setup
  h += '<header class="intro"><h1>Which UI system improves the page most?</h1><p class="lede">Eleven design systems and agent rule sets, each applied to the same app page by a separate AI agent, then judged blind against the untouched original.</p></header>';
  h += '<section class="takeaways">' + TAKEAWAYS.map((t) => '<div class="panel take"><div class="take-ico">' + icon(t.icon) + '</div><div><div class="take-k">' + esc(t.k) + '</div><div class="take-v">' + esc(t.v) + '</div><p class="sub">' + esc(t.d) + "</p></div></div>").join("") + "</section>";
  h += '<section><h2>The experiment</h2><div class="setup">' + SETUP.map((c) => '<div class="panel setup-card"><div class="setup-head">' + icon(c.icon) + "<strong>" + esc(c.title) + "</strong></div><ul>" + c.items.map((i) => "<li>" + esc(i) + "</li>").join("") + "</ul></div>").join("") + "</div></section>";

  // Scores
  h += '<section><div class="sec-head"><h2>Scores</h2><p class="sub">Mean of three blind judges on a 1–5 scale, where the original page scores 3 on every axis. Hover or focus a column name for what it measures. Click a row to compare that system with the original.</p><div class="legend"><span class="sc up">≥ 3.5</span> better than the original <span class="sc flat">3.0</span> about the same <span class="sc down">≤ 2.5</span> worse</div></div>';
  h += '<div class="panel tbl-wrap"><table class="scores"><thead><tr><th class="rank">#</th><th>System</th>' + AXES.map(([, l, d], i) => '<th class="ctr">' + tip(l, d, i > 3) + "</th>").join("") + '<th class="num">' + tip("Average", "Plain mean of the six scores.", true) + '</th><th class="ctr">' + tip("Judges", "Where each of the three judges ranked it, out of 11: product designer · design engineer · accessibility and UX writer.", true) + "</th><th>" + tip("Best for", "The situation where this system helped most.", true) + "</th></tr></thead><tbody>";
  order.forEach((id, i) => {
    const r = S[id], avg = avgOf(id);
    h += '<tr class="clickable" data-open="' + id + '" tabindex="0"><td class="rank"><span class="rk">' + (i + 1) + '</span></td><td class="sys-cell"><span class="sys">' + esc(nameOf(id)) + "</span> " + linksOf(id) + '<br><span class="chip">' + esc(groupOf(id)) + "</span></td>" + AXES.map(([k]) => '<td class="ctr">' + chip(r.scores[k]) + "</td>").join("") + '<td class="num"><span class="avg-cell"><span class="avg">' + avg.toFixed(2) + '</span><span class="sbar"><span style="width:' + Math.round(((avg - 1) / 4) * 100) + '%"></span></span></span></td><td class="ctr judges">' + (r.judgeRanks || []).join(" · ") + '</td><td class="wrap">' + esc(r.bestFor) + "</td></tr>";
  });
  h += "</tbody></table></div></section>";

  // Kinds of system
  h += '<section><h2>Kinds of system</h2><div class="groups">' + REVIEW.groups.map((g) => '<div class="panel group-card"><div class="group-head"><span class="group-ico">' + icon(groupIcon(g.label)) + "</span><strong>" + esc((t => t.charAt(0).toUpperCase() + t.slice(1))(g.label.replace(/^Rule skills: /, ""))) + '</strong></div><span class="kind">' + g.ids.length + (g.ids.length === 1 ? " system · " : " systems · ") + (g.label.startsWith("Rule skills") ? "agent rule sets" : g.label.startsWith("Component") ? "ships its own components" : "adds animated effects") + '</span><div class="sys-chips">' + g.ids.map((id) => '<button type="button" class="sys-chip" data-open="' + id + '">' + esc(nameOf(id)) + "</button>").join("") + "</div><p>" + esc(g.note) + "</p></div>").join("") + "</div></section>";

  // Performance
  const P = PERF_COLS;
  h += '<section><div class="sec-head"><h2>Performance</h2><div class="perf-note">' + PERF_NOTE_HTML + "</div></div>";
  h += '<div class="panel tbl-wrap"><table class="perf"><thead><tr><th>System</th>' + P.map((c, i) => '<th class="' + (c.k === "deps" ? "" : "num") + '">' + tip(c.label, c.tip, i > 3) + "</th>").join("") + "</tr></thead><tbody>";
  ["baseline", ...order].forEach((id) => {
    const m = METRICS[id];
    const hot = (v, b, f) => (v > b * f ? ' class="num bad"' : ' class="num"');
    const idleV = IDLE[id] != null ? IDLE[id] + "%" : "≈0%";
    h += '<tr class="clickable' + (id === "baseline" ? " base" : "") + '" data-open="' + id + '" tabindex="0"><td class="sys">' + esc(nameOf(id)) + '</td><td class="num"><span class="bar-cell"><span class="mini' + (m.jsGz > base.jsGz * 1.25 ? " hot" : "") + '" style="width:' + Math.round((60 * m.jsGz) / maxJs) + 'px"></span>' + m.jsGz + ' KB</span></td><td class="num">' + (m.font ? m.font + " KB" : "–") + "</td><td" + hot(m.lcp || 99999, base.lcp, 1.3) + ">" + (m.lcp ? m.lcp.toLocaleString() + " ms" : "not reached") + "</td><td" + hot(m.tbt, base.tbt, 1.5) + ">" + m.tbt.toLocaleString() + " ms</td><td" + hot(m.p95, base.p95, 2) + ">" + m.p95 + " ms</td><td" + ((IDLE[id] || 0) > 5 ? ' class="num bad"' : ' class="num"') + ">" + idleV + "</td><td>" + esc(DEPS[id] || "none") + "</td></tr>";
  });
  h += "</tbody></table></div></section>";

  // System notes
  h += '<section><h2>System notes</h2><div class="notes">' + order.map((id, i) => {
    const r = S[id], avg = avgOf(id);
    const col = (ic, title, items, cls) => '<div class="note-col ' + cls + '"><div class="lbl2">' + icon(ic) + esc(title) + "</div><ul>" + items.map((x) => "<li>" + esc(x) + "</li>").join("") + "</ul></div>";
    return '<article class="panel note"><div class="note-head"><span class="rk big">' + (i + 1) + '</span><div class="note-title"><div class="nt-row"><strong>' + esc(nameOf(id)) + "</strong>" + linksOf(id) + '</div><span class="chip">' + esc(groupOf(id)) + '</span></div><div class="note-scores">' + AXES.map(([k, l]) => '<span class="ns"><span class="ns-l">' + esc(l) + "</span>" + chip(r.scores[k]) + "</span>").join("") + '<span class="ns"><span class="ns-l">Average</span><span class="avg">' + avg.toFixed(2) + '</span></span></div></div><p class="verdict">' + esc(r.verdict) + '</p><div class="note-cols">' +
      col("eye", "Look for", r.highlights || [], "look") +
      col("alert", "Problems found", (r.issues && r.issues.length ? r.issues : ["None verified."]), "prob") +
      col("wrench", "How to improve", r.improve || [], "fix") +
      '</div><div class="note-foot"><span class="sub">Change size: ' + esc(r.effort) + ' · Judges ranked it ' + (r.judgeRanks || []).join(", ") + '</span><button type="button" class="open" data-open="' + id + '">Compare with original</button></div></article>';
  }).join("") + "</div></section>";

  h += '<section><h2>Not included</h2><div class="panel tbl-wrap"><table><tbody>' + [
    ["transitions.dev", "https://transitions.dev", "Its recipes are only on its website, which the build environment couldn’t reach."],
    ["Stageshow", "https://benji.org/stageshow", "Built for animated landing-page mockups, not for improving a working app screen."],
    ["addyosmani/agent-skills", "https://github.com/addyosmani/agent-skills", "General engineering skills. Its one frontend guide overlaps with the dedicated systems."],
    ["mattpocock/skills", "https://github.com/mattpocock/skills", "Engineering workflow skills (TDD, tickets, PRs), not UI."],
  ].map(([n, u, why]) => '<tr><td><a class="ext" href="' + u + '" target="_blank" rel="noopener">' + esc(n) + '</a></td><td style="white-space:normal">' + esc(why) + "</td></tr>").join("") + "</tbody></table></div></section>";
  reportInner.innerHTML = h;
  reportInner.addEventListener("click", (e) => { if (e.target.closest("a")) return; const t = e.target.closest("[data-open]"); if (t) openCompare(t.dataset.open); });
  reportInner.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.target.closest("a, .tip")) { const t = e.target.closest("tr[data-open]"); if (t) openCompare(t.dataset.open); } });
}

