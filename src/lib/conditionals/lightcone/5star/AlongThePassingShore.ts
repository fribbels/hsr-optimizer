import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.AlongThePassingShore')
  const { SOURCE_LC } = Source.lightCone('23024')

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
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, (r.emptyBubblesDebuff) ? sValuesDmgBoost[s] : 0, x.source(SOURCE_LC))
      x.buff(StatKey.DMG_BOOST, (r.emptyBubblesDebuff) ? sValuesUltDmgBoost[s] : 0, x.damageType(DamageTag.ULT).source(SOURCE_LC))
    },
  }
}
