// UI Lab bridge. Do not remove when creating variants.
(function () {
  var rate = 1, syncing = false, raf = 0;
  try {
    var q = new URLSearchParams(location.search);
    if (q.get("theme") === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
  function applyRate() {
    document.getAnimations().forEach(function (a) { if (a.playbackRate !== rate) a.playbackRate = rate; });
    raf = rate === 1 ? 0 : requestAnimationFrame(applyRate);
  }
  window.addEventListener("message", function (e) {
    var d = e.data || {};
    if (d.type === "lab:theme") document.documentElement.classList.toggle("dark", d.theme === "dark");
    if (d.type === "lab:rate") {
      rate = d.rate;
      if (rate === 1) document.getAnimations().forEach(function (a) { a.playbackRate = 1; });
      else if (!raf) applyRate();
    }
    if (d.type === "lab:scroll") {
      syncing = true;
      var max = document.documentElement.scrollHeight - innerHeight;
      scrollTo(0, d.ratio * max);
      setTimeout(function () { syncing = false; }, 50);
    }
  });
  addEventListener("keydown", function (e) {
    var t = e.target, tag = t && t.tagName;
    if (parent === window || e.metaKey || e.ctrlKey || e.altKey) return;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;
    if (/^[1-9smd]$/.test(e.key)) parent.postMessage({ type: "lab:key", key: e.key }, "*");
  });
  addEventListener("scroll", function () {
    if (syncing || parent === window) return;
    var max = document.documentElement.scrollHeight - innerHeight;
    parent.postMessage({ type: "lab:scroll", ratio: max > 0 ? scrollY / max : 0 }, "*");
  }, { passive: true });
})();
