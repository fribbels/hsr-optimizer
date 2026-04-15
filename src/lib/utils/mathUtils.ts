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

export function sumArray(arr: number[]) {
  let sum = 0
  for (let i = 0; i < arr.length; i++) {
    if (!isNaN(arr[i])) {
      sum += arr[i]
    }
  }
  return sum
}

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

export function nullUndefinedToZero(x: number | null | undefined): number {
  if (x == null) return 0
  return x
}

export function precisionRound(number: number, precision: number = 5): number {
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
