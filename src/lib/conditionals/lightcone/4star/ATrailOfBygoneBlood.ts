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
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ATrailOfBygoneBlood.Content')
  const { SOURCE_LC } = Source.lightCone(ATrailOfBygoneBlood.id)

  const sValuesSkillUltDmg = [0.24, 0.28, 0.32, 0.36, 0.40]

  const defaults = {
    skillUltDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillUltDmgBoost: {
      lc: true,
      id: 'skillUltDmgBoost',
      formItem: 'switch',
      text: t('skillUltDmgBoost.text'),
      content: t('skillUltDmgBoost.content', { DmgBuff: precisionRound(100 * sValuesSkillUltDmg[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, (r.skillUltDmgBoost) ? sValuesSkillUltDmg[s] : 0, x.damageType(DamageTag.SKILL | DamageTag.ULT).source(SOURCE_LC))
    },
  }
}

export const ATrailOfBygoneBlood: LightConeConfig = {
  id: '21058',
  conditionals,
}
