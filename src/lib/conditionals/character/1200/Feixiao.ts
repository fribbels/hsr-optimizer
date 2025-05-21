import { AbilityType, ASHBLAZING_ATK_STACK, FUA_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, calculateAshblazingSetP, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityCd, buffAbilityResPen } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Boltsunder

Basic ATK+1

Deals Wind DMG equal to 100% of Feixiao's ATK to a single target enemy.

 Single 10

Lv6

Waraxe

Skill-1

Deals Wind DMG equal to 200% of Feixiao's ATK to a single target enemy. Then, immediately launches 1 extra instance of Talent's Follow-up ATK against the target.

 Single 20

Lv10

Terrasplit

Ultimate6

Deals Wind DMG to a single target enemy, up to 700% of Feixiao's ATK. During this time, can ignore Weakness Type to reduce the target's Toughness. When the target is not Weakness Broken, Feixiao's Weakness Break Efficiency increases by 100%.
During the attack, Feixiao first launches "Boltsunder Blitz" or "Waraxe Skyward" on the target, for a total of 6 time(s).
At the end, deals Wind DMG equal to 160% of Feixiao's ATK to the target.

 Single 30

Lv10

Thunderhunt

Talent

Can activate Ultimate when "Flying Aureus" reaches 6 points, accumulating up to 12 points. Feixiao gains 1 point of "Flying Aureus" for every 2 attacks by ally targets. Feixiao's Ultimate attacks do not count towards this number.
After Feixiao's teammates attack an Enemy target, Feixiao immediately launches Follow-up ATK against the primary target, dealing Wind DMG equal to 110% of Feixiao's ATK. If there is no primary target available to attack, Feixiao attacks a single random enemy instead. This effect can only trigger once per turn and the trigger count resets at the start of Feixiao's turn. When using this attack, increases DMG dealt by this unit by 60%, lasting for 2 turn(s).

 Single 5

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Stormborn

Technique

After using Technique, enters the "Onrush" state, lasting for 20 seconds. While in "Onrush," pulls in enemies within a certain range, and increases this unit's movement speed by 50%. After entering battle, gains 1 point(s) of "Flying Aureus."
While in "Onrush," actively attacking will start battle with all pulled enemies. After entering battle, deals Wind DMG equal to 200% of Feixiao's ATK to all enemies at the start of each wave. This DMG is guaranteed to CRIT. If more than 1 enemy is pulled in, increases the multiplier of this DMG by 100% for each additional enemy pulled in, up to a maximum of 1000%.


Boltsunder Blitz

Ultimate

Deals Wind DMG equal to 60% of Feixiao's ATK to the chosen target. If the target is Weakness Broken, the DMG multiplier increases by 30%.

 Single 5

Lv10

Waraxe Skyward

Ultimate

Deals Wind DMG equal to 60% of Feixiao's ATK to the chosen target. If the target is not Weakness Broken, the DMG multiplier increases by 30%.

 Single 5

Lv10

Terrasplit

Ultimate


Hidden Stat: 1.6
Hidden Stat: 1
Hidden Stat: 6
Hidden Stat: 7

Lv10

Stat Boosts

 +28.0% ATK
 +12.0% CRIT Rate
 +12.5% DEF

Heavenpath

When the battle starts, gains 3 point(s) of "Flying Aureus."
At the start of a turn, if no Follow-up ATK was launched via Talent in the previous turn, then this counts as 1 toward the number of attacks required to gain "Flying Aureus."


Formshift

When using Ultimate to deal DMG to an enemy target, it is considered as a Follow-up ATK. Follow-up ATKs' CRIT DMG increases by 36%.


Boltcatch

When using Skill, increases ATK by 48%, lasting for 3 turn(s).



1 Skyward I Quell

After launching "Boltsunder Blitz" or "Waraxe Skyward," additionally increases the Ultimate DMG dealt by Feixiao by an amount equal to 10% of the original DMG, stacking up to 5 time(s) and lasting until the end of the Ultimate action.



