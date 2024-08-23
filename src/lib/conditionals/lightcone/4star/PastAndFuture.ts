import { LightConeConditional } from 'types/LightConeConditionals'
import { ContentItem } from 'types/Conditionals'
import getContentFromLCRanks from 'lib/conditionals/lightcone/getContentFromLCRank'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.16, 0.20, 0.24, 0.28, 0.32]
  const lcRank = {
    id: '21025',
    skill: 'Kites From the Past',
    desc: 'When the wearer uses their Skill, the next ally taking action (except the wearer) deals #1[i]% increased DMG for #2[i] turn(s).',
    params: [[0.16, 1], [0.2, 1], [0.24, 1], [0.28, 1], [0.32, 1]],
    properties: [[], [], [], [], []],
  }

  const content: ContentItem[] = [{
    lc: true,
    id: 'postSkillDmgBuff',
    name: 'postSkillDmgBuff',
    formItem: 'switch',
    text: 'Post skill DMG buff',
    title: 'Post skill DMG buff',
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

      x.ELEMENTAL_DMG += (t.postSkillDmgBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
