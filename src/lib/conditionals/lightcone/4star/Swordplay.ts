import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Swordplay')

  const sValues = [0.08, 0.10, 0.12, 0.14, 0.16]

  const content: ContentDefinition<typeof defaults> = [
    {
      lc: true,
      id: 'sameTargetHitStacks',
      formItem: 'slider',
      text: t('Content.sameTargetHitStacks.text'),
      content: t('Content.sameTargetHitStacks.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
      min: 0,
      max: 5,
    },
  ]

  return {
    content: () => Object.values(content),
    defaults: () => ({
      sameTargetHitStacks: 5,
    }),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.ELEMENTAL_DMG += (r.sameTargetHitStacks) * sValues[s]
    },
    finalizeCalculations: () => {
    },
  }
}
