import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Mediation')
  const { SOURCE_LC } = Source.lightCone('20019')

  const sValues = [12, 14, 16, 18, 20]

  const defaults = {
    initialSpdBuff: false,
  }

  const teammateDefaults = {
    initialSpdBuff: false,
  }

  const content: ContentDefinition<typeof defaults> = {
    initialSpdBuff: {
      lc: true,
      id: 'initialSpdBuff',
      formItem: 'switch',
      text: t('Content.initialSpdBuff.text'),
      content: t('Content.initialSpdBuff.content', { SpdBuff: sValues[s] }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    initialSpdBuff: content.initialSpdBuff,
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

      x.SPD.buffTeam((m.initialSpdBuff) ? sValues[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
