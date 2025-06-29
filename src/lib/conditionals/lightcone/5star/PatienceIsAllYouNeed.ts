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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.PatienceIsAllYouNeed')
  const { SOURCE_LC } = Source.lightCone('23006')

  const sValuesDmg = [0.24, 0.28, 0.32, 0.36, 0.40]
  const sValuesSpd = [0.048, 0.056, 0.064, 0.072, 0.08]
  const sValuesErode = [0.6, 0.7, 0.8, 0.9, 1]

  const defaults = {
    spdStacks: 3,
    dotEffect: false,
  }

  const content: ContentDefinition<typeof defaults> = {
    spdStacks: {
      lc: true,
      id: 'spdStacks',
      formItem: 'slider',
      text: t('Content.spdStacks.text'),
      content: t('Content.spdStacks.content', { SpdBuff: TsUtils.precisionRound(100 * sValuesSpd[s]) }),
      min: 0,
      max: 3,
    },
    dotEffect: {
      lc: true,
      id: 'dotEffect',
      formItem: 'switch',
      text: t('Content.dotEffect.text'),
      content: t('Content.dotEffect.content', { Multiplier: TsUtils.precisionRound(100 * sValuesErode[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.SPD_P.buff(r.spdStacks * sValuesSpd[s], SOURCE_LC)
      x.ELEMENTAL_DMG.buff(sValuesDmg[s], SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
