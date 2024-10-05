import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.Swordplay')
  const sValues = [0.08, 0.10, 0.12, 0.14, 0.16]
  const content: ContentItem[] = [{
    lc: true,
    id: 'sameTargetHitStacks',
    name: 'sameTargetHitStacks',
    formItem: 'slider',
    text: t('Content.sameTargetHitStacks.text'),
    title: t('Content.sameTargetHitStacks.title'),
    content: t('Content.sameTargetHitStacks.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    min: 0,
    max: 5,
  }]

  return {
    content: () => content,
    defaults: () => ({
      sameTargetHitStacks: 5,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.sameTargetHitStacks) * sValues[s]
    },
    finalizeCalculations: () => {
    },
  }
}
