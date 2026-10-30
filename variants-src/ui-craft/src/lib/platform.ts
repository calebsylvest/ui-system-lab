// Platform-aware shortcut labels (surface-details › Shortcuts and Platform Labels:
// show Cmd on macOS/iOS, Ctrl elsewhere).
export const isApplePlatform =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/i.test(
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform || navigator.platform || navigator.userAgent
  )

/** "⌘" on Apple platforms, "Ctrl " elsewhere. Use as `${modKey}K`. */
export const modKey = isApplePlatform ? "⌘" : "Ctrl "
