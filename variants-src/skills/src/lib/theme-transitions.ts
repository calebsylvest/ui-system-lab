// better-ui "Suppress transitions on theme switch": the lab bridge flips the `.dark`
// class on <html>. Before the next style recalc, turn every transition off, force a
// flush so the new colors commit, then restore transitions after the next frame.
export function suppressTransitionsOnThemeChange() {
  const root = document.documentElement
  let wasDark = root.classList.contains("dark")

  new MutationObserver(() => {
    const isDark = root.classList.contains("dark")
    if (isDark === wasDark) return
    wasDark = isDark

    const style = document.createElement("style")
    style.append(document.createTextNode("*,*::before,*::after{transition:none !important}"))
    document.head.append(style)
    void document.body.offsetHeight // synchronous style flush
    requestAnimationFrame(() => requestAnimationFrame(() => style.remove()))
  }).observe(root, { attributes: true, attributeFilter: ["class"] })
}
