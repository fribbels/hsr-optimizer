import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.08, 0.10, 0.12, 0.14, 0.16]
  const lcRanks = {
    id: '21010',
    skill: 'Answers of Their Own',
    desc: 'For each time the wearer hits the same target, DMG dealt increases by #1[i]%, stacking up to #2[i] time(s). This effect will be dispelled when the wearer changes targets.',
    params: [
      [0.08, 5],
      [0.1, 5],
      [0.12, 5],
      [0.14, 5],
      [0.16, 5],
    ],
    properties: [
      [], [], [], [], [],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'sameTargetHitStacks',
    name: 'sameTargetHitStacks',
    formItem: 'slider',
    text: 'Same target hit stacks',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
    min: 0,
    max: 5,
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      sameTargetHitStacks: 5,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.sameTargetHitStacks) * sValues[s]
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
