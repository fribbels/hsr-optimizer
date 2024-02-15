import { ContentItem } from 'types/Conditionals'

import { SuperImpositionLevel } from 'types/LightCone'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.002, 0.0025, 0.003, 0.0035, 0.004]

  const lcRank = {
    id: '21034',
    skill: 'A Storm Is Coming',
    desc: "After entering battle, increases the wearer's DMG based on their Max Energy. DMG increases by #1[i]% per point of Energy, up to #2[i] Energy.",
    params: [
      [0.002, 160],
      [0.0025, 160],
      [0.003, 160],
      [0.0035, 160],
      [0.004, 160],
    ],
    properties: [
      [], [], [], [], [],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'maxEnergyStacks',
    name: 'maxEnergyStacks',
    formItem: 'slider',
    text: 'Max energy',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
    min: 0,
    max: 160,
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      maxEnergyStacks: 160,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += r.maxEnergyStacks * sValues[s]
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
