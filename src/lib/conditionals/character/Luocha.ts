import { Stats } from 'lib/constants'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon, findContentId } from 'lib/conditionals/utils'
import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 2.00, 2.16)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'fieldActive',
    name: 'fieldActive',
    text: 'Field active',
    title: 'Field active',
    content: `
      E1: While the Field is active, ATK of all allies increases by 20%.
    `,
    // disabled: e < 1, Not disabling this one since technically the field can be active at E0
  }, {
    formItem: 'switch',
    id: 'e6ResReduction',
    name: 'e6ResReduction',
    text: 'E6 RES reduction',
    title: 'E6 RES reduction',
    content: `E6: When Ultimate is used, reduces all enemies' All-Type RES by 20% for 2 turn(s).`,
    disabled: e < 6,
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'fieldActive'),
    findContentId(content, 'e6ResReduction'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      fieldActive: true,
      e6ResReduction: true,
    }),
    teammateDefaults: () => ({
      fieldActive: true,
      e6ResReduction: true,
    }),
    precomputeEffects: (_request) => {
      const x = Object.assign({}, baseComputedStatsObject)

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.ATK_P] += (e >= 1 && m.fieldActive) ? 0.20 : 0

      x.RES_PEN += (e >= 6 && m.e6ResReduction) ? 0.20 : 0
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    },
  }
}
