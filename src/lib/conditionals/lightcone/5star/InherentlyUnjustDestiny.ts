import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.InherentlyUnjustDestiny')
  const { SOURCE_LC } = Source.lightCone(InherentlyUnjustDestiny.id)

  const sValuesCd = [0.40, 0.46, 0.52, 0.58, 0.64]
  const sValuesVulnerability = [0.10, 0.115, 0.13, 0.145, 0.16]

  const defaults = {
    shieldCdBuff: true,
    targetVulnerability: true,
  }

  const teammateDefaults = {
    targetVulnerability: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    shieldCdBuff: {
      lc: true,
      id: 'shieldCdBuff',
      formItem: 'switch',
      text: t('Content.shieldCdBuff.text'),
      content: t('Content.shieldCdBuff.content', { CritBuff: precisionRound(100 * sValuesCd[s]) }),
    },
    targetVulnerability: {
      lc: true,
      id: 'targetVulnerability',
      formItem: 'switch',
      text: t('Content.targetVulnerability.text'),
      content: t('Content.targetVulnerability.content', {
        baseChance: precisionRound(100 + 15 * s),
        Vulnerability: precisionRound(100 * sValuesVulnerability[s]),
      }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    targetVulnerability: content.targetVulnerability,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.CD, (r.shieldCdBuff) ? sValuesCd[s] : 0, x.source(SOURCE_LC))
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.VULNERABILITY, (m.targetVulnerability) ? sValuesVulnerability[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const InherentlyUnjustDestiny: LightConeConfig = {
  id: '23023',
  conditionals,
}
