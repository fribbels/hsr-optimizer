import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { ContentItem } from 'types/Conditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.08, 0.09, 0.10, 0.11, 0.12]
  const lcRanks = {
    id: '20005',
    skill: 'Concerted',
    desc: 'After entering battle, increases the ATK of all allies by #1[i]%. Effects of the same type cannot stack.',
    params: [
      [0.08],
      [0.09],
      [0.1],
      [0.11],
      [0.12],
    ],
    properties: [
      [], [], [], [], [],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'inBattleAtkBuff',
    name: 'inBattleAtkBuff',
    formItem: 'switch',
    text: 'Initial ATK buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      inBattleAtkBuff: true,
    }),
    teammateDefaults: () => ({
      inBattleAtkBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x[Stats.ATK_P] += (m.inBattleAtkBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
