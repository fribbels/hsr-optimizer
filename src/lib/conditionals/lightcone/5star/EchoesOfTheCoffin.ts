import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.EchoesOfTheCoffin')

  const sValues = [12, 14, 16, 18, 20]
  const sValuesEnergy = [3, 3.5, 4, 4.5, 5]

  const defaults = {
    postUltSpdBuff: false,
  }

  const teammateDefaults = {
    postUltSpdBuff: false,
  }

  const content: ContentDefinition<typeof defaults> = {
    postUltSpdBuff: {
      lc: true,
      id: 'postUltSpdBuff',
      formItem: 'switch',
      text: t('Content.postUltSpdBuff.text'),
      content: t('Content.postUltSpdBuff.content', {
        EnergyRecovered: TsUtils.precisionRound(sValuesEnergy[s]),
        SpdBuff: TsUtils.precisionRound(sValues[s]),
      }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    postUltSpdBuff: content.postUltSpdBuff,
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

      x.SPD.buff((m.postUltSpdBuff) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
