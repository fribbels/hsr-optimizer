import { basic3 } from 'lib/conditionals/utils'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/constants'
import { Eidolon } from 'types/Character'
import { ContentItem } from 'types/Conditionals'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { Stats } from 'lib/constants.ts'

const betaUpdate = 'All calculations are subject to change. Last updated 03-03-2024.'

// 3 skill basic
// 5 ult talent
const Gallagher = (e: Eidolon): CharacterConditional => {
  const basicScaling = basic3(e, 1.00, 1.10)
  const basicEnhancedScaling = basic3(e, 2.50, 2.75)
  const ultScaling = basic3(e, 1.50, 1.65)

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'basicEnhanced',
      name: 'basicEnhanced',
      text: 'Enhanced basic',
      title: 'Enhanced basic',
      content: betaUpdate,
    },
    {
      formItem: 'switch',
      id: 'breakEffectToOhbBoost',
      name: 'breakEffectToOhbBoost',
      text: 'BE to OHB boost',
      title: 'BE to OHB boost',
      content: betaUpdate,
    },
    {
      formItem: 'switch',
      id: 'e1ResBuff',
      name: 'e1ResBuff',
      text: 'E1 RES buff',
      title: 'E1 RES buff',
      content: betaUpdate,
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e2ResBuff',
      name: 'e2ResBuff',
      text: 'E2 RES buff',
      title: 'E2 RES buff',
      content: betaUpdate,
      disabled: e < 2,
    },
    {
      formItem: 'switch',
      id: 'e6BeBuff',
      name: 'e6BeBuff',
      text: 'E6 BE buff',
      title: 'E6 BE buff',
      content: betaUpdate,
      disabled: e < 6,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      basicEnhanced: true,
      breakEffectToOhbBoost: true,
      e1ResBuff: true,
      e2ResBuff: true,
      e6BeBuff: true,
    }),
    teammateDefaults: () => ({
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      x[Stats.RES] += (e >= 1 && r.e1ResBuff) ? 0.50 : 0
      x[Stats.RES] += (e >= 2 && r.e2ResBuff) ? 0.30 : 0
      x[Stats.BE] += (e >= 6) ? 0.20 : 0

      x.BASIC_SCALING += (r.basicEnhanced) ? basicEnhancedScaling : basicScaling
      x.ULT_SCALING += ultScaling

      return x
    },
    precomputeMutualEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c['x']

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x[Stats.OHB] += Math.min(0.75, x[Stats.BE] * 0.50)
    },
  }
}
Gallagher.label = 'Gallagher'

export default Gallagher
