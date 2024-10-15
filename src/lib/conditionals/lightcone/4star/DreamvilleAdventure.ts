import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { BASIC_TYPE, ComputedStatsObject, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.DreamvilleAdventure')
  const sValues = [0.12, 0.14, 0.16, 0.18, 0.20]
  const content: ContentItem[] = [
    {
      lc: true,
      id: 'ultDmgBuff',
      name: 'ultDmgBuff',
      formItem: 'switch',
      text: t('Content.ultDmgBuff.text'),
      title: t('Content.ultDmgBuff.title'),
      content: t('Content.ultDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
    {
      lc: true,
      id: 'skillDmgBuff',
      name: 'skillDmgBuff',
      formItem: 'switch',
      text: t('Content.skillDmgBuff.text'),
      title: t('Content.skillDmgBuff.title'),
      content: t('Content.skillDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    }, {
      lc: true,
      id: 'basicDmgBuff',
      name: 'basicDmgBuff',
      formItem: 'switch',
      text: t('Content.basicDmgBuff.text'),
      title: t('Content.basicDmgBuff.title'),
      content: t('Content.basicDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  ]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      ultDmgBuff: true,
      skillDmgBuff: false,
      basicDmgBuff: false,
    }),
    teammateDefaults: () => ({
      ultDmgBuff: true,
      skillDmgBuff: false,
      basicDmgBuff: false,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals

      buffAbilityDmg(x, BASIC_TYPE, sValues[s], (m.basicDmgBuff))
      buffAbilityDmg(x, SKILL_TYPE, sValues[s], (m.skillDmgBuff))
      buffAbilityDmg(x, ULT_TYPE, sValues[s], (m.ultDmgBuff))
    },
    finalizeCalculations: () => {
    },
  }
}
