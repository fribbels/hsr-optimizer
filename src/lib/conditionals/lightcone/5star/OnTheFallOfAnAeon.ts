import { ContentItem } from 'types/Conditionals'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import getContentFromLCRanks from '../getContentFromLCRank'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional, LightConeRawRank } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesAtkStacks = [0.08, 0.10, 0.12, 0.14, 0.16]
  const sValuesDmgBuff = [0.12, 0.15, 0.18, 0.21, 0.24]

  const lcRank: LightConeRawRank = {
    id: '24000',
    skill: 'Moth to Flames',
    desc: 'Whenever the wearer attacks, their ATK is increased by #1[i]% in this battle. This effect can stack up to #2[i] time(s).',
    params: [
      [0.08, 4, 0.12, 2],
      [0.1, 4, 0.15, 2],
      [0.12, 4, 0.18, 2],
      [0.14, 4, 0.21, 2],
      [0.16, 4, 0.24, 2],
    ],
    properties: [
      [], [], [], [], [],
    ],
  }
  const lcRank2: LightConeRawRank = {
    ...lcRank,
    desc: `After a character inflicts Weakness Break on an enemy, the wearer's DMG increases by #3[i]% for #4[i] turn(s).`,
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'atkBoostStacks',
    name: 'atkBoostStacks',
    formItem: 'slider',
    text: 'ATK boost stacks',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
    min: 0,
    max: 4,
  }, {
    lc: true,
    id: 'weaknessBreakDmgBuff',
    name: 'weaknessBreakDmgBuff',
    formItem: 'switch',
    text: 'Weakness break DMG buff',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank2),
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      atkBoostStacks: 4,
      weaknessBreakDmgBuff: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.ATK_P] += r.atkBoostStacks * sValuesAtkStacks[s]
      x.ELEMENTAL_DMG += (r.weaknessBreakDmgBuff) ? sValuesDmgBuff[s] : 0
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
