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
