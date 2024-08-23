import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import getContentFromLCRanks from '../getContentFromLCRank'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional, LightConeRawRank } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesAtk = [0.18, 0.21, 0.24, 0.27, 0.30]
  const sValuesErr = [0.06, 0.07, 0.08, 0.09, 0.10]

  const lcRank: LightConeRawRank = {
    id: '23015',
    skill: 'Defiant Till Death',
    desc: "When the wearer uses their Basic ATK, they will gain 1 stack of Dragon's Call, lasting for #2[i] turns. Each stack of Dragon's Call increases the wearer's ATK by #4[i]% and Energy Regeneration Rate by #5[f1]%. Dragon's Call can be stacked up to #3[i] times.",
    params: [
      [0.18, 2, 2, 0.18, 0.06],
      [0.21, 2, 2, 0.21, 0.07],
      [0.24, 2, 2, 0.24, 0.08],
      [0.27, 2, 2, 0.27, 0.09],
      [0.3, 2, 2, 0.3, 0.1],
    ],
    properties: [
      [{ type: 'CriticalChanceBase', value: 0.18 }],
      [{ type: 'CriticalChanceBase', value: 0.21 }],
      [{ type: 'CriticalChanceBase', value: 0.24 }],
      [{ type: 'CriticalChanceBase', value: 0.27 }],
      [{ type: 'CriticalChanceBase', value: 0.3 }],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'dragonsCallStacks',
    name: 'dragonsCallStacks',
    formItem: 'slider',
    text: "Dragon's Call stacks",
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
    min: 0,
    max: 2,
  }]

  return {
    content: () => content,
    defaults: () => ({
      dragonsCallStacks: 2,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.ATK_P] += r.dragonsCallStacks * sValuesAtk[s]
      x[Stats.ERR] += r.dragonsCallStacks * sValuesErr[s]
    },
    finalizeCalculations: () => {
    },
  }
}
