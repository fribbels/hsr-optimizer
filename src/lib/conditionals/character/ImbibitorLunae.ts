import { Stats } from 'lib/constants'
import { BASIC_TYPE, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityResPen } from 'lib/optimizer/calculateBuffs'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.ImbibitorLunae')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const righteousHeartStackMax = (e >= 1) ? 10 : 6
  const outroarStackCdValue = skill(e, 0.12, 0.132)
  const righteousHeartDmgValue = talent(e, 0.10, 0.11)

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhanced1Scaling = basic(e, 2.60, 2.86)
  const basicEnhanced2Scaling = basic(e, 3.80, 4.18)
  const basicEnhanced3Scaling = basic(e, 5.00, 5.50)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 3.00, 3.24)

  const content: ContentItem[] = [{
    formItem: 'slider',
    id: 'basicEnhanced',
    name: 'basicEnhanced',
    text: t('Content.basicEnhanced.text'),
    title: t('Content.basicEnhanced.title'),
    content: t('Content.basicEnhanced.content', { basicScaling: TsUtils.precisionRound(100 * basicScaling), basicEnhanced1Scaling: TsUtils.precisionRound(100 * basicEnhanced1Scaling), basicEnhanced2Scaling: TsUtils.precisionRound(100 * basicEnhanced2Scaling), basicEnhanced3Scaling: TsUtils.precisionRound(100 * basicEnhanced3Scaling) }),
    min: 0,
    max: 3,
  }, {
    formItem: 'slider',
    id: 'skillOutroarStacks',
    name: 'skillOutroarStacks',
    text: t('Content.skillOutroarStacks.text'),
    title: t('Content.skillOutroarStacks.title'),
    content: t('Content.skillOutroarStacks.content', { outroarStackCdValue: TsUtils.precisionRound(100 * outroarStackCdValue) }),
    min: 0,
    max: 4,
  }, {
    formItem: 'slider',
    id: 'talentRighteousHeartStacks',
    name: 'talentRighteousHeartStacks',
    text: t('Content.talentRighteousHeartStacks.text'),
    title: t('Content.talentRighteousHeartStacks.title'),
    content: t('Content.talentRighteousHeartStacks.content', { righteousHeartDmgValue: TsUtils.precisionRound(100 * righteousHeartDmgValue) }),
    min: 0,
    max: righteousHeartStackMax,
  }, {
    formItem: 'slider',
    id: 'e6ResPenStacks',
    name: 'e6ResPenStacks',
    text: t('Content.e6ResPenStacks.text'),
    title: t('Content.e6ResPenStacks.title'),
    content: t('Content.e6ResPenStacks.content'),
    min: 0,
    max: 3,
    disabled: e < 6,
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      basicEnhanced: 3,
      skillOutroarStacks: 4,
      talentRighteousHeartStacks: righteousHeartStackMax,
      e6ResPenStacks: 3,
    }),
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      // Stats
      x[Stats.CD] += (context.enemyElementalWeak) ? 0.24 : 0
      x[Stats.CD] += r.skillOutroarStacks * outroarStackCdValue

      // Scaling
      x.BASIC_SCALING += {
        0: basicScaling,
        1: basicEnhanced1Scaling,
        2: basicEnhanced2Scaling,
        3: basicEnhanced3Scaling,
      }[r.basicEnhanced] ?? 0
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.ELEMENTAL_DMG += r.talentRighteousHeartStacks * righteousHeartDmgValue
      buffAbilityResPen(x, BASIC_TYPE, 0.20 * r.e6ResPenStacks, (e >= 6 && r.basicEnhanced == 3))

      x.BASIC_TOUGHNESS_DMG += 30 + 30 * r.basicEnhanced
      x.ULT_TOUGHNESS_DMG += 60

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
