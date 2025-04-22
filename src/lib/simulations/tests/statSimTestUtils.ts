export function expectWithinDelta(actual: number, expected: number, delta: number = 0.001): void {
  const difference = Math.abs(actual - expected)
  const pass = difference <= delta

  if (!pass) {
    throw new Error(`Expected ${actual} to be within ${delta} of ${expected} (difference: ${difference})`)
  }
}
