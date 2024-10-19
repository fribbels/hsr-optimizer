import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.FlamesAfar')
  const sValues = [0.25, 0.3125, 0.375, 0.4375, 0.50]
  const content: ContentItem[] = [{
    lc: true,
    id: 'dmgBuff',
    name: 'dmgBuff',
    formItem: 'switch',
    text: t('Content.dmgBuff.text'),
    title: t('Content.dmgBuff.title'),
    content: t('Content.dmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      dmgBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x.ELEMENTAL_DMG += (r.dmgBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
