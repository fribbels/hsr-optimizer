import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.20, 0.25, 0.30, 0.35, 0.40]
  const lcRanks = {
    id: '21040',
    skill: 'Stratagem',
    desc: "When the wearer uses an attack and at least 2 attacked enemies have the corresponding Weakness, the wearer's CRIT DMG increases by #2[i]% for #3[i] turn(s).",
    params: [
      [0.16, 0.2, 2],
      [0.18, 0.25, 2],
      [0.2, 0.3, 2],
      [0.22, 0.35, 2],
      [0.24, 0.4, 2],
    ],
    properties: [
      [{ type: 'AttackAddedRatio', value: 0.16 }],
      [{ type: 'AttackAddedRatio', value: 0.18 }],
      [{ type: 'AttackAddedRatio', value: 0.2 }],
      [{ type: 'AttackAddedRatio', value: 0.22 }],
      [{ type: 'AttackAddedRatio', value: 0.24 }],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'cdBuffActive',
    name: 'cdBuffActive',
    formItem: 'switch',
    text: '≥ 2 weakness targets CD buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    defaults: () => ({
      cdBuffActive: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CD] += (r.cdBuffActive) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
