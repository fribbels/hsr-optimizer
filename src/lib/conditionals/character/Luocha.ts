import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Luocha')
  const { basic, skill, ult } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 2.00, 2.16)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'fieldActive',
    name: 'fieldActive',
    text: t('Content.fieldActive.text'),
    title: t('Content.fieldActive.title'),
    content: t('Content.fieldActive.content'),
    // disabled: e < 1, Not disabling this one since technically the field can be active at E0
  }, {
    formItem: 'switch',
    id: 'e6ResReduction',
    name: 'e6ResReduction',
    text: t('Content.e6ResReduction.text'),
    title: t('Content.e6ResReduction.title'),
    content: t('Content.e6ResReduction.content'),
    disabled: e < 6,
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'fieldActive'),
    findContentId(content, 'e6ResReduction'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      fieldActive: true,
      e6ResReduction: true,
    }),
    teammateDefaults: () => ({
      fieldActive: true,
      e6ResReduction: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      x.BASIC_TOUGHNESS_DMG += 30
      x.ULT_TOUGHNESS_DMG += 60

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      x[Stats.ATK_P] += (e >= 1 && m.fieldActive) ? 0.20 : 0

      x.RES_PEN += (e >= 6 && m.e6ResReduction) ? 0.20 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
