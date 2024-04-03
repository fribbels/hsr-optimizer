import { OptimizationRequest } from 'lib/optimizer/new/optimizationRequest'
import { optimize } from 'lib/optimizer/new/optimizer'
import { BodyPiece, FeetPiece, HandPiece, HeadPiece, RopePiece, SpherePiece } from 'lib/optimizer/new/stats/relic'
import { describe, expect, test } from 'vitest'
import { extended, extendedWithLimit, limited } from './jingliu'

// This test suite is very heavy, preferrably not running it on commit. The
// whole suite should take around 10s-1m depend on the machine (around 30s).
describe.concurrent('Jingliu worker test suite', () => {
  // 2024/04/03 @kamii0909: I removed vitest/web-worker so this test will never
  // work. It is here if I can find a better way to test multiple web workers.
  // Because vitest emulate workers in single thread, despite the test passing
  // every fucking manual test scenario I could imagined in a real browser, I
  // can't seem to get the test passed with vitest with higher than 1 worker. It
  // seems only the first worker is actually created.
  test.skip('should also work with web workers', async () => {
    const options: OptimizationRequest['options'] = {
      workerSize: 1,
    }
    limited.options = options
    const builds = await optimize(limited, true)

    expect(10).toEqual(builds.builds.length)
  })

  test('Jingliu limited set eff', async () => {
    const result = await optimize(limited)
    const best = result.builds[0]
    const head = best.head as HeadPiece
    expect(2.9).toBeCloseTo((head.crit?.critRate as number) * 100, 1)
    const hand = best.hand as HandPiece
    expect(7.7).toBeCloseTo((hand.basic.percent?.atk as number) * 100, 0)
    const body = best.body as BodyPiece
    expect(7.3).toBeCloseTo((body.basic?.percent?.atk as number) * 100, 1)
    const feet = best.feet as FeetPiece
    expect(22.6).toBeCloseTo((feet.crit?.critDmg as number) * 100, 0)
    const rope = best.rope as RopePiece
    expect(5.8).toBeCloseTo((rope.breakEffect as number) * 100, 1)
    const sphere = best.sphere as SpherePiece
    expect(74).toBeCloseTo(sphere.basic?.flat?.def as number, 0)
  })

  test('Jingliu extended set eff', async () => {
    const result = await optimize(extended)
    expect(result.builds.length).toEqual(10)

    const best = result.builds[0]

    expect(best.value).toBeCloseTo(45464, -1)
  })

  test('Jingliu extended set eff with 133 SPD limit', async () => {
    const result = await optimize(extendedWithLimit)

    const best = result.builds[0]

    expect(best.value).toBeCloseTo(39912, -1)
    expect(best.body?.set).toContain('Hunter')
  })
})
