import i18next from 'i18next'
import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })
  const { SOURCE_LC } = Source.lightCone(UponTheFirstEchoOfAha.id)

  const sValuesDefPen = [0.16, 0.18, 0.20, 0.22, 0.24]

  const defaults = {
    teamDefPen: true,
  }

  const teammateDefaults = {
    teamDefPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    teamDefPen: {
      lc: true,
      id: 'teamDefPen',
      formItem: 'switch',
      text: 'Team DEF PEN',
      content: betaContent,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    teamDefPen: content.teamDefPen,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.DEF_PEN, m.teamDefPen ? sValuesDefPen[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const UponTheFirstEchoOfAha: LightConeConfig = {
  id: '23065',
  conditionals,
}
