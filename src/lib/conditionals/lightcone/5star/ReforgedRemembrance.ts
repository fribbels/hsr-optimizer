import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityDefShred } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsObject, DOT_TYPE } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesAtk = [0.05, 0.06, 0.07, 0.08, 0.09]
  const sValuesDotPen = [0.072, 0.079, 0.086, 0.093, 0.10]
  const lcRanks = {
    id: '23022',
    skill: 'Crystallize',
    desc: "When the wearer deals DMG to an enemy inflicted with Wind Shear, Burn, Shock, or Bleed, each respectively grants 1 stack of Prophet, stacking up to #4[i] time(s). In a single battle, only 1 stack of Prophet can be granted for each type of DoT. Every stack of Prophet increases wearer's ATK by #2[i]% and enables the DoT dealt to ignore #3[f1]% of the target's DEF.",
    params: [
      [0.4, 0.05, 0.072, 4],
      [0.45, 0.06, 0.079, 4],
      [0.5, 0.07, 0.086, 4],
      [0.55, 0.08, 0.093, 4],
      [0.6, 0.09, 0.1, 4],
    ],
    properties: [
      [{ type: 'StatusProbabilityBase', value: 0.4 }],
      [{ type: 'StatusProbabilityBase', value: 0.45 }],
      [{ type: 'StatusProbabilityBase', value: 0.5 }],
      [{ type: 'StatusProbabilityBase', value: 0.55 }],
      [{ type: 'StatusProbabilityBase', value: 0.6 }],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'prophetStacks',
    name: 'prophetStacks',
    formItem: 'slider',
    text: 'Prophet stacks',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
    min: 0,
    max: 4,
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      prophetStacks: 4,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.ATK_P] += r.prophetStacks * sValuesAtk[s]

      buffAbilityDefShred(x, DOT_TYPE, r.prophetStacks * sValuesDotPen[s])
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
