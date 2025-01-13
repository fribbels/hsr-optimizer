import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.IntotheUnreachableVeil')

  const sValues = [0, 0, 0, 0, 0]

  const defaults = {}

  const content: ContentDefinition<typeof defaults> = {
    // skillUltDmgBoost: {
    //   lc: true,
    //   id: 'skillUltDmgBoost',
    //   formItem: 'switch',
    //   text: 'Skill / Ult DMG boost',
    //   content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    // },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>
    },
    finalizeCalculations: () => {
    },
  }
}
