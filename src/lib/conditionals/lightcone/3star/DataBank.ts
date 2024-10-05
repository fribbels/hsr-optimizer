import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsObject, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.DataBank')
  const sValues = [0.28, 0.35, 0.42, 0.49, 0.56]
  const content: ContentItem[] = [{
    lc: true,
    id: 'ultDmgBuff',
    name: 'ultDmgBuff',
    formItem: 'switch',
    text: t('Content.ultDmgBuff.text'),
    title: t('Content.ultDmgBuff.title'),
    content: t('Content.ultDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      ultDmgBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      buffAbilityDmg(x, ULT_TYPE, sValues[s], (r.ultDmgBuff))
    },
    finalizeCalculations: () => {
    },
  }
}
