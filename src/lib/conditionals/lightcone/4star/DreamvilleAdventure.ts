import { BASIC_TYPE, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.DreamvilleAdventure')

  const sValues = [0.12, 0.14, 0.16, 0.18, 0.20]

  const defaults = {
    ultDmgBuff: true,
    skillDmgBuff: false,
    basicDmgBuff: false,
  }

  const teammateDefaults = {
    ultDmgBuff: true,
    skillDmgBuff: false,
    basicDmgBuff: false,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultDmgBuff: {
      lc: true,
      id: 'ultDmgBuff',
      formItem: 'switch',
      text: t('Content.ultDmgBuff.text'),
      content: t('Content.ultDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
    skillDmgBuff: {
      lc: true,
      id: 'skillDmgBuff',
      formItem: 'switch',
      text: t('Content.skillDmgBuff.text'),
      content: t('Content.skillDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
    basicDmgBuff: {
      lc: true,
      id: 'basicDmgBuff',
      formItem: 'switch',
      text: t('Content.basicDmgBuff.text'),
      content: t('Content.basicDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    ultDmgBuff: content.ultDmgBuff,
    skillDmgBuff: content.skillDmgBuff,
    basicDmgBuff: content.basicDmgBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m: Conditionals<typeof teammateContent> = action.lightConeConditionals

      buffAbilityDmg(x, BASIC_TYPE, (m.basicDmgBuff) ? sValues[s] : 0, Source.NONE)
      buffAbilityDmg(x, SKILL_TYPE, (m.skillDmgBuff) ? sValues[s] : 0, Source.NONE)
      buffAbilityDmg(x, ULT_TYPE, (m.ultDmgBuff) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
