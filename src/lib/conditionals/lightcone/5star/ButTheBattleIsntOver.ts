import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import getContentFromLCRanks from '../getContentFromLCRank'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional, LightConeRawRank } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesDmg = [0.30, 0.35, 0.40, 0.45, 0.50]

  const lcRank: LightConeRawRank = {
    id: '23003',
    skill: 'Heir',
    desc: 'When the wearer uses their Skill, the next ally taking action (except the wearer) deals #2[i]% more DMG for #3[i] turn(s).',
    params: [
      [0.1, 0.3, 1],
      [0.12, 0.35, 1],
      [0.14, 0.4, 1],
      [0.16, 0.45, 1],
      [0.18, 0.5, 1],
    ],
    properties: [
      [{ type: 'SPRatioBase', value: 0.1 }],
      [{ type: 'SPRatioBase', value: 0.12 }],
      [{ type: 'SPRatioBase', value: 0.14 }],
      [{ type: 'SPRatioBase', value: 0.16 }],
      [{ type: 'SPRatioBase', value: 0.18 }],
    ],
  }

  const content: ContentItem[] = [{
    lc: true,
    id: 'postSkillDmgBuff',
    name: 'postSkillDmgBuff',
    formItem: 'switch',
    text: 'Post skill DMG buff',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
  }]

  return {
    content: () => [],
    teammateContent: () => content,
    defaults: () => ({}),
    teammateDefaults: () => ({
      postSkillDmgBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.lightConeConditionals

      x.ELEMENTAL_DMG += (t.postSkillDmgBuff) ? sValuesDmg[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
