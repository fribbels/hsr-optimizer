import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  ComputedStatsArray,
  Key,
} from 'lib/optimization/computedStatsArray'
import { THOUGH_WORLDS_APART } from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ThoughWorldsApart.Content')
  const { SOURCE_LC } = Source.lightCone(THOUGH_WORLDS_APART)

  const sValuesDmgBoost = [0.24, 0.30, 0.36, 0.42, 0.48]
  const sValuesDmgBoostSummons = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    dmgBoost: true,
  }

  const teammateDefaults = {
    dmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    dmgBoost: {
      lc: true,
      id: 'dmgBoost',
      formItem: 'switch',
      text: t('dmgBoost.text'),
      content: t('dmgBoost.content', {
        DmgBuff: TsUtils.precisionRound(100 * sValuesDmgBoost[s]),
        SummonDmgBuff: TsUtils.precisionRound(100 * sValuesDmgBoostSummons[s]),
      }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    dmgBoost: content.dmgBoost,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {},
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.ELEMENTAL_DMG.buffTeam((m.dmgBoost) ? sValuesDmgBoost[s] : 0, SOURCE_LC)
      x.ELEMENTAL_DMG.buffTeam((m.dmgBoost && x.a[Key.SUMMONS] > 0) ? sValuesDmgBoostSummons[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: (x, action, context) => {},
    gpuFinalizeCalculations: (action, context) => '',
  }
}
