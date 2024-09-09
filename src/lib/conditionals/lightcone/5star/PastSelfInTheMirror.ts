import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import getContentFromLCRanks from '../getContentFromLCRank'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional, LightConeRawRank } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.24, 0.28, 0.32, 0.36, 0.40]

  const lcRank: LightConeRawRank = {
    id: '23019',
    skill: 'The Plum Fragrance In My Bones',
    desc: "When the wearer uses their Ultimate, increases all allies' DMG by #2[i]%, lasting for #3[i] turn(s).",
    params: [
      [0.6, 0.24, 3, 1.5, 10],
      [0.7, 0.28, 3, 1.5, 12.5],
      [0.8, 0.32, 3, 1.5, 15],
      [0.9, 0.36, 3, 1.5, 17.5],
      [1, 0.4, 3, 1.5, 20],
    ],
    properties: [
      [{ type: 'BreakDamageAddedRatioBase', value: 0.6 }],
      [{ type: 'BreakDamageAddedRatioBase', value: 0.7 }],
      [{ type: 'BreakDamageAddedRatioBase', value: 0.8 }],
      [{ type: 'BreakDamageAddedRatioBase', value: 0.9 }],
      [{ type: 'BreakDamageAddedRatioBase', value: 1 }],
    ],
  }

  const content: ContentItem[] = [{
    lc: true,
    id: 'postUltDmgBuff',
    name: 'postUltDmgBuff',
    formItem: 'switch',
    text: 'Post Ult DMG buff',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
  }]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      postUltDmgBuff: true,
    }),
    teammateDefaults: () => ({
      postUltDmgBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x.ELEMENTAL_DMG += (m.postUltDmgBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
