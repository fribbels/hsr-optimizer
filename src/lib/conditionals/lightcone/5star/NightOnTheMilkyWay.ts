import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.NightOnTheMilkyWay')

  const sValuesAtk = [0.09, 0.105, 0.12, 0.135, 0.15]
  const sValuesDmg = [0.30, 0.35, 0.40, 0.45, 0.50]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'enemyCountAtkBuff',
      formItem: 'switch',
      text: t('Content.enemyCountAtkBuff.text'),
      content: t('Content.enemyCountAtkBuff.content', { AtkBuff: TsUtils.precisionRound(100 * sValuesAtk[s]) }),
    },
    {
      lc: true,
      id: 'enemyWeaknessBreakDmgBuff',
      formItem: 'switch',
      text: t('Content.enemyWeaknessBreakDmgBuff.text'),
      content: t('Content.enemyWeaknessBreakDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesDmg[s]) }),
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      enemyCountAtkBuff: true,
      enemyWeaknessBreakDmgBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.ATK_P] += (r.enemyCountAtkBuff) ? context.enemyCount * sValuesAtk[s] : 0
      x.ELEMENTAL_DMG += (r.enemyWeaknessBreakDmgBuff) ? sValuesDmg[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
