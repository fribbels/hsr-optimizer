import {
  calculateApplicationRate,
  calculateRequiredEhr,
  type EhrCalcInputs,
} from 'lib/tabs/tabUtilities/ehrCalculations'
import {
  describe,
  expect,
  it,
} from 'vitest'

const DEFAULT_INPUTS: EhrCalcInputs = {
  effectRes: 40,
  debuffRes: 0,
  effectHitRate: 100,
  baseChance: 100,
  attempts: 1,
}

describe('calculateApplicationRate', () => {
  it('default values: 100% EHR vs 40% res, 100% base, 1 attempt', () => {
    // (100/100) * (1 + 100/100) * (1 - 40/100) * (1 - 0/100) = 1 * 2 * 0.6 * 1 = 1.2
    // trueHitRate = 100 * (1 - (max(0, 1 - 1.2))^1) = 100 * (1 - 0) = 100
    expect(calculateApplicationRate(DEFAULT_INPUTS)).toBeCloseTo(100)
  })

  it('0% EHR returns base chance adjusted for resistance', () => {
    // (100/100) * (1 + 0/100) * (1 - 40/100) * (1 - 0/100) = 0.6
    // trueHitRate = 100 * (1 - (max(0, 0.4))^1) = 60
    expect(calculateApplicationRate({ ...DEFAULT_INPUTS, effectHitRate: 0 })).toBeCloseTo(60)
  })

  it('high resistance reduces hit rate', () => {
    // (100/100) * (1 + 100/100) * (1 - 80/100) * (1 - 0/100) = 1 * 2 * 0.2 = 0.4
    // trueHitRate = 100 * (1 - 0.6^1) = 40
    expect(calculateApplicationRate({ ...DEFAULT_INPUTS, effectRes: 80 })).toBeCloseTo(40)
  })

  it('debuff resistance stacks multiplicatively', () => {
    // (100/100) * (1 + 100/100) * (1 - 40/100) * (1 - 50/100) = 1 * 2 * 0.6 * 0.5 = 0.6
    // trueHitRate = 100 * (1 - 0.4^1) = 60
    expect(calculateApplicationRate({ ...DEFAULT_INPUTS, debuffRes: 50 })).toBeCloseTo(60)
  })

  it('multiple attempts increase true hit rate', () => {
    // hitRate = 0.6 (same as 0% EHR case)
    // trueHitRate = 100 * (1 - 0.4^3) = 100 * (1 - 0.064) = 93.6
    expect(calculateApplicationRate({ ...DEFAULT_INPUTS, effectHitRate: 0, attempts: 3 })).toBeCloseTo(93.6)
  })

  it('2 attempts with 50% hit rate', () => {
    // hitRate = (100/100) * (1 + 0/100) * (1 - 50/100) * (1 - 0/100) = 0.5
    // trueHitRate = 100 * (1 - 0.5^2) = 100 * 0.75 = 75
    expect(calculateApplicationRate({ ...DEFAULT_INPUTS, effectRes: 50, effectHitRate: 0, attempts: 2 })).toBeCloseTo(75)
  })

  it('base chance below 100% scales linearly', () => {
    // (50/100) * (1 + 100/100) * (1 - 40/100) * (1 - 0/100) = 0.5 * 2 * 0.6 = 0.6
    // trueHitRate = 100 * (1 - 0.4^1) = 60
    expect(calculateApplicationRate({ ...DEFAULT_INPUTS, baseChance: 50 })).toBeCloseTo(60)
  })

  it('0% base chance results in 0% application rate', () => {
    expect(calculateApplicationRate({ ...DEFAULT_INPUTS, baseChance: 0 })).toBeCloseTo(0)
  })

  it('100% effect res results in 0% application rate', () => {
    expect(calculateApplicationRate({ ...DEFAULT_INPUTS, effectRes: 100 })).toBeCloseTo(0)
  })

  it('100% debuff res results in 0% application rate', () => {
    expect(calculateApplicationRate({ ...DEFAULT_INPUTS, debuffRes: 100 })).toBeCloseTo(0)
  })

  it('does not clamp when hitRate is very negative', () => {
    // effectRes=200 is unrealistic (UI prevents it), but the formula doesn't clamp output
    // hitRate = 1 * 2 * (1-2) * 1 = -2, trueHitRate = 100*(1 - 3^1) = -200
    expect(calculateApplicationRate({ ...DEFAULT_INPUTS, effectRes: 200 })).toBeCloseTo(-200)
  })

  it('caps at 100% when hit rate exceeds 1.0', () => {
    // Very high EHR with low resistance
    expect(calculateApplicationRate({ ...DEFAULT_INPUTS, effectRes: 0, effectHitRate: 200 })).toBeCloseTo(100)
  })
})

