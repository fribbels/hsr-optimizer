import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.DayOneOfMyNewLife')

  const sValues = [0.08, 0.09, 0.10, 0.11, 0.12]

  const defaults = {
    dmgResBuff: true,
  }

  const teammateDefaults = {
    dmgResBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    dmgResBuff: {
      lc: true,
      id: 'dmgResBuff',
      formItem: 'switch',
      text: t('Content.dmgResBuff.text'),
      content: t('Content.dmgResBuff.content', { ResBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    dmgResBuff: content.dmgResBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      // TODO: This is technically a DMG RES buff not a DMG Reduction buff
      x.DMG_RED_MULTI.multiplyTeam((m.dmgResBuff) ? (1 - sValues[s]) : 1, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
