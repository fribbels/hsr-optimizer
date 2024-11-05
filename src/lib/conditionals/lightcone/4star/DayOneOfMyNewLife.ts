import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.DayOneOfMyNewLife')

  const sValues = [0.08, 0.09, 0.10, 0.11, 0.12]

  const content: ContentDefinition<typeof defaults> = [
    {
      lc: true,
      id: 'dmgResBuff',
      formItem: 'switch',
      text: t('Content.dmgResBuff.text'),
      content: t('Content.dmgResBuff.content', { ResBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  ]

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => ({
      dmgResBuff: true,
    }),
    teammateDefaults: () => ({
      dmgResBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m: Conditionals<typeof teammateContent> = action.lightConeConditionals

      // TODO: This is technically a DMG RES buff not a DMG Reduction buff
      x.DMG_RED_MULTI *= (m.dmgResBuff) ? (1 - sValues[s]) : 1
    },
    finalizeCalculations: () => {
    },
  }
}
