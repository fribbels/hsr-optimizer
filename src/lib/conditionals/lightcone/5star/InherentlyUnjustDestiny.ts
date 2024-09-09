import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { findContentId, precisionRound } from 'lib/conditionals/conditionalUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesCd = [0.40, 0.46, 0.52, 0.58, 0.64]
  const sValuesVulnerability = [0.10, 0.115, 0.13, 0.145, 0.16]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'shieldCdBuff',
      name: 'shieldCdBuff',
      formItem: 'switch',
      text: 'Shield CD buff',
      title: 'All-In',
      content: `When the wearer provides a Shield to an ally, the wearer's CRIT DMG increases by ${precisionRound(sValuesCd[s] * 100)}%, lasting for 2 turn(s).`,
    },
    {
      lc: true,
      id: 'targetVulnerability',
      name: 'targetVulnerability',
      formItem: 'switch',
      text: 'Target vulnerability debuff',
      title: 'All-In',
      content: `When the wearer's follow-up attack hits an enemy target, there is a 100% base chance to increase the DMG taken by the attacked enemy target by ${precisionRound(sValuesVulnerability[s] * 100)}%, lasting for 2 turn(s).`,
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'targetVulnerability'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      shieldCdBuff: true,
      targetVulnerability: true,
    }),
    teammateDefaults: () => ({
      targetVulnerability: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CD] += (r.shieldCdBuff) ? sValuesCd[s] : 0
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x.VULNERABILITY += (m.targetVulnerability) ? sValuesVulnerability[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
