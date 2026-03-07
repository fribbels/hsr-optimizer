import i18next from 'i18next'
import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { LightConeConfig } from 'types/lightConeConfig'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const { SOURCE_LC } = Source.lightCone(TheFinaleOfALie.id)

  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })

  const sValuesAtk = [0.40, 0.50, 0.60, 0.70, 0.80]
  const sValuesVulnerability = [0.20, 0.225, 0.25, 0.275, 0.30]

  const defaults = {
    umbraDevourerBuff: true,
  }

  const teammateDefaults = {
    umbraDevourerBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    umbraDevourerBuff: {
      lc: true,
      id: 'umbraDevourerBuff',
      formItem: 'switch',
      text: 'Umbra Devourer',
      content: betaContent,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    umbraDevourerBuff: content.umbraDevourerBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.ATK_P, (r.umbraDevourerBuff) ? sValuesAtk[s] : 0, x.source(SOURCE_LC))
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.VULNERABILITY, (m.umbraDevourerBuff) ? sValuesVulnerability[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const TheFinaleOfALie: LightConeConfig = {
  id: '23056',
  conditionals,
}
