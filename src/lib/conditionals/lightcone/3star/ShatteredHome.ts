import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ContentItem } from 'types/Conditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.ShatteredHome')
  const sValues = [0.20, 0.25, 0.30, 0.35, 0.40]
  const content: ContentItem[] = [{
    lc: true,
    id: 'enemyHp50Buff',
    name: 'enemyHp50Buff',
    formItem: 'switch',
    text: t('Content.0.text'),
    title: t('Content.0.title'),
    content: t('Content.0.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]), HpThreshold: 50 }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      enemyHp50Buff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.enemyHp50Buff) ? sValues[s] : 0
    },
    finalizeCalculations: (/* c, request */) => {
    },
  }
}
