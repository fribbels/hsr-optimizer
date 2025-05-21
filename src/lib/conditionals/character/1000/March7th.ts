import { AbilityType, ASHBLAZING_ATK_STACK } from 'lib/conditionals/conditionalConstants'
import { boostAshblazingAtkP, gpuBoostAshblazingAtkP, gpuStandardDefShieldFinalizer, standardDefShieldFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Frigid Cold Arrow

Basic ATK+1+20

Deals Ice DMG equal to 100% of March 7th's ATK to a single enemy.

 Single 10

Lv6

The Power of Cuteness

Skill-1+30

Provides a single ally with a Shield that can absorb DMG equal to 57% of March 7th's DEF plus 760 for 3 turn(s).
If the ally's current HP percentage is 30% or higher, greatly increases the chance of enemies attacking that ally.
Hidden Stat: 5

Lv10

Glacial Cascade

Ultimate120+5

Deals Ice DMG equal to 150% of March 7th's ATK to all enemies. Hit enemies have a 50% base chance to be Frozen for 1 turn(s).
While Frozen, enemies cannot take action and will receive Ice Additional DMG equal to 60% of March 7th's ATK at the beginning of each turn.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

 All 20

Lv10

Girl Power

Talent+10

After a Shielded ally is attacked by an enemy, March 7th immediately Counters, dealing Ice DMG equal to 100% of her ATK. This effect can be triggered 2 time(s) each turn.

Counter
An effect that automatically triggers when the target is attacked, which unleashes an extra attack on the attacker.
Counter is also considered a Follow-up ATK.

 Single 10

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Freezing Beauty

Technique

Immediately attacks the enemy. After entering battle, there is a 100% base chance to Freeze a random enemy for 1 turn(s).
While Frozen, the enemy cannot take action and will take Ice Additional DMG equal to 50% of March 7th's ATK at the beginning of each turn.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

 Single 20


Stat Boosts

 +22.4% Ice DMG Boost
 +22.5% DEF
 +10.0% Effect RES

Purify

When using Skill, dispels 1 debuff from one designated ally.


Reinforce

The duration of the Shield generated from Skill is extended for 1 turn(s).


Ice Spell

When using Ultimate, increases the base chance to Freeze enemies by 15%.



1 Memory of You

Every time March 7th's Ultimate Freezes a target, she regenerates 6 Energy.



2 Memory of It

Upon entering battle, grants a Shield equal to 24% of March 7th's DEF plus 320 to the ally with the lowest HP percentage, lasting for 3 turn(s).



3 Memory of Everything

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Never Forfeit Again

The Talent's Counter effect can be triggered 1 more time in each turn. The DMG dealt by Counter increases by an amount that is equal to 30% of March 7th's DEF.

Counter
An effect that automatically triggers when the target is attacked, which unleashes an extra attack on the attacker.
Counter is also considered a Follow-up ATK.



5 Never Forget Again

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Just Like This, Always...

Allies under the protection of the Shield granted by the Skill restore HP equal to 4% of their Max HP plus 106 at the beginning of each turn.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
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
  } = Source.character('1001')

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 1.50, 1.62)
  const fuaScaling = talent(e, 1.00, 1.10)

  const hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  const skillShieldScaling = skill(e, 0.57, 0.608)
  const skillShieldFlat = skill(e, 760, 845.5)

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT, AbilityType.FUA, AbilityType.DOT],
    content: () => [],
    defaults: () => ({}),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_ATK_SCALING.buff(fuaScaling, SOURCE_TALENT)
      x.FUA_DEF_SCALING.buff((e >= 4) ? 0.30 : 0, SOURCE_E4)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(10, SOURCE_TALENT)

      x.SHIELD_SCALING.buff(skillShieldScaling, SOURCE_SKILL)
      x.SHIELD_FLAT.buff(skillShieldFlat, SOURCE_SKILL)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkP(x, action, context, hitMulti)
      standardDefShieldFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => gpuBoostAshblazingAtkP(hitMulti) + gpuStandardDefShieldFinalizer(),
  }
}
