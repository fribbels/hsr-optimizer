import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { BASIC_TYPE, ComputedStatsObject, SKILL_TYPE } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.SubscribeForMore')
  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]
  const content: ContentItem[] = [{
    lc: true,
    id: 'maxEnergyDmgBoost',
    name: 'maxEnergyDmgBoost',
    formItem: 'switch',
    text: t('Content.0.text'),
    title: t('Content.0.title'),
    content: t('Content.0.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      maxEnergyDmgBoost: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      buffAbilityDmg(x, BASIC_TYPE | SKILL_TYPE, sValues[s])
      buffAbilityDmg(x, BASIC_TYPE | SKILL_TYPE, sValues[s], (r.maxEnergyDmgBoost))
    },
    finalizeCalculations: () => {
    },
  }
}
