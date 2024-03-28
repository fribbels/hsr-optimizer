import { optimize } from 'lib/optimizer/new/optimizer'
import {
  BodyPiece,
  FeetPiece,
  HandPiece,
  HeadPiece,
  RopePiece,
  SpherePiece,
} from 'lib/optimizer/new/stats/relic'
import { expect, test } from 'vitest'
import { request } from './jingliuSetup'

test('Jingliu optimize', async () => {
  const result = await optimize(request)
  const best = result.builds[0]
  console.log(JSON.stringify(best, null, 4))
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
