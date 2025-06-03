import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.InherentlyUnjustDestiny')
  const { SOURCE_LC } = Source.lightCone('23023')

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
      content: t('Content.shieldCdBuff.content', { CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]) }),
    },
    targetVulnerability: {
      lc: true,
      id: 'targetVulnerability',
      formItem: 'switch',
      text: t('Content.targetVulnerability.text'),
      content: t('Content.targetVulnerability.content', {
        baseChance: TsUtils.precisionRound(100 + 15 * s),
        Vulnerability: TsUtils.precisionRound(100 * sValuesVulnerability[s]),
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
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.CD.buff((r.shieldCdBuff) ? sValuesCd[s] : 0, SOURCE_LC)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.VULNERABILITY.buffTeam((m.targetVulnerability) ? sValuesVulnerability[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
