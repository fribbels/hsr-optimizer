import { ContentItem } from 'types/Conditionals'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import getContentFromLCRanks from '../getContentFromLCRank'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional, LightConeRawRank } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesDmg = [0.06, 0.07, 0.08, 0.09, 0.10]
  const sValuesCd = [0.12, 0.14, 0.16, 0.18, 0.20]

  const lcRank: LightConeRawRank = {
    id: '23001',
    skill: 'Flowers and Butterflies',
    desc: "While the wearer is in battle, for every #2[i] SPD that exceeds 100, the DMG of the wearer's Basic ATK and Skill is increased by #3[i]% and the CRIT DMG of their Ultimate is increased by #4[i]%. This effect can stack up to #5[i] time(s).",
    params: [
      [0.18, 10, 0.06, 0.12, 6],
      [0.21, 10, 0.07, 0.14, 6],
      [0.24, 10, 0.08, 0.16, 6],
      [0.27, 10, 0.09, 0.18, 6],
      [0.3, 10, 0.1, 0.2, 6],
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
    id: 'spdScalingBuffs',
    name: 'spdScalingBuffs',
    formItem: 'switch',
    text: 'Speed scaling buffs enabled',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      spdScalingBuffs: true,
    }),
    precomputeEffects: (/* x, request */) => {
      // const r = request.lightConeConditionals;
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals
      const x = c['x']

      const stacks = Math.max(0, Math.min(6, Math.floor((x[Stats.SPD] - 100) / 10)))

      x.BASIC_BOOST += (r.spdScalingBuffs) ? stacks * sValuesDmg[s] : 0
      x.SKILL_BOOST += (r.spdScalingBuffs) ? stacks * sValuesDmg[s] : 0
      x.ULT_CD_BOOST += (r.spdScalingBuffs) ? stacks * sValuesCd[s] : 0
    },
  }
}
