import { ComputedStatsObject, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, standardHpHealFinalizer } from 'lib/conditionals/conditionalUtils'
import { Stats } from 'lib/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { TsUtils } from 'lib/TsUtils'
import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Natasha')
  const tHeal = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealAbility')
  const { basic, skill, ult } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)

  const ultHealScaling = ult(e, 0.138, 0.1472)
  const ultHealFlat = ult(e, 368, 409.4)

  const skillHealScaling = skill(e, 0.105, 0.112)
  const skillHealFlat = skill(e, 280, 311.5)

  const content: ContentItem[] = [
    {
      formItem: 'select',
      id: 'healAbility',
      text: tHeal('Text'),
      content: tHeal('Content'),
      options: [
        { display: tHeal('Skill'), value: SKILL_TYPE, label: tHeal('Skill') },
        { display: tHeal('Ult'), value: ULT_TYPE, label: tHeal('Ult') },
      ],
      fullWidth: true,
    },
  ]

  const defaults = {
    healAbility: ULT_TYPE,
  }

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => (defaults),
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      x[Stats.OHB] += 0.10

      x.BASIC_SCALING += basicScaling

      x.BASIC_TOUGHNESS_DMG += 30

      if (r.healAbility == SKILL_TYPE) {
        x.HEAL_TYPE = SKILL_TYPE
        x.HEAL_SCALING += skillHealScaling
        x.HEAL_FLAT += skillHealFlat
      }
      if (r.healAbility == ULT_TYPE) {
        x.HEAL_TYPE = ULT_TYPE
        x.HEAL_SCALING += ultHealScaling
        x.HEAL_FLAT += ultHealFlat
      }

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.BASIC_DMG += (e >= 6) ? 0.40 * x[Stats.HP] : 0

      standardHpHealFinalizer(x)
    },
    gpuFinalizeCalculations: () => {
      return `
x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
x.HEAL_VALUE += x.HEAL_SCALING * x.HP + x.HEAL_FLAT;
if (${wgslTrue(e >= 6)}) {
  x.BASIC_DMG += 0.40 * x.HP;
}
`
    },
  }
}
