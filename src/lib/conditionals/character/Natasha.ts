import { ComputedStatsObject, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon } from 'lib/conditionals/conditionalUtils'
import { Stats } from 'lib/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { TsUtils } from 'lib/TsUtils'
import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Natasha')
  const { basic, skill, ult } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const ultHealingFlat = ult(e, 368, 409.4)
  const ultHealingScaling = ult(e, 0.138, 0.1472)
  const skillHealingFlat = skill(e, 280, 311.5)
  const skillHealingScaling = skill(e, 0.105, 0.112)

  const content: ContentItem[] = [
    {
      formItem: 'select',
      id: 'healingAbility',
      name: 'healingAbility',
      text: t('Content.healingAbility.text'),
      title: t('Content.healingAbility.title'),
      content: t('Content.healingAbility.content'),
      options: [
        {
          display: 'Healing ability: Ult',
          value: ULT_TYPE,
          label: 'Healing ability: Ult',
        },
        {
          display: 'Healing ability: Skill',
          value: SKILL_TYPE,
          label: 'Healing ability: Skill',
        },
      ],
      fullWidth: true,
    },
  ]

  const defaults = {
    healingAbility: ULT_TYPE,
  }

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => (defaults),
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      x.BASIC_SCALING += basicScaling

      x.BASIC_TOUGHNESS_DMG += 30

      if (r.healingAbility == ULT_TYPE) {
        x.HEAL_TYPE = ULT_TYPE
        x.HEAL_SCALING += ultHealingScaling
        x.HEAL_FLAT += ultHealingFlat
      }

      if (r.healingAbility == SKILL_TYPE) {
        x.HEAL_TYPE = SKILL_TYPE
        x.HEAL_SCALING += skillHealingScaling
        x.HEAL_FLAT += skillHealingFlat
      }

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.BASIC_DMG += (e >= 6) ? 0.40 * x[Stats.HP] : 0

      x.HEAL_VALUE += x.HEAL_SCALING * x[Stats.HP] + x.HEAL_FLAT
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
