import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { GepardConversionConditional } from 'lib/gpu/conditionals/dynamicConditionals'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'e4TeamResBuff',
    name: 'e4TeamResBuff',
    text: 'E4 Team RES buff',
    title: 'E4 Team RES buff',
    content: `E4: When Gepard is in battle, all allies' Effect RES increases by 20%.`,
    disabled: e < 4,
  }]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      e4TeamResBuff: true,
    }),
    teammateDefaults: () => ({
      e4TeamResBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.RES] += (e >= 4 && m.e4TeamResBuff) ? 0.20 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
    dynamicConditionals: [GepardConversionConditional],
  }
}
