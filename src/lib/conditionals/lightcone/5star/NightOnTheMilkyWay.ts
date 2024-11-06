import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.NightOnTheMilkyWay')

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
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.ATK_P.buff((r.enemyCountAtkBuff) ? context.enemyCount * sValuesAtk[s] : 0, Source.NONE)
      x.ELEMENTAL_DMG.buff((r.enemyWeaknessBreakDmgBuff) ? sValuesDmg[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
