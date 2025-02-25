import i18next from 'i18next'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.LifeShouldBeCastToFlames')
  const { SOURCE_LC } = Source.lightCone('23041')

  const sValuesDefPen = [0.06, 0.075, 0.09, 0.105, 0.12]

  const defaults = {
    defPenStacks: 2,
  }
  const teammateDefaults = {
    defPenStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    defPenStacks: {
      lc: true,
      id: 'defPenStacks',
      formItem: 'slider',
      text: 'DEF PEN stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 2,
    },
  }
  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    defPenStacks: content.defPenStacks,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.DEF_PEN.buffTeam(m.defPenStacks * sValuesDefPen[s], SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
