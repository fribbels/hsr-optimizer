import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import getContentFromLCRanks from '../getContentFromLCRank'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional, LightConeRawRank } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesStackDmg = [0.14, 0.165, 0.19, 0.215, 0.24]
  const sValuesDefPen = [0.12, 0.14, 0.16, 0.18, 0.20]
  const lcRank: LightConeRawRank = {
    id: '23014',
    skill: 'With This Evening Jade',
    desc: "When an ally (excluding the wearer) gets attacked or loses HP, the wearer gains 1 stack of Eclipse, up to a max of #2[i] stack(s). Each stack of Eclipse increases the DMG of the wearer's next attack by #3[f1]%.",
    params: [
      [0.2, 3, 0.14, 0.12],
      [0.23, 3, 0.165, 0.14],
      [0.26, 3, 0.19, 0.16],
      [0.29, 3, 0.215, 0.18],
      [0.32, 3, 0.24, 0.2],
    ],
    properties: [
      [{ type: 'CriticalDamageBase', value: 0.2 }],
      [{ type: 'CriticalDamageBase', value: 0.23 }],
      [{ type: 'CriticalDamageBase', value: 0.26 }],
      [{ type: 'CriticalDamageBase', value: 0.29 }],
      [{ type: 'CriticalDamageBase', value: 0.32 }],
    ],
  }
  const lcRank2: LightConeRawRank = {
    ...lcRank,
    desc: `When #2[i] stack(s) are reached, additionally enables that attack to ignore #4[i]% of the enemy's DEF. This effect will be removed after the wearer uses an attack.`,
  }

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'eclipseStacks',
      name: 'eclipseStacks',
      formItem: 'slider',
      text: 'Eclipse stacks',
      title: lcRank.skill,
      content: getContentFromLCRanks(s, lcRank),
      min: 0,
      max: 3,
    },
    {
      lc: true,
      id: 'maxStackDefPen',
      name: 'maxStackDefPen',
      formItem: 'switch',
      text: 'Max stack DEF pen',
      title: lcRank.skill,
      content: getContentFromLCRanks(s, lcRank2),
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      eclipseStacks: 3,
      maxStackDefPen: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals
      x.ELEMENTAL_DMG += r.eclipseStacks * sValuesStackDmg[s]
      x.DEF_PEN += (r.maxStackDefPen && r.eclipseStacks == 3) ? sValuesDefPen[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
