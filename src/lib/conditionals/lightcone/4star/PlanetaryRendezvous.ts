import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.PlanetaryRendezvous')

  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    alliesSameElement: true,
  }

  const teammateDefaults = {
    alliesSameElement: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    alliesSameElement: {
      lc: true,
      id: 'alliesSameElement',
      formItem: 'switch',
      text: t('Content.alliesSameElement.text'),
      content: t('Content.alliesSameElement.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    alliesSameElement: content.alliesSameElement,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.ELEMENTAL_DMG.buff((r.alliesSameElement) ? sValues[s] : 0, Source.NONE)
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.ELEMENTAL_DMG.buff((r.alliesSameElement) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
