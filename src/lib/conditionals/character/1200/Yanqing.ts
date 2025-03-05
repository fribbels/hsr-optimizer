import { AbilityType, ASHBLAZING_ATK_STACK } from 'lib/conditionals/conditionalConstants'
import { boostAshblazingAtkP, gpuBoostAshblazingAtkP, gpuStandardAdditionalDmgAtkFinalizer, standardAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Yanqing')
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
  } = Source.character('1209')

  const ultCdBuffValue = ult(e, 0.50, 0.54)
  const talentCdBuffValue = ult(e, 0.30, 0.33)
  const talentCrBuffValue = ult(e, 0.20, 0.21)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.20, 2.42)
  const ultScaling = ult(e, 3.50, 3.78)
  const fuaScaling = talent(e, 0.50, 0.55)

  const hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  const defaults = {
    ultBuffActive: true,
    soulsteelBuffActive: true,
    critSpdBuff: true,
    e1TargetFrozen: true,
    e4CurrentHp80: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultBuffActive: {
      id: 'ultBuffActive',
      formItem: 'switch',
      text: t('Content.ultBuffActive.text'),
      content: t('Content.ultBuffActive.content', { ultCdBuffValue: TsUtils.precisionRound(100 * ultCdBuffValue) }),
    },
    soulsteelBuffActive: {
      id: 'soulsteelBuffActive',
      formItem: 'switch',
      text: t('Content.soulsteelBuffActive.text'),
      content: t('Content.soulsteelBuffActive.content', {
        talentCdBuffValue: TsUtils.precisionRound(100 * talentCdBuffValue),
        talentCrBuffValue: TsUtils.precisionRound(100 * talentCrBuffValue),
        ultCdBuffValue: TsUtils.precisionRound(100 * ultCdBuffValue),
      }),
    },
    critSpdBuff: {
      id: 'critSpdBuff',
      formItem: 'switch',
      text: t('Content.critSpdBuff.text'),
      content: t('Content.critSpdBuff.content'),
    },
    e1TargetFrozen: {
      id: 'e1TargetFrozen',
      formItem: 'switch',
      text: t('Content.e1TargetFrozen.text'),
      content: t('Content.e1TargetFrozen.content'),
      disabled: (e < 1),
    },
    e4CurrentHp80: {
      id: 'e4CurrentHp80',
      formItem: 'switch',
      text: t('Content.e4CurrentHp80.text'),
      content: t('Content.e4CurrentHp80.content'),
      disabled: (e < 4),
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.CR.buff((r.ultBuffActive) ? 0.60 : 0, SOURCE_ULT)
      x.CD.buff((r.ultBuffActive && r.soulsteelBuffActive) ? ultCdBuffValue : 0, SOURCE_ULT)
      x.CR.buff((r.soulsteelBuffActive) ? talentCrBuffValue : 0, SOURCE_TALENT)
      x.CD.buff((r.soulsteelBuffActive) ? talentCdBuffValue : 0, SOURCE_TALENT)
      x.RES.buff((r.soulsteelBuffActive) ? 0.20 : 0, SOURCE_TRACE)
      x.SPD_P.buff((r.critSpdBuff) ? 0.10 : 0, SOURCE_TRACE)
      x.ERR.buff((e >= 2 && r.soulsteelBuffActive) ? 0.10 : 0, SOURCE_E2)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_ATK_SCALING.buff(fuaScaling, SOURCE_TALENT)

      x.BASIC_ADDITIONAL_DMG_SCALING.buff((context.enemyElementalWeak) ? 0.30 : 0, SOURCE_BASIC)
      x.SKILL_ADDITIONAL_DMG_SCALING.buff((context.enemyElementalWeak) ? 0.30 : 0, SOURCE_SKILL)
      x.ULT_ADDITIONAL_DMG_SCALING.buff((context.enemyElementalWeak) ? 0.30 : 0, SOURCE_ULT)
      x.FUA_ADDITIONAL_DMG_SCALING.buff((context.enemyElementalWeak) ? 0.30 : 0, SOURCE_TALENT)

      x.BASIC_ATK_SCALING.buff((e >= 1 && r.e1TargetFrozen) ? 0.60 : 0, SOURCE_E1)
      x.SKILL_ATK_SCALING.buff((e >= 1 && r.e1TargetFrozen) ? 0.60 : 0, SOURCE_E1)
      x.ULT_ATK_SCALING.buff((e >= 1 && r.e1TargetFrozen) ? 0.60 : 0, SOURCE_E1)
      x.FUA_ATK_SCALING.buff((e >= 1 && r.e1TargetFrozen) ? 0.60 : 0, SOURCE_E1)

      // Boost
      x.ICE_RES_PEN.buff((e >= 4 && r.e4CurrentHp80) ? 0.12 : 0, SOURCE_E4)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(10, SOURCE_TALENT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkP(x, action, context, hitMulti)
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkP(hitMulti) + gpuStandardAdditionalDmgAtkFinalizer()
    },
  }
}
