import { FUA_TYPE } from 'lib/conditionals/conditionalConstants'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TheBirthOfTheSelf')

  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  const defaults = {
    enemyHp50FuaBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enemyHp50FuaBuff: {
      lc: true,
      id: 'enemyHp50FuaBuff',
      formItem: 'switch',
      text: t('Content.enemyHp50FuaBuff.text'),
      content: t('Content.enemyHp50FuaBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      buffAbilityDmg(x, FUA_TYPE, sValues[s], Source.NONE)
      buffAbilityDmg(x, FUA_TYPE, (r.enemyHp50FuaBuff) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
