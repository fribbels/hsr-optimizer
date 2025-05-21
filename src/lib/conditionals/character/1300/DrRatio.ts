import { AbilityType, ASHBLAZING_ATK_STACK, FUA_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { boostAshblazingAtkP, gpuBoostAshblazingAtkP, gpuStandardAdditionalDmgAtkFinalizer, standardAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Mind is Might

Basic ATK+1+20

Deals Imaginary DMG equal to 100% of Dr. Ratio's ATK to a single target enemy.

 Single 10

Lv6

Intellectual Midwifery

Skill-1+30

Deals Imaginary DMG equal to 150% of Dr. Ratio's ATK to a single target enemy.

 Single 20

Lv10

Syllogistic Paradox

Ultimate140+5

Deals Imaginary DMG equal to 240% of Dr. Ratio's ATK to a single target enemy and applies Wiseman's Folly. When Dr. Ratio's teammates attack a target afflicted with Wiseman's Folly, Dr. Ratio launches 1 instance of his Talent's Follow-up ATK against this target.
Wiseman's Folly can be triggered for up to 2 times and only affects the most recent target of Dr. Ratio's Ultimate. This trigger count resets after Dr. Ratio's Ultimate is used.

 Single 30

Lv10

Cogito, Ergo Sum

Talent+5

When using his Skill, Dr. Ratio has a 40% fixed chance of launching a Follow-up ATK against his target for 1 time, dealing Imaginary DMG equal to 270% of Dr. Ratio's ATK. For each debuff the target enemy has, the fixed chance of launching Follow-up ATK increases by 20%. If the target enemy is defeated before the Follow-up ATK triggers, the Follow-up ATK will be directed at a single random enemy instead.

 Single 10

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Mold of Idolatry

Technique

After using Technique, creates a Special Dimension that Taunts nearby enemies, lasting for 10 second(s). After entering battle with enemies in this Special Dimension, there is a 100% base chance to reduce each single enemy target's SPD by 15% for 2 turn(s). Only 1 Dimension Effect created by allies can exist at the same time.


Stat Boosts

 +28.0% ATK
 +12.0% CRIT Rate
 +12.5% DEF

Summation

When Dr. Ratio uses his Skill, for every debuff on the target, his CRIT Rate increases by 2.5% and CRIT DMG by 5%. This effect can stack up to 6 time(s).


Inference

When Skill is used to attack an enemy target, there is a 100% base chance to reduce the attacked enemy target's Effect RES by 10% for 2 turn(s).


Deduction

When dealing DMG to a target that has 3 or more debuff(s), for each debuff the target has, the DMG dealt by Dr. Ratio to this target increases by 10%, up to a maximum increase of 50%.



1 Pride Comes Before a Fall

The maximum stackable count for the Trace "Summation" increases by 4. When a battle begins, immediately obtains 4 stacks of Summation. Needs to unlock Summation first.



2 The Divine Is in the Details

When his Talent's Follow-up ATK hits a target, for every debuff the target has, deals Imaginary Additional DMG equal to 20% of Dr. Ratio's ATK. This effect can be triggered for a maximum of 4 time(s) during each Follow-up ATK.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.



3 Know Thyself

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Ignorance Is Blight

When triggering the Talent, additionally regenerates 15 Energy for Dr. Ratio.



5 Sic Itur Ad Astra

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Vincit Omnia Veritas

Additionally increases the trigger count for "Wiseman's Folly" by 1. The DMG dealt by the Talent's Follow-up ATK increases by 50%.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.DrRatio')
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
  } = Source.character('1305')

  const debuffStacksMax = 5
  const summationStacksMax = (e >= 1) ? 10 : 6

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.50, 1.65)
  const ultScaling = ult(e, 2.40, 2.592)
  const fuaScaling = talent(e, 2.70, 2.97)

  function e2FuaRatio(procs: number, fua = true) {
    return fua
      ? fuaScaling / (fuaScaling + 0.20 * procs) // for fua dmg
      : 0.20 / (fuaScaling + 0.20 * procs) // for each e2 proc
  }

  const baseHitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)
  const fuaMultiByDebuffs: NumberToNumberMap = {
    0: ASHBLAZING_ATK_STACK * (1 * 1 / 1), // 0
    1: ASHBLAZING_ATK_STACK * (1 * e2FuaRatio(1, true) + 2 * e2FuaRatio(1, false)), // 2
    2: ASHBLAZING_ATK_STACK * (1 * e2FuaRatio(2, true) + 5 * e2FuaRatio(2, false)), // 2 + 3
    3: ASHBLAZING_ATK_STACK * (1 * e2FuaRatio(3, true) + 9 * e2FuaRatio(3, false)), // 2 + 3 + 4
    4: ASHBLAZING_ATK_STACK * (1 * e2FuaRatio(4, true) + 14 * e2FuaRatio(4, false)), // 2 + 3 + 4 + 5
  }

  function getHitMulti(action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals as Conditionals<typeof content>
    return e >= 2
      ? fuaMultiByDebuffs[Math.min(4, r.enemyDebuffStacks)]
      : baseHitMulti
  }

  const defaults = {
    enemyDebuffStacks: debuffStacksMax,
    summationStacks: summationStacksMax,
  }

  const content: ContentDefinition<typeof defaults> = {
    summationStacks: {
      id: 'summationStacks',
      formItem: 'slider',
      text: t('Content.summationStacks.text'),
      content: t('Content.summationStacks.content', { summationStacksMax }),
      min: 0,
      max: summationStacksMax,
    },
    enemyDebuffStacks: {
      id: 'enemyDebuffStacks',
      formItem: 'slider',
      text: t('Content.enemyDebuffStacks.text'),
      content: t('Content.enemyDebuffStacks.content', { FuaScaling: TsUtils.precisionRound(100 * fuaScaling) }),
      min: 0,
      max: debuffStacksMax,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.CR.buff(r.summationStacks * 0.025, SOURCE_TRACE)
      x.CD.buff(r.summationStacks * 0.05, SOURCE_TRACE)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_ATK_SCALING.buff(fuaScaling, SOURCE_TALENT)
      x.FUA_ADDITIONAL_DMG_SCALING.buff((e >= 2) ? 0.20 * Math.min(4, r.enemyDebuffStacks) : 0, SOURCE_E2)

      // Boost
      x.ELEMENTAL_DMG.buff((r.enemyDebuffStacks >= 3) ? Math.min(0.50, r.enemyDebuffStacks * 0.10) : 0, SOURCE_TRACE)
      buffAbilityDmg(x, FUA_DMG_TYPE, (e >= 6) ? 0.50 : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(10, SOURCE_TALENT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkP(x, action, context, getHitMulti(action, context))
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkP(getHitMulti(action, context)) + gpuStandardAdditionalDmgAtkFinalizer()
    },
  }
}
