import { ComputedStatsObject, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  findContentId,
  gpuStandardHpHealingFinalizer,
  standardHpHealingFinalizer,
} from 'lib/conditionals/conditionalUtils'
import { Stats } from 'lib/constants'
import { TsUtils } from 'lib/TsUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Huohuo')
  const tHealing = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealingAbility')
  const { basic, ult, skill, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const ultBuffValue = ult(e, 0.40, 0.432)
  const basicScaling = basic(e, 0.50, 0.55)

  const skillHealingFlat = talent(e, 560, 623)
  const skillHealingScaling = talent(e, 0.21, 0.224)

  const talentHealingFlat = skill(e, 120, 133.5)
  const talentHealingScaling = skill(e, 0.045, 0.048)

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
      id: 'ultBuff',
      name: 'ultBuff',
      text: t('Content.ultBuff.text'),
      title: '',
      content: t('Content.ultBuff.content', { ultBuffValue: TsUtils.precisionRound(100 * ultBuffValue) }),
    },
    {
      formItem: 'switch',
      id: 'skillBuff',
      name: 'skillBuff',
      text: t('Content.skillBuff.text'),
      title: '',
      content: t('Content.skillBuff.content'),
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e6DmgBuff',
      name: 'e6DmgBuff',
      text: t('Content.e6DmgBuff.text'),
      title: '',
      content: t('Content.e6DmgBuff.content'),
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'ultBuff'),
    findContentId(content, 'skillBuff'),
    findContentId(content, 'e6DmgBuff'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      healingAbility: 0,
      ultBuff: true,
      skillBuff: true,
      e6DmgBuff: true,
    }),
    teammateDefaults: () => ({
      ultBuff: true,
      skillBuff: true,
      e6DmgBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      // Scaling
      x.BASIC_SCALING += basicScaling

      x.BASIC_TOUGHNESS_DMG += 30

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

      x[Stats.ATK_P] += (m.ultBuff) ? ultBuffValue : 0
      x[Stats.SPD_P] += (e >= 1 && m.skillBuff) ? 0.12 : 0

      x.ELEMENTAL_DMG += (e >= 6 && m.e6DmgBuff) ? 0.50 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      standardHpHealingFinalizer(x)
    },
    gpuFinalizeCalculations: () => {
      return gpuStandardHpHealingFinalizer()
    },
  }
}
