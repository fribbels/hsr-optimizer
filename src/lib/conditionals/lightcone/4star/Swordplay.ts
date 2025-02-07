import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Swordplay')
  const { SOURCE_LC } = Source.lightCone('21010')

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
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.ELEMENTAL_DMG.buff((r.sameTargetHitStacks) * sValues[s], SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
