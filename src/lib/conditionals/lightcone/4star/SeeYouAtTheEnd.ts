import i18next from 'i18next'
import {
  FUA_DMG_TYPE,
  SKILL_DMG_TYPE,
} from 'lib/conditionals/conditionalConstants'
import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ATrailOfBygoneBlood')
  const { SOURCE_LC } = Source.lightCone('21062')

  const sValuesSkillFuaDmg = [0.24, 0.28, 0.32, 0.36, 0.40]

  const defaults = {
    skillFuaDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillFuaDmgBoost: {
      lc: true,
      id: 'skillFuaDmgBoost',
      formItem: 'switch',
      text: 'Skill / Fua DMG boost',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      buffAbilityDmg(x, r.skillFuaDmgBoost ? SKILL_DMG_TYPE | FUA_DMG_TYPE : 0, sValuesSkillFuaDmg[s], SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
