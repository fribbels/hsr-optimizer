import {
  AHA_BASE_SPEED,
  calculateAhaSpeed,
  calculateNextTeammateSpeed,
  speedToContributionMultiplier,
} from 'lib/tabs/tabCalculators/ahaCalculations'
import {
  describe,
  expect,
  it,
} from 'vitest'

interface AhaContribution {
  rank: number
  speed: number
  multiplier: number
  contribution: number
}

function calculateContributions(speeds: Array<number>): AhaContribution[] {
  const sorted = [...speeds].sort((a, b) => b - a)
  return sorted.map((speed, idx) => {
    const multiplier = speedToContributionMultiplier(idx)
    return {
      rank: idx,
      speed,
      multiplier,
      contribution: speed * multiplier,
    }
  })
}

describe('speedToContributionMultiplier', () => {
  it('returns correct weights for ranks 0-3', () => {
    expect(speedToContributionMultiplier(0)).toBeCloseTo(1 / 5)
    expect(speedToContributionMultiplier(1)).toBeCloseTo(1 / 10)
    expect(speedToContributionMultiplier(2)).toBeCloseTo(1 / 20)
    expect(speedToContributionMultiplier(3)).toBeCloseTo(1 / 40)
  })

  it('clamps at rank 3 for higher ranks', () => {
    expect(speedToContributionMultiplier(4)).toBeCloseTo(1 / 40)
    expect(speedToContributionMultiplier(10)).toBeCloseTo(1 / 40)
  })
})

describe('calculateAhaSpeed', () => {
  it('returns base speed with no teammates', () => {
    expect(calculateAhaSpeed([])).toBe(AHA_BASE_SPEED)
  })

  it('single teammate at 200 speed', () => {
    // 80 + 200/5 = 80 + 40 = 120
    expect(calculateAhaSpeed([200])).toBeCloseTo(120)
  })

  it('two teammates', () => {
    // sorted: [200, 100]
    // 80 + 200/5 + 100/10 = 80 + 40 + 10 = 130
    expect(calculateAhaSpeed([200, 100])).toBeCloseTo(130)
  })

  it('four teammates, applies weighted formula', () => {
    // sorted: [200, 160, 140, 100]
    // 80 + 200/5 + 160/10 + 140/20 + 100/40
    // = 80 + 40 + 16 + 7 + 2.5 = 145.5
    expect(calculateAhaSpeed([200, 160, 140, 100])).toBeCloseTo(145.5)
  })

  it('sorts speeds descending before applying weights', () => {
    // [100, 200] sorted => [200, 100]
    // 80 + 200/5 + 100/10 = 130
    expect(calculateAhaSpeed([100, 200])).toBeCloseTo(130)
    // Same result regardless of input order
    expect(calculateAhaSpeed([100, 200])).toBeCloseTo(calculateAhaSpeed([200, 100]))
  })

  it('does not mutate the input array', () => {
    const speeds = [100, 200, 150]
    const copy = [...speeds]
    calculateAhaSpeed(speeds)
    expect(speeds).toEqual(copy)
  })

  it('all teammates at same speed', () => {
    // sorted: [150, 150, 150, 150]
    // 80 + 150/5 + 150/10 + 150/20 + 150/40
    // = 80 + 30 + 15 + 7.5 + 3.75 = 136.25
    expect(calculateAhaSpeed([150, 150, 150, 150])).toBeCloseTo(136.25)
  })

  it('single teammate at 0 speed', () => {
    expect(calculateAhaSpeed([0])).toBe(AHA_BASE_SPEED)
  })

  it('three teammates', () => {
    // sorted: [180, 135, 100]
    // 80 + 180/5 + 135/10 + 100/20
    // = 80 + 36 + 13.5 + 5 = 134.5
    expect(calculateAhaSpeed([180, 135, 100])).toBeCloseTo(134.5)
  })
})

