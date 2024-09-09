import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import getContentFromLCRanks from '../getContentFromLCRank'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional, LightConeRawRank } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesCr = [0.08, 0.10, 0.12, 0.14, 0.16]
  const sValuesAtk = [0.20, 0.25, 0.30, 0.35, 0.40]

  const lcRank: LightConeRawRank = {
    id: '24001',
    skill: 'Chase',
    desc: "Increases the wearer's CRIT rate against enemies with HP less than or equal to #2[i]% by an extra #3[i]%.",
    params: [
      [0.08, 0.5, 0.08, 0.2, 2],
      [0.1, 0.5, 0.1, 0.25, 2],
      [0.12, 0.5, 0.12, 0.3, 2],
      [0.14, 0.5, 0.14, 0.35, 2],
      [0.16, 0.5, 0.16, 0.4, 2],
    ],
    properties: [
      [{ type: 'CriticalChanceBase', value: 0.08 }],
      [{ type: 'CriticalChanceBase', value: 0.1 }],
      [{ type: 'CriticalChanceBase', value: 0.12 }],
      [{ type: 'CriticalChanceBase', value: 0.14 }],
      [{ type: 'CriticalChanceBase', value: 0.16 }],
    ],
  }
  const lcRank2: LightConeRawRank = {
    ...lcRank,
    desc: 'When the wearer defeats an enemy, their ATK is increased by #4[i]% for #5[i] turn(s).',
  }

  const content: ContentItem[] = [{
    lc: true,
    id: 'enemyHp50CrBoost',
    name: 'enemyHp50CrBoost',
    formItem: 'switch',
    text: 'Enemy HP ≤ 50% CR buff',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
  }, {
    lc: true,
    id: 'enemyDefeatedAtkBuff',
    name: 'enemyDefeatedAtkBuff',
    formItem: 'switch',
    text: 'Enemy defeated ATK buff',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank2),
  }]

  return {
    content: () => content,
    defaults: () => ({
      enemyHp50CrBoost: false,
      enemyDefeatedAtkBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CR] += (r.enemyHp50CrBoost) ? sValuesCr[s] : 0
      x[Stats.ATK_P] += (r.enemyDefeatedAtkBuff) ? sValuesAtk[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
