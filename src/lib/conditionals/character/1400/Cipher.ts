import i18next from 'i18next'
import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Cipher')
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

    // TODO: ID
  } = Source.character('1220')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.50, 2.50)
  const skillAtkBuff = skill(e, 0.37, 0.37)

  const ultScaling = ult(e, 0.60, 0.648)
  const ultBrokenScaling = ult(e, 0.30, 0.33)
  const ultFinalScaling = ult(e, 1.60, 1.728)

  const fuaScaling = talent(e, 1.10, 1.21)
  const talentDmgBuff = talent(e, 0.60, 0.66)

  // TODO: Ashblazing

  // const ultHitCountMulti = (1 * 0.1285 + 2 * 0.1285 + 3 * 0.1285 + 4 * 0.1285 + 5 * 0.1285 + 6 * 0.1285 + 7 * 0.2285)
  // const ultBrokenHitCountMulti = (
  //   1 * 0.1285 * 0.1 + 2 * 0.1285 * 0.9
  //   + 3 * 0.1285 * 0.1 + 4 * 0.1285 * 0.9
  //   + 5 * 0.1285 * 0.1 + 6 * 0.1285 * 0.9
  //   + 7 * 0.1285 * 0.1 + 8 * 0.1285 * 0.9
  //   + 8 * 0.1285 * 0.1 + 8 * 0.1285 * 0.9
  //   + 8 * 0.1285 * 0.1 + 8 * 0.1285 * 0.9
  //   + 8 * 0.2285)

  function getUltHitMulti(action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals as Conditionals<typeof content>

    return 1
  }

  const defaults = {
    defPen: true,
    skillAtkBuff: true,
    // talentDmgBuff: true,
    // skillAtkBuff: true,
    // e1OriginalDmgBoost: true,
    // e4Buffs: true,
    // e6Buffs: true,
  }

  const teammateDefaults = {
    defPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    defPen: {
      id: 'defPen',
      formItem: 'switch',
      text: 'Team DEF PEN',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    skillAtkBuff: {
      id: 'skillAtkBuff',
      formItem: 'switch',
      text: 'Skill ATK buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    // skillAtkBuff: {
    //   id: 'skillAtkBuff',
    //   formItem: 'switch',
    //   text: t('Content.skillAtkBuff.text'),
    //   content: t('Content.skillAtkBuff.content'),
    // },
    // e1OriginalDmgBoost: {
    //   id: 'e1OriginalDmgBoost',
    //   formItem: 'switch',
    //   text: t('Content.e1OriginalDmgBoost.text'),
    //   content: t('Content.e1OriginalDmgBoost.content'),
    //   disabled: e < 1,
    // },
    // e4Buffs: {
    //   id: 'e4Buffs',
    //   formItem: 'switch',
    //   text: t('Content.e4Buffs.text'),
    //   content: t('Content.e4Buffs.content'),
    //   disabled: e < 4,
    // },
    // e6Buffs: {
    //   id: 'e6Buffs',
    //   formItem: 'switch',
    //   text: t('Content.e6Buffs.text'),
    //   content: t('Content.e6Buffs.content'),
    //   disabled: e < 6,
    // },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    defPen: content.defPen,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    defaults: () => defaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // x.ULT_DMG_TYPE.set(ULT_DMG_TYPE | FUA_DMG_TYPE, SOURCE_TRACE)
      //
      // if (r.weaknessBrokenUlt) {
      //   x.ENEMY_WEAKNESS_BROKEN.config(1, SOURCE_ULT)
      // }
      //
      // if (e >= 6 && r.e6Buffs) {
      //   x.FUA_DMG_TYPE.set(ULT_DMG_TYPE | FUA_DMG_TYPE, SOURCE_E6)
      // }
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.DEF_PEN.buffTeam((m.defPen) ? 0.30 : 0, SOURCE_TRACE)
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.ATK_P.buff((r.skillAtkBuff) ? skillAtkBuff : 0, SOURCE_SKILL)

      // Special case where we force the weakness break on if the ult break option is enabled
      // if (!r.weaknessBrokenUlt) {
      //   x.ULT_BREAK_EFFICIENCY_BOOST.buff(1.00, SOURCE_ULT)
      // }
      //
      // buffAbilityCd(x, FUA_DMG_TYPE, 0.36, SOURCE_TRACE)
      //
      // x.ATK_P.buff((r.skillAtkBuff) ? 0.48 : 0, SOURCE_TRACE)
      // x.ELEMENTAL_DMG.buff((r.talentDmgBuff) ? talentDmgBuff : 0, SOURCE_TALENT)
      //
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      // x.FUA_ATK_SCALING.buff(fuaScaling, SOURCE_TALENT)
      //
      // x.ULT_ATK_SCALING.buff(6 * (ultScaling + ultBrokenScaling) + ultFinalScaling, SOURCE_ULT)
      //
      // x.ULT_FINAL_DMG_BOOST.buff((e >= 1 && r.e1OriginalDmgBoost) ? 0.3071 : 0, SOURCE_E1)
      //
      // if (e >= 4) {
      //   x.SPD_P.buff(0.08, SOURCE_E1)
      //   x.FUA_TOUGHNESS_DMG.buff(5, SOURCE_E1)
      // }
      //
      // if (e >= 6 && r.e6Buffs) {
      //   buffAbilityResPen(x, ULT_DMG_TYPE, 0.20, SOURCE_E6)
      //   x.FUA_ATK_SCALING.buff(1.40, SOURCE_E6)
      // }
      //
      // x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      // x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      // x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)
      // x.FUA_TOUGHNESS_DMG.buff(5, SOURCE_TALENT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.CR.buff((r.spdBasedBuffs && x.a[Key.SPD] >= 140) ? 0.25 : 0, SOURCE_TRACE)
      x.CR.buff((r.spdBasedBuffs && x.a[Key.SPD] >= 170) ? 0.25 : 0, SOURCE_TRACE)

      // TODO: Recorded value

      // TODO: Finalizers

      // const ultHitMulti = getUltHitMulti(action, context)
      // const fuaHitMulti = ASHBLAZING_ATK_STACK * (1 * 1.00)
      //
      // const ultAshblazingAtkP = calculateAshblazingSetP(x, action, context, ultHitMulti)
      // const fuaAshblazingAtkP = calculateAshblazingSetP(x, action, context, fuaHitMulti)
      //
      // x.ULT_ATK_P_BOOST.buff(ultAshblazingAtkP, Source.NONE)
      // x.FUA_ATK_P_BOOST.buff(fuaAshblazingAtkP, Source.NONE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      // const ultHitMulti = getUltHitMulti(action, context)
      // const fuaHitMulti = ASHBLAZING_ATK_STACK * (1 * 1.00)

      return ''
      //       return `
      // x.ULT_ATK_P_BOOST += calculateAshblazingSetP(sets.TheAshblazingGrandDuke, action.setConditionals.valueTheAshblazingGrandDuke, ${ultHitMulti});
      // x.FUA_ATK_P_BOOST += calculateAshblazingSetP(sets.TheAshblazingGrandDuke, action.setConditionals.valueTheAshblazingGrandDuke, ${fuaHitMulti});
      //     `
    },
  }
}
