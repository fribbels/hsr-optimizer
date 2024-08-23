import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.16, 0.20, 0.24, 0.28, 0.32]
  const lcRanks = {
    id: '21026',
    skill: 'Run!',
    desc: "Increases the wearer's DMG to enemies afflicted with Burn or Bleed by #2[i]%. This also applies to DoT.",
    params: [
      [0.1, 0.16],
      [0.125, 0.2],
      [0.15, 0.24],
      [0.175, 0.28],
      [0.2, 0.32],
    ],
    properties: [
      [{ type: 'AttackAddedRatio', value: 0.1 }],
      [{ type: 'AttackAddedRatio', value: 0.125 }],
      [{ type: 'AttackAddedRatio', value: 0.15 }],
      [{ type: 'AttackAddedRatio', value: 0.175 }],
      [{ type: 'AttackAddedRatio', value: 0.2 }],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'atkBoost',
    name: 'atkBoost',
    formItem: 'switch',
    text: 'Enemy Burn/Bleed ATK boost',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    defaults: () => ({
      enemyBurnedBleeding: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.enemyBurnedBleeding) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
