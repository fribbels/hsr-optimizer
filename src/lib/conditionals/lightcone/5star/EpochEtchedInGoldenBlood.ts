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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.EpochEtchedInGoldenBlood.Content')
  const { SOURCE_LC } = Source.lightCone(EpochEtchedInGoldenBlood.id)

  const sValuesSkillDmg = [0.54, 0.675, 0.81, 0.945, 1.08]

  const teammateDefaults = {
    skillDmgBoost: true,
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillDmgBoost: {
      lc: true,
      id: 'skillDmgBoost',
      formItem: 'switch',
      text: t('skillDmgBoost.text'),
      content: t('skillDmgBoost.content', { DmgBuff: precisionRound(100 * sValuesSkillDmg[s]) }),
    },
  }

  return {
    content: () => [],
    teammateContent: () => Object.values(teammateContent),
    defaults: () => ({}),
    teammateDefaults: () => teammateDefaults,
    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.DMG_BOOST, (t.skillDmgBoost) ? sValuesSkillDmg[s] : 0, x.damageType(DamageTag.SKILL).source(SOURCE_LC))
    },
  }
}

export const EpochEtchedInGoldenBlood: LightConeConfig = {
  id: '23048',
  conditionals,
}
