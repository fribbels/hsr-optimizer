import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsObject, ULT_TYPE } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.28, 0.35, 0.42, 0.49, 0.56]
  const lcRanks = {
    id: '20006',
    skill: 'Learned',
    desc: "Increases the wearer's Ultimate DMG by #1[i]%.",
    params: [
      [0.28],
      [0.35],
      [0.42],
      [0.49],
      [0.56],
    ],
    properties: [
      [], [], [], [], [],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'ultDmgBuff',
    name: 'ultDmgBuff',
    formItem: 'switch',
    text: 'Ult DMG buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    defaults: () => ({
      ultDmgBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      buffAbilityDmg(x, ULT_TYPE, sValues[s], (r.ultDmgBuff))
    },
    finalizeCalculations: () => {
    },
  }
}
