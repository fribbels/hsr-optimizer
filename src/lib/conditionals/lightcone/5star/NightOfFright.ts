import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.NightOfFright')
  const { SOURCE_LC } = Source.lightCone('23017')

  const sValues = [0.024, 0.028, 0.032, 0.036, 0.04]

  const defaults = {
    atkBuffStacks: 5,
  }

  const teammateDefaults = {
    atkBuffStacks: 5,
  }

  const content: ContentDefinition<typeof defaults> = {
    atkBuffStacks: {
      lc: true,
      id: 'atkBuffStacks',
      formItem: 'slider',
      text: t('Content.atkBuffStacks.text'),
      content: t('Content.atkBuffStacks.content', { AtkBuff: TsUtils.precisionRound(100 * sValues[s]) }),
      min: 0,
      max: 5,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    atkBuffStacks: content.atkBuffStacks,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.ATK_P.buffTeam(m.atkBuffStacks * sValues[s], SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
