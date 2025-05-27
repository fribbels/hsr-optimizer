import { AbilityType, ASHBLAZING_ATK_STACK, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
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

Flower Pick

Basic ATK+1+20

Tosses 1 jade tile from the suit with the fewest tiles in hand to deal Quantum DMG equal to 100% of Qingque's ATK to a single enemy.

 Single 10

Lv6

Cherry on Top!

Basic ATK+20

Deals Quantum DMG equal to 240% of Qingque's ATK to a single enemy, and deals Quantum DMG equal to 100% of Qingque's ATK to enemies adjacent to it.
"Cherry on Top!" cannot recover Skill Points.

 Single 20 | Other 10

Lv6

A Scoop of Moon

Skill-1

Immediately draws 2 jade tile(s) and increases DMG by 28% until the end of the current turn. This effect can stack up to 4 time(s). The turn will not end after this Skill is used.

Lv10

A Quartet? Woo-hoo!

Ultimate140+5

Deals Quantum DMG equal to 200% of Qingque's ATK to all enemies, and obtains 4 jade tiles of the same suit.

 All 20

Lv10

Celestial Jade

Talent

When an ally's turn starts, Qingque randomly draws 1 tile from 3 different suits and can hold up to 4 tiles at one time.
If Qingque starts her turn with 4 tiles of the same suit, she consumes all tiles to enter the "Hidden Hand" state.
While in this state, Qingque cannot use her Skill again. At the same time, Qingque's ATK increases by 72%, and her Basic ATK "Flower Pick" is enhanced, becoming "Cherry on Top!" The "Hidden Hand" state ends after using "Cherry on Top!".

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Game Solitaire

Technique

After using Technique, Qingque draws 2 jade tile(s) when the battle starts.


Stat Boosts

 +28.0% ATK
 +14.4% Quantum DMG Boost
 +12.5% DEF

Tile Battle

Restores 1 Skill Point when using the Skill. This effect can only be triggered 1 time per battle.


Bide Time

Using the Skill increases DMG Boost effect of attacks by an extra 10%.


Winning Hand

Qingque's SPD increases by 10% for 1 turn after using the Enhanced Basic ATK.



1 Rise Through the Tiles

Ultimate deals 10% more DMG.



2 Sleep on the Tiles

Every time Draw Tile is triggered, Qingque immediately regenerates 1 Energy.



3 Read Between the Tiles

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Right on the Tiles

After using Skill, there is a 24% fixed chance to gain "Self-Sufficer," lasting until the end of the current turn.
While "Self-Sufficer" is active, using Basic ATK or Enhanced Basic ATK immediately launches 1 Follow-up ATK on the same target, dealing Quantum DMG equal to 100% of Basic ATK DMG or Enhanced Basic ATK DMG.



5 Gambit for the Tiles

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Prevail Beyond the Tiles

Recovers 1 Skill Point after using Enhanced Basic ATK.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Qingque')
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
  } = Source.character('1201')

  const skillStackDmg = skill(e, 0.38, 0.408)
  const talentAtkBuff = talent(e, 0.72, 0.792)

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 2.40, 2.64)
  const ultScaling = ult(e, 2.00, 2.16)

  const hitMultiByTargetsBlast: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1), // 0.06
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 1), // 0.12
    5: ASHBLAZING_ATK_STACK * (2 * 1 / 1), // 0.12
  }

  const hitMultiSingle = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  function getHitMulti(action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals as Conditionals<typeof content>
    return r.basicEnhanced
      ? hitMultiByTargetsBlast[context.enemyCount]
      : hitMultiSingle
  }

  const defaults = {
    basicEnhanced: true,
    basicEnhancedSpdBuff: false,
    skillDmgIncreaseStacks: 4,
  }

  const content: ContentDefinition<typeof defaults> = {
    basicEnhanced: {
      id: 'basicEnhanced',
      formItem: 'switch',
      text: t('Content.basicEnhanced.text'),
      content: t('Content.basicEnhanced.content', { talentAtkBuff: TsUtils.precisionRound(100 * talentAtkBuff) }),
    },
    basicEnhancedSpdBuff: {
      id: 'basicEnhancedSpdBuff',
      formItem: 'switch',
      text: t('Content.basicEnhancedSpdBuff.text'),
      content: t('Content.basicEnhancedSpdBuff.content'),
    },
    skillDmgIncreaseStacks: {
      id: 'skillDmgIncreaseStacks',
      formItem: 'slider',
      text: t('Content.skillDmgIncreaseStacks.text'),
      content: t('Content.skillDmgIncreaseStacks.content', { skillStackDmg: TsUtils.precisionRound(100 * skillStackDmg) }),
      min: 0,
      max: 4,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.ATK_P.buff((r.basicEnhanced) ? talentAtkBuff : 0, SOURCE_TALENT)
      x.SPD_P.buff((r.basicEnhancedSpdBuff) ? 0.10 : 0, SOURCE_TRACE)

      // Scaling
      x.BASIC_ATK_SCALING.buff((r.basicEnhanced) ? basicEnhancedScaling : basicScaling, SOURCE_BASIC)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_ATK_SCALING.buff((e >= 4) ? (r.basicEnhanced) ? basicEnhancedScaling : basicScaling : 0, SOURCE_E4)

      // Boost
      x.ELEMENTAL_DMG.buff(r.skillDmgIncreaseStacks * skillStackDmg, SOURCE_SKILL)
      buffAbilityDmg(x, ULT_DMG_TYPE, (e >= 1) ? 0.10 : 0, SOURCE_E1)

      x.BASIC_TOUGHNESS_DMG.buff((r.basicEnhanced) ? 20 : 10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff((e >= 4 && r.basicEnhanced) ? 20 : 10, SOURCE_E4)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkP(x, action, context, getHitMulti(action, context))
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkP(getHitMulti(action, context))
    },
  }
}
