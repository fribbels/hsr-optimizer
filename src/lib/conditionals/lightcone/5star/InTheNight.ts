import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import getContentFromLCRanks from '../getContentFromLCRank'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional, LightConeRawRank } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { buffAbilityCd, buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { BASIC_TYPE, ComputedStatsObject, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'

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
    defaults: () => ({
      spdScalingBuffs: true,
    }),
    precomputeEffects: () => {
    },
    finalizeCalculations: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals
      const stacks = Math.max(0, Math.min(6, Math.floor((x[Stats.SPD] - 100) / 10)))

      buffAbilityDmg(x, BASIC_TYPE | SKILL_TYPE, stacks * sValuesDmg[s], (r.spdScalingBuffs))
      buffAbilityCd(x, ULT_TYPE, stacks * sValuesCd[s], (r.spdScalingBuffs))
    },
    gpuFinalizeCalculations: (request: Form) => {
      const r = request.lightConeConditionals

      return `
if (${wgslTrue(r.spdScalingBuffs)}) {
  let stacks = max(0, min(6, floor((x.SPD - 100) / 10)));

  buffAbilityDmg(p_x, BASIC_TYPE | SKILL_TYPE, stacks * ${sValuesDmg[s]}, 1);
  buffAbilityCd(p_x, ULT_TYPE, stacks * ${sValuesCd[s]}, 1);
}
    `
    },
  }
}
