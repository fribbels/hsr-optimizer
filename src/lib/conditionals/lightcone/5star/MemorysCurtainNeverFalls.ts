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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.MemorysCurtainNeverFalls.Content')
  const { SOURCE_LC } = Source.lightCone('24005')

  const sValues = [0.08, 0.10, 0.12, 0.14, 0.16]

  const defaults = {
    teamDmgBoost: true,
  }
  const teammateDefaults = {
    teamDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    teamDmgBoost: {
      lc: true,
      id: 'teamDmgBoost',
      formItem: 'switch',
      text: t('teamDmgBoost.text'),
      content: t('teamDmgBoost.content', { DmgBoost: TsUtils.precisionRound(sValues[s] * 100) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    teamDmgBoost: content.teamDmgBoost,
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

      x.ELEMENTAL_DMG.buffTeam((m.teamDmgBoost) ? sValues[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
