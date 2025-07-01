import {
  FUA_DMG_TYPE,
  ULT_DMG_TYPE,
} from 'lib/conditionals/conditionalConstants'
import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ADreamScentedInWheat.Content')
  const { SOURCE_LC } = Source.lightCone('21060')

  const sValuesUltFuaDmg = [0.24, 0.28, 0.32, 0.36, 0.40]

  const defaults = {
    ultFuaDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultFuaDmgBoost: {
      lc: true,
      id: 'ultFuaDmgBoost',
      formItem: 'switch',
      text: t('ultFuaDmgBoost.text'),
      content: t('ultFuaDmgBoost.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesUltFuaDmg[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      buffAbilityDmg(x, r.ultFuaDmgBoost ? ULT_DMG_TYPE | FUA_DMG_TYPE : 0, sValuesUltFuaDmg[s], SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
