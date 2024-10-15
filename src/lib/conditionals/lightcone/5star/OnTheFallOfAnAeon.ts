import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.OnTheFallOfAnAeon')
  const sValuesAtkStacks = [0.08, 0.10, 0.12, 0.14, 0.16]
  const sValuesDmgBuff = [0.12, 0.15, 0.18, 0.21, 0.24]

  const content: ContentItem[] = [{
    lc: true,
    id: 'atkBoostStacks',
    name: 'atkBoostStacks',
    formItem: 'slider',
    text: t('Content.atkBoostStacks.text'),
    title: t('Content.atkBoostStacks.title'),
    content: t('Content.atkBoostStacks.content', { AtkBuff: TsUtils.precisionRound(100 * sValuesAtkStacks[s]) }),
    min: 0,
    max: 4,
  }, {
    lc: true,
    id: 'weaknessBreakDmgBuff',
    name: 'weaknessBreakDmgBuff',
    formItem: 'switch',
    text: t('Content.weaknessBreakDmgBuff.text'),
    title: t('Content.weaknessBreakDmgBuff.title'),
    content: t('Content.weaknessBreakDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesDmgBuff[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      atkBoostStacks: 4,
      weaknessBreakDmgBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.ATK_P] += r.atkBoostStacks * sValuesAtkStacks[s]
      x.ELEMENTAL_DMG += (r.weaknessBreakDmgBuff) ? sValuesDmgBuff[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
