import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Swordplay')

  const sValues = [0.08, 0.10, 0.12, 0.14, 0.16]

  const defaults = {
    sameTargetHitStacks: 5,
  }

  const content: ContentDefinition<typeof defaults> = {
    sameTargetHitStacks: {
      lc: true,
      id: 'sameTargetHitStacks',
      formItem: 'slider',
      text: t('Content.sameTargetHitStacks.text'),
      content: t('Content.sameTargetHitStacks.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
      min: 0,
      max: 5,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.ELEMENTAL_DMG.buff((r.sameTargetHitStacks) * sValues[s], Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
