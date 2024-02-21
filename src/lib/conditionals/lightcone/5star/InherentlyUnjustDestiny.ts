import { ContentItem } from 'types/Conditionals'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { ConditionalLightConeMap, LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/constants.ts'
import { Stats } from 'lib/constants.ts'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesCd = [0.40, 0.46, 0.52, 0.58, 0.64]
  const sValuesVulnerability = [0.08, 0.09, 0.10, 0.11, 0.12]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'shieldCdBuff',
      name: 'shieldCdBuff',
      formItem: 'switch',
      text: 'Shield CD buff',
      title: 'Shield CD buff',
      content: 'Shield CD buff',
    },
    {
      lc: true,
      id: 'targetVulnerability',
      name: 'targetVulnerability',
      formItem: 'switch',
      text: 'Target vulnerability debuff',
      title: 'Target vulnerability debuff',
      content: 'Target vulnerability debuff',
    },
  ]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      shieldCdBuff: true,
      targetVulnerability: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals as ConditionalLightConeMap

      x[Stats.CD] += (r.shieldCdBuff) ? sValuesCd[s] : 0
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x.DMG_TAKEN_MULTI += (m.targetVulnerability) ? sValuesVulnerability[s] : 0
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
