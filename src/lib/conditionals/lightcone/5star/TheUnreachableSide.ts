import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.TheUnreachableSide')
  const sValues = [0.24, 0.28, 0.32, 0.36, 0.40]
  const content: ContentItem[] = [{
    lc: true,
    id: 'dmgBuff',
    name: 'dmgBuff',
    formItem: 'switch',
    text: t('Content.dmgBuff.text'),
    title: t('Content.dmgBuff.title'),
    content: t('Content.dmgBuff.content', { DmgBuff: TsUtils.precisionRound(sValues[s] * 100) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      dmgBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.dmgBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
