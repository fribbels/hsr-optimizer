import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { ContentItem } from 'types/Conditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]
  const lcRanks = {
    id: '20011',
    skill: 'Pursuit',
    desc: 'Increases DMG dealt from its wearer to Slowed enemies by #1[i]%.',
    params: [
      [0.24],
      [0.3],
      [0.36],
      [0.42],
      [0.48],
    ],
    properties: [
      [], [], [], [], [],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'enemySlowedDmgBuff',
    name: 'enemySlowedDmgBuff',
    formItem: 'switch',
    text: 'Enemy slowed DMG buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    defaults: () => ({
      enemySlowedDmgBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.enemySlowedDmgBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
