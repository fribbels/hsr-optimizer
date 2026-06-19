import {
  aoe,
  ashblazingMulti,
  blast,
  single,
} from 'lib/conditionals/ashblazingCompute'
import { ASHBLAZING_ATK_STACK } from 'lib/conditionals/conditionalConstants'
import {
  describe,
  expect,
  it,
} from 'vitest'

function context(enemyCount: number) {
  return { enemyCount }
}

describe('ashblazingMulti', () => {
  describe('single-target hits', () => {
    it('1 single hit — constant across enemy counts', () => {
      const hitMulti = ashblazingMulti([single(1.00)])

      expect(hitMulti(context(1))).toBeCloseTo(0.06, 6)
      expect(hitMulti(context(3))).toBeCloseTo(0.06, 6)
      expect(hitMulti(context(5))).toBeCloseTo(0.06, 6)
    })

    it('Hook ULT — 2 single hits: 30%/70%', () => {
      const hitMulti = ashblazingMulti([single(0.30), single(0.70)])

      // stacks: 1, 2
      const expected = ASHBLAZING_ATK_STACK * (1 * 0.30 + 2 * 0.70)
      expect(hitMulti(context(1))).toBeCloseTo(expected, 6)
      expect(hitMulti(context(3))).toBeCloseTo(expected, 6)
      expect(hitMulti(context(5))).toBeCloseTo(expected, 6)
    })

    it('Moze FUA — 6 single hits', () => {
      const hitMulti = ashblazingMulti([
        single(0.08),
        single(0.08),
        single(0.08),
        single(0.08),
        single(0.08),
        single(0.60),
      ])

      // stacks: 1, 2, 3, 4, 5, 6
      const expected = ASHBLAZING_ATK_STACK * (
        1 * 0.08 + 2 * 0.08 + 3 * 0.08 + 4 * 0.08 + 5 * 0.08 + 6 * 0.60
      )
      expect(hitMulti(context(1))).toBeCloseTo(expected, 6)
      expect(hitMulti(context(3))).toBeCloseTo(expected, 6)
      expect(hitMulti(context(5))).toBeCloseTo(expected, 6)
    })

    it('Archer ULT — 15 single hits: 4%×14 + 44%', () => {
      const hitMulti = ashblazingMulti([
        ...Array(14).fill(single(0.04)),
        single(0.44),
      ])

      // stacks: 1,2,3,4,5,6,7,8,8,8,8,8,8,8,8 — caps at hit 8
      const expected = ASHBLAZING_ATK_STACK * (
        1 * 0.04 + 2 * 0.04 + 3 * 0.04 + 4 * 0.04
        + 5 * 0.04 + 6 * 0.04 + 7 * 0.04
        + 8 * 0.04 * 7
        + 8 * 0.44
      )
      expect(hitMulti(context(1))).toBeCloseTo(expected, 6)
      expect(hitMulti(context(5))).toBeCloseTo(expected, 6)
    })

    it('Ashveil ULT — 20 single hits: 5%×20', () => {
      const hitMulti = ashblazingMulti(Array(20).fill(single(0.05)))

      // stacks: 1,2,3,4,5,6,7 then 13×8 — caps at hit 8
      const expected = ASHBLAZING_ATK_STACK * (
        (1 + 2 + 3 + 4 + 5 + 6 + 7) * 0.05 + 8 * 0.05 * 13
      )
      expect(hitMulti(context(1))).toBeCloseTo(expected, 6)
      expect(hitMulti(context(5))).toBeCloseTo(expected, 6)
    })
  })

  describe('AoE hits', () => {
    it('1 AoE hit — scales with enemy count', () => {
      const hitMulti = ashblazingMulti([aoe(1.00)])

      expect(hitMulti(context(1))).toBeCloseTo(ASHBLAZING_ATK_STACK * 1, 6)
      expect(hitMulti(context(3))).toBeCloseTo(ASHBLAZING_ATK_STACK * 2, 6)
      expect(hitMulti(context(5))).toBeCloseTo(ASHBLAZING_ATK_STACK * 3, 6)
    })

    it('Himeko FUA — 4 AoE hits: 20%/20%/20%/40%', () => {
      const hitMulti = ashblazingMulti([aoe(0.20), aoe(0.20), aoe(0.20), aoe(0.40)])

      // 1 enemy: stacks 1, 2, 3, 4
      expect(hitMulti(context(1))).toBeCloseTo(
        ASHBLAZING_ATK_STACK * (1 * 0.20 + 2 * 0.20 + 3 * 0.20 + 4 * 0.40),
        6,
      )
      // 3 enemies: stacks 2, 5, 8, 8
      expect(hitMulti(context(3))).toBeCloseTo(
        ASHBLAZING_ATK_STACK * (2 * 0.20 + 5 * 0.20 + 8 * 0.20 + 8 * 0.40),
        6,
      )
      // 5 enemies: stacks 3, 8, 8, 8
      expect(hitMulti(context(5))).toBeCloseTo(
        ASHBLAZING_ATK_STACK * (3 * 0.20 + 8 * 0.20 + 8 * 0.20 + 8 * 0.40),
        6,
      )
    })

    it('Sampo ULT — 4 AoE hits: 25%×4', () => {
      const hitMulti = ashblazingMulti([aoe(0.25), aoe(0.25), aoe(0.25), aoe(0.25)])

      expect(hitMulti(context(1))).toBeCloseTo(
        ASHBLAZING_ATK_STACK * (1 * 0.25 + 2 * 0.25 + 3 * 0.25 + 4 * 0.25),
        6,
      )
      expect(hitMulti(context(3))).toBeCloseTo(
        ASHBLAZING_ATK_STACK * (2 * 0.25 + 5 * 0.25 + 8 * 0.25 + 8 * 0.25),
        6,
      )
      expect(hitMulti(context(5))).toBeCloseTo(
        ASHBLAZING_ATK_STACK * (3 * 0.25 + 8 * 0.25 + 8 * 0.25 + 8 * 0.25),
        6,
      )
    })
  })

  describe('blast hits', () => {
    it('1 blast hit — caps at 3 targets', () => {
      const hitMulti = ashblazingMulti([blast(1.00)])

      expect(hitMulti(context(1))).toBeCloseTo(ASHBLAZING_ATK_STACK * 1, 6)
      expect(hitMulti(context(3))).toBeCloseTo(ASHBLAZING_ATK_STACK * 2, 6)
      // blast hits max 3 at 5 enemies → starting stacks = ceil(3/2) = 2
      expect(hitMulti(context(5))).toBeCloseTo(ASHBLAZING_ATK_STACK * 2, 6)
    })

    it('3 blast hits — 5-enemy case matches 3-enemy case', () => {
      // Arlan ULT: 3 blast 30%/10%/60%
      const hitMulti = ashblazingMulti([blast(0.30), blast(0.10), blast(0.60)])

      // 1 enemy: stacks 1, 2, 3
      expect(hitMulti(context(1))).toBeCloseTo(
        ASHBLAZING_ATK_STACK * (1 * 0.30 + 2 * 0.10 + 3 * 0.60),
        6,
      )
      // 3 enemies: stacks 2, 5, 8
      expect(hitMulti(context(3))).toBeCloseTo(
        ASHBLAZING_ATK_STACK * (2 * 0.30 + 5 * 0.10 + 8 * 0.60),
        6,
      )
      // 5 enemies: blast only hits 3, so stacks 2, 5, 8 — same as 3 enemies
      expect(hitMulti(context(5))).toBeCloseTo(hitMulti(context(3)), 6)
    })
  })

  describe('mixed hit types', () => {
    it('Himeko ULT E6 — 1 AoE + 2 single', () => {
      const hitMulti = ashblazingMulti([aoe(5 / 9), single(2 / 9), single(2 / 9)])

      // 1 enemy: start=1(aoe), stacks 1, 2, 3
      expect(hitMulti(context(1))).toBeCloseTo(
        ASHBLAZING_ATK_STACK * (1 * 5 / 9 + 2 * 2 / 9 + 3 * 2 / 9),
        6,
      )
      // 3 enemies: start=2(aoe at 3), growth aoe→+3, single→+1 → stacks 2, 5, 6
      expect(hitMulti(context(3))).toBeCloseTo(
        ASHBLAZING_ATK_STACK * (2 * 5 / 9 + 5 * 2 / 9 + 6 * 2 / 9),
        6,
      )
      // 5 enemies: start=3(aoe at 5), growth aoe→+5, single→+1 → stacks 3, 8, 8
      expect(hitMulti(context(5))).toBeCloseTo(
        ASHBLAZING_ATK_STACK * (3 * 5 / 9 + 8 * 2 / 9 + 8 * 2 / 9),
        6,
      )
    })

    it('Saber ULT — 1 AoE + 10 single', () => {
      const hitMulti = ashblazingMulti([
        aoe(0.2029),
        ...Array(10).fill(single(0.0797)),
      ])

      // Saber weights sum to 0.9999 — normalization adjusts them slightly
      // Use precision 4 to account for the intentional normalization shift

      // 1 enemy: start=1(aoe), all growth +1 → stacks 1,2,3,4,5,6,7,8,8,8,8
      expect(hitMulti(context(1))).toBeCloseTo(
        ASHBLAZING_ATK_STACK * (
          1 * 0.2029
          + 2 * 0.0797 + 3 * 0.0797 + 4 * 0.0797 + 5 * 0.0797
          + 6 * 0.0797 + 7 * 0.0797 + 8 * 0.0797 + 8 * 0.0797
          + 8 * 0.0797 + 8 * 0.0797
        ),
        4,
      )

      // 3 enemies: start=2(aoe at 3), aoe growth +3→5, then single +1 each
      // stacks: 2, 5, 6, 7, 8, 8, 8, 8, 8, 8, 8
      expect(hitMulti(context(3))).toBeCloseTo(
        ASHBLAZING_ATK_STACK * (
          2 * 0.2029 + 5 * 0.0797 + 6 * 0.0797 + 7 * 0.0797 + 8 * 0.0797 * 7
        ),
        4,
      )

      // 5 enemies: start=3(aoe at 5), aoe growth +5→8, then all at 8
      // stacks: 3, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8
      expect(hitMulti(context(5))).toBeCloseTo(
        ASHBLAZING_ATK_STACK * (3 * 0.2029 + 8 * 0.0797 * 10),
        4,
      )
    })
  })

  describe('weight normalization', () => {
    it('normalizes weights that do not sum to 1', () => {
      const unnormalized = ashblazingMulti([single(3), single(7)])
      const normalized = ashblazingMulti([single(0.30), single(0.70)])

      expect(unnormalized(context(1))).toBeCloseTo(normalized(context(1)), 6)
      expect(unnormalized(context(3))).toBeCloseTo(normalized(context(3)), 6)
      expect(unnormalized(context(5))).toBeCloseTo(normalized(context(5)), 6)
    })

    it('leaves weights that already sum to 1 unchanged', () => {
      const hitMulti = ashblazingMulti([aoe(0.60), aoe(0.40)])

      // 1 enemy: stacks 1, 2
      expect(hitMulti(context(1))).toBeCloseTo(
        ASHBLAZING_ATK_STACK * (1 * 0.60 + 2 * 0.40),
        6,
      )
    })
  })
})
