import { ContentDefinition, findContentId } from 'lib/conditionals/conditionalUtils'
import { Stats } from 'lib/constants'
import { ComputedStatsArray } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.InherentlyUnjustDestiny')

  const sValuesCd = [0.40, 0.46, 0.52, 0.58, 0.64]
  const sValuesVulnerability = [0.10, 0.115, 0.13, 0.145, 0.16]

  const content: ContentDefinition<typeof defaults> = [
    {
      lc: true,
      id: 'shieldCdBuff',
      formItem: 'switch',
      text: t('Content.shieldCdBuff.text'),
      content: t('Content.shieldCdBuff.content', { CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]) }),
    },
    {
      lc: true,
      id: 'targetVulnerability',
      formItem: 'switch',
      text: t('Content.targetVulnerability.text'),
      content: t('Content.targetVulnerability.content', { Vulnerability: TsUtils.precisionRound(100 * sValuesVulnerability[s]) }),
    },
  ]

  const teammateContent: ContentDefinition<typeof teammateDefaults> = [
    findContentId(content, 'targetVulnerability'),
  ]

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => ({
      shieldCdBuff: true,
      targetVulnerability: true,
    }),
    teammateDefaults: () => ({
      targetVulnerability: true,
    }),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.CD] += (r.shieldCdBuff) ? sValuesCd[s] : 0
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals

      x.VULNERABILITY += (m.targetVulnerability) ? sValuesVulnerability[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
