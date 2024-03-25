import { Formula } from 'lib/optimizer/new/step/formula'
import { EarlyConditional } from 'lib/optimizer/new/stats/conditional'
import { Trait } from 'lib/optimizer/new/stats/context'
import { HsrElement } from 'lib/optimizer/new/stats/context'
import { matchByElement, matchByTraits } from 'lib/optimizer/new/stats/matcher'
import { PartialModifiableStats } from 'lib/optimizer/new/stats/stat'
import { StepBuilder } from 'lib/optimizer/new/step/builder'
import { Step } from 'lib/optimizer/new/step/step'
import { test, expect } from 'vitest'

/**
 * Setup: A Yanqing lv 80 on Forgotten Hall 2 (enemy lv70) with Ice Weakness.
 * FYI, the current (2024/03/09) Forgotten Hall buff is 50% DMG Bonus on Normal
 * Attack/Skills.
 * Give Yanqing a Ting Yun E lv 12 buff (which is 55% ATK).
 */

/**
 * Create a single step that is nothing but a Normal Attack.
 */
const step = StepBuilder.damage(HsrElement.ICE, [Trait.NORMAL], 1, 'atk')
  .neverCrit()
  .build()

// let's assume tingyun is not the problem
const tingYunEBuff: PartialModifiableStats = {
  basic: { percent: { atk: 0.55 } },
}

const forgottenHallBuff = new EarlyConditional(
  matchByTraits(Trait.SKILL, Trait.NORMAL),
  { dmgBoost: 0.5 },
)

const yanqingTraceDmg = new EarlyConditional(matchByElement(HsrElement.ICE), {
  dmgBoost: 0.144,
})

// Enemy is not weak to Lightning
const enemyRes = new EarlyConditional(matchByElement(HsrElement.LIGHTING), {
  res: 0.2,
})

const yanqingTraces: PartialModifiableStats = {
  basic: {
    percent: {
      atk: 0.28,
    },
  },
}

test('Yanqing NA Basic', () => {
  // Create a formula with a single step, Yanqing A
  const formula = Formula.create([step], {
    baseMods: {
      unconditional: [tingYunEBuff, yanqingTraces],
      early: [yanqingTraceDmg, enemyRes, forgottenHallBuff],
      late: [],
    },
    basic: {
      base: {
        atk: 679,
        // Irrelevant
        def: 10000,
        speed: 10000,
        hp: 10000,
      },
      lv: 80,
    },
    maxEnergy: 10000, // Irrelevant
    targetBaseDef: 200 + 70 * 10,
  })
  expect(967).toBeCloseTo(formula.calculate([], [], []), -1)
})

test('Addtional damage with Ting Yun', () => {
  // Ting Yun E lets Yanqing deals an additional instance of Lightning (no
  // weakness).
  // Note that E4 Ting Yun increase 20%, so 44 -> 64
  const addtional: Step = StepBuilder.damage(
    HsrElement.LIGHTING,
    [],
    0.64,
    'atk',
  )
    .neverCrit()
    .build()

  // Except the added step, everything else is the same, I probably could
  // refine some support in this, but for now deal with it.
  const formula = Formula.create([step, addtional], {
    baseMods: {
      unconditional: [tingYunEBuff, yanqingTraces],
      early: [yanqingTraceDmg, enemyRes, forgottenHallBuff],
      late: [],
    },
    basic: {
      base: {
        atk: 679,
        // Irrelevant
        def: 10000,
        speed: 10000,
        hp: 10000,
      },
      lv: 80,
    },
    maxEnergy: 10000, // Irrelevant
    targetBaseDef: 200 + 70 * 10,
  })

  expect(967 + 301).toBeCloseTo(formula.calculate([], [], []), -1)
})
