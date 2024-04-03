import { HsrElement, Trait } from 'lib/optimizer/new/stats/context'
import { StepBuilder } from 'lib/optimizer/new/step/builder'
import { Formula } from 'lib/optimizer/new/step/formula'

const unconditional = [
  {
    // 3 stack LC
    dmgBoost: 0.42,
    // LC passive
    crit: { critDmg: 0.2 },
    targetDef: { percent: -0.12 },
  },
  {
    // Talent - 180% ATK and 50% CR
    crit: { critRate: 0.5 },
    basic: { percent: { atk: 1.8 } },
  },
  {
    // Relevant traces - 37.3% Crit DMG
    crit: { critDmg: 0.373 },
    basic: {
      flat: {
        speed: 9,
      },
    },
  },
  {
    // Character base Crit
    crit: {
      critRate: 0.05,
      critDmg: 0.5,
    },
  },
]

const context = {
  basic: {
    lv: 80,
    base: {
      hp: 9999,
      atk: 1261.3,
      def: 9999,
      speed: 96,
    },
  },
  maxEnergy: 9999,
  targetBaseDef: 200 + 10 * 95,
  baseMods: {
    unconditional: unconditional,
    early: [],
    late: [],
  },
}

export const formula: Formula = Formula.create(
  [StepBuilder.damage(HsrElement.ICE, [Trait.SKILL], 2.5, 'atk').build()],
  context,
)

export const formulaWithLimit: Formula = Formula.create(
  [
    StepBuilder
      .damage(HsrElement.ICE, [Trait.SKILL], 2.5, 'atk')
      .limit({ basic: { speed: { min: 133 } } })
      .build(),
  ],
  context,
)
