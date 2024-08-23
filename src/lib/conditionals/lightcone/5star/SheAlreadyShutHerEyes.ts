import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import getContentFromLCRanks from '../getContentFromLCRank'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional, LightConeRawRank } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.09, 0.105, 0.12, 0.135, 0.15]

  const lcRank: LightConeRawRank = {
    id: '23011',
    skill: 'Visioscape',
    desc: "When the wearer's HP is reduced, all allies' DMG dealt increases by #2[f1]%, lasting for #5[i] turn(s).",
    params: [
      [0.24, 0.09, 0.8, 0.12, 2],
      [0.28, 0.105, 0.85, 0.14, 2],
      [0.32, 0.12, 0.9, 0.16, 2],
      [0.36, 0.135, 0.95, 0.18, 2],
      [0.4, 0.15, 1, 0.2, 2],
    ],
    properties: [
      [{ type: 'HPAddedRatio', value: 0.24 }, { type: 'SPRatioBase', value: 0.12 }],
      [{ type: 'HPAddedRatio', value: 0.28 }, { type: 'SPRatioBase', value: 0.14 }],
      [{ type: 'HPAddedRatio', value: 0.32 }, { type: 'SPRatioBase', value: 0.16 }],
      [{ type: 'HPAddedRatio', value: 0.36 }, { type: 'SPRatioBase', value: 0.18 }],
      [{ type: 'HPAddedRatio', value: 0.4 }, { type: 'SPRatioBase', value: 0.2 }],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'hpLostDmgBuff',
    name: 'hpLostDmgBuff',
    formItem: 'switch',
    text: 'HP lost DMG buff',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
  }]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      hpLostDmgBuff: true,
    }),
    teammateDefaults: () => ({
      hpLostDmgBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x.ELEMENTAL_DMG += (m.hpLostDmgBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
