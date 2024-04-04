import { Stats } from 'lib/constants'
import { ASHBLAZING_ATK_STACK, baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon, calculateAshblazingSet, precisionRound } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const skillStackDmg = skill(e, 0.38, 0.408)
  const talentAtkBuff = talent(e, 0.72, 0.792)

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 2.40, 2.64)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 2.00, 2.16)

  const hitMultiByTargetsBlast = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1), // 0.06
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 1), // 0.12
    5: ASHBLAZING_ATK_STACK * (2 * 1 / 1), // 0.12
  }

  const hitMultiSingle = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'basicEnhanced',
    name: 'basicEnhanced',
    text: 'Basic enhanced',
    title: 'Basic enhanced',
    content: `Qingque's ATK increases by ${precisionRound(talentAtkBuff * 100)}%, and her Basic ATK "Flower Pick" is enhanced, becoming "Cherry on Top!"`,
  }, {
    formItem: 'switch',
    id: 'basicEnhancedSpdBuff',
    name: 'basicEnhancedSpdBuff',
    text: 'Basic enhanced SPD buff',
    title: 'Basic enhanced SPD buff',
    content: `Qingque's SPD increases by 10% for 1 turn after using the Enhanced Basic ATK.`,
  }, {
    formItem: 'slider',
    id: 'skillDmgIncreaseStacks',
    name: 'skillDmgIncreaseStacks',
    text: 'Skill DMG stacks',
    title: 'Skill DMG stacks',
    content: `Immediately draws 2 jade tile(s) and increases DMG by ${precisionRound(skillStackDmg * 100)}% until the end of the current turn. This effect can stack up to 4 time(s).`,
    min: 0,
    max: 4,
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      basicEnhanced: true,
      basicEnhancedSpdBuff: true,
      skillDmgIncreaseStacks: 4,
    }),
    teammateDefaults: () => ({
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.ATK_P] += (r.basicEnhanced) ? talentAtkBuff : 0
      x[Stats.SPD_P] += (r.basicEnhancedSpdBuff) ? 0.10 : 0

      // Scaling
      x.BASIC_SCALING += (r.basicEnhanced) ? basicEnhancedScaling : basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += (e >= 4) ? x.BASIC_SCALING : 0

      // Boost
      x.ELEMENTAL_DMG += r.skillDmgIncreaseStacks * skillStackDmg
      x.ULT_BOOST += (e >= 1) ? 0.10 : 0

      return x
    },
    precomputeMutualEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]

      if (r.basicEnhanced) {
        const hitMulti = hitMultiByTargetsBlast[request.enemyCount]
        const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)
        x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
      } else {
        const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMultiSingle)
        x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
      }
    },
  }
}
