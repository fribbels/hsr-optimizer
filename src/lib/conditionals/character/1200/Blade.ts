import { AbilityType, ASHBLAZING_ATK_STACK, FUA_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuBoostAshblazingAtkP } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, calculateAshblazingSetP, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Shard Sword

Basic ATK+1+20

Deals 100% of Blade's ATK as Wind DMG to a target enemy.

 Single 10

Lv6

Forest of Swords

Basic ATK+30

Consumes HP equal to 10% of Blade's Max HP and deals Wind DMG equal to the sum of 40% of his ATK and 100% of his Max HP to a single enemy. In addition, deals Wind DMG equal to the sum of 16% of Blade's ATK and 40% of his Max HP to adjacent targets.
If Blade's current HP is insufficient, his HP will be reduced to 1 when using Forest of Swords.
Forest of Swords cannot regenerate Skill Points.

 Single 20 | Other 10

Lv6

Death Sentence

Ultimate130+5

Sets Blade's current HP to 50% of his Max HP and deals Wind DMG to a single enemy equal to the sum of 40% of his ATK, 100% of his Max HP, and 100% of the tally of Blade's HP loss in the current battle. At the same time, deals Wind DMG to adjacent targets equal to the sum of 16% of his ATK, 40% of his Max HP, and 40% of the tally of his HP loss in the current battle.
The tally of Blade's HP loss in the current battle is capped at 90% of his Max HP. This value will be reset and re-accumulated after his Ultimate has been used.

 Single 20 | Other 20

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Karma Wind

Technique

Immediately attacks the enemy. After entering combat, consumes 20% of Blade's Max HP while dealing Wind DMG equal to 40% of his Max HP to all enemies.
If Blade's current HP is insufficient, his HP will be reduced to 1 when this Technique is used.

 Single 20


Hellscape

Skill-1

Consumes HP equal to 30% of Blade's Max HP to enter the Hellscape state.
When Hellscape is active, his Skill cannot be used, his DMG dealt increases by 40%, and his Basic ATK Shard Sword is enhanced to Forest of Swords for 3 turn(s).
If Blade's current HP is insufficient, his HP will be reduced to 1 when he uses his Skill.
This Skill does not regenerate Energy. Using this Skill does not end the current turn.
Hidden Stat: 1

Lv10

Shuhu's Gift

Talent+10

When Blade sustains DMG or consumes his HP, he gains 1 stack of Charge, stacking up to 5 times. A max of 1 Charge stack can be gained every time he is attacked.
When Charge stack reaches maximum, immediately launches a Follow-up ATK on all enemies, dealing Wind DMG equal to 44% of Blade's ATK plus 110% of his Max HP. At the same time, restores Blade's HP by 25% of his Max HP. After the Follow-up ATK, all Charges are consumed.
Hidden Stat: 3

 All 10

Lv10

Stat Boosts

 +28.0% HP
 +12.0% CRIT Rate
 +10.0% Effect RES

Vita Infinita

When Blade's current HP percentage is at 50% of Max HP or lower, the HP restored when receiving healing increases by 20%.


Neverending Deaths

If Blade hits a Weakness Broken enemy after using "Forest of Swords," he will restore HP equal to 5% of his Max HP plus 100.


Cyclone of Destruction

Increases DMG dealt by the Talent's Follow-up ATK by 20%.



1 Blade Cuts the Deepest in Hell

Blade's Ultimate deals additionally increased DMG to a single enemy target, with the increased amount equal to 150% of the tally of Blade's HP loss in the current battle.
The tally of Blade's HP loss in the current battle is capped at 90% of his Max HP. The tally value will be reset and re-accumulated after his Ultimate has been used.



2 Ten Thousand Sorrows From One Broken Dream

When Blade is in the Hellscape state, his CRIT Rate increases by 15%.



3 Hardened Blade Bleeds Coldest Shade

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Rejected by Death, Infected With Life

When Blade's current HP percentage drops to 50% or lower of his Max HP, increases his Max HP by 20%. Stacks up to 2 time(s).



5 Death By Ten Lords' Gaze

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Reborn Into an Empty Husk

