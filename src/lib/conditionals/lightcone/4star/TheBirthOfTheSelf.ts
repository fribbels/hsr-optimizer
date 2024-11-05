import { ComputedStatsObject, FUA_TYPE } from 'lib/conditionals/conditionalConstants'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TheBirthOfTheSelf')

  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  const content: ContentDefinition<typeof defaults> = [
    {
      lc: true,
      id: 'enemyHp50FuaBuff',
      formItem: 'switch',
      text: t('Content.enemyHp50FuaBuff.text'),
      content: t('Content.enemyHp50FuaBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  ]

  return {
    content: () => Object.values(content),
    defaults: () => ({
      enemyHp50FuaBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      buffAbilityDmg(x, FUA_TYPE, sValues[s])
      buffAbilityDmg(x, FUA_TYPE, sValues[s], (r.enemyHp50FuaBuff))
    },
    finalizeCalculations: () => {
    },
  }
}
