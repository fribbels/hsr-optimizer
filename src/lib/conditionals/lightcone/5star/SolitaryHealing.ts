import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import getContentFromLCRanks from '../getContentFromLCRank'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional, LightConeRawRank } from 'types/LightConeConditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsObject, DOT_TYPE } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  const lcRank: LightConeRawRank = {
    id: '24003',
    skill: 'Chaos Elixir',
    desc: 'When the wearer uses their Ultimate, increases DoT dealt by the wearer by #2[i]%, lasting for #3[i] turn(s).',
    params: [
      [0.2, 0.24, 2, 4],
      [0.25, 0.3, 2, 4.5],
      [0.3, 0.36, 2, 5],
      [0.35, 0.42, 2, 5.5],
      [0.4, 0.48, 2, 6],
    ],
    properties: [
      [{ type: 'BreakDamageAddedRatioBase', value: 0.2 }],
      [{ type: 'BreakDamageAddedRatioBase', value: 0.25 }],
      [{ type: 'BreakDamageAddedRatioBase', value: 0.3 }],
      [{ type: 'BreakDamageAddedRatioBase', value: 0.35 }],
      [{ type: 'BreakDamageAddedRatioBase', value: 0.4 }],
    ],
  }

  const content: ContentItem[] = [{
    lc: true,
    id: 'postUltDotDmgBuff',
    name: 'postUltDotDmgBuff',
    formItem: 'switch',
    text: 'Post ult DoT DMG buff',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
  }]

  return {
    content: () => content,
    defaults: () => ({
      postUltDotDmgBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      buffAbilityDmg(x, DOT_TYPE, sValues[s], (r.postUltDotDmgBuff))
    },
    finalizeCalculations: () => {
    },
  }
}
