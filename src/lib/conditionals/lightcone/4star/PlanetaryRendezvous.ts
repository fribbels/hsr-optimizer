import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.PlanetaryRendezvous')

  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  const content: ContentDefinition<typeof defaults> = [
    {
      lc: true,
      id: 'alliesSameElement',
      formItem: 'switch',
      text: t('Content.alliesSameElement.text'),
      content: t('Content.alliesSameElement.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  ]

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => ({
      alliesSameElement: true,
    }),
    teammateDefaults: () => ({
      alliesSameElement: true,
    }),
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.ELEMENTAL_DMG += (r.alliesSameElement) ? sValues[s] : 0
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.ELEMENTAL_DMG += (r.alliesSameElement) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
