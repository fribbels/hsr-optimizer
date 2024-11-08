import { ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.AlongThePassingShore')

  const sValuesDmgBoost = [0.24, 0.28, 0.32, 0.36, 0.40]
  const sValuesUltDmgBoost = [0.24, 0.28, 0.32, 0.36, 0.40]

  const defaults = {
    emptyBubblesDebuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    emptyBubblesDebuff: {
      lc: true,
      id: 'emptyBubblesDebuff',
      formItem: 'switch',
      text: t('Content.emptyBubblesDebuff.text'),
      content: t('Content.emptyBubblesDebuff.content', {
        UltDmgBoost: TsUtils.precisionRound(100 * sValuesUltDmgBoost[s]),
        DmgBoost: TsUtils.precisionRound(100 * sValuesDmgBoost[s]),
      }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.ELEMENTAL_DMG.buff((r.emptyBubblesDebuff) ? sValuesDmgBoost[s] : 0, Source.NONE)
      buffAbilityDmg(x, ULT_TYPE, (r.emptyBubblesDebuff) ? sValuesUltDmgBoost[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
