import { Stats } from 'lib/constants'
import { ASHBLAZING_ATK_STACK, baseComputedStatsObject } from 'lib/conditionals/constants'
import { basic, calculateAshblazingSet, skill, talent, ult } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'

export default (e: Eidolon): CharacterConditional => {
  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.60, 1.76)
  const ultScaling = ult(e, 0.80, 0.864)
  const fuaScaling = talent(e, 1.40, 1.596)
  const dotScaling = ult(e, 2.90, 3.183)

  const hitMulti = ASHBLAZING_ATK_STACK
    * (1 * 0.15 + 2 * 0.15 + 3 * 0.15 + 4 * 0.15 + 5 * 0.15 + 6 * 0.25)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'e1DotDmgReceivedDebuff',
    name: 'e1DotDmgReceivedDebuff',
    text: 'E1 DoT DMG debuff',
    title: 'E1 DoT DMG debuff',
    content: `E1: When the Talent triggers a follow-up attack, there is a 100% base chance to increase the DoT received by the target by 30% for 2 turn(s).`,
    disabled: e < 1,
  }]

  return {
    content: () => content,
    defaults: () => ({
      e1DotDmgReceivedDebuff: true,
    }),
    precomputeEffects: (request) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling
      x.DOT_SCALING += dotScaling

      // Boost
      x.DOT_VULNERABILITY += (e >= 1 && r.e1DotDmgReceivedDebuff) ? 0.30 : 0
      x.DOT_BOOST += (e >= 2) ? 0.25 : 0
      x.DOT_SCALING += (e >= 6) ? 1.56 : 0

      return x
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const x = c['x']

      const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
      x.DOT_DMG += x.DOT_SCALING * x[Stats.ATK]
    },
  }
}
