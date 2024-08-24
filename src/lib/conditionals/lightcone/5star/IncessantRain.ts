import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import getContentFromLCRanks from '../getContentFromLCRank'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional, LightConeRawRank } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { findContentId } from 'lib/conditionals/conditionalUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesCr = [0.12, 0.14, 0.16, 0.18, 0.20]
  const sValuesDmg = [0.12, 0.14, 0.16, 0.18, 0.20]

  const lcRank: LightConeRawRank = {
    id: '23007',
    skill: 'Mirage of Reality',
    desc: "When the wearer deals DMG to an enemy that currently has #4[i] or more debuffs, increases the wearer's CRIT Rate by #5[i]%.",
    params: [
      [0.24, 1, 0.12, 3, 0.12],
      [0.28, 1, 0.14, 3, 0.14],
      [0.32, 1, 0.16, 3, 0.16],
      [0.36, 1, 0.18, 3, 0.18],
      [0.4, 1, 0.2, 3, 0.2],
    ],
    properties: [
      [{ type: 'StatusProbabilityBase', value: 0.24 }],
      [{ type: 'StatusProbabilityBase', value: 0.28 }],
      [{ type: 'StatusProbabilityBase', value: 0.32 }],
      [{ type: 'StatusProbabilityBase', value: 0.36 }],
      [{ type: 'StatusProbabilityBase', value: 0.4 }],
    ],
  }
  const lcRank2: LightConeRawRank = {
    ...lcRank,
    desc: `After the wearer uses their Basic ATK, Skill, or Ultimate, there is a chance to implant Aether Code on a random hit target that does not yet have it. Targets with Aether Code receive #3[i]% increased DMG for 1 turn.`,
  }

  const content: ContentItem[] = [{
    lc: true,
    id: 'enemy3DebuffsCrBoost',
    name: 'enemy3DebuffsCrBoost',
    formItem: 'switch',
    text: 'Enemy ≤ 3 debuffs CR buff',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
  }, {
    lc: true,
    id: 'targetCodeDebuff',
    name: 'targetCodeDebuff',
    formItem: 'switch',
    text: 'Target Aether Code debuff',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank2),
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'targetCodeDebuff'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      enemy3DebuffsCrBoost: true,
      targetCodeDebuff: true,
    }),
    teammateDefaults: () => ({
      targetCodeDebuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CR] += (r.enemy3DebuffsCrBoost) ? sValuesCr[s] : 0
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x.VULNERABILITY += (m.targetCodeDebuff) ? sValuesDmg[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
