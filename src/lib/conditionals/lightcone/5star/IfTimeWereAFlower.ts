import i18next from 'i18next'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.IntotheUnreachableVeil')

  const sValuesCd = [0.48, 0.60, 0.72, 0.84, 0.96]

  const defaults = {
    presage: true,
  }

  const teammateDefaults = {
    presage: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    presage: {
      lc: true,
      id: 'presage',
      formItem: 'switch',
      text: 'Presage active',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    presage: content.presage,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.CD.buffTeam((m.presage) ? sValuesCd[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
