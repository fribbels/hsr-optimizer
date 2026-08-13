// @vitest-environment jsdom
import {
  getBucketIndex,
  getBucketPotential,
} from 'lib/tabs/tabRelics/relicInsightsPanel/BucketsPanel'
import { BucketPotentialMode } from 'lib/tabs/tabRelics/useRelicsTabStore'
import {
  describe,
  expect,
  it,
} from 'vitest'

const score = {
  bestPct: 53,
  averagePct: 45,
}

describe('BucketsPanel potential modes', () => {
  it('uses maximum potential for maximum mode', () => {
    expect(getBucketPotential(score, BucketPotentialMode.Maximum)).toBe(53)
    expect(getBucketIndex(score, BucketPotentialMode.Maximum)).toBe(5)
  })

  it('uses average potential for average mode', () => {
    expect(getBucketPotential(score, BucketPotentialMode.Average)).toBe(45)
    expect(getBucketIndex(score, BucketPotentialMode.Average)).toBe(4)
  })

  it('clamps values to the available bucket range', () => {
    expect(getBucketIndex({ bestPct: -1, averagePct: -1 }, BucketPotentialMode.Maximum)).toBe(0)
    expect(getBucketIndex({ bestPct: 100, averagePct: 100 }, BucketPotentialMode.Maximum)).toBe(9)
  })

  it('places exact multiples of ten in the next bucket', () => {
    expect(getBucketIndex({ bestPct: 9.99, averagePct: 9.99 }, BucketPotentialMode.Maximum)).toBe(0)
    expect(getBucketIndex({ bestPct: 10, averagePct: 10 }, BucketPotentialMode.Maximum)).toBe(1)
  })
})
