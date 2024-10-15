import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsObject, FUA_TYPE } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TheBirthOfTheSelf')
  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]
  const content: ContentItem[] = [{
    lc: true,
    id: 'enemyHp50FuaBuff',
    name: 'enemyHp50FuaBuff',
    formItem: 'switch',
    text: t('Content.enemyHp50FuaBuff.text'),
    title: t('Content.enemyHp50FuaBuff.title'),
    content: t('Content.enemyHp50FuaBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      enemyHp50FuaBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      buffAbilityDmg(x, FUA_TYPE, sValues[s])
      buffAbilityDmg(x, FUA_TYPE, sValues[s], (r.enemyHp50FuaBuff))
    },
    finalizeCalculations: () => {
    },
  }
}
