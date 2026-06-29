import { truncate10ths } from 'lib/utils/mathUtils'

// Single shared rule for every number displayed in the AV Visualizer (energy, SPD, ERR, AV, etc.):
// truncate — never round — to 1 decimal place, e.g. 36.5999 → "36.5". toFixed(1) on the truncated
// value (rather than on the raw value) guarantees the display always shows exactly 1 decimal digit
// without ever rounding the dropped digits up.
export function formatAvNumber(value: number): string {
  return truncate10ths(value).toFixed(1)
}
