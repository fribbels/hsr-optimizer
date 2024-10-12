import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Swordplay')
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
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x.ELEMENTAL_DMG += (r.sameTargetHitStacks) * sValues[s]
    },
    finalizeCalculations: () => {
    },
  }
}
