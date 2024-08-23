import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsObject, FUA_TYPE } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  const lcRanks = {
    id: '21006',
    skill: 'The Maiden in the Painting',
    desc: 'If the current HP of the target enemy is below or equal to #2[i]%, increases DMG dealt by follow-up attacks by an extra #3[i]%.',
    params: [
      [0.24, 0.5, 0.24],
      [0.3, 0.5, 0.3],
      [0.36, 0.5, 0.36],
      [0.42, 0.5, 0.42],
      [0.48, 0.5, 0.48],
    ],
    properties: [
      [], [], [], [], [],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'enemyHp50FuaBuff',
    name: 'enemyHp50FuaBuff',
    formItem: 'switch',
    text: 'Enemy HP < 50% fua buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    defaults: () => ({
      enemyHp50FuaBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      buffAbilityDmg(x, FUA_TYPE, sValues[s])
      buffAbilityDmg(x, FUA_TYPE, sValues[s], (r.enemyHp50FuaBuff))
    },
    finalizeCalculations: () => {
    },
  }
}
