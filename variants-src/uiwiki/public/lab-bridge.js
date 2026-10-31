// UI Lab bridge. Do not remove or edit when creating variants.
// Lets the comparison viewer set theme, slow motion, scroll sync, brand overrides
// (primary color, font, density) and replay the same action in every variant.
(function () {
  var rate = 1, syncing = false, raf = 0;
  var root = document.documentElement;
  try {
    var q = new URLSearchParams(location.search);
    if (q.get("theme") === "dark") root.classList.add("dark");
  } catch (e) {}

  function applyRate() {
    document.getAnimations().forEach(function (a) { if (a.playbackRate !== rate) a.playbackRate = rate; });
    raf = rate === 1 ? 0 : requestAnimationFrame(applyRate);
  }

  // ---- Brand overrides -------------------------------------------------
  var FONTS = {
    inter: ["Inter", "Inter:opsz,wght@14..32,400..700"],
    geist: ["Geist", "Geist:wght@400..700"],
    plex: ["IBM Plex Sans", "IBM+Plex+Sans:wght@400;500;600;700"],
    manrope: ["Manrope", "Manrope:wght@400..700"],
    "dm-sans": ["DM Sans", "DM+Sans:opsz,wght@9..40,400..700"],
    "source-serif": ["Source Serif 4", "Source+Serif+4:opsz,wght@8..60,400..700", "ui-serif, Georgia, serif"],
  };
  var styleEl = null, fontLink = null;
  function luminance(hex) {
    var n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (v) {
      v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function applyBrand(b) {
    var css = "";
    if (b.primary) {
      var fg = luminance(b.primary) > 0.4 ? "#111111" : "#ffffff";
      var vars = "--primary:" + b.primary + ";--primary-foreground:" + fg + ";--fluid-accent:" + b.primary + ";--sidebar-primary:" + b.primary + ";";
      css += ":root,:root.dark,.dark{" + vars + "}";
    }
    if (b.font && FONTS[b.font]) {
      var f = FONTS[b.font];
      if (!fontLink) { fontLink = document.createElement("link"); fontLink.rel = "stylesheet"; document.head.appendChild(fontLink); }
      fontLink.href = "https://fonts.googleapis.com/css2?family=" + f[1] + "&display=swap";
      var stack = "\"" + f[0] + "\", " + (f[2] || "ui-sans-serif, system-ui, sans-serif");
      css += ":root{--font-sans:" + stack + ";--default-font-family:" + stack + "}body,body *:not(svg):not(svg *){font-family:" + stack + "}";
    }
    if (b.density === "compact") css += ":root{--spacing:0.2rem}";
    if (b.density === "comfortable") css += ":root{--spacing:0.3rem}";
    if (!styleEl) { styleEl = document.createElement("style"); styleEl.id = "lab-brand"; document.head.appendChild(styleEl); }
    styleEl.textContent = css;
    if (b.density) root.setAttribute("data-density", b.density); else root.removeAttribute("data-density");
  }

  // ---- Synced actions --------------------------------------------------
  // Each action first looks for a [data-lab] hook, then falls back to the
  // element's accessible name so it still works on variants that rewrote markup.
  var ACTIONS = {
    "dialog": { lab: "new-project", name: /new project/i },
    "menu": { name: /^actions for/i },
    "toast": { name: /success toast/i },
    "tab": { tab: true },
    "task-add": { lab: "task-add", name: /^add$/i },
    "task-complete": { lab: "task-complete" },
    "task-remove": { lab: "task-remove" },
    "task-move": { lab: "task-move" },
    "task-sort": { lab: "task-sort", name: /sort/i },
    "sheet": { lab: "sheet", name: /project details/i },
    "popover": { lab: "popover", name: /^filter/i },
    "combobox": { lab: "combobox" },
    "command": { lab: "command", name: /command menu/i },
    "save-fail": { lab: "save-fail", name: /raise by/i },
    "retry": { lab: "retry", name: /^retry$/i },
    "offline": { lab: "offline" },
    "reload": { lab: "reload", name: /^reload$/i },
    "ledger-sort": { lab: "ledger-sort" },
    "ledger-filter": { lab: "ledger-filter" },
    "ledger-empty": { lab: "ledger-empty" },
    "ledger-clear": { lab: "ledger-clear" },
    "ledger-next": { lab: "ledger-next", name: /^next( page)?$/i },
    "wizard-fill": { lab: "wizard-fill" },
    "wizard-invalid": { lab: "wizard-invalid" },
    "wizard-next": { lab: "wizard-next" },
    "wizard-back": { lab: "wizard-back" },
    "wizard-cancel": { lab: "wizard-cancel" },
  };
  function accName(el) {
    return (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim();
  }
  function findEl(spec) {
    if (spec.lab) { var hit = document.querySelector('[data-lab="' + spec.lab + '"]'); if (hit) return hit; }
    if (spec.tab) {
      var tabs = [].slice.call(document.querySelectorAll('[role="tab"]'));
      var cur = tabs.findIndex(function (t) { return t.getAttribute("aria-selected") === "true"; });
      return tabs.length ? tabs[(cur + 1) % Math.min(tabs.length, 3)] : null;
    }
    if (spec.name) {
      var els = [].slice.call(document.querySelectorAll('button, [role="button"], [role="combobox"], a'));
      return els.find(function (el) { return spec.name.test(accName(el)); }) || null;
    }
    return null;
  }
  function press(el) {
    var o = { bubbles: true, cancelable: true, button: 0, pointerType: "mouse", isPrimary: true };
    el.dispatchEvent(new PointerEvent("pointerdown", o));
    el.dispatchEvent(new MouseEvent("mousedown", o));
    el.dispatchEvent(new PointerEvent("pointerup", o));
    el.dispatchEvent(new MouseEvent("mouseup", o));
    el.click();
  }
  function runAction(name) {
    if (name === "close") {
      var t = document.activeElement || document.body;
      t.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true, cancelable: true }));
      return true;
    }
    var spec = ACTIONS[name];
    var el = spec && findEl(spec);
    if (!el) return false;
    if (el.hidden || el.offsetParent === null) { el.click(); return true; }
    var r = el.getBoundingClientRect();
    if (r.top < 0 || r.bottom > innerHeight) el.scrollIntoView({ block: "center" });
    press(el);
    return true;
  }

  window.addEventListener("message", function (e) {
    var d = e.data || {};
    if (d.type === "lab:theme") root.classList.toggle("dark", d.theme === "dark");
    if (d.type === "lab:rate") {
      rate = d.rate;
      if (rate === 1) document.getAnimations().forEach(function (a) { a.playbackRate = 1; });
      else if (!raf) applyRate();
    }
    if (d.type === "lab:scroll") {
      syncing = true;
      var max = root.scrollHeight - innerHeight;
      scrollTo(0, d.ratio * max);
      setTimeout(function () { syncing = false; }, 50);
    }
    if (d.type === "lab:brand") applyBrand(d.brand || {});
    if (d.type === "lab:action") {
      var ok = runAction(d.name);
      if (parent !== window) parent.postMessage({ type: "lab:action-result", name: d.name, ok: ok }, "*");
    }
  });
  addEventListener("keydown", function (e) {
    var t = e.target, tag = t && t.tagName;
    if (parent === window || e.metaKey || e.ctrlKey || e.altKey) return;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;
    if (/^[1-9smdr]$/.test(e.key)) parent.postMessage({ type: "lab:key", key: e.key }, "*");
  });
  addEventListener("scroll", function () {
    if (syncing || parent === window) return;
    var max = root.scrollHeight - innerHeight;
    parent.postMessage({ type: "lab:scroll", ratio: max > 0 ? scrollY / max : 0 }, "*");
  }, { passive: true });
})();
