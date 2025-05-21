import { AbilityType, ASHBLAZING_ATK_STACK, FUA_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { boostAshblazingAtkP, gpuBoostAshblazingAtkP } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Mara-Sunder Awl

Basic ATK+1+20

Deals 100% of Xueyi's ATK as Quantum DMG to a single target enemy.

 Single 10

Lv6

Iniquity Obliteration

Skill-1+30

Deals Quantum DMG equal to 140% of Xueyi's ATK to a single enemy, and Quantum DMG equal to 70% of Xueyi's ATK to any adjacent enemies.

 Single 20 | Other 10

Lv10

Divine Castigation

Ultimate120+5

Deals Quantum DMG equal to 250% of Xueyi's ATK to a single target enemy. This attack ignores Weakness Types and reduces the enemy's Toughness. When the enemy's Weakness is Broken, the Quantum Weakness Break effect is triggered.
In this attack, the more Toughness is reduced, the higher the DMG will be dealt, up to a max of 60% increase.
Hidden Stat: 0.15

 Single 40

Lv10

Karmic Perpetuation

Talent+2

When Xueyi reduces enemy Toughness with attacks, Karma will be stacked. The more Toughness is reduced, the more stacks of Karma are added, up to 8 stacks.
When Xueyi's teammates reduce enemy Toughness with attacks, Xueyi gains 1 stack(s) of Karma.
When Karma reaches the max number of stacks, consumes all current Karma stacks and immediately launches Follow-up ATK against an enemy target, dealing DMG for 3 times, with each time dealing Quantum DMG equal to 90% of Xueyi's ATK to a single random enemy. This Follow-up ATK will not add Karma stacks.

 Single 5

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Summary Execution

Technique

Immediately attacks the enemy. After entering combat, deals 80% of Xueyi's ATK as Quantum DMG to all enemies.

 Single 20


Stat Boosts

 +37.3% Break Effect
 +18.0% HP
 +8.0% Quantum DMG Boost

Clairvoyant Loom

Increases DMG dealt by this unit by an amount equal to 100% of Break Effect, up to a maximum DMG increase of 240%.


Intrepid Rollerbearings

If the enemy target's Toughness is equal to or higher than 50% of their Max Toughness, deals 10% more DMG when using Ultimate.


Perspicacious Mainframe

Xueyi will keep a tally of the number of Karma stacks that exceed the max stack limit, up to 6 stacks in the tally. After Xueyi's Talent is triggered, she will gain a corresponding number of tallied Karma stacks.



1 Dvesha, Inhibited

Increases the DMG dealt by the Talent's Follow-up ATK by 40%.



2 Klesha, Breached

Talent's Follow-up ATK Reduces enemy Toughness regardless of Weakness types. At the same time, restores Xueyi's HP by an amount equal to 5% of her Max HP. When breaking Weakness, triggers the Quantum Break Effect.



3 Duḥkha, Ceased

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Karma, Severed

When using Ultimate, increases Break Effect by 40% for 2 turn(s).



5 Deva, Enthralled

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Saṃsāra, Mastered

The max stack limit for Karma decreases to 6.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Xueyi')
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
  } = Source.character('1214')

  const ultBoostMax = ult(e, 0.60, 0.648)
  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.40, 1.54)
  const ultScaling = ult(e, 2.50, 2.70)
  const fuaScaling = talent(e, 0.90, 0.99)

  const hitMultiByFuaHits: NumberToNumberMap = {
    0: 0,
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1), // 0.06
    2: ASHBLAZING_ATK_STACK * (1 * 1 / 2 + 2 * 1 / 2), // 0.09
    3: ASHBLAZING_ATK_STACK * (1 * 1 / 3 + 2 * 1 / 3 + 3 * 1 / 3), // 0.12
  }

  const defaults = {
    beToDmgBoost: true,
    enemyToughness50: true,
    toughnessReductionDmgBoost: ultBoostMax,
    fuaHits: 3,
    e4BeBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    beToDmgBoost: {
      id: 'beToDmgBoost',
      formItem: 'switch',
      text: t('Content.beToDmgBoost.text'),
      content: t('Content.beToDmgBoost.content'),
    },
    enemyToughness50: {
      id: 'enemyToughness50',
      formItem: 'switch',
      text: t('Content.enemyToughness50.text'),
      content: t('Content.enemyToughness50.content'),
    },
    toughnessReductionDmgBoost: {
      id: 'toughnessReductionDmgBoost',
      formItem: 'slider',
      text: t('Content.toughnessReductionDmgBoost.text'),
      content: t('Content.toughnessReductionDmgBoost.content', { ultBoostMax: TsUtils.precisionRound(100 * ultBoostMax) }),
      min: 0,
      max: ultBoostMax,
      percent: true,
    },
    fuaHits: {
      id: 'fuaHits',
      formItem: 'slider',
      text: t('Content.fuaHits.text'),
      content: t('Content.fuaHits.content', { fuaScaling: TsUtils.precisionRound(100 * fuaScaling) }),
      min: 0,
      max: 3,
    },
    e4BeBuff: {
      id: 'e4BeBuff',
      formItem: 'switch',
      text: t('Content.e4BeBuff.text'),
      content: t('Content.e4BeBuff.content'),
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
      x.BE.buff((e >= 4 && r.e4BeBuff) ? 0.40 : 0, SOURCE_E4)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_ATK_SCALING.buff(fuaScaling * (r.fuaHits), SOURCE_TALENT)

      // Boost
      buffAbilityDmg(x, ULT_DMG_TYPE, r.toughnessReductionDmgBoost, SOURCE_ULT)
      buffAbilityDmg(x, ULT_DMG_TYPE, (r.enemyToughness50) ? 0.10 : 0, SOURCE_TRACE)
      buffAbilityDmg(x, FUA_DMG_TYPE, (e >= 1) ? 0.40 : 0, SOURCE_E1)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(40, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(5 * (r.fuaHits), SOURCE_TALENT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.ELEMENTAL_DMG.buff((r.beToDmgBoost) ? Math.min(2.40, x.a[Key.BE]) : 0, SOURCE_TRACE)
      boostAshblazingAtkP(x, action, context, hitMultiByFuaHits[action.characterConditionals.fuaHits as number])
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(r.beToDmgBoost)}) {
  x.ELEMENTAL_DMG += min(2.40, x.BE);
}

${gpuBoostAshblazingAtkP(hitMultiByFuaHits[action.characterConditionals.fuaHits as number])}
`
    },
  }
}
