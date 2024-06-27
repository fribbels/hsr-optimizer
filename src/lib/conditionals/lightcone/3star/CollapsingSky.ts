import { SuperImpositionLevel } from 'types/LightCone'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { BASIC_TYPE, SKILL_TYPE } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.20, 0.25, 0.30, 0.35, 0.40]
  const lcRanks = {
    id: '20002',
    skill: 'Havoc',
    desc: "Increases the wearer's Basic ATK and Skill DMG by #1[i]%.",
    params: [
      [0.2],
      [0.25],
      [0.3],
      [0.35],
      [0.4],
    ],
    properties: [
      [], [], [], [], [],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'basicSkillDmgBuff',
    name: 'basicSkillDmgBuff',
    formItem: 'switch',
    text: 'Basic/Skill DMG buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      basicSkillDmgBuff: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      r.basicSkillDmgBuff && buffAbilityDmg(x, [BASIC_TYPE, SKILL_TYPE], sValues[s])
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
