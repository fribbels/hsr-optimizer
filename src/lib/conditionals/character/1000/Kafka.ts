import { AbilityType, ASHBLAZING_ATK_STACK, DOT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { boostAshblazingAtkP, gpuBoostAshblazingAtkP } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg, buffAbilityVulnerability, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Midnight Tumult

Basic ATK+1+20

Deals Lightning DMG equal to 100% of Kafka's ATK to a single enemy.

 Single 10

Lv6

Caressing Moonlight

Skill-1+30

Deals Lightning DMG equal to 160% of Kafka's ATK to a target enemy and Lightning DMG equal to 60% of Kafka's ATK to enemies adjacent to it.
If the target enemy is currently receiving DoT, all DoTs currently placed on that enemy immediately produce DMG equal to 75% of their original DMG.

 Single 20 | Other 10

Lv10

Twilight Trill

Ultimate120+5

Deals Lightning DMG equal to 80% of Kafka's ATK to all enemies, with a 100% base chance for enemies hit to become Shocked and immediately take DMG from their current Shock state, equal to 100% of its original DMG. Shock lasts for 2 turn(s).
While Shocked, enemies receive Lightning DoT equal to 290% of Kafka's ATK at the beginning of each turn.

 All 20

Lv10

Gentle but Cruel

Talent+10

After Kafka's teammate uses Basic ATK on an enemy target, Kafka immediately launches Follow-up ATK and deals Lightning DMG equal to 140% of her ATK to that target, with a 100% base chance to inflict Shock equivalent to that applied by her Ultimate to the attacked enemy target, lasting for 2 turns. This effect can only be triggered 1 time per turn.

 Single 10

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Mercy Is Not Forgiveness

Technique

Immediately attacks all enemies within a set range. After entering battle, deals Lightning DMG equal to 50% of Kafka's ATK to all enemies, with a 100% base chance to inflict Shock equivalent to that applied by her Ultimate on every enemy target for 2 turn(s).

 Single 20


Stat Boosts

 +28.0% ATK
 +18.0% Effect Hit Rate
 +10.0% HP

Torture

When the Ultimate is used, enemy targets will now receive DMG immediately from all currently applied DoT sources instead of just receiving DMG immediately from the currently applied Shock state.


Plunder

If an enemy is defeated while Shocked, Kafka additionally regenerates 5 Energy.


Thorns

The base chance for target enemies to be Shocked by the Ultimate, the Technique, and the Talent-triggered Follow-up ATK increases by 30%.



1 Da Capo

When the Talent triggers a Follow-up ATK, there is a 100% base chance to increase the DoT received by the target by 30% for 2 turn(s).



2 Fortississimo

While Kafka is on the field, DoT dealt by all allies increases by 25%.



3 Capriccio

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Recitativo

When an enemy target takes DMG from the Shock status inflicted by Kafka, Kafka additionally regenerates 2 Energy.



5 Doloroso

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Leggiero

The Shock inflicted on the enemy target by the Ultimate, the Technique, or the Talent-triggered Follow-up ATK has a DMG multiplier increase of 156% and lasts 1 turn(s) longer.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Kafka')
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
  } = Source.character('1005')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.60, 1.76)
  const ultScaling = ult(e, 0.80, 0.864)
  const fuaScaling = talent(e, 1.40, 1.596)
  const dotScaling = ult(e, 2.90, 3.183)

  const hitMulti = ASHBLAZING_ATK_STACK
    * (1 * 0.15 + 2 * 0.15 + 3 * 0.15 + 4 * 0.15 + 5 * 0.15 + 6 * 0.25)

  const defaults = {
    e1DotDmgReceivedDebuff: true,
    e2TeamDotBoost: true,
  }

  const teammateDefaults = {
    e1DotDmgReceivedDebuff: true,
    e2TeamDotBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    e1DotDmgReceivedDebuff: {
      id: 'e1DotDmgReceivedDebuff',
      formItem: 'switch',
      text: t('Content.e1DotDmgReceivedDebuff.text'),
      content: t('Content.e1DotDmgReceivedDebuff.content'),
      disabled: e < 1,
    },
    e2TeamDotBoost: {
      id: 'e2TeamDotBoost',
      formItem: 'switch',
      text: t('Content.e2TeamDotBoost.text'),
      content: t('Content.e2TeamDotBoost.content'),
      disabled: e < 2,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    e1DotDmgReceivedDebuff: content.e1DotDmgReceivedDebuff,
    e2TeamDotBoost: content.e2TeamDotBoost,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA, AbilityType.DOT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_ATK_SCALING.buff(fuaScaling, SOURCE_TALENT)
      x.DOT_ATK_SCALING.buff(dotScaling, SOURCE_ULT)

      x.DOT_ATK_SCALING.buff((e >= 6) ? 1.56 : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(10, SOURCE_TALENT)

      x.DOT_CHANCE.set(1.30, SOURCE_TRACE)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      buffAbilityVulnerability(x, DOT_DMG_TYPE, (e >= 1 && m.e1DotDmgReceivedDebuff) ? 0.30 : 0, SOURCE_E1, Target.TEAM)
      buffAbilityDmg(x, DOT_DMG_TYPE, (e >= 2 && m.e2TeamDotBoost) ? 0.25 : 0, SOURCE_E2, Target.TEAM)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkP(x, action, context, hitMulti)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => gpuBoostAshblazingAtkP(hitMulti),
  }
}
