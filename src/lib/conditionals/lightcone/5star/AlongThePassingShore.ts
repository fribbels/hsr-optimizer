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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.AlongThePassingShore')
  const { SOURCE_LC } = Source.lightCone(AlongThePassingShore.id)

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
        UltDmgBoost: precisionRound(100 * sValuesUltDmgBoost[s]),
        DmgBoost: precisionRound(100 * sValuesDmgBoost[s]),
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

export const AlongThePassingShore: LightConeConfig = {
  id: '23024',
  conditionals,
  display: {
    imageOffset: {
      x: 8,
      y: -333,
      s: 1.9,
    },
  },
}
