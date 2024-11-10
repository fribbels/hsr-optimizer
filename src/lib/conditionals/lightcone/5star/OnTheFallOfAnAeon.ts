import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.OnTheFallOfAnAeon')

  const sValuesAtkStacks = [0.08, 0.10, 0.12, 0.14, 0.16]
  const sValuesDmgBuff = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    atkBoostStacks: 4,
    weaknessBreakDmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    atkBoostStacks: {
      lc: true,
      id: 'atkBoostStacks',
      formItem: 'slider',
      text: t('Content.atkBoostStacks.text'),
      content: t('Content.atkBoostStacks.content', { AtkBuff: TsUtils.precisionRound(100 * sValuesAtkStacks[s]) }),
      min: 0,
      max: 4,
    },
    weaknessBreakDmgBuff: {
      lc: true,
      id: 'weaknessBreakDmgBuff',
      formItem: 'switch',
      text: t('Content.weaknessBreakDmgBuff.text'),
      content: t('Content.weaknessBreakDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesDmgBuff[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.ATK_P.buff(r.atkBoostStacks * sValuesAtkStacks[s], Source.NONE)
      x.ELEMENTAL_DMG.buff((r.weaknessBreakDmgBuff) ? sValuesDmgBuff[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
