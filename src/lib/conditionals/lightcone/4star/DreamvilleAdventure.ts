import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { BASIC_TYPE, ComputedStatsObject, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants.ts'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.12, 0.14, 0.16, 0.18, 0.20]
  const lcRanks = {
    id: '21036',
    skill: 'Solidarity',
    desc: "After the wearer uses a certain type of ability such as Basic ATK, Skill, or Ultimate, all allies gain Childishness, which increases allies' DMG for the same type of ability as used by the wearer by #1[i]%. Childishness only takes effect for the most recent type of ability the wearer used and cannot be stacked.",
    params: [
      [0.12],
      [0.14],
      [0.16],
      [0.18],
      [0.2],
    ],
    properties: [
      [], [], [], [], [],
    ],
  }
  const content: ContentItem[] = [
    {
      lc: true,
      id: 'ultDmgBuff',
      name: 'ultDmgBuff',
      formItem: 'switch',
      text: 'Ult DMG buff',
      title: lcRanks.skill,
      content: getContentFromLCRanks(s, lcRanks),
    },
    {
      lc: true,
      id: 'skillDmgBuff',
      name: 'skillDmgBuff',
      formItem: 'switch',
      text: 'Skill DMG buff',
      title: lcRanks.skill,
      content: getContentFromLCRanks(s, lcRanks),
    }, {
      lc: true,
      id: 'basicDmgBuff',
      name: 'basicDmgBuff',
      formItem: 'switch',
      text: 'Basic DMG buff',
      title: lcRanks.skill,
      content: getContentFromLCRanks(s, lcRanks),
    },
  ]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      ultDmgBuff: true,
      skillDmgBuff: false,
      basicDmgBuff: false,
    }),
    teammateDefaults: () => ({
      ultDmgBuff: true,
      skillDmgBuff: false,
      basicDmgBuff: false,
    }),
    precomputeEffects: (_x: PrecomputedCharacterConditional, _request: Form) => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      m.basicDmgBuff && buffAbilityDmg(x, [BASIC_TYPE], sValues[s])
      m.skillDmgBuff && buffAbilityDmg(x, [SKILL_TYPE], sValues[s])
      m.ultDmgBuff && buffAbilityDmg(x, [ULT_TYPE], sValues[s])
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
