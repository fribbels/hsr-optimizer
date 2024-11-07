import { ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.DataBank')

  const sValues = [0.28, 0.35, 0.42, 0.49, 0.56]

  const defaults = {
    ultDmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultDmgBuff: {
      lc: true,
      id: 'ultDmgBuff',
      formItem: 'switch',
      text: t('Content.ultDmgBuff.text'),
      content: t('Content.ultDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      buffAbilityDmg(x, ULT_TYPE, (r.ultDmgBuff) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
