import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import getContentFromLCRanks from '../getContentFromLCRank'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional, LightConeRawRank } from 'types/LightConeConditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsObject, FUA_TYPE, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesSkillUltDmg = [0.18, 0.21, 0.24, 0.27, 0.30]
  const sValuesFuaDmg = [0.48, 0.56, 0.64, 0.72, 0.80]

  const lcRank: LightConeRawRank = {
    id: '23010',
    skill: 'Long Night',
    desc: "Increases the wearer's CRIT DMG by #1[i]%. Increases the wearer's Skill and Ultimate DMG by #2[i]%.",
    params: [
      [0.36, 0.18, 0.48],
      [0.42, 0.21, 0.56],
      [0.48, 0.24, 0.64],
      [0.54, 0.27, 0.72],
      [0.6, 0.3, 0.8],
    ],
    properties: [
      [{ type: 'CriticalDamageBase', value: 0.36 }],
      [{ type: 'CriticalDamageBase', value: 0.42 }],
      [{ type: 'CriticalDamageBase', value: 0.48 }],
      [{ type: 'CriticalDamageBase', value: 0.54 }],
      [{ type: 'CriticalDamageBase', value: 0.6 }],
    ],
  }
  const lcRank2: LightConeRawRank = {
    ...lcRank,
    desc: `After the wearer uses their Skill or Ultimate, they gain Somnus Corpus. Upon triggering a follow-up attack, Somnus Corpus will be consumed and the follow-up attack DMG increases by #3[i]%.`,
  }

  const content: ContentItem[] = [{
    lc: true,
    id: 'fuaDmgBoost',
    name: 'fuaDmgBoost',
    formItem: 'switch',
    text: 'FUA DMG boost',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank2),
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      fuaDmgBoost: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      buffAbilityDmg(x, SKILL_TYPE | ULT_TYPE, sValuesSkillUltDmg[s])
      buffAbilityDmg(x, FUA_TYPE, sValuesFuaDmg[s], (r.fuaDmgBoost))
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
