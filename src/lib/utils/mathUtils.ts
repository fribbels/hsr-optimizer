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

export function sumArray(arr: number[]) {
  let sum = 0
  for (let i = 0; i < arr.length; i++) {
    if (!isNaN(arr[i])) {
      sum += arr[i]
    }
  }
  return sum
}

export function precisionRound(number: number, precision: number = 5): number {
  const factor = Math.pow(10, precision)
  return Math.round(number * factor) / factor
}
