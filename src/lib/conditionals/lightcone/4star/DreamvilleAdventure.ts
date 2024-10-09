import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { BASIC_TYPE, ComputedStatsObject, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValues = [0.12, 0.14, 0.16, 0.18, 0.20]
  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.DreamvilleAdventure.Content')
    return [
      {
        lc: true,
        id: 'ultDmgBuff',
        name: 'ultDmgBuff',
        formItem: 'switch',
        text: t('ultDmgBuff.text'),
        title: t('ultDmgBuff.title'),
        content: t('ultDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
      },
      {
        lc: true,
        id: 'skillDmgBuff',
        name: 'skillDmgBuff',
        formItem: 'switch',
        text: t('skillDmgBuff.text'),
        title: t('skillDmgBuff.title'),
        content: t('skillDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
      }, {
        lc: true,
        id: 'basicDmgBuff',
        name: 'basicDmgBuff',
        formItem: 'switch',
        text: t('basicDmgBuff.text'),
        title: t('basicDmgBuff.title'),
        content: t('basicDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
      },
    ]
  })()

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
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      buffAbilityDmg(x, BASIC_TYPE, sValues[s], (m.basicDmgBuff))
      buffAbilityDmg(x, SKILL_TYPE, sValues[s], (m.skillDmgBuff))
      buffAbilityDmg(x, ULT_TYPE, sValues[s], (m.ultDmgBuff))
    },
    finalizeCalculations: () => {
    },
  }
}
