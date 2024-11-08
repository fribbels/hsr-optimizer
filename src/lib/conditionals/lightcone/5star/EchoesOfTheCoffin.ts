import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
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
      const m: Conditionals<typeof teammateContent> = action.lightConeConditionals

      x.SPD.buff((m.postUltSpdBuff) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
