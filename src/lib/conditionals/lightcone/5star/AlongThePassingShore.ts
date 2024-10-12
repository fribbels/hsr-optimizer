import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsObject, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.AlongThePassingShore')
  const sValuesDmgBoost = [0.24, 0.28, 0.32, 0.36, 0.40]
  const sValuesUltDmgBoost = [0.24, 0.28, 0.32, 0.36, 0.40]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'emptyBubblesDebuff',
      name: 'emptyBubblesDebuff',
      formItem: 'switch',
      text: t('Content.emptyBubblesDebuff.text'),
      title: t('Content.emptyBubblesDebuff.title'),
      content: t('Content.emptyBubblesDebuff.content', { UltDmgBoost: TsUtils.precisionRound(100 * sValuesUltDmgBoost[s]), DmgBoost: TsUtils.precisionRound(100 * sValuesDmgBoost[s]) }),
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      emptyBubblesDebuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x.ELEMENTAL_DMG += (r.emptyBubblesDebuff) ? sValuesDmgBoost[s] : 0
      buffAbilityDmg(x, ULT_TYPE, sValuesUltDmgBoost[s], (r.emptyBubblesDebuff))
    },
    finalizeCalculations: () => {
    },
  }
}
