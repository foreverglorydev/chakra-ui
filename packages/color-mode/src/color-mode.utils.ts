export type ColorMode = "light" | "dark"

/**
 * Credit: https://github.com/pacocoursey/next-themes/blob/master/index.tsx
 * Learn more: https://paco.sh/blog/disable-theme-transitions
 */
export function disabledAllTransition() {
  const style = document.createElement("style")
  style.appendChild(
    document.createTextNode(
      `*{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`,
    ),
  )
  document.head.appendChild(style)

  return () => {
    // Force reflow
    ;(() => window.getComputedStyle(style).top)()
    document.head.removeChild(style)
  }
}
