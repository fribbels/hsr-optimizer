import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TheSeriousnessOfBreakfast')
  const { SOURCE_LC } = Source.lightCone('21027')

  const sValuesDmgBoost = [0.12, 0.15, 0.18, 0.21, 0.24]
  const sValuesStacks = [0.04, 0.05, 0.06, 0.07, 0.08]

  const defaults = {
    dmgBoost: true,
    defeatedEnemyAtkStacks: 3,
  }

  const content: ContentDefinition<typeof defaults> = {
    dmgBoost: {
      lc: true,
      id: 'dmgBoost',
      formItem: 'switch',
      text: t('Content.dmgBoost.text'),
      content: t('Content.dmgBoost.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesDmgBoost[s]) }),
    },
    defeatedEnemyAtkStacks: {
      lc: true,
      id: 'defeatedEnemyAtkStacks',
      formItem: 'slider',
      text: t('Content.defeatedEnemyAtkStacks.text'),
      content: t('Content.defeatedEnemyAtkStacks.content', { AtkBuff: TsUtils.precisionRound(100 * sValuesStacks[s]) }),
      min: 0,
      max: 3,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.ATK_P.buff(r.defeatedEnemyAtkStacks * sValuesStacks[s], SOURCE_LC)
      x.ELEMENTAL_DMG.buff((r.dmgBoost) ? sValuesDmgBoost[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
