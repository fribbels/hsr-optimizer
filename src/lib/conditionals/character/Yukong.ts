import { AbilityEidolon, Conditionals, ContentDefinition, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Yukong')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const skillAtkBuffValue = skill(e, 0.80, 0.88)
  const ultCdBuffValue = skill(e, 0.65, 0.702)
  const ultCrBuffValue = skill(e, 0.28, 0.294)
  const talentAtkScaling = talent(e, 0.80, 0.88)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 3.80, 4.104)

  const defaults = {
    teamImaginaryDmgBoost: true,
    roaringBowstringsActive: true,
    ultBuff: true,
    initialSpeedBuff: true,
  }

  const teammateDefaults = {
    teamImaginaryDmgBoost: true,
    roaringBowstringsActive: true,
    ultBuff: true,
    initialSpeedBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    teamImaginaryDmgBoost: {
      id: 'teamImaginaryDmgBoost',
      formItem: 'switch',
      text: t('Content.teamImaginaryDmgBoost.text'),
      content: t('Content.teamImaginaryDmgBoost.content'),
    },
    roaringBowstringsActive: {
      id: 'roaringBowstringsActive',
      formItem: 'switch',
      text: t('Content.roaringBowstringsActive.text'),
      content: t('Content.roaringBowstringsActive.content', { skillAtkBuffValue: TsUtils.precisionRound(100 * skillAtkBuffValue) }),
    },
    ultBuff: {
      id: 'ultBuff',
      formItem: 'switch',
      text: t('Content.ultBuff.text'),
      content: t('Content.ultBuff.content', {
        ultCrBuffValue: TsUtils.precisionRound(100 * ultCrBuffValue),
        ultCdBuffValue: TsUtils.precisionRound(100 * ultCdBuffValue),
        ultScaling: TsUtils.precisionRound(100 * ultScaling),
      }),
    },
    initialSpeedBuff: {
      id: 'initialSpeedBuff',
      formItem: 'switch',
      text: t('Content.initialSpeedBuff.text'),
      content: t('Content.initialSpeedBuff.content'),
      disabled: e < 1,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    teamImaginaryDmgBoost: content.teamImaginaryDmgBoost,
    roaringBowstringsActive: content.roaringBowstringsActive,
    ultBuff: content.ultBuff,
    initialSpeedBuff: content.initialSpeedBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.characterConditionals

      // Scaling
      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.BASIC_SCALING.buff(talentAtkScaling, Source.NONE)
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)
      x.ULT_SCALING.buff(ultScaling, Source.NONE)

      // Boost
      x.ELEMENTAL_DMG.buff((e >= 4 && r.roaringBowstringsActive) ? 0.30 : 0, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(90, Source.NONE)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m: Conditionals<typeof teammateContent> = action.characterConditionals

      x.ATK_P.buff((m.roaringBowstringsActive) ? skillAtkBuffValue : 0, Source.NONE)
      x.CR.buff((m.ultBuff && m.roaringBowstringsActive) ? ultCrBuffValue : 0, Source.NONE)
      x.CD.buff((m.ultBuff && m.roaringBowstringsActive) ? ultCdBuffValue : 0, Source.NONE)
      x.SPD_P.buff((e >= 1 && m.initialSpeedBuff) ? 0.10 : 0, Source.NONE)

      x.IMAGINARY_DMG_BOOST.buff((m.teamImaginaryDmgBoost) ? 0.12 : 0, Source.NONE)
    },
    finalizeCalculations: (x: ComputedStatsArray) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
