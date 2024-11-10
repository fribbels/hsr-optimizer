import { ASHBLAZING_ATK_STACK, FUA_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, calculateAshblazingSet, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { buffAbilityCd } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Key, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Feixiao')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)

  const ultScaling = ult(e, 0.60, 0.648)
  const ultBrokenScaling = ult(e, 0.30, 0.33)
  const ultFinalScaling = ult(e, 1.60, 1.728)

  const fuaScaling = talent(e, 1.10, 1.21)
  const talentDmgBuff = talent(e, 0.60, 0.66)

  const ultHitCountMulti = (1 * 0.1285 + 2 * 0.1285 + 3 * 0.1285 + 4 * 0.1285 + 5 * 0.1285 + 6 * 0.1285 + 7 * 0.2285)
  const ultBrokenHitCountMulti = (
    1 * 0.1285 * 0.1 + 2 * 0.1285 * 0.9
    + 3 * 0.1285 * 0.1 + 4 * 0.1285 * 0.9
    + 5 * 0.1285 * 0.1 + 6 * 0.1285 * 0.9
    + 7 * 0.1285 * 0.1 + 8 * 0.1285 * 0.9
    + 8 * 0.1285 * 0.1 + 8 * 0.1285 * 0.9
    + 8 * 0.1285 * 0.1 + 8 * 0.1285 * 0.9
    + 8 * 0.2285)

  function getUltHitMulti(action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals as Conditionals<typeof content>

    return r.weaknessBrokenUlt
      ? ASHBLAZING_ATK_STACK * ultBrokenHitCountMulti
      : ASHBLAZING_ATK_STACK * ultHitCountMulti
  }

  const defaults = {
    weaknessBrokenUlt: true,
    talentDmgBuff: true,
    skillAtkBuff: true,
    e1OriginalDmgBoost: true,
    e4Buffs: true,
    e6Buffs: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    weaknessBrokenUlt: {
      id: 'weaknessBrokenUlt',
      formItem: 'switch',
      text: t('Content.weaknessBrokenUlt.text'),
      content: t('Content.weaknessBrokenUlt.content'),
    },
    talentDmgBuff: {
      id: 'talentDmgBuff',
      formItem: 'switch',
      text: t('Content.talentDmgBuff.text'),
      content: t('Content.talentDmgBuff.content', {
        FuaMultiplier: TsUtils.precisionRound(100 * fuaScaling),
        DmgBuff: TsUtils.precisionRound(100 * talentDmgBuff),
      }),
    },
    skillAtkBuff: {
      id: 'skillAtkBuff',
      formItem: 'switch',
      text: t('Content.skillAtkBuff.text'),
      content: t('Content.skillAtkBuff.content'),
    },
    e1OriginalDmgBoost: {
      id: 'e1OriginalDmgBoost',
      formItem: 'switch',
      text: t('Content.e1OriginalDmgBoost.text'),
      content: t('Content.e1OriginalDmgBoost.content'),
      disabled: e < 1,
    },
    e4Buffs: {
      id: 'e4Buffs',
      formItem: 'switch',
      text: t('Content.e4Buffs.text'),
      content: t('Content.e4Buffs.content'),
      disabled: e < 4,
    },
    e6Buffs: {
      id: 'e6Buffs',
      formItem: 'switch',
      text: t('Content.e6Buffs.text'),
      content: t('Content.e6Buffs.content'),
      disabled: e < 6,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.ULT_DMG_TYPE.set(ULT_TYPE | FUA_TYPE, Source.NONE)

      if (r.weaknessBrokenUlt) {
        x.ENEMY_WEAKNESS_BROKEN.set(1, Source.NONE)
      }

      if (e >= 6 && r.e6Buffs) {
        x.FUA_DMG_TYPE.set(ULT_TYPE | FUA_TYPE, Source.NONE)
      }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Special case where we force the weakness break on if the ult break option is enabled
      if (!r.weaknessBrokenUlt) {
        x.ULT_BREAK_EFFICIENCY_BOOST.buff(1.00, Source.NONE)
      }

      buffAbilityCd(x, FUA_TYPE, 0.36, Source.NONE)

      x.ATK_P.buff((r.skillAtkBuff) ? 0.48 : 0, Source.NONE)
      x.ELEMENTAL_DMG.buff((r.talentDmgBuff) ? talentDmgBuff : 0, Source.NONE)

      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)
      x.FUA_SCALING.buff(fuaScaling, Source.NONE)

      x.ULT_SCALING.buff(6 * (ultScaling + ultBrokenScaling) + ultFinalScaling, Source.NONE)

      x.ULT_ORIGINAL_DMG_BOOST.buff((e >= 1 && r.e1OriginalDmgBoost) ? 0.3071 : 0, Source.NONE)

      if (e >= 4) {
        x.SPD_P.buff(0.08, Source.NONE)
        x.FUA_TOUGHNESS_DMG.buff(15, Source.NONE)
      }

      if (e >= 6 && r.e6Buffs) {
        x.RES_PEN.buff(0.20, Source.NONE)
        x.FUA_SCALING.buff(1.40, Source.NONE)
      }

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.SKILL_TOUGHNESS_DMG.buff(60, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(90, Source.NONE)
      x.FUA_TOUGHNESS_DMG.buff(15, Source.NONE)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      x.BASIC_DMG.buff(x.a[Key.BASIC_SCALING] * x.a[Key.ATK], Source.NONE)
      x.SKILL_DMG.buff(x.a[Key.SKILL_SCALING] * x.a[Key.ATK], Source.NONE)
      x.ULT_DMG.buff(x.a[Key.ULT_SCALING] * (x.a[Key.ATK] + calculateAshblazingSet(x, action, context, getUltHitMulti(action, context))), Source.NONE)
      x.FUA_DMG.buff(x.a[Key.FUA_SCALING] * (x.a[Key.ATK] + calculateAshblazingSet(x, action, context, ASHBLAZING_ATK_STACK * (1 * 1.00))), Source.NONE)
      x.DOT_DMG.buff(x.a[Key.DOT_SCALING] * x.a[Key.ATK], Source.NONE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return `
x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
x.SKILL_DMG += x.SKILL_SCALING * x.ATK;
x.ULT_DMG += x.ULT_SCALING * (x.ATK + calculateAshblazingSet(p_x, p_state, ${getUltHitMulti(action, context)}));
x.FUA_DMG += x.FUA_SCALING * (x.ATK + calculateAshblazingSet(p_x, p_state, ${ASHBLAZING_ATK_STACK * (1 * 1.00)}));
x.DOT_DMG += x.DOT_SCALING * x.ATK;
    `
    },
  }
}
