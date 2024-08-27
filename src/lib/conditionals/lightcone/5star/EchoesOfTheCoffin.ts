import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import getContentFromLCRanks from '../getContentFromLCRank'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional, LightConeRawRank } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [12, 14, 16, 18, 20]

  const lcRank: LightConeRawRank = {
    id: '23008',
    skill: 'Thorns',
    desc: 'After the wearer uses an attack, for each different enemy target the wearer hits, regenerates #3[f1] Energy. Each attack can regenerate Energy up to #4[i] time(s) this way. After the wearer uses their Ultimate, all allies gain #2[i] SPD for 1 turn.',
    params: [
      [0.24, 12, 3, 3],
      [0.28, 14, 3.5, 3],
      [0.32, 16, 4, 3],
      [0.36, 18, 4.5, 3],
      [0.4, 20, 5, 3],
    ],
    properties: [
      [{ type: 'AttackAddedRatio', value: 0.24 }],
      [{ type: 'AttackAddedRatio', value: 0.28 }],
      [{ type: 'AttackAddedRatio', value: 0.32 }],
      [{ type: 'AttackAddedRatio', value: 0.36 }],
      [{ type: 'AttackAddedRatio', value: 0.4 }],
    ],
  }

  const content: ContentItem[] = [{
    lc: true,
    id: 'postUltSpdBuff',
    name: 'postUltSpdBuff',
    formItem: 'switch',
    text: 'Post ult SPD buff',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
  }]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      postUltSpdBuff: false,
    }),
    teammateDefaults: () => ({
      postUltSpdBuff: false,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x[Stats.SPD] += (m.postUltSpdBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
