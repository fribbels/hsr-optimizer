import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  const lcRanks = {
    id: '21005',
    skill: 'Fantastic Adventure',
    desc: "When the wearer uses Basic ATK, Skill, or Ultimate to attack enemies, the wearer gains one stack of Mischievous. Each stack increases the wearer's ATK by #1[i]%.",
    params: [
      [0.12],
      [0.15],
      [0.18],
      [0.21],
      [0.24],
    ],
    properties: [
      [], [], [], [], [],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'atkBuffStacks',
    name: 'atkBuffStacks',
    formItem: 'slider',
    text: 'ATK buff stacks',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
    min: 0,
    max: 3,
  }]

  return {
    content: () => content,
    defaults: () => ({
      atkBuffStacks: 3,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.ATK_P] += (r.atkBuffStacks) * sValues[s]
    },
    finalizeCalculations: () => {
    },
  }
}
