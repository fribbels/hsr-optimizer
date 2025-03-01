import { ASHBLAZING_ATK_STACK } from 'lib/conditionals/conditionalConstants'
import { ashblazingWgsl, gpuStandardDefShieldFinalizer, standardDefShieldFinalizer, standardFuaFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon } from 'lib/conditionals/conditionalUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_ULT,
    SOURCE_TALENT,
    SOURCE_TECHNIQUE,
    SOURCE_TRACE,
    SOURCE_MEMO,
    SOURCE_E1,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
  } = Source.character('1001')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 1.50, 1.62)
  const fuaScaling = talent(e, 1.00, 1.10)

  const hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  const skillShieldScaling = skill(e, 0.57, 0.608)
  const skillShieldFlat = skill(e, 760, 845.5)

  return {
    content: () => [],
    defaults: () => ({}),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_ATK_SCALING.buff(fuaScaling, SOURCE_TALENT)
      x.FUA_DEF_SCALING.buff((e >= 4) ? 0.30 * x.a[Key.DEF] : 0, SOURCE_E4)

      x.BASIC_TOUGHNESS_DMG.buff(30, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(60, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(30, SOURCE_TALENT)

      x.SHIELD_SCALING.buff(skillShieldScaling, SOURCE_SKILL)
      x.SHIELD_FLAT.buff(skillShieldFlat, SOURCE_SKILL)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardFuaFinalizer(x, action, context, hitMulti)
      standardDefShieldFinalizer(x)
    },
    gpuFinalizeCalculations: () => {
      return `
x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
x.SKILL_DMG += x.SKILL_SCALING * x.ATK;
x.ULT_DMG += x.ULT_SCALING * x.ATK;
x.FUA_DMG += x.FUA_SCALING * (x.ATK + ${ashblazingWgsl(hitMulti)});
if (${wgslTrue(e >= 4)}) {
  x.FUA_DMG += 0.30 * x.DEF;
}
` + gpuStandardDefShieldFinalizer()
    },
  }
}
