import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon } from 'lib/conditionals/conditionalUtils'
import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'

export default (e: Eidolon): CharacterConditional => {
  const { basic } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)

  return {
    content: () => [],
    teammateContent: () => [],
    defaults: () => ({}),
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      x.BASIC_SCALING += basicScaling

      x.BASIC_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
    },
    finalizeCalculations: (x: ComputedStatsObject, request: Form) => {
      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.BASIC_DMG += (e >= 6) ? 0.40 * x[Stats.HP] : 0
    },
    gpuFinalizeCalculations: () => {
      return `
x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
if (${wgslTrue(e >= 6)}) {
  x.BASIC_DMG += 0.40 * x.HP;
}
    `
    },
  }
}
