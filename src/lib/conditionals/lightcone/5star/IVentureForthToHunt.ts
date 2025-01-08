import { ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { buffAbilityDefPen } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.IVentureForthToHunt')

  const sValuesDefShred = [0.27, 0.30, 0.33, 0.36, 0.39]

  const defaults = {
    luminfluxUltStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    luminfluxUltStacks: {
      lc: true,
      id: 'luminfluxUltStacks',
      formItem: 'slider',
      text: t('Content.luminfluxUltStacks.text'),
      content: t('Content.luminfluxUltStacks.content', { DefIgnore: TsUtils.precisionRound(100 * sValuesDefShred[s]) }),
      min: 0,
      max: 2,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      buffAbilityDefPen(x, ULT_DMG_TYPE, r.luminfluxUltStacks * sValuesDefShred[s], Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
