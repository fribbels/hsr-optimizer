import { Stats } from 'lib/constants'
import { ComputedStatsObject, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  findContentId,
  gpuStandardAtkFinalizer, gpuStandardAtkHealingFinalizer,
  standardAtkFinalizer, standardAtkHealingFinalizer,
} from 'lib/conditionals/conditionalUtils'
import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Luocha')
  const tHealing = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealingAbility')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 2.00, 2.16)

  const skillHealingFlat = skill(e, 800, 890)
  const skillHealingScaling = skill(e, 0.60, 0.64)

  const talentHealingFlat = talent(e, 240, 267)
  const talentHealingScaling = talent(e, 0.18, 0.192)

  const content: ContentItem[] = [
    {
      formItem: 'select',
      id: 'healingAbility',
      name: 'healingAbility',
      text: '',
      title: '',
      content: '',
      options: [
        {
          display: tHealing('Skill'),
          value: SKILL_TYPE,
          label: tHealing('Skill'),
        },
        {
          display: tHealing('Talent'),
          value: 0,
          label: tHealing('Talent'),
        },
      ],
      fullWidth: true,
    },
    {
      formItem: 'switch',
      id: 'fieldActive',
      name: 'fieldActive',
      text: t('Content.fieldActive.text'),
      title: t('Content.fieldActive.title'),
      content: t('Content.fieldActive.content'),
      // disabled: e < 1, Not disabling this one since technically the field can be active at E0
    }, {
      formItem: 'switch',
      id: 'e6ResReduction',
      name: 'e6ResReduction',
      text: t('Content.e6ResReduction.text'),
      title: t('Content.e6ResReduction.title'),
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
      healingAbility: 0,
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

      if (r.healingAbility == SKILL_TYPE) {
        x.HEAL_TYPE = SKILL_TYPE
        x.HEAL_SCALING += skillHealingScaling
        x.HEAL_FLAT += skillHealingFlat
      }
      if (r.healingAbility == 0) {
        x.HEAL_TYPE = 0
        x.HEAL_SCALING += talentHealingScaling
        x.HEAL_FLAT += talentHealingFlat
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
      standardAtkHealingFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer() + gpuStandardAtkHealingFinalizer(),
  }
}
