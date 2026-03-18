import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import { type OptimizerAction, type OptimizerContext } from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.BeforeDawn')
  const { SOURCE_LC } = Source.lightCone(BeforeDawn.id)

  const sValuesSkillUltDmg = [0.18, 0.21, 0.24, 0.27, 0.30]
  const sValuesFuaDmg = [0.48, 0.56, 0.64, 0.72, 0.80]

  const defaults = {
    fuaDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    fuaDmgBoost: {
      lc: true,
      id: 'fuaDmgBoost',
      formItem: 'switch',
      text: t('Content.fuaDmgBoost.text'),
      content: t('Content.fuaDmgBoost.content', { DmgBuff: precisionRound(100 * sValuesFuaDmg[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, sValuesSkillUltDmg[s], x.damageType(DamageTag.SKILL | DamageTag.ULT).source(SOURCE_LC))
      x.buff(StatKey.DMG_BOOST, (r.fuaDmgBoost) ? sValuesFuaDmg[s] : 0, x.damageType(DamageTag.FUA).source(SOURCE_LC))
    },
  }
}

export const BeforeDawn: LightConeConfig = {
  id: '23010',
  conditionals,
}
