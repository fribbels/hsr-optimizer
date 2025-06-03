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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TheGreatCosmicEnterprise.Content')
  const { SOURCE_LC } = Source.lightCone('22004')

  const sValuesDmg = [0.04, 0.05, 0.06, 0.07, 0.08]

  const defaults = {
    weaknessTypes: 7,
  }

  const content: ContentDefinition<typeof defaults> = {
    weaknessTypes: {
      lc: true,
      id: 'weaknessTypes',
      formItem: 'slider',
      text: t('weaknessTypes.text'),
      content: t('weaknessTypes.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesDmg[s]) }),
      min: 0,
      max: 7,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.ELEMENTAL_DMG.buff(r.weaknessTypes * sValuesDmg[s], SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
