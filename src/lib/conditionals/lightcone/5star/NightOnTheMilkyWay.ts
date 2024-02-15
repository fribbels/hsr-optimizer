import { ContentItem } from 'types/Conditionals'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import getContentFromLCRanks from '../getContentFromLCRank'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional, LightConeRawRank } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesAtk = [0.09, 0.105, 0.12, 0.135, 0.15]
  const sValuesDmg = [0.30, 0.35, 0.40, 0.45, 0.50]

  const lcRank: LightConeRawRank = {
    id: '23000',
    skill: 'Meteor Swarm',
    desc: "For every enemy on the field, increases the wearer's ATK by #2[f1]%, up to 5 stacks.",
    params: [
      [0.3, 0.09],
      [0.35, 0.105],
      [0.4, 0.12],
      [0.45, 0.135],
      [0.5, 0.15],
    ],
    properties: [
      [], [], [], [], [],
    ],
  }
  const lcRank2: LightConeRawRank = {
    ...lcRank,
    desc: `When an enemy is inflicted with Weakness Break, the DMG dealt by the wearer increases by #1[i]% for 1 turn.`,
  }

  const content: ContentItem[] = [{
    lc: true,
    id: 'enemyCountAtkBuff',
    name: 'enemyCountAtkBuff',
    formItem: 'switch',
    text: 'Enemy count atk buff',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
  }, {
    lc: true,
    id: 'enemyWeaknessBreakDmgBuff',
    name: 'enemyWeaknessBreakDmgBuff',
    formItem: 'switch',
    text: 'Enemy weakness break dmg buff',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank2),
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      enemyCountAtkBuff: true,
      enemyWeaknessBreakDmgBuff: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.ATK_P] += (r.enemyCountAtkBuff) ? request.enemyCount * sValuesAtk[s] : 0
      x.ELEMENTAL_DMG += (r.enemyWeaknessBreakDmgBuff) ? sValuesDmg[s] : 0
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
