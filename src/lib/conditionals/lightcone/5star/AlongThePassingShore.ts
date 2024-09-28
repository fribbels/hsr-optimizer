import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsObject, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.AlongThePassingShore')
  const sValuesDmgBoost = [0.24, 0.28, 0.32, 0.36, 0.40]
  const sValuesUltDmgBoost = [0.24, 0.28, 0.32, 0.36, 0.40]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'emptyBubblesDebuff',
      name: 'emptyBubblesDebuff',
      formItem: 'switch',
      text: t('Content.0.text'),
      title: t('Content.0.title'),
      content: t('Content.0.content', { UltDmgBoost: TsUtils.precisionRound(100 * sValuesUltDmgBoost[s]), DmgBoost: TsUtils.precisionRound(100 * sValuesDmgBoost[s]) }),
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      emptyBubblesDebuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.emptyBubblesDebuff) ? sValuesDmgBoost[s] : 0
      buffAbilityDmg(x, ULT_TYPE, sValuesUltDmgBoost[s], (r.emptyBubblesDebuff))
    },
    finalizeCalculations: () => {
    },
  }
}
