import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.CruisingInTheStellarSea')

  const sValuesCr = [0.08, 0.10, 0.12, 0.14, 0.16]
  const sValuesAtk = [0.20, 0.25, 0.30, 0.35, 0.40]

  const defaults = {
    enemyHp50CrBoost: false,
    enemyDefeatedAtkBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enemyHp50CrBoost: {
      lc: true,
      id: 'enemyHp50CrBoost',
      formItem: 'switch',
      text: t('Content.enemyHp50CrBoost.text'),
      content: t('Content.enemyHp50CrBoost.content', { CritBuff: TsUtils.precisionRound(100 * sValuesCr[s]) }),
    },
    enemyDefeatedAtkBuff: {
      lc: true,
      id: 'enemyDefeatedAtkBuff',
      formItem: 'switch',
      text: t('Content.enemyDefeatedAtkBuff.text'),
      content: t('Content.enemyDefeatedAtkBuff.content', { AtkBuff: TsUtils.precisionRound(100 * sValuesAtk[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.CR.buff((r.enemyHp50CrBoost) ? sValuesCr[s] : 0, Source.NONE)
      x.ATK_P.buff((r.enemyDefeatedAtkBuff) ? sValuesAtk[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
