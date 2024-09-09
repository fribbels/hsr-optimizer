import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.08, 0.09, 0.10, 0.11, 0.12]
  const lcRanks = {
    id: '21037',
    skill: 'All In',
    desc: "When the wearer lands a CRIT hit on enemies, gains a stack of Good Fortune, stacking up to #3[i] time(s). Every stack of Good Fortune the wearer has will increase their CRIT DMG by #2[i]%. Good Fortune will be removed at the end of the wearer's turn.",
    params: [
      [0.12, 0.08, 4],
      [0.14, 0.09, 4],
      [0.16, 0.1, 4],
      [0.18, 0.11, 4],
      [0.2, 0.12, 4],
    ],
    properties: [
      [{ type: 'AttackAddedRatio', value: 0.12 }],
      [{ type: 'AttackAddedRatio', value: 0.14 }],
      [{ type: 'AttackAddedRatio', value: 0.16 }],
      [{ type: 'AttackAddedRatio', value: 0.18 }],
      [{ type: 'AttackAddedRatio', value: 0.2 }],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'goodFortuneStacks',
    name: 'goodFortuneStacks',
    formItem: 'slider',
    text: 'Good Fortune stacks',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
    min: 0,
    max: 4,
  }]

  return {
    content: () => content,
    defaults: () => ({
      goodFortuneStacks: 4,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CD] += r.goodFortuneStacks * sValues[s]
    },
    finalizeCalculations: () => {
    },
  }
}