describe('calculateContributions', () => {
  it('returns empty array for no speeds', () => {
    expect(calculateContributions([])).toEqual([])
  })

  it('returns single contribution for one teammate', () => {
    const result = calculateContributions([160])
    expect(result).toHaveLength(1)
    expect(result[0].rank).toBe(0)
    expect(result[0].speed).toBe(160)
    expect(result[0].multiplier).toBeCloseTo(1 / 5)
    expect(result[0].contribution).toBeCloseTo(32)
  })

  it('sorts by speed descending and assigns ranks', () => {
    const result = calculateContributions([100, 200, 150])
    expect(result).toHaveLength(3)
    expect(result[0].speed).toBe(200)
    expect(result[0].rank).toBe(0)
    expect(result[1].speed).toBe(150)
    expect(result[1].rank).toBe(1)
    expect(result[2].speed).toBe(100)
    expect(result[2].rank).toBe(2)
  })

  it('contributions sum to the non-base portion of Aha speed', () => {
    const speeds = [180, 135, 120, 100]
    const contributions = calculateContributions(speeds)
    const totalContribution = contributions.reduce((sum, c) => sum + c.contribution, 0)
    expect(totalContribution).toBeCloseTo(calculateAhaSpeed(speeds) - AHA_BASE_SPEED)
  })

  it('does not mutate input array', () => {
    const speeds = [100, 200]
    const copy = [...speeds]
    calculateContributions(speeds)
    expect(speeds).toEqual(copy)
  })
})

describe('calculateNextTeammateSpeed', () => {
  it('returns null for empty string target', () => {
    expect(calculateNextTeammateSpeed('', [100, 200])).toBeNull()
  })

  it('with no existing teammates, solves for single teammate', () => {
    // target = 120, base = 80, so need 40 from one teammate
    // 40 / (1/5) = 40 * 5 = 200
    expect(calculateNextTeammateSpeed(120, [])).toBeCloseTo(200)
  })

  it('does not mutate the input array', () => {
    const speeds = [180, 135]
    const copy = [...speeds]
    calculateNextTeammateSpeed(135, speeds)
    expect(speeds).toEqual(copy)
  })

  it('round-trips with calculateAhaSpeed for 1 existing teammate', () => {
    const existing = [180]
    const target = 130
    const needed = calculateNextTeammateSpeed(target, existing)
    expect(needed).not.toBeNull()
    const resultSpeed = calculateAhaSpeed([...existing, needed!])
    expect(resultSpeed).toBeCloseTo(target)
  })

  it('round-trips with calculateAhaSpeed for 2 existing teammates', () => {
    const existing = [180, 135]
    const target = 140
    const needed = calculateNextTeammateSpeed(target, existing)
    expect(needed).not.toBeNull()
    const resultSpeed = calculateAhaSpeed([...existing, needed!])
    expect(resultSpeed).toBeCloseTo(target)
  })

  it('round-trips with calculateAhaSpeed for 3 existing teammates', () => {
    const existing = [180, 135, 120]
    const target = 145
    const needed = calculateNextTeammateSpeed(target, existing)
    expect(needed).not.toBeNull()
    const resultSpeed = calculateAhaSpeed([...existing, needed!])
    expect(resultSpeed).toBeCloseTo(target)
  })

  it('handles case where new teammate must be fastest', () => {
    const existing = [100]
    const target = 150
    // Need a very fast teammate that becomes rank 0
    const needed = calculateNextTeammateSpeed(target, existing)
    expect(needed).not.toBeNull()
    expect(needed!).toBeGreaterThan(100)
    const resultSpeed = calculateAhaSpeed([...existing, needed!])
    expect(resultSpeed).toBeCloseTo(target)
  })

  it('handles case where new teammate is slowest', () => {
    const existing = [200]
    const target = 125
    // Current: 80 + 200/5 = 120, need +5 more
    // New teammate slots as rank 1: need * (1/10) = 5, so need = 50
    const needed = calculateNextTeammateSpeed(target, existing)
    expect(needed).not.toBeNull()
    expect(needed!).toBeLessThan(200)
    const resultSpeed = calculateAhaSpeed([...existing, needed!])
    expect(resultSpeed).toBeCloseTo(target)
  })

  it('can produce negative speed when target is unreachable', () => {
    // With 3 very slow teammates, reaching a high target may require negative speed
    const existing = [50, 50, 50]
    const target = 120
    const needed = calculateNextTeammateSpeed(target, existing)
    expect(needed).not.toBeNull()
    // Whether negative or not, the math should still round-trip
    const resultSpeed = calculateAhaSpeed([...existing, needed!])
    expect(resultSpeed).toBeCloseTo(target)
  })

  it('default form values produce expected Aha speed', () => {
    // Default: teammate0=180, teammate1=135, rest empty, desiredAha=135
    const speeds = [180, 135]
    const ahaSpeed = calculateAhaSpeed(speeds)
    // 80 + 180/5 + 135/10 = 80 + 36 + 13.5 = 129.5
    expect(ahaSpeed).toBeCloseTo(129.5)

    const needed = calculateNextTeammateSpeed(135, speeds)
    expect(needed).not.toBeNull()
    expect(calculateAhaSpeed([...speeds, needed!])).toBeCloseTo(135)
  })
})