The maximum number of Charge stacks is reduced to 4. The Follow-up ATK triggered by Talent deals additionally increased DMG equal to 50% of Blade's Max HP.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Blade')
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
  } = Source.character('1205')

  const enhancedStateDmgBoost = skill(e, 0.40, 0.456)
  const hpPercentLostTotalMax = 0.90

  const basicScaling = basic(e, 1.0, 1.1)
  const basicEnhancedAtkScaling = skill(e, 0.40, 0.44)
  const basicEnhancedHpScaling = skill(e, 1.00, 1.10)
  const ultAtkScaling = ult(e, 0.40, 0.432)
  const ultHpScaling = ult(e, 1.00, 1.08)
  const ultLostHpScaling = ult(e, 1.00, 1.08)
  const fuaAtkScaling = talent(e, 0.44, 0.484)
  const fuaHpScaling = talent(e, 1.10, 1.21)

  const hitMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.33 + 2 * 0.33 + 3 * 0.34),
    3: ASHBLAZING_ATK_STACK * (2 * 0.33 + 5 * 0.33 + 8 * 0.34),
    5: ASHBLAZING_ATK_STACK * (3 * 0.33 + 8 * 0.33 + 8 * 0.34),
  }

  const defaults = {
    enhancedStateActive: true,
    hpPercentLostTotal: hpPercentLostTotalMax,
    e4MaxHpIncreaseStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedStateActive: {
      id: 'enhancedStateActive',
      formItem: 'switch',
      text: t('Content.enhancedStateActive.text'),
      content: t('Content.enhancedStateActive.content', { enhancedStateDmgBoost: TsUtils.precisionRound(100 * enhancedStateDmgBoost) }),
    },
    hpPercentLostTotal: {
      id: 'hpPercentLostTotal',
      formItem: 'slider',
      text: t('Content.hpPercentLostTotal.text'),
      content: t('Content.hpPercentLostTotal.content', { hpPercentLostTotalMax: TsUtils.precisionRound(100 * hpPercentLostTotalMax) }),
      min: 0,
      max: hpPercentLostTotalMax,
      percent: true,
    },
    e4MaxHpIncreaseStacks: {
      id: 'e4MaxHpIncreaseStacks',
      formItem: 'slider',
      text: t('Content.e4MaxHpIncreaseStacks.text'),
      content: t('Content.e4MaxHpIncreaseStacks.content'),
      min: 0,
      max: 2,
      disabled: e < 4,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.CR.buff((e >= 2 && r.enhancedStateActive) ? 0.15 : 0, SOURCE_E2)
      x.HP_P.buff((e >= 4) ? r.e4MaxHpIncreaseStacks * 0.20 : 0, SOURCE_E4)

      // Scaling
      if (r.enhancedStateActive) {
        x.BASIC_ATK_SCALING.buff(basicEnhancedAtkScaling, SOURCE_BASIC)
        x.BASIC_HP_SCALING.buff(basicEnhancedHpScaling, SOURCE_BASIC)
      } else {
        x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      }
      x.ULT_ATK_SCALING.buff(ultAtkScaling, SOURCE_ULT)
      x.ULT_HP_SCALING.buff(ultHpScaling, SOURCE_ULT)
      x.ULT_HP_SCALING.buff(ultLostHpScaling * r.hpPercentLostTotal, SOURCE_ULT)
      x.ULT_HP_SCALING.buff((e >= 1 && context.enemyCount == 1) ? 1.50 * r.hpPercentLostTotal : 0, SOURCE_E1)
      x.FUA_ATK_SCALING.buff(fuaAtkScaling, SOURCE_TALENT)
      x.FUA_HP_SCALING.buff(fuaHpScaling, SOURCE_TALENT)
      x.FUA_HP_SCALING.buff((e >= 6) ? 0.50 : 0, SOURCE_E6)

      // Boost
      x.ELEMENTAL_DMG.buff(r.enhancedStateActive ? enhancedStateDmgBoost : 0, SOURCE_SKILL)
      buffAbilityDmg(x, FUA_DMG_TYPE, 0.20, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff((r.enhancedStateActive) ? 20 : 10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(10, SOURCE_TALENT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const hitMulti = hitMultiByTargets[context.enemyCount]
      x.FUA_ATK_P_BOOST.buff(calculateAshblazingSetP(x, action, context, hitMulti), Source.NONE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => gpuBoostAshblazingAtkP(hitMultiByTargets[context.enemyCount]),
  }
}
