import { ComputedStatsObject, NONE_TYPE, SKILL_TYPE } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  findContentId,
  gpuStandardAtkFinalizer,
  gpuStandardAtkHealFinalizer,
  standardAtkFinalizer,
  standardAtkHealFinalizer,
} from 'lib/conditionals/conditionalUtils'
import { Stats } from 'lib/constants'
import { TsUtils } from 'lib/TsUtils'
import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Luocha')
  const tHeal = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealAbility')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 2.00, 2.16)

  const skillHealScaling = skill(e, 0.60, 0.64)
  const skillHealFlat = skill(e, 800, 890)

  const talentHealScaling = talent(e, 0.18, 0.192)
  const talentHealFlat = talent(e, 240, 267)

  const content: ContentItem[] = [
    {
      formItem: 'select',
      id: 'healAbility',
      text: tHeal('Text'),
      content: tHeal('Content'),
      options: [
        {
          display: tHeal('Skill'),
          value: SKILL_TYPE,
          label: tHeal('Skill'),
        },
        {
          display: tHeal('Talent'),
          value: NONE_TYPE,
          label: tHeal('Talent'),
        },
      ],
      fullWidth: true,
    },
    {
      formItem: 'switch',
      id: 'fieldActive',
      text: t('Content.fieldActive.text'),
      content: t('Content.fieldActive.content'),
      // disabled: e < 1, Not disabling this one since technically the field can be active at E0
    }, {
      formItem: 'switch',
      id: 'e6ResReduction',
      text: t('Content.e6ResReduction.text'),
      content: t('Content.e6ResReduction.content'),
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'fieldActive'),
    findContentId(content, 'e6ResReduction'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      healAbility: NONE_TYPE,
      fieldActive: true,
      e6ResReduction: true,
    }),
    teammateDefaults: () => ({
      fieldActive: true,
      e6ResReduction: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      x.BASIC_TOUGHNESS_DMG += 30
      x.ULT_TOUGHNESS_DMG += 60

      if (r.healAbility == SKILL_TYPE) {
        x.HEAL_TYPE = SKILL_TYPE
        x.HEAL_SCALING += skillHealScaling
        x.HEAL_FLAT += skillHealFlat
      }
      if (r.healAbility == NONE_TYPE) {
        x.HEAL_TYPE = NONE_TYPE
        x.HEAL_SCALING += talentHealScaling
        x.HEAL_FLAT += talentHealFlat
      }

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      x[Stats.ATK_P] += (e >= 1 && m.fieldActive) ? 0.20 : 0

      x.RES_PEN += (e >= 6 && m.e6ResReduction) ? 0.20 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject) => {
      standardAtkFinalizer(x)
      standardAtkHealFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer() + gpuStandardAtkHealFinalizer(),
  }
}
