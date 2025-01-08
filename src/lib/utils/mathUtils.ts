// 0.1, 0.2, 0.3, 0.5 => 0.15

export function scaleTowardsRange(
  value: number,
  min: number,
  max: number,
  factor: number,
): number {
  if (value < min) {
    return value + (min - value) * factor
  } else if (value > max) {
    return value - (value - max) * factor
  }
  return value
}

export function nanAsZero(n: number) {
  return isNaN(n) ? 0 : n
}
