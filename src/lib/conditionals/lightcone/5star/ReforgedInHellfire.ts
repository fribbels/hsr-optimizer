import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import i18next from 'i18next'
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
  const { SOURCE_LC } = Source.lightCone(ReforgedInHellfire.id)

  const sValuesHp = [0.24, 0.30, 0.36, 0.42, 0.48]
  const sValuesTeamCd = [0.30, 0.375, 0.45, 0.525, 0.60]
  const sValuesSelfCd = [0.30, 0.375, 0.45, 0.525, 0.60]

  const defaults = {
    purgatoryState: true,
  }

  const teammateDefaults = {
    purgatoryState: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    purgatoryState: {
      lc: true,
      id: 'purgatoryState',
      formItem: 'switch',
      text: 'Purgatory state',
      content: betaContent,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    purgatoryState: content.purgatoryState,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      x.buff(StatKey.HP_P, sValuesHp[s], x.source(SOURCE_LC))

      const r = action.lightConeConditionals as Conditionals<typeof content>
      x.buff(StatKey.CD, r.purgatoryState ? sValuesSelfCd[s] : 0, x.source(SOURCE_LC))
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.CD, m.purgatoryState ? sValuesTeamCd[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const ReforgedInHellfire: LightConeConfig = {
  id: '23040', // TODO(HUMAN): verify light cone ID from game_data.json
  conditionals,
}
