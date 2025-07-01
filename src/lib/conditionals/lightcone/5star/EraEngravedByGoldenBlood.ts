import i18next from 'i18next'
import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { ERA_ENGRAVED_BY_GOLDEN_BLOOD } from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.EternalCalculus')
  const { SOURCE_LC } = Source.lightCone(ERA_ENGRAVED_BY_GOLDEN_BLOOD)

  const sValuesSkillDmg = [0.54, 0.675, 0.81, 0.945, 1.08]

  const teammateDefaults = {
    skillDmgBoost: true,
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillDmgBoost: {
      lc: true,
      id: 'skillDmgBoost',
      formItem: 'switch',
      text: 'Skill DMG boost',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
  }

  return {
    content: () => [],
    teammateContent: () => Object.values(teammateContent),
    defaults: () => ({}),
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.SKILL_DMG_BOOST.buff((t.skillDmgBoost) ? sValuesSkillDmg[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
