import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.WoofWalkTime')
  const sValues = [0.16, 0.20, 0.24, 0.28, 0.32]
  const content: ContentItem[] = [{
    lc: true,
    id: 'atkBoost',
    name: 'atkBoost',
    formItem: 'switch',
    text: t('Content.atkBoost.text'),
    title: t('Content.atkBoost.title'),
    content: t('Content.atkBoost.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      enemyBurnedBleeding: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.enemyBurnedBleeding) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
