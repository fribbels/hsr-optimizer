import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  gpuStandardAtkFinalizer,
  gpuStandardDefShieldFinalizer,
  standardAtkFinalizer,
  standardDefShieldFinalizer,
} from 'lib/conditionals/conditionalUtils'
import { Stats } from 'lib/constants'
import { GepardConversionConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { TsUtils } from 'lib/TsUtils'
import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Gepard')
  const { basic, skill, ult } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)

  const ultShieldScaling = ult(e, 0.45, 0.48)
  const ultShieldFlat = ult(e, 600, 667.5)

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'e4TeamResBuff',
      text: t('Content.e4TeamResBuff.text'),
      content: t('Content.e4TeamResBuff.content'),
      disabled: e < 4,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      e4TeamResBuff: true,
    }),
    teammateDefaults: () => ({
      e4TeamResBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60

      x.SHIELD_SCALING += ultShieldScaling
      x.SHIELD_FLAT += ultShieldFlat

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      x[Stats.RES] += (e >= 4 && m.e4TeamResBuff) ? 0.20 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject) => {
      standardAtkFinalizer(x)
      standardDefShieldFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer() + gpuStandardDefShieldFinalizer(),
    dynamicConditionals: [GepardConversionConditional],
  }
}
