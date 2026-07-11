import { ASHBLAZING_ATK_STACK } from 'lib/conditionals/conditionalConstants'
import {
  aoe,
  ashblazingMulti,
  blast,
  bounce,
  outer,
  single,
} from 'lib/conditionals/ashblazingCompute'
import { describe, expect, it } from 'vitest'

const A = ASHBLAZING_ATK_STACK
function ctx(n: number) { return { enemyCount: n } }

describe('ashblazingMulti — generalized', () => {
  describe('backward compat — single', () => {
    it('1 single hit — constant across enemy counts', () => {
      const fn = ashblazingMulti([single(1.0)])
      expect(fn(ctx(1))).toBeCloseTo(A * 1, 6)
      expect(fn(ctx(3))).toBeCloseTo(A * 1, 6)
      expect(fn(ctx(5))).toBeCloseTo(A * 1, 6)
    })

    it('2 singles: 30/70', () => {
      const fn = ashblazingMulti([single(0.30), single(0.70)])
      const v = A * (1 * 0.30 + 2 * 0.70)
      expect(fn(ctx(1))).toBeCloseTo(v, 6)
      expect(fn(ctx(3))).toBeCloseTo(v, 6)
    })

    it('6 singles (Moze FUA)', () => {
      const fn = ashblazingMulti([
        single(0.08), single(0.08), single(0.08),
        single(0.08), single(0.08), single(0.60),
      ])
      const v = A * (1 * 0.08 + 2 * 0.08 + 3 * 0.08 + 4 * 0.08 + 5 * 0.08 + 6 * 0.60)
      expect(fn(ctx(1))).toBeCloseTo(v, 6)
      expect(fn(ctx(5))).toBeCloseTo(v, 6)
    })
  })

  describe('backward compat — aoe', () => {
    it('1 aoe hit — scales with enemy count', () => {
      const fn = ashblazingMulti([aoe(1.0)])
      expect(fn(ctx(1))).toBeCloseTo(A * 1, 6)
      expect(fn(ctx(3))).toBeCloseTo(A * 2, 6)
      expect(fn(ctx(5))).toBeCloseTo(A * 3, 6)
    })

    it('4 aoe hits: 20/20/20/40 (Himeko FUA)', () => {
      const fn = ashblazingMulti([aoe(0.20), aoe(0.20), aoe(0.20), aoe(0.40)])
      expect(fn(ctx(1))).toBeCloseTo(A * (1 * 0.20 + 2 * 0.20 + 3 * 0.20 + 4 * 0.40), 6)
      expect(fn(ctx(3))).toBeCloseTo(A * (2 * 0.20 + 5 * 0.20 + 8 * 0.20 + 8 * 0.40), 6)
      expect(fn(ctx(5))).toBeCloseTo(A * (3 * 0.20 + 8 * 0.20 + 8 * 0.20 + 8 * 0.40), 6)
    })
  })

  describe('backward compat — blast', () => {
    it('1 blast — caps at 3 targets', () => {
      const fn = ashblazingMulti([blast(1.0)])
      expect(fn(ctx(1))).toBeCloseTo(A * 1, 6)
      expect(fn(ctx(3))).toBeCloseTo(A * 2, 6)
      expect(fn(ctx(5))).toBeCloseTo(A * 2, 6)
    })

    it('3 blasts: 30/10/60', () => {
      const fn = ashblazingMulti([blast(0.30), blast(0.10), blast(0.60)])
      expect(fn(ctx(1))).toBeCloseTo(A * (1 * 0.30 + 2 * 0.10 + 3 * 0.60), 6)
      expect(fn(ctx(3))).toBeCloseTo(A * (2 * 0.30 + 5 * 0.10 + 8 * 0.60), 6)
      expect(fn(ctx(5))).toBeCloseTo(fn(ctx(3)), 6)
    })
  })

  describe('backward compat — mixed', () => {
    it('aoe + 2 singles (Himeko E6 ULT)', () => {
      const fn = ashblazingMulti([aoe(5 / 9), single(2 / 9), single(2 / 9)])
      expect(fn(ctx(1))).toBeCloseTo(A * (1 * 5 / 9 + 2 * 2 / 9 + 3 * 2 / 9), 6)
      expect(fn(ctx(3))).toBeCloseTo(A * (2 * 5 / 9 + 5 * 2 / 9 + 6 * 2 / 9), 6)
      expect(fn(ctx(5))).toBeCloseTo(A * (3 * 5 / 9 + 8 * 2 / 9 + 8 * 2 / 9), 6)
    })

    it('normalization — unnormalized weights match normalized', () => {
      const a = ashblazingMulti([single(3), single(7)])
      const b = ashblazingMulti([single(0.30), single(0.70)])
      expect(a(ctx(1))).toBeCloseTo(b(ctx(1)), 6)
      expect(a(ctx(3))).toBeCloseTo(b(ctx(3)), 6)
      expect(a(ctx(5))).toBeCloseTo(b(ctx(5)), 6)
    })
  })

  describe('bounce', () => {
    it('bounce(1, 1) — identical to single(1) at all enemy counts', () => {
      const fn = ashblazingMulti([bounce(1.0, 1)])
      expect(fn(ctx(1))).toBeCloseTo(A * 1, 6)
      expect(fn(ctx(3))).toBeCloseTo(A * 1, 6)
      expect(fn(ctx(5))).toBeCloseTo(A * 1, 6)
    })

    it('bounce(1, 8) — 1/N cancels, constant across enemy counts', () => {
      const fn = ashblazingMulti([bounce(1.0, 8)])
      // S=1, bounceSum(1,8) = 7×1 + 7×6/2 + 1×8 = 36
      expect(fn(ctx(1))).toBeCloseTo(A * 36 / 8, 6)
      expect(fn(ctx(3))).toBeCloseTo(A * 36 / 8, 6)
      expect(fn(ctx(5))).toBeCloseTo(A * 36 / 8, 6)
    })

    it('bounce(1, 20) — many bounces, most capped', () => {
      const fn = ashblazingMulti([bounce(1.0, 20)])
      // S=1, bounceSum(1,20): U=7, C=13 → 7+21+104=132
      expect(fn(ctx(1))).toBeCloseTo(A * 132 / 20, 6)
      expect(fn(ctx(5))).toBeCloseTo(A * 132 / 20, 6)
    })

    it('bounce already at max stacks', () => {
      const fn = ashblazingMulti([bounce(1.0, 10)])
      // S=1, bounceSum(1,10): U=7, C=3 → 7+21+24=52
      expect(fn(ctx(1))).toBeCloseTo(A * 52 / 10, 6)
    })

    it('Saber ULT — aoe(2.80) + bounce(1.10, 10) vs 1 enemy', () => {
      const fn = ashblazingMulti([aoe(2.80), bounce(1.10, 10)])
      // S0=1, aoe: 1×2.80, S→2. bounceSum(2,10): U=6, C=4 → 12+15+32=59
      expect(fn(ctx(1))).toBeCloseTo(
        A * (1 * 2.80 + 59 * 1.10) / (2.80 + 10 * 1.10), 4,
      )
    })

    it('Saber ULT — aoe(2.80) + bounce(1.10, 10) vs 3 enemies', () => {
      const fn = ashblazingMulti([aoe(2.80), bounce(1.10, 10)])
      // S0=2, aoe: 2×2.80, S→5. bounceSum(5,10): U=3, C=7 → 15+3+56=74
      expect(fn(ctx(3))).toBeCloseTo(
        A * (2 * 2.80 + 74 * 1.10 / 3) / (2.80 + 10 * 1.10 / 3), 4,
      )
    })

    it('Saber ULT — aoe(2.80) + bounce(1.10, 10) vs 5 enemies', () => {
      const fn = ashblazingMulti([aoe(2.80), bounce(1.10, 10)])
      // S0=3, aoe: 3×2.80, S→8. bounceSum(8,10): U=0, C=10 → 80
      expect(fn(ctx(5))).toBeCloseTo(
        A * (3 * 2.80 + 80 * 1.10 / 5) / (2.80 + 10 * 1.10 / 5), 4,
      )
    })

    it('single + bounce — stacks carry over', () => {
      const fn = ashblazingMulti([single(1.0), bounce(1.0, 5)])
      // S0=1, single: 1×1.0, S→2. bounceSum(2,5): U=5, C=0 → 10+10=20
      // 1 enemy: wEff=1, total = A * (1+20)/(1+5) = A*21/6
      expect(fn(ctx(1))).toBeCloseTo(A * 21 / 6, 6)
      // 3 enemies: wEff=1/3, total = A * (1+20/3)/(1+5/3) = A * (23/3)/(8/3) = A*23/8
      expect(fn(ctx(3))).toBeCloseTo(A * 23 / 8, 6)
    })
  })

  describe('outer', () => {
    it('outer only — returns 0 (no primary target damage)', () => {
      const fn = ashblazingMulti([outer()])
      expect(fn(ctx(1))).toBe(0)
      expect(fn(ctx(3))).toBe(0)
      expect(fn(ctx(5))).toBe(0)
    })

    it('outer at 1 enemy — no-op (N-1 = 0 targets)', () => {
      const fn = ashblazingMulti([outer(), single(1.0)])
      // S_init=ceil(0/2)=0, outer grows 0, single sees S=0
      expect(fn(ctx(1))).toBeCloseTo(0, 6)
    })

    it('outer + single — builds stacks for single', () => {
      const fn = ashblazingMulti([outer(), single(1.0)])
      // 3 enemies: S_init=ceil(2/2)=1, outer +2→S=3, single sees 3
      expect(fn(ctx(3))).toBeCloseTo(A * 3, 6)
      // 5 enemies: S_init=ceil(4/2)=2, outer +4→S=6, single sees 6
      expect(fn(ctx(5))).toBeCloseTo(A * 6, 6)
    })

    it('aoe + outer — outer after only weighted hit has no effect', () => {
      const aoeOnly = ashblazingMulti([aoe(1.0)])
      const aoeExcept = ashblazingMulti([aoe(1.0), outer()])
      expect(aoeExcept(ctx(1))).toBeCloseTo(aoeOnly(ctx(1)), 6)
      expect(aoeExcept(ctx(3))).toBeCloseTo(aoeOnly(ctx(3)), 6)
      expect(aoeExcept(ctx(5))).toBeCloseTo(aoeOnly(ctx(5)), 6)
    })

    it('outer + aoe — builds stacks before aoe', () => {
      const fn = ashblazingMulti([outer(), aoe(1.0)])
      // 1 enemy: S_init=0, outer +0→0, aoe sees 0
      expect(fn(ctx(1))).toBeCloseTo(0, 6)
      // 3 enemies: S_init=1, outer +2→3, aoe sees 3
      expect(fn(ctx(3))).toBeCloseTo(A * 3, 6)
      // 5 enemies: S_init=2, outer +4→6, aoe sees 6
      expect(fn(ctx(5))).toBeCloseTo(A * 6, 6)
    })

    it('multiple outers stack growth', () => {
      const fn = ashblazingMulti([outer(), outer(), single(1.0)])
      // 5 enemies: S_init=2, outer +4→6, outer +4→8(capped), single sees 8
      expect(fn(ctx(5))).toBeCloseTo(A * 8, 6)
    })
  })

  describe('mixed — all types', () => {
    it('aoe + outer + bounce', () => {
      const fn = ashblazingMulti([aoe(2.0), outer(), bounce(1.0, 5)])

      // 3 enemies: S0=2, aoe: 2×2.0=4, S→5
      //   outer: +2→S=7
      //   bounceSum(7,5): U=1, C=4 → 7+0+32=39, wEff=1/3
      //   total = A * (4 + 39/3) / (2 + 5/3) = A * 51/3 / (11/3) = A * 51/11
      expect(fn(ctx(3))).toBeCloseTo(A * 51 / 11, 4)

      // 5 enemies: S0=3, aoe: 3×2.0=6, S→8
      //   outer: +4→8 (capped)
      //   bounceSum(8,5): U=0, C=5 → 40, wEff=1/5
      //   total = A * (6 + 40/5) / (2 + 5/5) = A * 14/3
      expect(fn(ctx(5))).toBeCloseTo(A * 14 / 3, 4)
    })

    it('single + blast + outer + bounce', () => {
      const fn = ashblazingMulti([single(1.0), blast(1.0), outer(), bounce(1.0, 4)])

      // 1 enemy: S0=1, single: 1×1, S→2
      //   blast: 2×1, S→3
      //   outer: +0→3
      //   bounceSum(3,4): U=4, C=0 → 12+6=18, wEff=1
      //   total = A * (1+2+18) / (1+1+4) = A * 21/6
      expect(fn(ctx(1))).toBeCloseTo(A * 21 / 6, 4)

      // 5 enemies: S0=1, single: 1×1, S→2
      //   blast: 2×1, S→5
      //   outer: +4→8(capped)
      //   bounceSum(8,4): U=0, C=4 → 32, wEff=1/5
      //   total = A * (1+2+32/5) / (1+1+4/5) = A * (47/5) / (14/5) = A * 47/14
      expect(fn(ctx(5))).toBeCloseTo(A * 47 / 14, 4)
    })

    it('outer + bounce — outer supercharges bounce stacks', () => {
      const fn = ashblazingMulti([outer(), bounce(1.0, 5)])

      // 1 enemy: S_init=0, outer +0→0, bounceSum(0,5): U=5, C=0 → 0+10=10, wEff=1
      //   total = A * 10/5 = A * 2
      expect(fn(ctx(1))).toBeCloseTo(A * 2, 6)

      // 5 enemies: S_init=2, outer +4→6, bounceSum(6,5): U=2, C=3 → 12+1+24=37, wEff=1/5
      //   total = A * (37/5)/(5/5) = A * 37/5
      expect(fn(ctx(5))).toBeCloseTo(A * 37 / 5, 4)
    })
  })

  describe('edge cases', () => {
    it('bounce starting at max stacks — all capped', () => {
      // aoe at 5 enemies: S_init=3, aoe +5→8. Then bounce starts at 8.
      const fn = ashblazingMulti([aoe(1.0), bounce(1.0, 10)])
      // bounceSum(8,10): U=0, C=10 → 80, wEff=1/5
      // total = A * (3 + 80/5) / (1 + 10/5) = A * 19/3
      expect(fn(ctx(5))).toBeCloseTo(A * 19 / 3, 4)
    })

    it('weight normalization still works with bounce', () => {
      const a = ashblazingMulti([aoe(5.60), bounce(2.20, 10)])
      const b = ashblazingMulti([aoe(2.80), bounce(1.10, 10)])
      expect(a(ctx(1))).toBeCloseTo(b(ctx(1)), 4)
      expect(a(ctx(3))).toBeCloseTo(b(ctx(3)), 4)
      expect(a(ctx(5))).toBeCloseTo(b(ctx(5)), 4)
    })
  })
})
