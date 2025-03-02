import { AbilityType, ASHBLAZING_ATK_STACK, FUA_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { boostAshblazingAtkP, gpuBoostAshblazingAtkP, gpuStandardAdditionalDmgAtkFinalizer, standardAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityVulnerability, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Moze')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5
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
  } = Source.character('1223')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.50, 1.65)
  const ultScaling = ult(e, 2.70, 2.916)

  const fuaScaling = talent(e, 1.60, 1.76)
  const additionalDmgScaling = talent(e, 0.30, 0.33)

  const fuaHitCountMulti = ASHBLAZING_ATK_STACK * (1 * 0.08 + 2 * 0.08 + 3 * 0.08 + 4 * 0.08 + 5 * 0.08 + 6 * 0.6)

  const defaults = {
    preyMark: true,
    e2CdBoost: true,
    e4DmgBuff: true,
    e6MultiplierIncrease: true,
  }

  const teammateDefaults = {
    preyMark: true,
    e2CdBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    preyMark: {
      id: 'preyMark',
      formItem: 'switch',
      text: t('Content.preyMark.text'),
      content: t('Content.preyMark.content', {
        PreyAdditionalMultiplier: TsUtils.precisionRound(100 * additionalDmgScaling),
        FuaScaling: TsUtils.precisionRound(100 * fuaScaling),
      }),
    },
    e2CdBoost: {
      id: 'e2CdBoost',
      formItem: 'switch',
      text: t('Content.e2CdBoost.text'),
      content: t('Content.e2CdBoost.content'),
      disabled: e < 2,
    },
    e4DmgBuff: {
      id: 'e4DmgBuff',
      formItem: 'switch',
      text: t('Content.e4DmgBuff.text'),
      content: t('Content.e4DmgBuff.content'),
      disabled: e < 4,
    },
    e6MultiplierIncrease: {
      id: 'e6MultiplierIncrease',
      formItem: 'switch',
      text: t('Content.e6MultiplierIncrease.text'),
      content: t('Content.e6MultiplierIncrease.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    preyMark: content.preyMark,
    e2CdBoost: content.e2CdBoost,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      x.ULT_DMG_TYPE.set(ULT_DMG_TYPE | FUA_DMG_TYPE, SOURCE_TRACE)
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.ELEMENTAL_DMG.buff((e >= 4 && r.e4DmgBuff) ? 0.30 : 0, SOURCE_E4)

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.FUA_ATK_SCALING.buff(fuaScaling, SOURCE_TALENT)
      x.FUA_ATK_SCALING.buff((e >= 6 && r.e6MultiplierIncrease) ? 0.25 : 0, SOURCE_E6)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      x.BASIC_ADDITIONAL_DMG_SCALING.buff((r.preyMark) ? additionalDmgScaling : 0, SOURCE_BASIC)
      x.SKILL_ADDITIONAL_DMG_SCALING.buff((r.preyMark) ? additionalDmgScaling : 0, SOURCE_SKILL)
      x.FUA_ADDITIONAL_DMG_SCALING.buff((r.preyMark) ? additionalDmgScaling : 0, SOURCE_TALENT)
      x.ULT_ADDITIONAL_DMG_SCALING.buff((r.preyMark) ? additionalDmgScaling : 0, SOURCE_ULT)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_TALENT)
      x.FUA_TOUGHNESS_DMG.buff(10, SOURCE_ULT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      buffAbilityVulnerability(x, FUA_DMG_TYPE, (m.preyMark) ? 0.25 : 0, SOURCE_TRACE, Target.TEAM)

      x.CD.buffTeam((e >= 2 && m.preyMark && m.e2CdBoost) ? 0.40 : 0, SOURCE_E2)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkP(x, action, context, fuaHitCountMulti)
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkP(fuaHitCountMulti)
        + gpuStandardAdditionalDmgAtkFinalizer()
    },
  }
}
