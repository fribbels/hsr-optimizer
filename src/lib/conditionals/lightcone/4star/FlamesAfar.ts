import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.25, 0.3125, 0.375, 0.4375, 0.50]
  const lcRanks = {
    id: '21038',
    skill: 'Deflagration',
    desc: 'When the cumulative HP loss of the wearer during a single attack exceeds #1[i]% of their Max HP, or if the amount of their own HP they consume at one time is greater than #1[i]% of their Max HP, immediately heals the wearer for #3[i]% of their Max HP, and at the same time, increases the DMG they deal by #2[i]% for #4[i] turn(s). This effect can only be triggered once every #5[i] turn(s).',
    params: [
      [0.25, 0.25, 0.15, 2, 3],
      [0.25, 0.3125, 0.15, 2, 3],
      [0.25, 0.375, 0.15, 2, 3],
      [0.25, 0.4375, 0.15, 2, 3],
      [0.25, 0.5, 0.15, 2, 3],
    ],
    properties: [
      [], [], [], [], [],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'dmgBuff',
    name: 'dmgBuff',
    formItem: 'switch',
    text: 'DMG increased buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    defaults: () => ({
      dmgBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.dmgBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
