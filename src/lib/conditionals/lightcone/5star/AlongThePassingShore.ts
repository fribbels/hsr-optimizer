import { ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
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
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.ELEMENTAL_DMG.buff((r.emptyBubblesDebuff) ? sValuesDmgBoost[s] : 0, Source.NONE)
      buffAbilityDmg(x, ULT_TYPE, (r.emptyBubblesDebuff) ? sValuesUltDmgBoost[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
