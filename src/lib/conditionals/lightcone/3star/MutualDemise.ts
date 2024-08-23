import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { ContentItem } from 'types/Conditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  const lcRanks = {
    id: '20016',
    skill: 'Legion',
    desc: "If the wearer's current HP is lower than #1[i]%, CRIT Rate increases by #2[i]%.",
    params: [
      [0.8, 0.12],
      [0.8, 0.15],
      [0.8, 0.18],
      [0.8, 0.21],
      [0.8, 0.24],
    ],
    properties: [
      [], [], [], [], [],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'selfHp80CrBuff',
    name: 'selfHp80CrBuff',
    formItem: 'switch',
    text: 'Self HP < 80% CR buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    defaults: () => ({
      selfHp80CrBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CR] += (r.selfHp80CrBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
