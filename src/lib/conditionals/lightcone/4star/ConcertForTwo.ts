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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ConcertForTwo')
  const { SOURCE_LC } = Source.lightCone('21043')

  const sValuesStackDmg = [0.04, 0.05, 0.06, 0.07, 0.08]

  const defaults = {
    teammateShieldStacks: 4,
  }

  const content: ContentDefinition<typeof defaults> = {
    teammateShieldStacks: {
      lc: true,
      id: 'teammateShieldStacks',
      formItem: 'slider',
      text: t('Content.teammateShieldStacks.text'),
      content: t('Content.teammateShieldStacks.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesStackDmg[s]) }),
      min: 0,
      max: 4,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.ELEMENTAL_DMG.buff((r.teammateShieldStacks) * sValuesStackDmg[s], SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
