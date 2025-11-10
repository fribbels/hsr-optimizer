import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import {
  CAELUS_REMEMBRANCE,
  STELLE_REMEMBRANCE,
  FLY_INTO_A_PINK_TOMORROW,
} from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { CharacterId } from 'types/character'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean, { characterId }: { characterId: CharacterId }): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.FlyIntoAPinkTomorrow')
  const { SOURCE_LC } = Source.lightCone(FLY_INTO_A_PINK_TOMORROW)

  const sValuesDmg = [0.08, 0.10, 0.12, 0.14, 0.16]
  const sValuesEnhancedBasicDmg = [0.60, 0.70, 0.80, 0.90, 1.00]

  const isValidWearer = characterId == STELLE_REMEMBRANCE || characterId == CAELUS_REMEMBRANCE

  const defaults = {
    dmgBoost: isValidWearer,
    enhancedBasicBoost: true,
  }

  const teammateDefaults = {
    dmgBoost: isValidWearer,
  }

  const content: ContentDefinition<typeof defaults> = {
    dmgBoost: {
      lc: true,
      id: 'dmgBoost',
      formItem: 'switch',
      text: t('Content.dmgBoost.text'),
      content: t('Content.dmgBoost.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesDmg[s]) }),
      disabled: !isValidWearer,
    },
    enhancedBasicBoost: {
      lc: true,
      id: 'enhancedBasicBoost',
      formItem: 'switch',
      text: t('Content.enhancedBasicBoost.text'),
      content: t('Content.enhancedBasicBoost.content', { DmgBoost: TsUtils.precisionRound(100 * sValuesEnhancedBasicDmg[s]) }),
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
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      if (context.characterId == STELLE_REMEMBRANCE || context.characterId == CAELUS_REMEMBRANCE) {
        x.BASIC_DMG_BOOST.buff((r.enhancedBasicBoost) ? sValuesEnhancedBasicDmg[s] : 0, SOURCE_LC)
      }
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      if (characterId === STELLE_REMEMBRANCE || characterId === CAELUS_REMEMBRANCE) {
        x.ELEMENTAL_DMG.buffTeam((m.dmgBoost) ? sValuesDmg[s] : 0, SOURCE_LC)
      }
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}
