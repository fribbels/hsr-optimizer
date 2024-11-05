import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TheSeriousnessOfBreakfast')

  const sValuesDmgBoost = [0.12, 0.15, 0.18, 0.21, 0.24]
  const sValuesStacks = [0.04, 0.05, 0.06, 0.07, 0.08]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'dmgBoost',
      formItem: 'switch',
      text: t('Content.dmgBoost.text'),
      content: t('Content.dmgBoost.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesDmgBoost[s]) }),
    },
    {
      lc: true,
      id: 'defeatedEnemyAtkStacks',
      formItem: 'slider',
      text: t('Content.defeatedEnemyAtkStacks.text'),
      content: t('Content.defeatedEnemyAtkStacks.content', { AtkBuff: TsUtils.precisionRound(100 * sValuesStacks[s]) }),
      min: 0,
      max: 3,
    },
  ]

  return {
    content: () => Object.values(content),
    defaults: () => ({
      dmgBoost: true,
      defeatedEnemyAtkStacks: 3,
    }),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.ATK_P] += r.defeatedEnemyAtkStacks * sValuesStacks[s]
      x.ELEMENTAL_DMG += (r.dmgBoost) ? sValuesDmgBoost[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