2 Moonward I Wish

In the Talent's effect, for every 1 instance of Follow-up ATK launched by ally targets, Feixiao gains 1 point of "Flying Aureus." This effect can trigger up to 6 time(s) per turn.



3 Starward I Bode

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Stormward I Hear

The Toughness Reduction from the Talent's Follow-up ATK increases by 100% and, when launched, increases this unit's SPD by 8%, lasting for 2 turn(s).



5 Heavenward I Leap

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Homeward I Near

Increases the All-Type RES PEN of Ultimate DMG dealt by Feixiao by 20%. Talent's Follow-up ATK DMG is considered as Ultimate DMG at the same time, and its DMG multiplier increases by 140%.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Feixiao')
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
  } = Source.character('1220')

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
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    defaults: () => defaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.ULT_DMG_TYPE.set(ULT_DMG_TYPE | FUA_DMG_TYPE, SOURCE_TRACE)

      if (r.weaknessBrokenUlt) {
        x.ENEMY_WEAKNESS_BROKEN.config(1, SOURCE_ULT)
      }

      if (e >= 6 && r.e6Buffs) {
        x.FUA_DMG_TYPE.set(ULT_DMG_TYPE | FUA_DMG_TYPE, SOURCE_E6)
      }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Special case where we force the weakness break on if the ult break option is enabled
      if (!r.weaknessBrokenUlt) {
        x.ULT_BREAK_EFFICIENCY_BOOST.buff(1.00, SOURCE_ULT)
      }

      buffAbilityCd(x, FUA_DMG_TYPE, 0.36, SOURCE_TRACE)

      x.ATK_P.buff((r.skillAtkBuff) ? 0.48 : 0, SOURCE_TRACE)
      x.ELEMENTAL_DMG.buff((r.talentDmgBuff) ? talentDmgBuff : 0, SOURCE_TALENT)

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.FUA_ATK_SCALING.buff(fuaScaling, SOURCE_TALENT)

      x.ULT_ATK_SCALING.buff(6 * (ultScaling + ultBrokenScaling) + ultFinalScaling, SOURCE_ULT)

      x.ULT_FINAL_DMG_BOOST.buff((e >= 1 && r.e1OriginalDmgBoost) ? 0.3071 : 0, SOURCE_E1)

      if (e >= 4) {
        x.SPD_P.buff(0.08, SOURCE_E1)
        x.FUA_TOUGHNESS_DMG.buff(5, SOURCE_E1)
      }

      if (e >= 6 && r.e6Buffs) {
        buffAbilityResPen(x, ULT_DMG_TYPE, 0.20, SOURCE_E6)
        x.FUA_ATK_SCALING.buff(1.40, SOURCE_E6)
      }

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(5, SOURCE_TALENT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const ultHitMulti = getUltHitMulti(action, context)
      const fuaHitMulti = ASHBLAZING_ATK_STACK * (1 * 1.00)

      const ultAshblazingAtkP = calculateAshblazingSetP(x, action, context, ultHitMulti)
      const fuaAshblazingAtkP = calculateAshblazingSetP(x, action, context, fuaHitMulti)

      x.ULT_ATK_P_BOOST.buff(ultAshblazingAtkP, Source.NONE)
      x.FUA_ATK_P_BOOST.buff(fuaAshblazingAtkP, Source.NONE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const ultHitMulti = getUltHitMulti(action, context)
      const fuaHitMulti = ASHBLAZING_ATK_STACK * (1 * 1.00)

      return `
x.ULT_ATK_P_BOOST += calculateAshblazingSetP(sets.TheAshblazingGrandDuke, action.setConditionals.valueTheAshblazingGrandDuke, ${ultHitMulti});
x.FUA_ATK_P_BOOST += calculateAshblazingSetP(sets.TheAshblazingGrandDuke, action.setConditionals.valueTheAshblazingGrandDuke, ${fuaHitMulti});
    `
    },
  }
}
