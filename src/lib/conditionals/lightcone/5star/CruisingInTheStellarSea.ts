import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.CruisingInTheStellarSea')
  const { SOURCE_LC } = Source.lightCone('24001')

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
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.CR, (r.enemyHp50CrBoost) ? sValuesCr[s] : 0, x.source(SOURCE_LC))
      x.buff(StatKey.ATK_P, (r.enemyDefeatedAtkBuff) ? sValuesAtk[s] : 0, x.source(SOURCE_LC))
    },
  }
}
