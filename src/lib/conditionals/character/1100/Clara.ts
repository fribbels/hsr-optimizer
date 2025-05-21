import { AbilityType, ASHBLAZING_ATK_STACK, FUA_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { boostAshblazingAtkP, gpuBoostAshblazingAtkP } from 'lib/conditionals/conditionalFinalizers'
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

I Want to Help

Basic ATK+1+20

Deals Physical DMG equal to 100% of Clara's ATK to a single enemy.

 Single 10

Lv6

Svarog Watches Over You

Skill-1+30

Deals Physical DMG equal to 120% of Clara's ATK to all enemies, and additionally deals Physical DMG equal to 120% of Clara's ATK to enemies marked by Svarog with a Mark of Counter.
All Marks of Counter will be removed after this Skill is used.

 All 10

Lv10

Promise, Not Command

Ultimate110+5

After Clara uses Ultimate, DMG dealt to her is reduced by an extra 25%, and she has greatly increased chances of being attacked by enemies for 2 turn(s).
In addition, Svarog's Counter is enhanced. When an ally is attacked, Svarog immediately launches a Counter, and its DMG multiplier against the enemy increases by 160%. Enemies adjacent to it take 50% of the DMG dealt to the primary target enemy. Enhanced Counter(s) can take effect 2 time(s).
Hidden Stat: 5

Counter
An effect that automatically triggers when the target is attacked, which unleashes an extra attack on the attacker.
Counter is also considered a Follow-up ATK.

Lv10

Because We're Family

Talent+5

Under the protection of Svarog, DMG taken by Clara when hit by enemy attacks is reduced by 10%. Svarog will mark enemies who attack Clara with his Mark of Counter and retaliate with a Counter, dealing Physical DMG equal to 160% of Clara's ATK.
Hidden Stat: 1

 Single 10 | Other 10

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


A Small Price for Victory

Technique

Immediately attacks the enemy. Upon entering battle, the chance Clara will be attacked by enemies increases for 2 turn(s).
Hidden Stat: 5

 Single 20


Stat Boosts

 +28.0% ATK
 +14.4% Physical DMG Boost
 +10.0% HP

Kinship

When attacked, this unit has a 35% fixed chance to dispel 1 debuff placed on them.


Under Protection

Increases the chance to resist Crowd Control debuffs by 35%.

Crowd Control debuff
Freeze, Entanglement, Imprisonment, Dominated, Outrage, Strong Reverberation, Alien Dream, Snarelock, Terrified.


Revenge

Increases DMG dealt by Svarog's Counter by 30%.

Counter
An effect that automatically triggers when the target is attacked, which unleashes an extra attack on the attacker.
Counter is also considered a Follow-up ATK.



1 A Tall Figure

Using Skill will not remove Marks of Counter on the enemy.



2 A Tight Embrace

After using the Ultimate, ATK increases by 30% for 2 turn(s).



3 Cold Steel Armor

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Family's Warmth

After Clara is hit, the DMG taken by Clara is reduced by 30%. This effect lasts until the start of her next turn.



5 A Small Promise

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Long Company

After other allies are attacked, Svarog also has a 50% fixed chance to trigger a Counter on the attacker and mark them with a "Mark of Counter." When using Ultimate, the number of Enhanced Counters increases by 1.

Counter
An effect that automatically triggers when the target is attacked, which unleashes an extra attack on the attacker.
Counter is also considered a Follow-up ATK.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Clara')
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
  } = Source.character('1107')

  const ultDmgReductionValue = ult(e, 0.25, 0.27)
  const ultFuaExtraScaling = ult(e, 1.60, 1.728)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.20, 1.32)
  const fuaScaling = talent(e, 1.60, 1.76)

  const hitMultiByTargetsBlast: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1),
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 1),
    5: ASHBLAZING_ATK_STACK * (2 * 1 / 1), // Clara is 1 hit blast when enhanced
  }

  const hitMultiSingle = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  const defaults = {
    ultBuff: true,
    talentEnemyMarked: true,
    e2UltAtkBuff: true,
    e4DmgReductionBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultBuff: {
      id: 'ultBuff',
      formItem: 'switch',
      text: t('Content.ultBuff.text'),
      content: t('Content.ultBuff.content', {
        ultFuaExtraScaling: TsUtils.precisionRound(100 * ultFuaExtraScaling),
        ultDmgReductionValue: TsUtils.precisionRound((100 * ultDmgReductionValue)),
      }),
    },
    talentEnemyMarked: {
      id: 'talentEnemyMarked',
      formItem: 'switch',
      text: t('Content.talentEnemyMarked.text'),
      content: t('Content.talentEnemyMarked.content', { skillScaling: TsUtils.precisionRound(100 * skillScaling) }),
    },
    e2UltAtkBuff: {
      id: 'e2UltAtkBuff',
      formItem: 'switch',
      text: t('Content.e2UltAtkBuff.text'),
      content: t('Content.e2UltAtkBuff.content'),
      disabled: e < 2,
    },
    e4DmgReductionBuff: {
      id: 'e4DmgReductionBuff',
      formItem: 'switch',
      text: t('Content.e4DmgReductionBuff.text'),
      content: t('Content.e4DmgReductionBuff.content'),
      disabled: e < 4,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.FUA],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.ATK_P.buff((e >= 2 && r.e2UltAtkBuff) ? 0.30 : 0, SOURCE_E2)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.SKILL_ATK_SCALING.buff(r.talentEnemyMarked ? skillScaling : 0, SOURCE_SKILL)

      x.FUA_ATK_SCALING.buff(fuaScaling, SOURCE_TALENT)
      x.FUA_ATK_SCALING.buff(r.ultBuff ? ultFuaExtraScaling : 0, SOURCE_ULT)

      // Boost
      x.DMG_RED_MULTI.multiply((1 - 0.10), SOURCE_TALENT)
      x.DMG_RED_MULTI.multiply((r.ultBuff) ? (1 - ultDmgReductionValue) : 1, SOURCE_ULT)
      x.DMG_RED_MULTI.multiply((e >= 4 && r.e4DmgReductionBuff) ? (1 - 0.30) : 1, SOURCE_E4)
      buffAbilityDmg(x, FUA_DMG_TYPE, 0.30, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(10, SOURCE_SKILL)
      x.FUA_TOUGHNESS_DMG.buff(10, SOURCE_TALENT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const hitMulti = r.ultBuff ? hitMultiByTargetsBlast[context.enemyCount] : hitMultiSingle
      boostAshblazingAtkP(x, action, context, hitMulti)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const hitMulti = r.ultBuff ? hitMultiByTargetsBlast[context.enemyCount] : hitMultiSingle
      return gpuBoostAshblazingAtkP(hitMulti)
    },
  }
}
