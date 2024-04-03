import { EarlyConditional, FixedStat, LateConditional } from 'lib/optimizer/new/stats/conditional'
import { HsrElement, SupportedContextStat, Trait } from 'lib/optimizer/new/stats/context'
import {
  alwaysMatch,
  matchAll,
  matchByElement,
  matchByStat,
  matchByTraits,
  SupportedMatchType,
} from 'lib/optimizer/new/stats/matcher'
import { PartialModifiableStats } from 'lib/optimizer/new/stats/stat'
import { StepBuilder } from 'lib/optimizer/new/step/builder'
import { Formula } from 'lib/optimizer/new/step/formula'
import { Step } from 'lib/optimizer/new/step/step'
import { describe, expect, test } from 'vitest'

describe('Single shot damage test', () => {
  test('Jingliu one time build', () => {
    const unconditional: PartialModifiableStats[] = [
      {
        dmgBoost: 0.42,
        crit: { critRate: 0.5, critDmg: 0.2 },
        basic: { percent: { atk: 1.8 } },
        targetDef: { percent: -0.12 },
      },
      {
        crit: { critDmg: 0.373 },
      },
      {
        crit: {
          critRate: 0.05,
          critDmg: 0.5,
        },
      },
      // relics
      {
        basic: {
          flat: {
            hp: 705.6000000101048,
            def: 38.1037914,
          },
        },
        crit: {
          critRate: 0.02916,
          critDmg: 0.23976,
        },
      },
      /**
       *  "mainStat": "ATK",
          "mainValue": 352.8000000116881,
          "HP%": 0.03456,
          "ATK%": 0.07776,
          "CRIT Rate": 0.11988,
          "Effect RES": 0.03888,
       */
      {
        basic: {
          flat: {
            atk: 352.8000000116881,
          },
          percent: {
            atk: 0.07776,
            hp: 0.03456,
          },
        },
        crit: {
          critRate: 0.11988,
        },
        effectRes: 0.03888,
      },
      /**
        "mainStat": "CRIT DMG",
        "mainValue": 0.648000007029628,
        "HP": 114.3113823,
        "ATK%": 0.07344,
        "DEF%": 0.0432,
        "CRIT Rate": 0.081,
       */
      {
        crit: {
          critRate: 0.081,
          critDmg: 0.648000007029628,
        },
        basic: {
          flat: {
            hp: 114.3113823,
          },
          percent: {
            atk: 0.07344,
            def: 0.0432,
          },
        },
      },
      /**
        "mainStat": "ATK%", "mainValue": 0.43200000724755605, "ATK": 16.9350184,
        "DEF": 19.0518957, "SPD": 4, "CRIT DMG": 0.2268, */
      {
        basic: {
          percent: {
            atk: 0.43200000724755605,
          },
          flat: {
            def: 19.0518957,
            atk: 16.9350184,
            speed: 4,
          },
        },
        crit: { critDmg: 0.2268 },
        /**
         *"mainStat": "Ice DMG Boost",
          "mainValue": 0.388803014298894,
          "DEF": 74.0907055,
          "CRIT Rate": 0.05508,
          "CRIT DMG": 0.12312,
          "Effect Hit Rate": 0.0432, */
      },
      {
        crit: {
          critDmg: 0.12312,
          critRate: 0.05508,
        },
        dmgBoost: 0.388803014298894,
        basic: {
          flat: {
            def: 74.0907055,
          },
        },
      },
      /**
       *  "mainStat": "ATK%",
          "mainValue": 0.43200000724755605,
          "HP": 80.4413431,
          "CRIT Rate": 0.08424,
          "CRIT DMG": 0.10367999999999998,
          "Break Effect": 0.05832, */
      {
        crit: {
          critDmg: 0.10367999999999998,
          critRate: 0.08424,
        },
        basic: {
          flat: {
            hp: 80.4413431,
          },
          percent: {
            atk: 0.43200000724755605,
          },
        },
        breakEffect: 0.05832,
      },
    ]
    const earlySetEff = [
      // set 2 Rutilant
      new EarlyConditional(alwaysMatch(), { crit: { critRate: 0.08 } }),
      // set 2 Ice
      new EarlyConditional(matchByElement(HsrElement.ICE), { dmgBoost: 0.1 }),
      // set 4 Ice
      new EarlyConditional(alwaysMatch(), { crit: { critDmg: 0.25 } }),
    ]
    const lateSetEff = [
      // set 2 Rutilant
      new LateConditional(
        matchAll(
          matchByTraits(Trait.SKILL, Trait.NORMAL),
          matchByStat(
            SupportedContextStat.CRIT_RATE,
            SupportedMatchType.GREATER_THAN_OR_EQUAL,
            0.7,
          ),
        ),
        new FixedStat({
          dmgBoost: 0.2,
        }),
      ),
    ]

    const formula = Formula.create(
      [
        StepBuilder.damage(HsrElement.ICE, [Trait.SKILL], 2.5, 'atk')
          .averageCrit()
          .build(),
      ],
      {
        baseMods: {
          unconditional: unconditional,
          early: earlySetEff,
          late: lateSetEff,
        },
        basic: {
          base: {
            atk: 1262,
            hp: 99999,
            def: 99999,
            speed: 96,
          },
          lv: 80,
        },
        maxEnergy: 99999,
        targetBaseDef: 200 + 10 * 95,
      },
    )
    expect(44756).toBeCloseTo(formula.calculate([], [], []), -2)
  })

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
})
