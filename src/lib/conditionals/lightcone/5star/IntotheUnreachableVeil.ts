import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.IntoTheUnreachableVeil')
  const { SOURCE_LC } = Source.lightCone(IntotheUnreachableVeil.id)

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
      content: t('Content.skillUltDmgBoost.content', { DmgBuff: precisionRound(sValuesDmgBoost[s] * 100) }),
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

export const IntotheUnreachableVeil: LightConeConfig = {
  id: '23037',
  conditionals,
}
