import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { THE_FOREVER_VICTUAL } from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TheForeverVictual.Content')
  const { SOURCE_LC } = Source.lightCone(THE_FOREVER_VICTUAL)

  const sValuesAtk = [0.08, 0.10, 0.12, 0.14, 0.16]

  const defaults = {
    atkStacks: 3,
  }

  const content: ContentDefinition<typeof defaults> = {
    atkStacks: {
      lc: true,
      id: 'atkStacks',
      formItem: 'slider',
      text: t('atkStacks.text'),
      content: t('atkStacks.content', { AtkBuff: TsUtils.precisionRound(100 * sValuesAtk[s]) }),
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
