import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesDmgBoost = [0.12, 0.15, 0.18, 0.21, 0.24]
  const sValuesStacks = [0.04, 0.05, 0.06, 0.07, 0.08]
  const lcRanks = {
    id: '21027',
    skill: 'Get Ready',
    desc: "Increases the wearer's DMG by #1[i]%.",
    params: [
      [0.12, 0.04, 3],
      [0.15, 0.05, 3],
      [0.18, 0.06, 3],
      [0.21, 0.07, 3],
      [0.24, 0.08, 3],
    ],
    properties: [
      [{ type: 'AllDamageTypeAddedRatio', value: 0.12 }],
      [{ type: 'AllDamageTypeAddedRatio', value: 0.15 }],
      [{ type: 'AllDamageTypeAddedRatio', value: 0.18 }],
      [{ type: 'AllDamageTypeAddedRatio', value: 0.21 }],
      [{ type: 'AllDamageTypeAddedRatio', value: 0.24 }],
    ],
  }

  const lcRanks2 = {
    ...lcRanks,
    desc: `For every enemy defeated by the wearer, the wearer's ATK increases by #2[i]%, stacking up to #3[i] time(s).`,
  }

  const content: ContentItem[] = [{
    lc: true,
    id: 'dmgBoost',
    name: 'dmgBoost',
    formItem: 'switch',
    text: 'DMG boost',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }, {
    lc: true,
    id: 'defeatedEnemyAtkStacks',
    name: 'defeatedEnemyAtkStacks',
    formItem: 'slider',
    text: 'Defeated enemy ATK stacks',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks2),
    min: 0,
    max: 3,
  }]

  return {
    content: () => content,
    defaults: () => ({
      dmgBoost: true,
      defeatedEnemyAtkStacks: 3,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.ATK_P] += r.defeatedEnemyAtkStacks * sValuesStacks[s]
      x.ELEMENTAL_DMG += (r.dmgBoost) ? sValuesDmgBoost[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
