import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { SuperImpositionLevel } from 'types/LightCone'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesDmg = [0.24, 0.28, 0.32, 0.36, 0.40]

  const lcRank = {
    id: '23004',
    skill: 'Inheritor',
    desc: "Increases the wearer's DMG to debuffed enemies by #1[i]%.",
    params: [
      [0.24, 0.18, 0.24],
      [0.28, 0.21, 0.28],
      [0.32, 0.24, 0.32],
      [0.36, 0.27, 0.36],
      [0.4, 0.3, 0.4],
    ],
    properties: [[], [], [], [], []],
  }
  const lcRank2 = {
    ...lcRank,
    desc: `When the wearer uses their Skill, the Effect Hit Rate for this attack increases by #2[i]%, and ATK increases by #3[i]%.`,
  }

  const content: ContentItem[] = [{
    lc: true,
    id: 'enemyDebuffedDmgBoost',
    name: 'enemyDebuffedDmgBoost',
    formItem: 'switch',
    text: 'Enemy debuffed DMG boost',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
  }, {
    lc: true,
    id: 'skillAtkBoost',
    name: 'skillAtkBoost',
    formItem: 'switch',
    text: 'Skill ATK boost (not implemented)',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank2),
  }]

  return {
    content: () => content,
    defaults: () => ({
      enemyDebuffedDmgBoost: true,
      skillAtkBoost: false,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.enemyDebuffedDmgBoost) ? sValuesDmg[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
