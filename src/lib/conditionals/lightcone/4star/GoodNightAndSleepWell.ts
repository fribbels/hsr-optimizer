import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  const lcRanks = {
    id: '21001',
    skill: 'Toiler',
    desc: 'For every debuff the target enemy has, the DMG dealt by the wearer increases by #1[i]%, stacking up to #2[i] time(s). This effect also applies to DoT.',
    params: [
      [0.12, 3],
      [0.15, 3],
      [0.18, 3],
      [0.21, 3],
      [0.24, 3],
    ],
    properties: [
      [], [], [], [], [],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'debuffStacksDmgIncrease',
    name: 'debuffStacksDmgIncrease',
    formItem: 'slider',
    text: 'Debuff stacks DMG increase',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
    min: 0,
    max: 3,
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      debuffStacksDmgIncrease: 3,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += r.debuffStacksDmgIncrease * sValues[s]
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
