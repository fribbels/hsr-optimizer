/**
 * Schedules a callback to run after the browser's next paint.
 * Uses double requestAnimationFrame: the first fires before paint,
 * the second fires in the next frame — after the paint completes.
 */
export function afterPaint(callback: () => void) {
  requestAnimationFrame(() => requestAnimationFrame(callback))
}
