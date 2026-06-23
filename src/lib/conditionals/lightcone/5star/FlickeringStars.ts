import i18next from 'i18next'
import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { type LightConeConditionalsController } from 'types/conditionals'
import {
  type LightConeId,
  type SuperImpositionLevel,
} from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const FLICKERING_STARS_ID = '23061' as unknown as LightConeId

const conditionals = (s: SuperImpositionLevel, _withContent: boolean): LightConeConditionalsController => {
  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })
  const { SOURCE_LC } = Source.lightCone(FLICKERING_STARS_ID)

  const sValuesSkillDmg = [0.72, 0.84, 0.96, 1.08, 1.20]
  const sValuesDefPen = [0.20, 0.24, 0.28, 0.32, 0.36]

  const defaults = {
    radiantCrown: true,
  }

  const teammateDefaults = {
    radiantCrown: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    radiantCrown: {
      lc: true,
      id: 'radiantCrown',
      formItem: 'switch',
      text: 'Radiant Crown',
      content: betaContent,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    radiantCrown: content.radiantCrown,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.BOOST, r.radiantCrown ? sValuesSkillDmg[s] : 0, x.damageType(DamageTag.SKILL).source(SOURCE_LC))
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.DEF_PEN, m.radiantCrown ? sValuesDefPen[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const FlickeringStars: LightConeConfig = {
  id: FLICKERING_STARS_ID,
  conditionals,
  display: {
    imageOffset: { x: 0, y: -80, s: 1.05 },
  },
}
