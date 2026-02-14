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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.IntoTheUnreachableVeil')
  const { SOURCE_LC } = Source.lightCone('23037')

  const sValuesDmgBoost = [0.60, 0.70, 0.80, 0.90, 1.00]

  const defaults = {
    skillUltDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillUltDmgBoost: {
      lc: true,
      id: 'skillUltDmgBoost',
      formItem: 'switch',
      text: t('Content.skillUltDmgBoost.text'),
      content: t('Content.skillUltDmgBoost.content', { DmgBuff: TsUtils.precisionRound(sValuesDmgBoost[s] * 100) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, (r.skillUltDmgBoost) ? sValuesDmgBoost[s] : 0, x.damageType(DamageTag.SKILL | DamageTag.ULT).source(SOURCE_LC))
    },
  }
}
