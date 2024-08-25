import { Stats } from 'lib/constants'
import { ASHBLAZING_ATK_STACK, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, calculateAshblazingSet } from 'lib/conditionals/conditionalUtils'
import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 1.50, 1.62)
  const fuaScaling = talent(e, 1.00, 1.10)

  const hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  return {
    content: () => [],
    teammateContent: () => [],
    defaults: () => ({}),
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling

      x.BASIC_TOUGHNESS_DMG += 30
      x.ULT_TOUGHNESS_DMG += 60
      x.FUA_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
    },
    finalizeCalculations: (x: ComputedStatsObject, request: Form) => {
      const ashblazingAtk = calculateAshblazingSet(x, request, hitMulti)

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] + ashblazingAtk)
      x.FUA_DMG += (e >= 4) ? 0.30 * x[Stats.DEF] : 0
    },
    gpuFinalizeCalculations: () => {
      return `
x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
x.SKILL_DMG += x.SKILL_SCALING * x.ATK;
x.ULT_DMG += x.ULT_SCALING * x.ATK;
x.FUA_DMG += x.FUA_SCALING * (x.ATK + calculateAshblazingSet(p_x, p_state, ${hitMulti}));
if (${wgslTrue(e >= 4)}) {
  x.FUA_DMG += 0.30 * x.DEF;
}
    `
    },
  }
}
