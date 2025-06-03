import {
  Conditionals,
  ContentDefinition,
  countTeamPath,
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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.PoisedToBloom')
  const { SOURCE_LC } = Source.lightCone('21046')

  const sValuesCd = [0.16, 0.20, 0.24, 0.28, 0.32]

  const defaults = {
    cdBuff: true,
  }

  const teammateDefaults = {
    cdBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    cdBuff: {
      lc: true,
      id: 'cdBuff',
      formItem: 'switch',
      text: t('Content.cdBuff.text'),
      content: t('Content.cdBuff.content', { CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    cdBuff: content.cdBuff,
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

      x.CD.buff((m.cdBuff && countTeamPath(context, context.path) >= 2) ? sValuesCd[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
