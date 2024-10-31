import { ASHBLAZING_ATK_STACK, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  calculateAshblazingSet,
  gpuStandardDefShieldFinalizer,
  standardDefShieldFinalizer,
} from 'lib/conditionals/conditionalUtils'
import { Stats } from 'lib/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 1.50, 1.62)
  const fuaScaling = talent(e, 1.00, 1.10)

  const hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  const skillShieldScaling = skill(e, 0.57, 0.608)
  const skillShieldFlat = skill(e, 760, 845.5)

  return {
    content: () => [],
    teammateContent: () => [],
    defaults: () => ({}),
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling

      x.BASIC_TOUGHNESS_DMG += 30
      x.ULT_TOUGHNESS_DMG += 60
      x.FUA_TOUGHNESS_DMG += 30

      x.SHIELD_SCALING += skillShieldScaling
      x.SHIELD_FLAT += skillShieldFlat

      return x
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const ashblazingAtk = calculateAshblazingSet(x, action, context, hitMulti)

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] + ashblazingAtk)
      x.FUA_DMG += (e >= 4) ? 0.30 * x[Stats.DEF] : 0

      standardDefShieldFinalizer(x)
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
` + gpuStandardDefShieldFinalizer()
    },
  }
}
