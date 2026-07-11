export function truncate10ths(x: number): number {
  return Math.floor(x * 10) / 10
}

export function truncate100ths(x: number): number {
  return Math.floor(x * 100) / 100
}

export function truncate1000ths(x: number): number {
  return Math.floor(x * 1000) / 1000
}

export function truncate10000ths(x: number): number {
  return Math.floor(x * 10000) / 10000
}

export function precisionRound(number: number, precision: number = 5): number {
  if (precision === 5) return Math.round(number * 1e5) / 1e5
  const factor = Math.pow(10, precision)
  return Math.round(number * factor) / factor
}

// Safe floor/ceil: bias protects against f32 rounding causing off-by-one
// when accumulated stat values land just below exact thresholds.
export function floorSafe(x: number): number {
  return Math.floor(x + 0.0001)
}
export function ceilSafe(x: number): number {
  return Math.ceil(x - 0.0001)
}
