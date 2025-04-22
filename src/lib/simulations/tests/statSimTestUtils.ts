import { Stats } from 'lib/constants/constants'

export function expectWithinDelta(actual: number, expected: number, delta: number = 0.001): void {
  const difference = Math.abs(actual - expected)
  const pass = difference <= delta

  if (!pass) {
    throw new Error(`Expected ${actual} to be within ${delta} of ${expected} (difference: ${difference})`)
  }
}

export function testStatSpread() {
  return {
    [Stats.ATK]: 10,
    [Stats.ATK_P]: 10,
    [Stats.DEF]: 10,
    [Stats.DEF_P]: 10,
    [Stats.HP]: 10,
    [Stats.HP_P]: 10,
    [Stats.SPD]: 10,
    [Stats.CR]: 10,
    [Stats.CD]: 10,
    [Stats.EHR]: 10,
    [Stats.RES]: 10,
    [Stats.BE]: 10,
  }
}
