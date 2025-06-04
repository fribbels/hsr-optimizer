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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.VictoryInABlink')
  const { SOURCE_LC } = Source.lightCone('21050')

  const sValues = [0.08, 0.10, 0.12, 0.14, 0.16]

  const defaults = {
    teamDmgBuff: true,
  }

  const teammateDefaults = {
    teamDmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    teamDmgBuff: {
      lc: true,
      id: 'teamDmgBuff',
      formItem: 'switch',
      text: t('Content.teamDmgBuff.text'),
      content: t('Content.teamDmgBuff.content', { DmgBuff: TsUtils.precisionRound(sValues[s] * 100) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    teamDmgBuff: content.teamDmgBuff,
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

      x.ELEMENTAL_DMG.buffTeam(m.teamDmgBuff ? sValues[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
