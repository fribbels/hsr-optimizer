import { Conditionals, ContentDefinition, countTeamElement } from 'lib/conditionals/conditionalUtils'
import { WearerMetadata } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean, wearerMeta: WearerMetadata): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.PlanetaryRendezvous')
  const { SOURCE_LC } = Source.lightCone('21011')

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
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      if (r.alliesSameElement && countTeamElement(context, context.element) >= 2) {
        x.ELEMENTAL_DMG.buffTeam(sValues[s], SOURCE_LC)
      }
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.lightConeConditionals as Conditionals<typeof teammateContent>

      if (t.alliesSameElement && wearerMeta.element == context.element) {
        x.ELEMENTAL_DMG.buffTeam(sValues[s], SOURCE_LC)
      }
    },
    finalizeCalculations: () => {
    },
  }
}
