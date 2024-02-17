import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { Stats } from 'lib/constants.ts'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesDmg = [0.06, 0.07, 0.08, 0.09, 0.10]
  const sValuesAtkBuff = [0.20, 0.24, 0.28, 0.32, 0.36]

  const lcRanks = {
    id: '21041',
    skill: 'Self-Amusement',
    desc: "When the wearer inflicts a debuff on an enemy, gains a stack of Trick. Every stack of Trick increases the wearer's DMG dealt by #1[i]%, stacking up to #2[i] time(s). This effect lasts for #3[i] turn(s). When the wearer's Effect Hit Rate is #4[i]% or higher, increases ATK by #5[i]%.",
    params: [
      [0.06, 3, 1, 0.8, 0.2],
      [0.07, 3, 1, 0.8, 0.24],
      [0.08, 3, 1, 0.8, 0.28],
      [0.09, 3, 1, 0.8, 0.32],
      [0.1, 3, 1, 0.8, 0.36],
    ],
    properties: [
      [], [], [], [], [],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'trickStacks',
    name: 'trickStacks',
    formItem: 'slider',
    text: 'Trick stacks',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
    min: 0,
    max: 3,
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      trickStacks: 3,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += r.trickStacks * sValuesDmg[s]
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (c, request) => {
      const x = c['x']

      x[Stats.ATK] += x[Stats.EHR] >= 0.80 ? request.baseAtk * sValuesAtkBuff[s] : 0
    },
  }
}
