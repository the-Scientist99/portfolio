/**
 * The CRT glass. Purely decorative, never interactive, hidden from AT.
 * Visibility is driven by the `crt-off` class on <html> (see settings.tsx),
 * so this component has no props and never re-renders.
 */
export function CrtOverlay() {
  return <div className="crt-overlay" aria-hidden="true" />
}
