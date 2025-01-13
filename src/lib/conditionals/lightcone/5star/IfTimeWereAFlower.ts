import i18next from 'i18next'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.IntotheUnreachableVeil')

  const sValuesCd = [0.01, 0.0125, 0.015, 0.0175, 0.02]

  const defaults = {
    presageStacks: 60,
  }

  const teammateDefaults = {
    presageStacks: 60,
  }

  const content: ContentDefinition<typeof defaults> = {
    presageStacks: {
      lc: true,
      id: 'presageStacks',
      formItem: 'slider',
      text: 'Presage stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 60,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    presageStacks: content.presageStacks,
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

      x.CD.buffTeam(m.presageStacks * sValuesCd[s], Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
