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

/*

Hurlthorn

Basic ATK+1+20

Deals Lightning DMG equal to 100% of Moze's ATK to a single target enemy.

 Single 10

Lv6

Fleetwinged Raid

Skill-1+30

Marks a designated single enemy target as "Prey" and deals to it Lightning DMG equal to 150% of Moze's ATK, and gains 9 points of Charge.
When there are no other characters on the field that are capable of combat, Moze cannot use his Skill and dispels the enemy's "Prey" state.

 Single 20

Lv10

Dash In, Gash Out

Ultimate120+5

Deals Lightning DMG equal to 270% of Moze's ATK to a single target enemy, and launches the Talent's Follow-up ATK against this target. If the target is defeated before this Follow-up ATK is used, then launches the Follow-up ATK against a random single enemy instead.

 Single 30

Lv10

Cascading Featherblade

Talent+10

When "Prey" exists on the field, Moze will enter the Departed state.
After allies attack "Prey," Moze will additionally deal 1 instance of Lightning Additional DMG equal to 30% of his ATK and consumes 1 point of Charge. For every 3 point(s) of Charge consumed, Moze launches 1 Follow-up ATK to "Prey," dealing Lightning DMG equal to 160% of his ATK. When Charge reaches 0, dispels the target's "Prey" state and resets the tally of Charge points required to launch Follow-up ATK. Talent's Follow-up ATK does not consume Charge.

Departed
Targets in the Departed state cannot be designated as ability targets and will not appear in the Action Order.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

 Single 10

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Bated Wings

Technique

After using Technique, enters the Stealth state for 20 second(s). While in Stealth, Moze is undetectable by enemies. If Moze attacks enemies to enter combat while in Stealth, increases DMG by 30%, lasting for 2 turn(s).


Stat Boosts

 +37.3% CRIT DMG
 +18.0% ATK
 +10.0% HP

Nightfeather

After using Talent's Follow-up ATK, recovers 1 Skill Point(s). This effect can trigger again after 1 turn(s).


Daggerhold

When Moze dispels his Departed state, his action advances by 20%. At the start of each wave, Moze's action advances by 30%.

Departed
Targets in the Departed state cannot be designated as ability targets and will not appear in the Action Order.


Vengewise

When dealing DMG by using Ultimate, it is considered as having launched a Follow-up ATK. The Follow-up ATK DMG taken by the "Prey" increases by 25%.



1 Oathkeeper

After entering battle, Moze regenerates 20 Energy. Each time the Additional DMG from his Talent is triggered, Moze regenerates 2 Energy.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.



2 Wrathbearer

When all allies deal DMG to the enemy target marked as "Prey," increases CRIT DMG by 40%.



3 Deathchaser

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Heathprowler

When using Ultimate, increases the DMG dealt by Moze by 30%, lasting for 2 turn(s).



5 Truthbender

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Faithbinder

Increases the DMG multiplier of the Talent's Follow-up ATK by 25%.
 */
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
