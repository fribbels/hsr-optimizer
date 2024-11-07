import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.MutualDemise')

  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    selfHp80CrBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    selfHp80CrBuff: {
      lc: true,
      id: 'selfHp80CrBuff',
      formItem: 'switch',
      text: t('Content.selfHp80CrBuff.text'),
      content: t('Content.selfHp80CrBuff.content', { CritBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.CR.buff((r.selfHp80CrBuff) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
