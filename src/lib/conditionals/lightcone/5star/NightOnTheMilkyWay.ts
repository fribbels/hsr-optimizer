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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.NightOnTheMilkyWay')
  const { SOURCE_LC } = Source.lightCone('23000')

  const sValuesAtk = [0.09, 0.105, 0.12, 0.135, 0.15]
  const sValuesDmg = [0.30, 0.35, 0.40, 0.45, 0.50]

  const defaults = {
    enemyCountAtkBuff: true,
    enemyWeaknessBreakDmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enemyCountAtkBuff: {
      lc: true,
      id: 'enemyCountAtkBuff',
      formItem: 'switch',
      text: t('Content.enemyCountAtkBuff.text'),
      content: t('Content.enemyCountAtkBuff.content', { AtkBuff: TsUtils.precisionRound(100 * sValuesAtk[s]) }),
    },
    enemyWeaknessBreakDmgBuff: {
      lc: true,
      id: 'enemyWeaknessBreakDmgBuff',
      formItem: 'switch',
      text: t('Content.enemyWeaknessBreakDmgBuff.text'),
      content: t('Content.enemyWeaknessBreakDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesDmg[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.ATK_P, (r.enemyCountAtkBuff) ? context.enemyCount * sValuesAtk[s] : 0, x.source(SOURCE_LC))
      x.buff(StatKey.DMG_BOOST, (r.enemyWeaknessBreakDmgBuff) ? sValuesDmg[s] : 0, x.source(SOURCE_LC))
    },
  }
}
