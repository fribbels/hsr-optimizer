import { AbilityEidolon } from 'lib/conditionals/utils'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/constants'
import { Eidolon } from 'types/Character'
import { ContentItem } from 'types/Conditionals'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { Stats } from 'lib/constants.ts'

const betaUpdate = 'All calculations are subject to change. Last updated 03-03-2024.'

const Gallagher = (e: Eidolon): CharacterConditional => {
  const { basic } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 2.50, 2.75)
  const ultScaling = basic(e, 1.50, 1.65)

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'basicEnhanced',
      name: 'basicEnhanced',
      text: 'Enhanced basic',
      title: 'Nectar Blitz',
      content: `Ultimate enhances his next Basic ATK to Nectar Blitz.`,
    },
    {
      formItem: 'switch',
      id: 'breakEffectToOhbBoost',
      name: 'breakEffectToOhbBoost',
      text: 'BE to OHB boost',
      title: 'Novel Concoction',
      content: `Increases this unit's Outgoing Healing by an amount equal to 50% of Break Effect, up to a maximum Outgoing Healing increase of 75%.`,
    },
    {
      formItem: 'switch',
      id: 'e1ResBuff',
      name: 'e1ResBuff',
      text: 'E1 RES buff',
      title: 'E1: Salty Dog',
      content: `When entering the battle, Gallagher regenerates 20 Energy and increases Effect RES by 50%.`,
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e2ResBuff',
      name: 'e2ResBuff',
      text: 'E2 RES buff',
      title: 'E2: Lion\'s Tail',
      content: `When using the Skill, removes 1 debuff(s) from the target ally. At the same time, increases their Effect RES by 30%, lasting for 2 turn(s).`,
      disabled: e < 2,
    },
    {
      formItem: 'switch',
      id: 'e6BeBuff',
      name: 'e6BeBuff',
      text: 'E6 BE buff',
      title: 'E6: Blood and Sand',
      content: `Increases Gallagher's Break Effect by 20% and Weakness Break Efficiency by 20%.`,
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
