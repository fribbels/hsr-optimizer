import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Yukong')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
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
  } = Source.character('1207')

  const skillAtkBuffValue = skill(e, 0.80, 0.88)
  const ultCdBuffValue = skill(e, 0.65, 0.702)
  const ultCrBuffValue = skill(e, 0.28, 0.294)
  const talentAtkScaling = talent(e, 0.80, 0.88)

  const basicScaling = basic(e, 1.00, 1.10)
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
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.BASIC_ATK_SCALING.buff(talentAtkScaling, SOURCE_TALENT)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      // Boost
      x.ELEMENTAL_DMG.buff((e >= 4 && r.roaringBowstringsActive) ? 0.30 : 0, SOURCE_E4)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.ATK_P.buffTeam((m.roaringBowstringsActive) ? skillAtkBuffValue : 0, SOURCE_SKILL)
      x.CR.buffTeam((m.ultBuff && m.roaringBowstringsActive) ? ultCrBuffValue : 0, SOURCE_ULT)
      x.CD.buffTeam((m.ultBuff && m.roaringBowstringsActive) ? ultCdBuffValue : 0, SOURCE_ULT)
      x.SPD_P.buffTeam((e >= 1 && m.initialSpeedBuff) ? 0.10 : 0, SOURCE_E1)

      x.IMAGINARY_DMG_BOOST.buffTeam((m.teamImaginaryDmgBoost) ? 0.12 : 0, SOURCE_TRACE)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
  }
}
