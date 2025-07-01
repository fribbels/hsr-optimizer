import i18next from 'i18next'
import { DOT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDefPen } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import {
  MAZE_RESTAURANT_FOREVER,
  WHY_DOES_THE_OCEAN_SING,
} from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ReforgedRemembrance')
  const { SOURCE_LC } = Source.lightCone(MAZE_RESTAURANT_FOREVER)

  const sValuesAtk = [0.08, 0.10, 0.12, 0.14, 0.16]

  const defaults = {
    atkStacks: 3,
  }

  const content: ContentDefinition<typeof defaults> = {
    atkStacks: {
      lc: true,
      id: 'atkStacks',
      formItem: 'slider',
      text: 'ATK buff stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 3,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.ATK_P.buff(r.atkStacks * sValuesAtk[s], SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