describe('calculateRequiredEhr', () => {
  it('returns NaN when baseChance is 0', () => {
    expect(calculateRequiredEhr({ ...DEFAULT_INPUTS, baseChance: 0, desiredHitRate: 100 })).toBeNaN()
  })

  it('returns NaN when effectRes is 100', () => {
    expect(calculateRequiredEhr({ ...DEFAULT_INPUTS, effectRes: 100, desiredHitRate: 100 })).toBeNaN()
  })

  it('returns NaN when debuffRes is 100', () => {
    expect(calculateRequiredEhr({ ...DEFAULT_INPUTS, debuffRes: 100, desiredHitRate: 100 })).toBeNaN()
  })

  it('round-trips with calculateApplicationRate', () => {
    const desiredHitRate = 80
    const requiredEhr = calculateRequiredEhr({ ...DEFAULT_INPUTS, desiredHitRate })
    expect(Number.isFinite(requiredEhr)).toBe(true)

    const achieved = calculateApplicationRate({ ...DEFAULT_INPUTS, effectHitRate: requiredEhr })
    expect(achieved).toBeCloseTo(desiredHitRate)
  })

  it('round-trips with multiple attempts', () => {
    const inputs = { ...DEFAULT_INPUTS, attempts: 3, effectRes: 30 }
    const desiredHitRate = 99
    const requiredEhr = calculateRequiredEhr({ ...inputs, desiredHitRate })
    expect(Number.isFinite(requiredEhr)).toBe(true)
    expect(requiredEhr).toBeGreaterThan(0)

    const achieved = calculateApplicationRate({ ...inputs, effectHitRate: requiredEhr })
    expect(achieved).toBeCloseTo(desiredHitRate)
  })

  it('round-trips with debuff resistance', () => {
    const inputs = { ...DEFAULT_INPUTS, debuffRes: 30, effectRes: 20 }
    const desiredHitRate = 70
    const requiredEhr = calculateRequiredEhr({ ...inputs, desiredHitRate })
    expect(Number.isFinite(requiredEhr)).toBe(true)

    const achieved = calculateApplicationRate({ ...inputs, effectHitRate: requiredEhr })
    expect(achieved).toBeCloseTo(desiredHitRate)
  })

  it('0% desired hit rate requires 0% EHR (or less)', () => {
    const required = calculateRequiredEhr({ ...DEFAULT_INPUTS, desiredHitRate: 0 })
    expect(Number.isFinite(required)).toBe(true)
    // With 0% desired, the formula yields a very low/negative EHR requirement
    expect(required).toBeLessThanOrEqual(0)
  })

  it('100% desired hit rate with 1 attempt and resistance', () => {
    // Achieving exactly 100% with 40% effect res and 1 attempt
    const required = calculateRequiredEhr({ ...DEFAULT_INPUTS, desiredHitRate: 100 })
    expect(Number.isFinite(required)).toBe(true)

    const achieved = calculateApplicationRate({ ...DEFAULT_INPUTS, effectHitRate: required })
    expect(achieved).toBeCloseTo(100)
  })

  it('lower base chance requires higher EHR', () => {
    const ehrFull = calculateRequiredEhr({ ...DEFAULT_INPUTS, baseChance: 100, desiredHitRate: 80 })
    const ehrHalf = calculateRequiredEhr({ ...DEFAULT_INPUTS, baseChance: 50, desiredHitRate: 80 })
    expect(ehrHalf).toBeGreaterThan(ehrFull)
  })

  it('more attempts require less EHR for same desired rate', () => {
    const ehr1 = calculateRequiredEhr({ ...DEFAULT_INPUTS, attempts: 1, desiredHitRate: 90 })
    const ehr3 = calculateRequiredEhr({ ...DEFAULT_INPUTS, attempts: 3, desiredHitRate: 90 })
    expect(ehr3).toBeLessThan(ehr1)
  })
})
