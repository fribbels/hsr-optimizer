import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsObject, DOT_TYPE } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.SolitaryHealing')
  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  const content: ContentItem[] = [{
    lc: true,
    id: 'postUltDotDmgBuff',
    name: 'postUltDotDmgBuff',
    formItem: 'switch',
    text: t('Content.0.text'),
    title: t('Content.0.title'),
    content: t('Content.0.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]), Duration: 2 }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      postUltDotDmgBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      buffAbilityDmg(x, DOT_TYPE, sValues[s], (r.postUltDotDmgBuff))
    },
    finalizeCalculations: () => {
    },
  }
}
