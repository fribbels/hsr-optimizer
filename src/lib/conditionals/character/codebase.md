# 1300/Acheron.ts

```ts
import { AbilityType, BASIC_DMG_TYPE, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition, countTeamPath } from 'lib/conditionals/conditionalUtils'
import { PathNames } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityResPen, buffAbilityVulnerability, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Trilateral Wiltcross

Basic ATK+1

Deals Lightning DMG equal to 100% of Acheron's ATK to a single target enemy.

 Single 10

Lv6

Octobolt Flash

Skill-1

Gains 1 point(s) of Slashed Dream. Inflicts 1 stack(s) of Crimson Knot on a single target enemy, dealing Lightning DMG equal to 160% of Acheron's ATK to this target, as well as Lightning DMG equal to 60% of Acheron's ATK to adjacent targets.

 Single 20 | Other 10

Lv10

Slashed Dream Cries in Red

Ultimate9

Sequentially unleash Rainblade 3 times and Stygian Resurge 1 time, dealing Lightning DMG up to 372% of Acheron's ATK to a single target enemy, as well as Lightning DMG up to 300% of Acheron's ATK to other targets.

Rainblade: Deals Lightning DMG equal to 24% of Acheron's ATK to a single target enemy and removes up to 3 stacks of Crimson Knot from the target. When Crimson Knot is removed, immediately deals Lightning DMG equal to 15% of Acheron's ATK to all enemies. For every stack of Crimson Knot removed, this DMG Multiplier is additionally increased, up to a maximum of 60%.

Stygian Resurge: Deals Lightning DMG equal to 120% of Acheron's ATK to all enemies and remove all Crimson Knots.

Crimson Knot cannot be applied to enemies during the Ultimate.
Hidden Stat: 9

Lv10

Atop Rainleaf Hangs Oneness

Talent

When Slashed Dream reaches 9 point(s), the Ultimate can be activated. During the Ultimate, reduces enemies' Toughness regardless of Weakness Types and reduces all enemies' All-Type RES by 20%, lasting until the end of the Ultimate.
When any unit inflicts debuffs on an enemy target while using their ability, Acheron gains 1 point of Slashed Dream and inflicts 1 stack of Crimson Knot on a target. If debuffs are inflicted on multiple targets, then the 1 stack of Crimson Knot will be inflicted on the enemy target with the most Crimson Knot stacks. This effect can only trigger once for every ability use.
After an enemy target exits the field or gets defeated by any unit while Acheron is on the field, their Crimson Knot stacks will be transferred to the enemy target with the most Crimson Knot stacks on the whole field.

Lv10

Rainblade

Ultimate


Hidden Stat: 0.24
Hidden Stat: 0.15
Hidden Stat: 1.2

 Single 5 | All 5

Lv10

Rainblade

Ultimate


Hidden Stat: 0.24
Hidden Stat: 0.15
Hidden Stat: 1.2

 Single 5 | All 5

Lv10

Rainblade

Ultimate


Hidden Stat: 0.24
Hidden Stat: 0.15
Hidden Stat: 1.2

 Single 5 | All 5

Lv10

Stygian Resurge

Ultimate


Hidden Stat: 1.2

 All 5

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Quadrivalent Ascendance

Technique

Immediately attacks the enemy. At the start of each wave, gains Quadrivalent Ascendance, dealing Lightning DMG equal to 200% of Acheron's ATK to all enemies and reducing Toughness of all enemies irrespective of Weakness Types. When breaking Weaknesses, triggers the Lightning Weakness Break effect.
Quadrivalent Ascendance: After using the Ultimate, Acheron gains 1 point(s) of Slashed Dream and inflicts 1 stack(s) of Crimson Knot on a single random enemy.
If attacking a normal enemy, immediately defeats them without entering combat. When not hitting enemies, no Technique Points are consumed.

 Single 20


Stat Boosts

 +28.0% ATK
 +24.0% CRIT DMG
 +8.0% Lightning DMG Boost

Red Oni

When battle starts, immediately gains 5 point(s) of Slashed Dream and applies 5 stack(s) of Crimson Knot to a random enemy. When Slashed Dream reaches its upper limit, for every point of Slashed Dream that exceeds the limit, gains 1 stack of Quadrivalent Ascendance. Enables Quadrivalent Ascendance to stack up to 3 time(s).


The Abyss

When there are 1 or 2 Nihility characters other than Acheron in the team, the DMG dealt by Acheron's Basic ATK, Skill, and Ultimate increases to 115% or 160% of the original DMG respectively.


Thunder Core

When the Ultimate's Rainblade hits enemy targets that have Crimson Knot, the DMG dealt by Acheron increases by 30%, stacking up to 3 time(s) and lasting for 3 turn(s). And when Stygian Resurge triggers, additionally deals DMG for 6 times. Each time deals Lightning DMG equal to 25% of Acheron's ATK to a single random enemy and is considered as Ultimate DMG.



1 Silenced Sky Spake Sooth

When dealing DMG to debuffed enemies, increases CRIT Rate by 18%.



2 Mute Thunder in Still Tempest

The number of Nihility characters required for the Trace "The Abyss" to achieve its highest possible effect is reduced by 1. When this unit's turn starts, gains 1 point of Slashed Dream and inflicts 1 stack of Crimson Knot on the enemy with the most Crimson Knot stacks.



3 Frost Bites in Death

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Shrined Fire for Mirrored Soul

When enemy targets enter combat, inflicts them with the Ultimate DMG Vulnerability, increasing the amount of Ultimate DMG they take by 8%.



5 Strewn Souls on Erased Earths

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Apocalypse, the Emancipator

Increases the All-Type RES PEN for the Ultimate DMG dealt by Acheron by 20%. The DMG dealt by Basic ATK and Skill will also be considered as Ultimate DMG and can Reduce enemy Toughness regardless of Weakness Types. When breaking Weaknesses, triggers the Lightning Weakness Break effect.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Acheron')
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
  } = Source.character('1308')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.60, 1.76)

  const ultRainbladeScaling = ult(e, 0.24, 0.2592)
  const ultCrimsonKnotScaling = ult(e, 0.15, 0.162)
  const ultStygianResurgeScaling = ult(e, 1.20, 1.296)
  const ultThunderCoreScaling = 0.25
  const talentResPen = talent(e, 0.2, 0.22)

  const maxCrimsonKnotStacks = 9

  const nihilityTeammateScaling: NumberToNumberMap = {
    0: 0,
    1: (e >= 2) ? 0.60 : 0.15,
    2: 0.60,
    3: 0.60,
    4: 0.60,
  }

  const defaults = {
    crimsonKnotStacks: maxCrimsonKnotStacks,
    nihilityTeammatesBuff: true,
    e1EnemyDebuffed: true,
    thunderCoreStacks: 3,
    stygianResurgeHitsOnTarget: 6,
    e4UltVulnerability: true,
    e6UltBuffs: true,
  }

  const teammateDefaults = {
    e4UltVulnerability: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    crimsonKnotStacks: {
      id: 'crimsonKnotStacks',
      formItem: 'slider',
      text: t('Content.crimsonKnotStacks.text'),
      content: t('Content.crimsonKnotStacks.content', {
        RainbladeScaling: TsUtils.precisionRound(100 * ultRainbladeScaling),
        CrimsonKnotScaling: TsUtils.precisionRound(100 * ultCrimsonKnotScaling),
      }),
      min: 0,
      max: maxCrimsonKnotStacks,
    },
    nihilityTeammatesBuff: {
      id: 'nihilityTeammatesBuff',
      formItem: 'switch',
      text: t('Content.nihilityTeammatesBuff.text'),
      content: t('Content.nihilityTeammatesBuff.content'),
    },
    thunderCoreStacks: {
      id: 'thunderCoreStacks',
      formItem: 'slider',
      text: t('Content.thunderCoreStacks.text'),
      content: t('Content.thunderCoreStacks.content'),
      min: 0,
      max: 3,
    },
    stygianResurgeHitsOnTarget: {
      id: 'stygianResurgeHitsOnTarget',
      formItem: 'slider',
      text: t('Content.stygianResurgeHitsOnTarget.text'),
      content: t('Content.stygianResurgeHitsOnTarget.content'),
      min: 0,
      max: 6,
    },
    e1EnemyDebuffed: {
      id: 'e1EnemyDebuffed',
      formItem: 'switch',
      text: t('Content.e1EnemyDebuffed.text'),
      content: t('Content.e1EnemyDebuffed.content'),
      disabled: e < 1,
    },
    e4UltVulnerability: {
      id: 'e4UltVulnerability',
      formItem: 'switch',
      text: t('Content.e4UltVulnerability.text'),
      content: t('Content.e4UltVulnerability.content'),
      disabled: e < 4,
    },
    e6UltBuffs: {
      id: 'e6UltBuffs',
      formItem: 'switch',
      text: t('Content.e6UltBuffs.text'),
      content: t('Content.e6UltBuffs.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    e4UltVulnerability: content.e4UltVulnerability,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (e >= 6 && r.e6UltBuffs) {
        x.BASIC_DMG_TYPE.set(ULT_DMG_TYPE | BASIC_DMG_TYPE, SOURCE_E6)
        x.SKILL_DMG_TYPE.set(ULT_DMG_TYPE | SKILL_DMG_TYPE, SOURCE_E6)
      }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.CR_BOOST.buff((e >= 1 && r.e1EnemyDebuffed) ? 0.18 : 0, SOURCE_E1)

      x.ELEMENTAL_DMG.buff((r.thunderCoreStacks) * 0.30, SOURCE_TRACE)
      buffAbilityResPen(x, ULT_DMG_TYPE, talentResPen, SOURCE_TALENT)
      buffAbilityResPen(x, ULT_DMG_TYPE, (e >= 6 && r.e6UltBuffs) ? 0.20 : 0, SOURCE_E6)

      const originalDmgBoost = r.nihilityTeammatesBuff
        ? nihilityTeammateScaling[countTeamPath(context, PathNames.Nihility) - 1]
        : 0
      x.BASIC_FINAL_DMG_BOOST.buff(originalDmgBoost, SOURCE_TRACE)
      x.SKILL_FINAL_DMG_BOOST.buff(originalDmgBoost, SOURCE_TRACE)
      x.ULT_FINAL_DMG_BOOST.buff(originalDmgBoost, SOURCE_TRACE)

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      // Each ult is 3 rainblades, 3 base crimson knots, and then 1 crimson knot per stack, then 1 stygian resurge, and 6 thunder cores from trace
      x.ULT_ATK_SCALING.buff(3 * ultRainbladeScaling, SOURCE_ULT)
      x.ULT_ATK_SCALING.buff(3 * ultCrimsonKnotScaling, SOURCE_ULT)
      x.ULT_ATK_SCALING.buff(ultCrimsonKnotScaling * (r.crimsonKnotStacks), SOURCE_ULT)
      x.ULT_ATK_SCALING.buff(ultStygianResurgeScaling, SOURCE_ULT)
      x.ULT_ATK_SCALING.buff(r.stygianResurgeHitsOnTarget * ultThunderCoreScaling, SOURCE_ULT)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(35, SOURCE_ULT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      buffAbilityVulnerability(x, ULT_DMG_TYPE, (e >= 4 && m.e4UltVulnerability) ? 0.08 : 0, SOURCE_E4, Target.TEAM)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
    },
    gpuFinalizeCalculations: () => '',
  }
}

```

# 1300/Argenti.ts

```ts
import { AbilityType, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDefPen } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Fleeting Fragrance

Basic ATK+1+20

Deals Physical DMG equal to 100% of Argenti's ATK to a single target enemy.

 Single 10

Lv6

Justice, Hereby Blooms

Skill-1+30

Deals Physical DMG equal to 120% of Argenti's ATK to all enemies.

 All 10

Lv10

For In This Garden, Supreme Beauty Bestows

Ultimate90+5

Consumes 90 Energy and deals Physical DMG equal to 160% of Argenti's ATK to all enemies.

 All 20

Lv10

Sublime Object

Talent

For every enemy hit when Argenti uses his Basic Attack, Skill, or Ultimate, regenerates Argenti's Energy by 3, and grants him a stack of Apotheosis, increasing his CRIT Rate by 2.5%. This effect can stack up to 10 time(s).

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Manifesto of Purest Virtue

Technique

After using the Technique, enemies in a set area are inflicted with Daze for 10 second(s). Dazed enemies will not actively attack the team.
When attacking a Dazed enemy to enter combat, deals Physical DMG to all enemies equal to 80% of Argenti's ATK and regenerates his Energy by 15.

Merit Bestowed in "My" Garden


Ultimate180+5

Consumes 180 Energy and deals Physical DMG equal to 280% of Argenti's ATK to all enemies. And further deals DMG for 6 extra time(s), with each time dealing Physical DMG equal to 95% of Argenti's ATK to a random enemy.

 Single 5 | All 20

Lv10

Stat Boosts

 +28.0% ATK
 +14.4% Physical DMG Boost
 +10.0% HP

Piety

At the start of a turn, immediately gains 1 stack(s) of Apotheosis.


Generosity

When enemy targets enter battle, immediately regenerates 2 Energy for self.


Courage

Deals 15% more DMG to enemies whose HP percentage is 50% or less.



1 A Lacuna in Kingdom of Aesthetics

Each stack of Apotheosis additionally increases CRIT DMG by 4%.



2 Agate's Humility

If the number of enemies on the field equals to 3 or more when the Ultimate is used, ATK increases by 40% for 1 turn(s).



3 Thorny Road's Glory

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Trumpet's Dedication

At the start of battle, gains 2 stack(s) of Apotheosis and increases the maximum stack limit of the Talent's effect by 2.



5 Snow, From Somewhere in Cosmos

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 "Your" Resplendence

When using Ultimate, ignores 30% of enemy targets' DEF.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Argenti')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('1302')

  const talentMaxStacks = (e >= 4) ? 12 : 10

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.20, 1.32)
  const ultScaling = ult(e, 1.60, 1.728)
  const ultEnhancedScaling = ult(e, 2.80, 3.024)
  const ultEnhancedExtraHitScaling = ult(e, 0.95, 1.026)
  const talentCrStackValue = talent(e, 0.025, 0.028)

  const defaults = {
    ultEnhanced: false,
    talentStacks: talentMaxStacks,
    ultEnhancedExtraHits: 6,
    e2UltAtkBuff: true,
    enemyHp50: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultEnhanced: {
      id: 'ultEnhanced',
      formItem: 'switch',
      text: t('Content.ultEnhanced.text'),
      content: t('Content.ultEnhanced.content', {
        ultEnhancedExtraHitScaling: TsUtils.precisionRound(100 * ultEnhancedExtraHitScaling),
        ultEnhancedScaling: TsUtils.precisionRound(100 * ultEnhancedScaling),
      }),
    },
    enemyHp50: {
      id: 'enemyHp50',
      formItem: 'switch',
      text: t('Content.enemyHp50.text'),
      content: t('Content.enemyHp50.content'),
    },
    talentStacks: {
      id: 'talentStacks',
      formItem: 'slider',
      text: t('Content.talentStacks.text'),
      content: t('Content.talentStacks.content', {
        talentMaxStacks: TsUtils.precisionRound(talentMaxStacks),
        talentCrStackValue: TsUtils.precisionRound(100 * talentCrStackValue),
      }),
      min: 0,
      max: talentMaxStacks,
    },
    ultEnhancedExtraHits: {
      id: 'ultEnhancedExtraHits',
      formItem: 'slider',
      text: t('Content.ultEnhancedExtraHits.text'),
      content: t('Content.ultEnhancedExtraHits.content', { ultEnhancedExtraHitScaling: TsUtils.precisionRound(100 * ultEnhancedExtraHitScaling) }),
      min: 0,
      max: 6,
    },
    e2UltAtkBuff: {
      id: 'e2UltAtkBuff',
      formItem: 'switch',
      text: t('Content.e2UltAtkBuff.text'),
      content: t('Content.e2UltAtkBuff.content'),
      disabled: e < 2,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Skills
      x.CR.buff((r.talentStacks) * talentCrStackValue, SOURCE_TALENT)

      // Traces

      // Eidolons
      x.CD.buff((e >= 1) ? (r.talentStacks) * 0.04 : 0, SOURCE_E1)
      x.ATK_P.buff((e >= 2 && r.e2UltAtkBuff) ? 0.40 : 0, SOURCE_E2)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff((r.ultEnhanced) ? ultEnhancedScaling : ultScaling, SOURCE_ULT)
      x.ULT_ATK_SCALING.buff((r.ultEnhanced) ? r.ultEnhancedExtraHits * ultEnhancedExtraHitScaling : 0, SOURCE_ULT)

      // BOOST
      x.ELEMENTAL_DMG.buff((r.enemyHp50) ? 0.15 : 0, SOURCE_TRACE)
      // Argenti's e6 ult buff is actually a cast type buff, not dmg type but we'll do it like this anyways
      buffAbilityDefPen(x, ULT_DMG_TYPE, (e >= 6) ? 0.30 : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(10, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff((r.ultEnhanced) ? 20 + 5 * r.ultEnhancedExtraHits : 20, SOURCE_ULT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
  }
}

```

# 1000/Arlan.ts

```ts
import { AbilityType, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Lightning Rush

Basic ATK+1+20

Deals Lightning DMG equal to 100% of Arlan's ATK to a single enemy.

 Single 10

Lv6

Shackle Breaker

Skill+30

Consumes Arlan's HP equal to 15% of his Max HP to deal Lightning DMG equal to 240% of Arlan's ATK to a single enemy. If Arlan does not have sufficient HP, his HP will be reduced to 1 after using his Skill.

 Single 20

Lv10

Frenzied Punishment

Ultimate110+5

Deals Lightning DMG equal to 320% of Arlan's ATK to a single enemy and Lightning DMG equal to 160% of Arlan's ATK to enemies adjacent to it.

 Single 20 | Other 20

Lv10

Pain and Anger

Talent

Based on Arlan's current missing HP percentage, gains DMG bonus, up to a maximum increase of 72% DMG dealt by Arlan.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Swift Harvest

Technique

Immediately attacks the enemy. After entering battle, deals Lightning DMG equal to 80% of Arlan's ATK to all enemies.

 Single 20


Stat Boosts

 +28.0% ATK
 +18.0% Effect RES
 +10.0% HP

Revival

If the current HP percentage is 30% or lower when defeating an enemy, immediately restores HP equal to 20% of Max HP.


Endurance

The chance to resist DoT Debuffs increases by 50%.


Repel

Upon entering battle, if Arlan's HP percentage is less than or equal to 50%, he can nullify all DMG received except for DoTs until he is attacked.



1 To the Bitter End

When HP percentage is lower than or equal to 50% of Max HP, increases DMG dealt by Skill by 10%.



2 Breaking Free

Using Skill or Ultimate removes 1 debuff from this unit.



3 Power Through

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Turn the Tables

When struck by a killing blow after entering battle, instead of becoming knocked down, Arlan immediately restores his HP to 25% of his Max HP. This effect is automatically removed after it is triggered once or after 2 turn(s) have elapsed.



5 Hammer and Tongs

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Self-Sacrifice

When the current HP percentage drops to 50% or below, Ultimate deals 20% more DMG, and the DMG multiplier for adjacent targets is raised to the same level as that for the primary target.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Arlan')
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
  } = Source.character('1008')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.40, 2.64)
  const ultScaling = ult(e, 3.20, 3.456)

  const talentMissingHpDmgBoostMax = talent(e, 0.72, 0.792)

  const defaults = {
    selfCurrentHpPercent: 1.00,
  }

  const content: ContentDefinition<typeof defaults> = {
    selfCurrentHpPercent: {
      id: 'selfCurrentHpPercent',
      formItem: 'slider',
      text: t('Content.selfCurrentHpPercent.text'),
      content: t('Content.selfCurrentHpPercent.content', { talentMissingHpDmgBoostMax: TsUtils.precisionRound(100 * talentMissingHpDmgBoostMax) }),
      min: 0.01,
      max: 1.0,
      percent: true,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => [],
    defaults: () => defaults,
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.ELEMENTAL_DMG.buff(Math.min(talentMissingHpDmgBoostMax, 1 - r.selfCurrentHpPercent), SOURCE_TALENT)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      // Boost
      buffAbilityDmg(x, SKILL_DMG_TYPE, (e >= 1 && r.selfCurrentHpPercent <= 0.50) ? 0.10 : 0, SOURCE_E1)
      buffAbilityDmg(x, ULT_DMG_TYPE, (e >= 6 && r.selfCurrentHpPercent <= 0.50) ? 0.20 : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
  }
}

```

# 1000/Asta.ts

```ts
import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Spectrum Beam

Basic ATK+1+20

Deals Fire DMG equal to 100% of Asta's ATK to a single enemy.

 Single 10

Lv6

Meteor Storm

Skill-1+6

Deals Fire DMG equal to 50% of Asta's ATK to a single enemy and further deals DMG for 4 extra times, with each time dealing Fire DMG equal to 50% of Asta's ATK to a random enemy.

 Single 10

Lv10

Astral Blessing

Ultimate120+5

Increases SPD of all allies by 50 for 2 turn(s).

Lv10

Astrometry

Talent

Gains 1 stack of Charging for every different enemy hit by Asta plus an extra stack if the enemy hit has Fire Weakness.
For every stack of Charging Asta has, all allies' ATK increases by 14%, up to 5 time(s).
Starting from her second turn, Asta's Charging stack count is reduced by 3 at the beginning of every turn.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Miracle Flash

Technique

Immediately attacks the enemy. After entering battle, deals Fire DMG equal to 50% of Asta's ATK to all enemies.

 Single 20


Stat Boosts

 +22.4% Fire DMG Boost
 +22.5% DEF
 +6.7% CRIT Rate

Sparks

Asta's Basic ATK has a 80% base chance to Burn the enemy target for 3 turn(s).
Burned enemies take Fire DoT equal to 50% of DMG dealt by Asta's Basic ATK at the start of each turn.


Ignite

When Asta is on the field, all allies' Fire DMG increases by 18%.


Constellation

Asta's DEF increases by 6% for every current Charging stack she possesses.



1 Star Sings Sans Verses or Vocals

When using Skill, deals DMG for 1 extra time to a random enemy.



2 Moon Speaks in Wax and Wane

After using her Ultimate, Asta's Charging stacks will not be reduced in the next turn.
Hidden Stat: 1.0



3 Meteor Showers for Wish and Want

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Aurora Basks in Beauty and Bliss

Asta's Energy Regeneration Rate increases by 15% when she has 2 or more Charging stacks.



5 Nebula Secludes in Runes and Riddles

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Cosmos Dreams in Calm and Comfort

Charging stack(s) lost in each turn is reduced by 1.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Asta')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('1009')

  const ultSpdBuffValue = ult(e, 50, 52.8)
  const talentStacksAtkBuff = talent(e, 0.14, 0.154)
  const talentStacksDefBuff = 0.06
  const skillExtraDmgHitsMax = (e >= 1) ? 5 : 4

  const basicScaling = basic(e, 1.0, 1.1)
  const skillScaling = skill(e, 0.50, 0.55)
  const dotScaling = basic(e, 0.50, 0.55)

  const defaults = {
    talentBuffStacks: 5,
    skillExtraDmgHits: skillExtraDmgHitsMax,
    ultSpdBuff: true,
    fireDmgBoost: true,
  }

  const teammateDefaults = {
    talentBuffStacks: 5,
    ultSpdBuff: true,
    fireDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillExtraDmgHits: {
      id: 'skillExtraDmgHits',
      formItem: 'slider',
      text: t('Content.skillExtraDmgHits.text'),
      content: t('Content.skillExtraDmgHits.content', { skillScaling: TsUtils.precisionRound(skillScaling * 100), skillExtraDmgHitsMax }),
      min: 0,
      max: skillExtraDmgHitsMax,
    },
    talentBuffStacks: {
      id: 'talentBuffStacks',
      formItem: 'slider',
      text: t('Content.talentBuffStacks.text'),
      content: t('Content.talentBuffStacks.content', { talentStacksAtkBuff: TsUtils.precisionRound(100 * talentStacksAtkBuff) }),
      min: 0,
      max: 5,
    },
    ultSpdBuff: {
      id: 'ultSpdBuff',
      formItem: 'switch',
      text: t('Content.ultSpdBuff.text'),
      content: t('Content.ultSpdBuff.content', { ultSpdBuffValue }),
    },
    fireDmgBoost: {
      id: 'fireDmgBoost',
      formItem: 'switch',
      text: t('Content.fireDmgBoost.text'),
      content: t('Content.fireDmgBoost.content'),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    talentBuffStacks: content.talentBuffStacks,
    ultSpdBuff: content.ultSpdBuff,
    fireDmgBoost: content.fireDmgBoost,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.DEF_P.buff((r.talentBuffStacks) * talentStacksDefBuff, SOURCE_TRACE)
      x.ERR.buff((e >= 4 && r.talentBuffStacks >= 2) ? 0.15 : 0, SOURCE_E4)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling + r.skillExtraDmgHits * skillScaling, SOURCE_SKILL)
      x.DOT_ATK_SCALING.buff(dotScaling, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(10 + 5 * r.skillExtraDmgHits, SOURCE_SKILL)

      x.DOT_CHANCE.set(0.8, SOURCE_TRACE)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.SPD.buffTeam((m.ultSpdBuff) ? ultSpdBuffValue : 0, SOURCE_ULT)
      x.ATK_P.buffTeam((m.talentBuffStacks) * talentStacksAtkBuff, SOURCE_TALENT)

      x.FIRE_DMG_BOOST.buffTeam((m.fireDmgBoost) ? 0.18 : 0, SOURCE_TRACE)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
  }
}

```

# 1300/Aventurine.ts

```ts
import { AbilityType, NONE_TYPE, SKILL_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardDefShieldFinalizer, standardDefShieldFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Straight Bet

Basic ATK+1+20

Deals Imaginary DMG equal to 100% of Aventurine's DEF to a single target enemy.

 Single 10

Lv6

Cornerstone Deluxe

Skill-1+30

Provides all allies with a Fortified Wager shield that can block DMG equal to 24% of Aventurine's DEF plus 320, lasting for 3 turn(s). When Fortified Wager is gained repeatedly, the Shield Effect can stack, up to 200% of the current Shield Effect provided by the Skill.

Lv10

Roulette Shark

Ultimate110+5

Randomly gains 1 to 7 points of Blind Bet. Then, inflicts Unnerved on a single target enemy for 3 turn(s) and deals Imaginary DMG equal to 270% of Aventurine's DEF to the single target enemy. When an ally hits an Unnerved enemy target, the CRIT DMG dealt increases by 15%.

 Single 30

Lv10

Shot Loaded Right

Talent+1

For any single ally with Fortified Wager, their Effect RES increases by 50%, and when they get attacked, Aventurine gains 1 point of Blind Bet. When Aventurine has Fortified Wager, he can resist Crowd Control debuffs. This effect can trigger again after 2 turn(s). Aventurine additionally gains 1 point(s) of Blind Bet after getting attacked. Upon reaching 7 points of Blind Bet, Aventurine consumes the 7 points to launch a 7-hit Follow-up ATK, with each hit dealing Imaginary DMG equal to 25% of Aventurine's DEF to a single random enemy. Blind Bet is capped at 10 points.

Crowd Control debuff
Freeze, Entanglement, Imprisonment, Dominated, Outrage, Strong Reverberation, Alien Dream, Snarelock, Terrified.

 Single 10/3

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


The Red or the Black

Technique

After using the Technique, 1 of the following effects will be granted:
There is a chance for DEF to increase by 24%.
There is a high chance for DEF to increase by 36%.
There is a small chance for DEF to increase by 60%.

When this Technique is used repeatedly, the acquired effect with the highest buff value is retained.
When the next battle starts, increases all allies' DEF by the corresponding value, lasting for 3 turn(s).


Stat Boosts

 +35.0% DEF
 +14.4% Imaginary DMG Boost
 +10.0% Effect RES

Leverage

For every 100 of Aventurine's DEF that exceeds 1600, increases his own CRIT Rate by 2%, up to a maximum increase of 48%.


Hot Hand

When battle starts, grants all allies a Fortified Wager shield, whose Shield Effect is equal to 100% of the one provided by the Skill, lasting for 3 turn(s).


Bingo!

After a teammate with Fortified Wager launches Follow-up ATK, Aventurine accumulates 1 Blind Bet point. This effect can trigger up to 3 time(s). Its trigger count resets at the start of Aventurine's turn. After Aventurine launches his Talent's Follow-up ATK, provides all ally targets with a Fortified Wager that can block DMG equal to 7.2% of Aventurine's DEF plus 96, and additionally grants a Fortified Wager that can block DMG equal to 7.2% of Aventurine's DEF plus 96 to the ally with the lowest Shield Effect, lasting for 3 turns.



1 Prisoner's Dilemma

Increases CRIT DMG by 20% for ally targets with Fortified Wager. After using the Ultimate, provides all allies with a Fortified Wager shield, whose Shield Effect is equal to 100% of the one provided by the Skill, lasting for 3 turn(s).



2 Bounded Rationality

When using the Basic ATK, reduces the target's All-Type RES by 12% for 3 turn(s).
Hidden Stat: 1.2



3 Droprate Maxing

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Unexpected Hanging Paradox

When triggering his Talent's Follow-up ATK, first increases Aventurine's DEF by 40% for 2 turn(s), and additionally increases the Hits Per Action for his talent's Follow-up ATK by 3.



5 Ambiguity Aversion

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Stag Hunt Game

For every teammate that holds a Shield, the DMG dealt by Aventurine increases by 50%, up to a maximum of 150%.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Aventurine')
  const tShield = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.ShieldAbility')
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
  } = Source.character('1304')

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.70, 2.916)
  const ultCdBoost = ult(e, 0.15, 0.162)

  const talentDmgScaling = talent(e, 0.25, 0.275)
  const talentResScaling = talent(e, 0.50, 0.55)

  const fuaHits = (e >= 4) ? 10 : 7

  const skillShieldScaling = skill(e, 0.24, 0.256)
  const skillShieldFlat = skill(e, 320, 356)

  const traceShieldScaling = 0.07
  const traceShieldFlat = 96

  const defaults = {
    shieldAbility: SKILL_DMG_TYPE,
    defToCrBoost: true,
    fuaHitsOnTarget: fuaHits,
    fortifiedWagerBuff: true,
    enemyUnnervedDebuff: true,
    e2ResShred: true,
    e4DefBuff: true,
    e6ShieldStacks: 3,
  }

  const teammateDefaults = {
    fortifiedWagerBuff: true,
    enemyUnnervedDebuff: true,
    e2ResShred: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    shieldAbility: {
      id: 'shieldAbility',
      formItem: 'select',
      text: tShield('Text'),
      content: tShield('Content'),
      options: [
        { display: tShield('Skill'), value: SKILL_DMG_TYPE, label: tShield('Skill') },
        { display: tShield('Trace'), value: NONE_TYPE, label: tShield('Trace') },
      ],
      fullWidth: true,
    },
    defToCrBoost: {
      id: 'defToCrBoost',
      formItem: 'switch',
      text: t('Content.defToCrBoost.text'),
      content: t('Content.defToCrBoost.content'),
    },
    fortifiedWagerBuff: {
      id: 'fortifiedWagerBuff',
      formItem: 'switch',
      text: t('Content.fortifiedWagerBuff.text'),
      content: t('Content.fortifiedWagerBuff.content', { talentResScaling: TsUtils.precisionRound(100 * talentResScaling) }),
    },
    enemyUnnervedDebuff: {
      id: 'enemyUnnervedDebuff',
      formItem: 'switch',
      text: t('Content.enemyUnnervedDebuff.text'),
      content: t('Content.enemyUnnervedDebuff.content', { ultCdBoost: TsUtils.precisionRound(100 * ultCdBoost) }),
    },
    fuaHitsOnTarget: {
      id: 'fuaHitsOnTarget',
      formItem: 'slider',
      text: t('Content.fuaHitsOnTarget.text'),
      content: t('Content.fuaHitsOnTarget.content', { talentDmgScaling: TsUtils.precisionRound(100 * talentDmgScaling) }),
      min: 0,
      max: fuaHits,
    },
    e2ResShred: {
      id: 'e2ResShred',
      formItem: 'switch',
      text: t('Content.e2ResShred.text'),
      content: t('Content.e2ResShred.content'),
      disabled: e < 2,
    },
    e4DefBuff: {
      id: 'e4DefBuff',
      formItem: 'switch',
      text: t('Content.e4DefBuff.text'),
      content: t('Content.e4DefBuff.content'),
      disabled: e < 4,
    },
    e6ShieldStacks: {
      id: 'e6ShieldStacks',
      formItem: 'slider',
      text: t('Content.e6ShieldStacks.text'),
      content: t('Content.e6ShieldStacks.content'),
      min: 0,
      max: 3,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    fortifiedWagerBuff: content.fortifiedWagerBuff,
    enemyUnnervedDebuff: content.enemyUnnervedDebuff,
    e2ResShred: content.e2ResShred,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.DEF_P.buff((e >= 4 && r.e4DefBuff) ? 0.40 : 0, SOURCE_E4)
      x.ELEMENTAL_DMG.buff((e >= 6) ? Math.min(1.50, 0.50 * r.e6ShieldStacks) : 0, SOURCE_E6)

      x.BASIC_DEF_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.ULT_DEF_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_DEF_SCALING.buff(talentDmgScaling * r.fuaHitsOnTarget, SOURCE_TALENT)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(10 / 3 * r.fuaHitsOnTarget, SOURCE_TALENT)

      if (r.shieldAbility == SKILL_DMG_TYPE) {
        x.SHIELD_SCALING.buff(skillShieldScaling, SOURCE_SKILL)
        x.SHIELD_FLAT.buff(skillShieldFlat, SOURCE_SKILL)
      }
      if (r.shieldAbility == 0) {
        x.SHIELD_SCALING.buff(traceShieldScaling, SOURCE_SKILL)
        x.SHIELD_FLAT.buff(traceShieldFlat, SOURCE_SKILL)
      }

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.RES.buffTeam((m.fortifiedWagerBuff) ? talentResScaling : 0, SOURCE_TALENT)
      x.CD.buffTeam((m.enemyUnnervedDebuff) ? ultCdBoost : 0, SOURCE_ULT)
      x.CD.buffTeam((e >= 1 && m.fortifiedWagerBuff) ? 0.20 : 0, SOURCE_E1)
      x.RES_PEN.buffTeam((e >= 2 && m.e2ResShred) ? 0.12 : 0, SOURCE_E2)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardDefShieldFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardDefShieldFinalizer(),
    dynamicConditionals: [{
      id: 'AventurineConversionConditional',
      type: ConditionalType.ABILITY,
      activation: ConditionalActivation.CONTINUOUS,
      dependsOn: [Stats.DEF],
      chainsTo: [Stats.CR],
      condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>
        return r.defToCrBoost && x.a[Key.DEF] > 1600
      },
      effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
        dynamicStatConversion(Stats.DEF, Stats.CR, this, x, action, context, SOURCE_TRACE,
          (convertibleValue) => Math.min(0.48, 0.02 * Math.floor((convertibleValue - 1600) / 100)),
        )
      },
      gpu: function (action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>

        return gpuDynamicStatConversion(Stats.DEF, Stats.CR, this, action, context,
          `min(0.48, 0.02 * floor((convertibleValue - 1600) / 100))`,
          `${wgslTrue(r.defToCrBoost)} && x.DEF > 1600`,
        )
      },
    }],
  }
}

```

# 1200/Bailu.ts

```ts
import { AbilityType, NONE_TYPE, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardHpHealFinalizer, standardHpHealFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Diagnostic Kick

Basic ATK+1+20

Deals Lightning DMG equal to 100% of Bailu's ATK to a single enemy.

 Single 10

Lv6

Singing Among Clouds

Skill-1+30

Heals a single ally for 11.7% of Bailu's Max HP plus 312. Bailu then heals random allies 2 time(s). After each healing, HP restored from the next healing is reduced by 15%.

Lv10

Felicitous Thunderleap

Ultimate100+5

Heals all allies for 13.5% of Bailu's Max HP plus 360.
Bailu applies Invigoration to allies that are not already Invigorated. For those already Invigorated, Bailu extends the duration of their Invigoration by 1 turn.
The effect of Invigoration can last for 2 turn(s). This effect cannot stack.

Lv10

Gourdful of Elixir

Talent

After an ally target with Invigoration is hit, restores the ally's HP for 5.4% of Bailu's Max HP plus 144. This effect can trigger 2 time(s).
When Bailu's teammate receives a killing blow, they will not be knocked down. Bailu immediately heals the ally for 18% of Bailu's Max HP plus 480 HP. This effect can be triggered 1 time per battle.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Saunter in the Rain

Technique

After Technique is used, at the start of the next battle, all allies are granted Invigoration for 2 turn(s).


Stat Boosts

 +28.0% HP
 +22.5% DEF
 +10.0% Effect RES

Qihuang Analects

When Bailu heals a target ally above their normal Max HP, the target's Max HP increases by 10% for 2 turns.


Vidyadhara Ichor Lines

Invigoration can trigger 1 more time(s).


Aquatic Benediction

Characters with Invigoration receive 10% less DMG.



1 Ambrosial Aqua

If the target ally's current HP is equal to their Max HP when Invigoration ends, regenerates 8 extra Energy for this target.



2 Sylphic Slumber

After using her Ultimate, Bailu's Outgoing Healing increases by an additional 15% for 2 turn(s).



3 Omniscient Opulence

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Evil Excision

Every healing provided by the Skill makes the recipient deal 10% more DMG for 2 turn(s). This effect can stack up to 3 time(s).



5 Waning Worries

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Drooling Drop of Draconic Divinity

Bailu can heal allies who received a killing blow 1 more time(s) in a single battle.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Bailu')
  const tHeal = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealAbility')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('1211')

  const basicScaling = basic(e, 1.0, 1.1)

  const skillHealScaling = skill(e, 0.117, 0.1248)
  const skillHealFlat = skill(e, 312, 347.1)

  const ultHealScaling = ult(e, 0.135, 0.144)
  const ultHealFlat = ult(e, 360, 400.5)

  const talentHealScaling = talent(e, 0.054, 0.0576)
  const talentHealFlat = talent(e, 144, 160.2)

  const defaults = {
    healAbility: ULT_DMG_TYPE,
    healingMaxHpBuff: true,
    talentDmgReductionBuff: true,
    e2UltHealingBuff: true,
    e4SkillHealingDmgBuffStacks: 0,
  }

  const teammateDefaults = {
    healingMaxHpBuff: true,
    talentDmgReductionBuff: true,
    e4SkillHealingDmgBuffStacks: 3,
  }

  const content: ContentDefinition<typeof defaults> = {
    healAbility: {
      id: 'healAbility',
      formItem: 'select',
      text: tHeal('Text'),
      content: tHeal('Content'),
      options: [
        { display: tHeal('Skill'), value: SKILL_DMG_TYPE, label: tHeal('Skill') },
        { display: tHeal('Ult'), value: ULT_DMG_TYPE, label: tHeal('Ult') },
        { display: tHeal('Talent'), value: NONE_TYPE, label: tHeal('Talent') },
      ],
      fullWidth: true,
    },
    healingMaxHpBuff: {
      id: 'healingMaxHpBuff',
      formItem: 'switch',
      text: t('Content.healingMaxHpBuff.text'),
      content: t('Content.healingMaxHpBuff.content'),
    },
    talentDmgReductionBuff: {
      id: 'talentDmgReductionBuff',
      formItem: 'switch',
      text: t('Content.talentDmgReductionBuff.text'),
      content: t('Content.talentDmgReductionBuff.content'),
    },
    e2UltHealingBuff: {
      id: 'e2UltHealingBuff',
      formItem: 'switch',
      text: t('Content.e2UltHealingBuff.text'),
      content: t('Content.e2UltHealingBuff.content'),
      disabled: e < 2,
    },
    e4SkillHealingDmgBuffStacks: {
      id: 'e4SkillHealingDmgBuffStacks',
      formItem: 'slider',
      text: t('Content.e4SkillHealingDmgBuffStacks.text'),
      content: t('Content.e4SkillHealingDmgBuffStacks.content'),
      min: 0,
      max: 3,
      disabled: e < 4,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    healingMaxHpBuff: content.healingMaxHpBuff,
    talentDmgReductionBuff: content.talentDmgReductionBuff,
    e4SkillHealingDmgBuffStacks: content.e4SkillHealingDmgBuffStacks,
  }

  return {
    activeAbilities: [AbilityType.BASIC],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.OHB.buff((e >= 2 && r.e2UltHealingBuff) ? 0.15 : 0, SOURCE_E2)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)

      if (r.healAbility == SKILL_DMG_TYPE) {
        x.HEAL_TYPE.set(SKILL_DMG_TYPE, SOURCE_SKILL)
        x.HEAL_SCALING.buff(skillHealScaling, SOURCE_SKILL)
        x.HEAL_FLAT.buff(skillHealFlat, SOURCE_SKILL)
      }
      if (r.healAbility == ULT_DMG_TYPE) {
        x.HEAL_TYPE.set(ULT_DMG_TYPE, SOURCE_ULT)
        x.HEAL_SCALING.buff(ultHealScaling, SOURCE_ULT)
        x.HEAL_FLAT.buff(ultHealFlat, SOURCE_ULT)
      }
      if (r.healAbility == NONE_TYPE) {
        x.HEAL_TYPE.set(NONE_TYPE, SOURCE_TALENT)
        x.HEAL_SCALING.buff(talentHealScaling, SOURCE_TALENT)
        x.HEAL_FLAT.buff(talentHealFlat, SOURCE_TALENT)
      }

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.HP_P.buffTeam((m.healingMaxHpBuff) ? 0.10 : 0, SOURCE_TRACE)

      x.ELEMENTAL_DMG.buffTeam((e >= 4) ? m.e4SkillHealingDmgBuffStacks * 0.10 : 0, SOURCE_E4)
      x.DMG_RED_MULTI.multiplyTeam((m.talentDmgReductionBuff) ? (1 - 0.10) : 1, SOURCE_TRACE)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
      standardHpHealFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardHpHealFinalizer(),
  }
}

```

# 1300/BlackSwan.ts

```ts
import { AbilityType, DOT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDefPen, buffAbilityVulnerability, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Percipience, Silent Dawn

Basic ATK+1+20

Deals Wind DMG equal to 60% of Black Swan's ATK to a single target enemy, with a 65% base chance of inflicting 1 stack of Arcana on the target. Additionally, when attacking a target that suffers Wind Shear, Bleed, Burn, or Shock, there is respectively a 65% base chance of inflicting 1 extra stack of Arcana on the target.

Arcana
Arcana is a debuff that deals DMG over time. This debuff cannot be dispelled.
While in the Arcana state, the unit is also considered to be in the Wind Shear state and takes Wind DoT at the start of each turn.
The infliction of Arcana ignores the target's Wind Shear RES, Bleed RES, Burn RES, and Shock RES.

 Single 10

Lv6

Decadence, False Twilight

Skill-1+30

Deals Wind DMG equal to 90% of Black Swan's ATK to a single target enemy and any adjacent targets. At the same time, there is a 100% base chance of inflicting 1 stack of Arcana on the target enemy and the adjacent targets. Additionally, there is a 100% base chance of reducing the DEF of the target enemy and the adjacent targets by 20.8%, lasting for 3 turn(s).

 Single 20 | Other 10

Lv10

Bliss of Otherworld's Embrace

Ultimate120+5

Inflicts Epiphany on all enemies for 2 turn(s).
While afflicted with Epiphany, enemies take 25% increased DMG in their turn. Additionally, if enemies are also inflicted with Arcana, they are considered to be simultaneously afflicted with Wind Shear, Bleed, Burn, and Shock. After Arcana causes DMG at the start of each turn, its stacks are not reset. This non-reset effect of Arcana stacks can be triggered up to 1 time(s) for the duration of Epiphany. And the trigger count resets when Epiphany is applied again.
Deals Wind DMG equal to 120% of Black Swan's ATK to all enemies.

 All 20

Lv10

Loom of Fate's Caprice

Talent

Every time an enemy target receives DoT at the start of each turn, there is a 65% base chance for it to be inflicted with 1 stack of Arcana.
While afflicted with Arcana, enemy targets receive Wind DoT equal to 240% of Black Swan's ATK at the start of each turn. Each stack of Arcana increases this DMG multiplier by 12%. Then Arcana resets to 1 stack. Arcana can stack up to 50 times.
Only when Arcana causes DMG at the start of an enemy target's turn, Black Swan triggers additional effects based on the number of Arcana stacks inflicted on the target:
When there are 3 or more Arcana stacks, deals Wind DoT equal to 180% of Black Swan's ATK to adjacent targets, with a 65% base chance of inflicting 1 stack of Arcana on adjacent targets.
When there are 7 or more Arcana stacks, enables the current DoT dealt this time to ignore 20% of the target's and adjacent targets' DEF.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


From Façade to Vérité

Technique

After this Technique is used, there is a 150% base chance for each enemy to be inflicted with 1 stack of Arcana at the start of the next battle. For each successful application of Arcana on a target, inflicts another stack of Arcana on the same target. This process repeats until Arcana fails to be inflicted on this target. For each successive application of Arcana on a target, its base chance of success is equal to 50% of the base chance of the previous successful infliction of Arcana on that target.


Stat Boosts

 +28.0% ATK
 +14.4% Wind DMG Boost
 +10.0% Effect Hit Rate

Viscera's Disquiet

After using Skill to attack one designated enemy that has Wind Shear, Bleed, Burn, or Shock, each of these debuffs respectively has a 65% base chance of inflicting 1 extra stack of Arcana.

Arcana
Arcana is a debuff that deals DMG over time. This debuff cannot be dispelled.
While in the Arcana state, the unit is also considered to be in the Wind Shear state and takes Wind DoT at the start of each turn.
The infliction of Arcana ignores the target's Wind Shear RES, Bleed RES, Burn RES, and Shock RES.


Goblet's Dredges

When an enemy target enters battle, there is a 65% base chance for it to be inflicted with 1 stack of Arcana.
Every time an enemy target receives 1 instance of DoT during a single attack by an ally, there is a 65% base chance for the target to be inflicted with 1 stack of Arcana. The maximum number of stacks that can be inflicted during 1 single attack is 3.


Candleflame's Portent

Increases this unit's DMG by an amount equal to 60% of Effect Hit Rate, up to a maximum DMG increase of 72%.



1 Seven Pillars of Wisdom

While Black Swan is active in battle, enemies afflicted with Wind Shear, Bleed, Burn, or Shock will have their corresponding Wind, Physical, Fire, or Lightning RES respectively reduced by 25%.



2 Weep Not For Me, My Lamb

When an enemy target afflicted with "Arcana" is defeated, there is a 100% base chance of inflicting 6 stack(s) of "Arcana" on adjacent targets.

Arcana
Arcana is a debuff that deals DMG over time. This debuff cannot be dispelled.
While in the Arcana state, the unit is also considered to be in the Wind Shear state and takes Wind DoT at the start of each turn.
The infliction of Arcana ignores the target's Wind Shear RES, Bleed RES, Burn RES, and Shock RES.



3 As Above, So Below

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 In Tears We Gift

While in the Epiphany state, enemy targets have their Effect RES reduced by 10% and Black Swan regenerates 8 Energy at the start of these targets' turns or when they are defeated. This Energy Regeneration effect can only trigger up to 1 time while Epiphany lasts. The trigger count is reset when Epiphany is applied again.



5 Linnutee Flyway

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Pantheon Merciful, Masses Pitiful

When an enemy target is attacked by Black Swan's teammates, Black Swan has a 65% base chance of inflicting 1 stack of "Arcana" on the target.
Every time Black Swan inflicts "Arcana" on an enemy target, there is a 50% fixed chance to additionally increase the number of "Arcana" stacked this time by 1.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.BlackSwan')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('1307')

  const arcanaStackMultiplier = talent(e, 0.12, 0.132)
  const epiphanyDmgTakenBoost = ult(e, 0.25, 0.27)
  const defShredValue = skill(e, 0.208, 0.22)

  const basicScaling = basic(e, 0.60, 0.66)
  const skillScaling = skill(e, 0.90, 0.99)
  const ultScaling = ult(e, 1.20, 1.30)
  const dotScaling = talent(e, 2.40, 2.64)

  const dotChance = talent(e, 0.65, 0.68)

  const defaults = {
    ehrToDmgBoost: true,
    epiphanyDebuff: true,
    defDecreaseDebuff: true,
    arcanaStacks: 7,
    e1ResReduction: true,
    e4EffResPen: true,
  }
  const teammateDefaults = {
    epiphanyDebuff: true,
    defDecreaseDebuff: true,
    e1ResReduction: true,
    e4EffResPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ehrToDmgBoost: {
      id: 'ehrToDmgBoost',
      formItem: 'switch',
      text: t('Content.ehrToDmgBoost.text'),
      content: t('Content.ehrToDmgBoost.content'),
    },
    epiphanyDebuff: {
      id: 'epiphanyDebuff',
      formItem: 'switch',
      text: t('Content.epiphanyDebuff.text'),
      content: t('Content.epiphanyDebuff.content', { epiphanyDmgTakenBoost: TsUtils.precisionRound(100 * epiphanyDmgTakenBoost) }),
    },
    defDecreaseDebuff: {
      id: 'defDecreaseDebuff',
      formItem: 'switch',
      text: t('Content.defDecreaseDebuff.text'),
      content: t('Content.defDecreaseDebuff.content', { defShredValue: TsUtils.precisionRound(100 * defShredValue) }),
    },
    arcanaStacks: {
      id: 'arcanaStacks',
      formItem: 'slider',
      text: t('Content.arcanaStacks.text'),
      content: t('Content.arcanaStacks.content', {
        dotScaling: TsUtils.precisionRound(100 * dotScaling),
        arcanaStackMultiplier: TsUtils.precisionRound(100 * arcanaStackMultiplier),
      }),
      min: 1,
      max: 50,
    },
    e1ResReduction: {
      id: 'e1ResReduction',
      formItem: 'switch',
      text: t('Content.e1ResReduction.text'),
      content: t('Content.e1ResReduction.content'),
      disabled: e < 1,
    },
    e4EffResPen: {
      id: 'e4EffResPen',
      formItem: 'switch',
      text: t('Content.e4EffResPen.text'),
      content: t('Content.e4EffResPen.content'),
      disabled: e < 4,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    epiphanyDebuff: content.epiphanyDebuff,
    defDecreaseDebuff: content.defDecreaseDebuff,
    e1ResReduction: content.e1ResReduction,
    e4EffResPen: content.e4EffResPen,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.DOT_ATK_SCALING.buff(dotScaling + arcanaStackMultiplier * r.arcanaStacks, SOURCE_TALENT)

      buffAbilityDefPen(x, DOT_DMG_TYPE, (r.arcanaStacks >= 7) ? 0.20 : 0, SOURCE_TALENT)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      x.DOT_CHANCE.set(dotChance, SOURCE_TALENT)
      x.DOT_SPLIT.set(0.05, SOURCE_TALENT)
      x.DOT_STACKS.set(r.arcanaStacks, SOURCE_TALENT)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // TODO: Technically this isnt a DoT vulnerability but rather vulnerability to damage on the enemy's turn which includes ults/etc.
      buffAbilityVulnerability(x, DOT_DMG_TYPE, (m.epiphanyDebuff) ? epiphanyDmgTakenBoost : 0, SOURCE_ULT, Target.TEAM)

      x.DEF_PEN.buffTeam((m.defDecreaseDebuff) ? defShredValue : 0, SOURCE_SKILL)
      x.WIND_RES_PEN.buffTeam((e >= 1 && m.e1ResReduction) ? 0.25 : 0, SOURCE_E1)
      x.FIRE_RES_PEN.buffTeam((e >= 1 && m.e1ResReduction) ? 0.25 : 0, SOURCE_E1)
      x.PHYSICAL_RES_PEN.buffTeam((e >= 1 && m.e1ResReduction) ? 0.25 : 0, SOURCE_E1)
      x.LIGHTNING_RES_PEN.buffTeam((e >= 1 && m.e1ResReduction) ? 0.25 : 0, SOURCE_E1)

      x.EFFECT_RES_PEN.buffTeam((e >= 4 && m.epiphanyDebuff && m.e4EffResPen) ? 0.10 : 0, SOURCE_E4)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.ELEMENTAL_DMG.buff((r.ehrToDmgBoost) ? Math.min(0.72, 0.60 * x.a[Key.EHR]) : 0, SOURCE_TRACE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(r.ehrToDmgBoost)}) {
  x.ELEMENTAL_DMG += min(0.72, 0.60 * x.EHR);
}
`
    },
  }
}

```

# 1200/Blade.ts

```ts
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

```

# 1300/Boothill.ts

```ts
import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Skullcrush Spurs

Basic ATK+1+20

Deals Physical DMG equal to 100% of Boothill's ATK to a single enemy.

 Single 10

Lv6

Fanning the Hammer

Basic ATK+30

Deals Physical DMG equal to 220% of Boothill's ATK to a single enemy target.
The Enhanced Basic Attack cannot recover Skill Points and can only target the enemy currently with Standoff.

 Single 20

Lv6

Sizzlin' Tango

Skill-1

Make a targeted enemy and Boothill enter the Standoff state. Boothill's Basic ATK becomes Enhanced, and he cannot use his Skill, lasting for 2 turn(s). The remaining turn count reduces by 1 at the start of Boothill's turn.
The enemy target in Standoff becomes Taunted. When the enemy target/Boothill receives an attack from the other, the DMG they receive increases by 30%/15%.
After this target is defeated or becomes Weakness Broken, Boothill obtains 1 stack of Pocket Trickshot, then dispels Standoff.
This Skill cannot regenerate Energy. This turn will not end after using this Skill.

Lv10

Dust Devil's Sunset Rodeo

Ultimate115+5

Apply Physical Weakness to a target enemy, lasting for 2 turn(s).
Deals Physical DMG equal to 400% of Boothill's ATK to the target and delays their action by 40%.

Action delayed
Increases the target's waiting interval before the next action.

 Single 30

Lv10

Five Peas in a Pod

Talent

Every stack of Pocket Trickshot increases the Enhanced Basic Attack's Toughness-Reducing DMG by 50%, stacking up to 3 stacks.
If the target is Weakness Broken when the Enhanced Basic Attack is used, for every stack of Pocket Trickshot, deals Break DMG to this target equal to 70%/120%/170% of Boothill's Physical Break DMG. The max Toughness taken into account by this attack cannot exceed ×16 times of the base Toughness-Reducing DMG dealt by the Basic Attack "Skullcrush Spurs."
After winning the battle, Boothill can retain Pocket Trickshot for the next battle.

Weakness Break State
When enemy targets' Toughness is reduced to 0, they will enter the Weakness Break State, which delays their actions.

Break DMG
Break DMG increases with higher Break Effect, higher target max Toughness, and higher character levels.
Break DMG cannot CRIT Hit and is not affected by DMG Boost effects.

Lv10

Attack

Attack an enemy, and when the battle starts, reduce their Toughness of the corresponding Type.

 Single 10


3-9× Smile

Technique

After the Technique is used, when using the Skill for the first time in the next battle, add Physical Weakness equal to that applied by the Ultimate to the target, lasting for 2 turn(s).

 Single 20


Stat Boosts

 +37.3% Break Effect
 +18.0% ATK
 +10.0% HP

Ghost Load

Increase this character's CRIT Rate / CRIT DMG. The amount increased is equal to 10.0% / 50.0% of Break Effect. CRIT Rate / CRIT DMG can be increased by a max of 30.0% / 150.0%.


Above Snakes

Decreases the DMG this character receives from targets not in Standoff by 30.0%.


Point Blank

When obtaining Pocket Trickshot in Standoff, regenerates 10.0 Energy. This effect will also be triggered when obtaining Pocket Trickshot stacks that exceed the max.



1 Dusty Trail's Lone Star

At the start of battle, obtain 1 stack of Pocket Trickshot, allowing Boothill to deal DMG that ignores 16.0% of enemy target's DEF.



2 Milestonemonger

When obtaining Pocket Trickshot in Standoff, recovers 1.0 Skill Point(s) and increases Break Effect by 30.0%, lasting for 2.0 turn(s). This effect cannot be triggered repeatedly in one turn, and will also be triggered when obtaining Pocket Trickshot stacks that exceed the max.



3 Marble Orchard's Guard

Ultimate Lv. +2, up to a maximum of Lv. 15. Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Cold Cuts Chef

When the enemy target in Standoff is attacked by Boothill, the DMG they receive increases by 12.0%. When Boothill is attacked by the enemy target in Standoff, the effect of receiving more DMG is reduced by 12.0% on him.



5 Stump Speech

Skill Lv. +2, up to a maximum of Lv. 15. Talent Lv. +2, up to a maximum of Lv. 15.



6 Crowbar Hotel's Raccoon

When triggering the Talent's Break DMG, additionally deals Break DMG to the target equal to 40.0% of the original DMG multiplier and deals Break DMG to adjacent targets equal to 70.0% of the original DMG multiplier.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Boothill')
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
  } = Source.character('1315')

  const standoffVulnerabilityBoost = skill(e, 0.30, 0.33)

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 2.20, 2.42)
  const ultScaling = ult(e, 4.00, 4.32)

  const pocketTrickshotsToTalentBreakDmg: NumberToNumberMap = {
    0: 0,
    1: talent(e, 0.70, 0.77),
    2: talent(e, 1.20, 1.32),
    3: talent(e, 1.70, 1.87),
  }

  const defaults = {
    standoffActive: true,
    pocketTrickshotStacks: 3,
    beToCritBoost: true,
    talentBreakDmgScaling: true,
    e1DefShred: true,
    e2BeBuff: true,
    e4TargetStandoffVulnerability: true,
    e6AdditionalBreakDmg: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    standoffActive: {
      id: 'standoffActive',
      formItem: 'switch',
      text: t('Content.standoffActive.text'),
      content: t('Content.standoffActive.content', { standoffVulnerabilityBoost: TsUtils.precisionRound(100 * standoffVulnerabilityBoost) }),
    },
    pocketTrickshotStacks: {
      id: 'pocketTrickshotStacks',
      formItem: 'slider',
      text: t('Content.pocketTrickshotStacks.text'),
      content: t('Content.pocketTrickshotStacks.content'),
      min: 0,
      max: 3,
    },
    beToCritBoost: {
      id: 'beToCritBoost',
      formItem: 'switch',
      text: t('Content.beToCritBoost.text'),
      content: t('Content.beToCritBoost.content'),
    },
    talentBreakDmgScaling: {
      id: 'talentBreakDmgScaling',
      formItem: 'switch',
      text: t('Content.talentBreakDmgScaling.text'),
      content: t('Content.talentBreakDmgScaling.content'),
    },
    e1DefShred: {
      id: 'e1DefShred',
      formItem: 'switch',
      text: t('Content.e1DefShred.text'),
      content: t('Content.e1DefShred.content'),
      disabled: e < 1,
    },
    e2BeBuff: {
      id: 'e2BeBuff',
      formItem: 'switch',
      text: t('Content.e2BeBuff.text'),
      content: t('Content.e2BeBuff.content'),
      disabled: e < 2,
    },
    e4TargetStandoffVulnerability: {
      id: 'e4TargetStandoffVulnerability',
      formItem: 'switch',
      text: t('Content.e4TargetStandoffVulnerability.text'),
      content: t('Content.e4TargetStandoffVulnerability.content'),
      disabled: e < 4,
    },
    e6AdditionalBreakDmg: {
      id: 'e6AdditionalBreakDmg',
      formItem: 'switch',
      text: t('Content.e6AdditionalBreakDmg.text'),
      content: t('Content.e6AdditionalBreakDmg.content'),
      disabled: e < 6,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    defaults: () => defaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.talentBreakDmgScaling) {
        x.ENEMY_WEAKNESS_BROKEN.config(1, SOURCE_TALENT)
      }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BE.buff((e >= 2 && r.e2BeBuff) ? 0.30 : 0, SOURCE_E2)
      x.VULNERABILITY.buff((r.standoffActive) ? standoffVulnerabilityBoost : 0, SOURCE_SKILL)

      x.DEF_PEN.buff((e >= 1 && r.e1DefShred) ? 0.16 : 0, SOURCE_E1)
      x.VULNERABILITY.buff((e >= 4 && r.standoffActive && r.e4TargetStandoffVulnerability) ? 0.12 : 0, SOURCE_E4)

      x.BASIC_ATK_SCALING.buff((r.standoffActive) ? basicEnhancedScaling : basicScaling, SOURCE_BASIC)
      x.BASIC_BREAK_EFFICIENCY_BOOST.buff((r.standoffActive) ? r.pocketTrickshotStacks * 0.50 : 0, SOURCE_TALENT)

      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      x.BASIC_TOUGHNESS_DMG.buff((r.standoffActive) ? 20 : 10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)

      // Since his toughness scaling is capped at 1600% x 30, we invert the toughness scaling on the original break dmg and apply the new scaling
      const newMaxToughness = Math.min(16.00 * 30, context.enemyMaxToughness)
      const inverseBreakToughnessMultiplier = 1 / (0.5 + context.enemyMaxToughness / 120)
      const newBreakToughnessMultiplier = (0.5 + newMaxToughness / 120)
      let talentBreakDmgScaling = pocketTrickshotsToTalentBreakDmg[r.pocketTrickshotStacks]
      talentBreakDmgScaling += (e >= 6 && r.e6AdditionalBreakDmg) ? 0.40 : 0
      x.BASIC_BREAK_DMG_MODIFIER.buff(
        (r.talentBreakDmgScaling && r.standoffActive)
          ? inverseBreakToughnessMultiplier * newBreakToughnessMultiplier * talentBreakDmgScaling
          : 0
        , SOURCE_TALENT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
    dynamicConditionals: [{
      id: 'BoothillConversionConditional',
      type: ConditionalType.ABILITY,
      activation: ConditionalActivation.CONTINUOUS,
      dependsOn: [Stats.BE],
      chainsTo: [Stats.CR, Stats.CD],
      condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>

        return r.beToCritBoost
      },
      effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
        const stateValue = action.conditionalState[this.id] || 0

        const stateCrBuffValue = Math.min(0.30, 0.10 * stateValue)
        const stateCdBuffValue = Math.min(1.50, 0.50 * stateValue)

        const crBuffValue = Math.min(0.30, 0.10 * x.a[Key.BE])
        const cdBuffValue = Math.min(1.50, 0.50 * x.a[Key.BE])

        action.conditionalState[this.id] = x.a[Key.BE]

        x.CR.buffDynamic(crBuffValue - stateCrBuffValue, SOURCE_TRACE, action, context)
        x.CD.buffDynamic(cdBuffValue - stateCdBuffValue, SOURCE_TRACE, action, context)
      },
      gpu: function (action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>

        return conditionalWgslWrapper(this, `
if (${wgslFalse(r.beToCritBoost)}) {
  return;
}

let be = x.BE;
let stateValue = (*p_state).BoothillConversionConditional;

let stateCrBuffValue = min(0.30, 0.10 * stateValue);
let stateCdBuffValue = min(1.50, 0.50 * stateValue);

let crBuffValue = min(0.30, 0.10 * be);
let cdBuffValue = min(1.50, 0.50 * be);

(*p_state).BoothillConversionConditional = be;

(*p_x).CR += crBuffValue - stateCrBuffValue;
(*p_x).CD += cdBuffValue - stateCdBuffValue;
    `)
      },
    }],
  }
}

```

# 1100/Bronya.ts

```ts
import { AbilityType, ASHBLAZING_ATK_STACK, BASIC_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { boostAshblazingAtkP, gpuBoostAshblazingAtkP } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityCr } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Windrider Bullet

Basic ATK+1+20

Deals Wind DMG equal to 100% of Bronya's ATK to a single enemy.

 Single 10

Lv6

Combat Redeployment

Skill-1+30

Dispels a debuff from a single ally, allows them to immediately take action, and increases their DMG by 66% for 1 turn(s).
When this Skill is used on Bronya herself, she cannot immediately take action again.
Hidden Stat: 0
Hidden Stat: 1

Lv10

The Belobog March

Ultimate120+5

Increases the ATK of all allies by 55%, and increases their CRIT DMG equal to 16% of Bronya's CRIT DMG plus 20% for 2 turn(s).

Lv10

Leading the Way

Talent+5

After using her Basic ATK, Bronya's next action will be Advanced Forward by 30%.

 Single 10

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Banner of Command

Technique

After using Bronya's Technique, at the start of the next battle, all allies' ATK increases by 15% for 2 turn(s).


Stat Boosts

 +22.4% Wind DMG Boost
 +24.0% CRIT DMG
 +10.0% Effect RES

Command

The CRIT Rate for Basic ATK increases to 100%.


Battlefield

At the start of the battle, all allies' DEF increases by 20% for 2 turn(s).


Military Might

When Bronya is on the field, all allies deal 10% more DMG.



1 Hone Your Strength

When using Skill, there is a 50% fixed chance of recovering 1 Skill Point. This effect has a 1-turn cooldown.



2 Quick March

When using Skill, the target ally's SPD increases by 30% after taking action, lasting for 1 turn.



3 Bombardment

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Take by Surprise

After any other ally character uses Basic ATK on an enemy target that has Wind Weakness, Bronya immediately launches 1 instance of Follow-up ATK, dealing Wind DMG to this target equal to 80% of her Basic ATK DMG. This effect can only trigger once per turn.



5 Unstoppable

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Piercing Rainbow

The duration of the DMG Boost effect placed by the Skill on the target ally increases by 1 turn(s).
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Bronya')
  const { basic, skill, ult } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5
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
  } = Source.character('1101')

  const skillDmgBoostValue = skill(e, 0.66, 0.726)
  const ultAtkBoostValue = ult(e, 0.55, 0.594)
  const ultCdBoostValue = ult(e, 0.16, 0.168)
  const ultCdBoostBaseValue = ult(e, 0.20, 0.216)

  const basicScaling = basic(e, 1.0, 1.1)
  const fuaScaling = basicScaling * 0.80

  const hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  const defaults = {
    teamDmgBuff: true,
    skillBuff: true,
    ultBuff: true,
    battleStartDefBuff: false,
    techniqueBuff: false,
    e2SkillSpdBuff: false,
  }

  const teammateDefaults = {
    ...defaults,
    ...{
      teammateCDValue: 2.50,
    },
  }

  const content: ContentDefinition<typeof defaults> = {
    teamDmgBuff: {
      id: 'teamDmgBuff',
      formItem: 'switch',
      text: t('Content.teamDmgBuff.text'),
      content: t('Content.teamDmgBuff.content'),
    },
    skillBuff: {
      id: 'skillBuff',
      formItem: 'switch',
      text: t('Content.skillBuff.text'),
      content: t('Content.skillBuff.content', { skillDmgBoostValue: TsUtils.precisionRound(100 * skillDmgBoostValue) }),
    },
    ultBuff: {
      id: 'ultBuff',
      formItem: 'switch',
      text: t('Content.ultBuff.text'),
      content: t('Content.ultBuff.content', {
        ultAtkBoostValue: TsUtils.precisionRound(100 * ultAtkBoostValue),
        ultCdBoostValue: TsUtils.precisionRound(100 * ultCdBoostValue),
        ultCdBoostBaseValue: TsUtils.precisionRound(100 * ultCdBoostBaseValue),
      }),
    },
    battleStartDefBuff: {
      id: 'battleStartDefBuff',
      formItem: 'switch',
      text: t('Content.battleStartDefBuff.text'),
      content: t('Content.battleStartDefBuff.content'),
    },
    techniqueBuff: {
      id: 'techniqueBuff',
      formItem: 'switch',
      text: t('Content.techniqueBuff.text'),
      content: t('Content.techniqueBuff.content'),
    },
    e2SkillSpdBuff: {
      id: 'e2SkillSpdBuff',
      formItem: 'switch',
      text: t('Content.e2SkillSpdBuff.text'),
      content: t('Content.e2SkillSpdBuff.content'),
      disabled: e < 2,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    teamDmgBuff: content.teamDmgBuff,
    skillBuff: content.skillBuff,
    ultBuff: content.ultBuff,
    battleStartDefBuff: content.battleStartDefBuff,
    techniqueBuff: content.techniqueBuff,
    teammateCDValue: {
      id: 'teammateCDValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateCDValue.text'),
      content: t('TeammateContent.teammateCDValue.content', {
        ultAtkBoostValue: TsUtils.precisionRound(100 * ultAtkBoostValue),
        ultCdBoostValue: TsUtils.precisionRound(100 * ultCdBoostValue),
        ultCdBoostBaseValue: TsUtils.precisionRound(100 * ultCdBoostBaseValue),
      }),
      min: 0,
      max: 4.00,
      percent: true,
    },
    e2SkillSpdBuff: content.e2SkillSpdBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.FUA],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      buffAbilityCr(x, BASIC_DMG_TYPE, 1.00, SOURCE_TRACE)

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.FUA_ATK_SCALING.buff((e >= 4) ? fuaScaling : 0, SOURCE_E4)

      if (r.ultBuff) {
        x.CD.buff(ultCdBoostBaseValue, SOURCE_ULT)
        x.UNCONVERTIBLE_CD_BUFF.buff(ultCdBoostBaseValue, SOURCE_ULT)
      }

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.FUA_TOUGHNESS_DMG.buff((e >= 4) ? 10 : 0, SOURCE_E4)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.DEF_P.buffTeam((m.battleStartDefBuff) ? 0.20 : 0, SOURCE_TRACE)
      x.SPD_P.buffSingle((m.e2SkillSpdBuff) ? 0.30 : 0, SOURCE_E2)
      x.ATK_P.buffTeam((m.techniqueBuff) ? 0.15 : 0, SOURCE_TECHNIQUE)
      x.ATK_P.buffTeam((m.ultBuff) ? ultAtkBoostValue : 0, SOURCE_ULT)

      x.ELEMENTAL_DMG.buffTeam((m.teamDmgBuff) ? 0.10 : 0, SOURCE_TRACE)
      x.ELEMENTAL_DMG.buffSingle((m.skillBuff) ? skillDmgBoostValue : 0, SOURCE_SKILL)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const cdBuff = (t.ultBuff) ? ultCdBoostValue * t.teammateCDValue + ultCdBoostBaseValue : 0
      x.CD.buffTeam(cdBuff, SOURCE_ULT)
      x.UNCONVERTIBLE_CD_BUFF.buffTeam(cdBuff, SOURCE_ULT)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkP(x, action, context, hitMulti)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => gpuBoostAshblazingAtkP(hitMulti),
    dynamicConditionals: [
      {
        id: 'BronyaCdConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CD],
        chainsTo: [Stats.CD],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.ultBuff
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.CD, Stats.CD, this, x, action, context, SOURCE_ULT,
            (convertibleValue) => convertibleValue * ultCdBoostValue,
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.CD, Stats.CD, this, action, context,
            `${ultCdBoostValue} * convertibleValue`,
            `${wgslTrue(r.ultBuff)}`,
          )
        },
      },
    ],
  }
}

```

# 1100/Clara.ts

```ts
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

```

# 1000/DanHeng.ts

```ts
import { AbilityType, BASIC_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Cloudlancer Art: North Wind

Basic ATK+1+20

Deals Wind DMG equal to 100% of Dan Heng's ATK to a single enemy.

 Single 10

Lv6

Cloudlancer Art: Torrent

Skill-1+30

Deals Wind DMG equal to 260% of Dan Heng's ATK to a single enemy.
When DMG dealt by Skill triggers CRIT Hit, there is a 100% base chance to reduce the target's SPD by 12%, lasting for 2 turn(s).

 Single 20

Lv10

Ethereal Dream

Ultimate100+5

Deals Wind DMG equal to 400% of Dan Heng's ATK to a single target enemy. If the attacked enemy is Slowed, the multiplier for the DMG dealt by Ultimate increases by 120%.

 Single 30

Lv10

Superiority of Reach

Talent

When Dan Heng becomes the target of an ally's ability, his next attack's Wind RES PEN increases by 36%. This effect can be triggered again after 2 turn(s).

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Splitting Spearhead

Technique

After Dan Heng uses his Technique, his ATK increases by 40% at the start of the next battle for 3 turn(s).


Stat Boosts

 +22.4% Wind DMG Boost
 +18.0% ATK
 +12.5% DEF

Hidden Dragon

When current HP percentage is 50% or lower, reduces the chance of being attacked by enemies.
Hidden Stat: 0.5


Faster Than Light

After launching an attack, there is a 50% fixed chance to increase this unit's SPD by 20% for 2 turn(s).


High Gale

Basic ATK deals 40% more DMG to Slowed enemies.



1 The Higher You Fly, the Harder You Fall

When the target enemy's current HP percentage is greater than or equal to 50%, CRIT Rate increases by 12%.



2 Quell the Venom Octet, Quench the Vice O'Flame

Reduces Talent cooldown by 1 turn.



3 Seen and Unseen

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Roaring Dragon and Soaring Sun

When Dan Heng uses his Ultimate to defeat an enemy, he will immediately take action again.



5 A Drop of Rain Feeds a Torrent

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 The Troubled Soul Lies in Wait

The Slow state triggered by Skill reduces the enemy's SPD by an extra 8%.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.DanHeng')
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
  } = Source.character('1002')

  const extraPenValue = talent(e, 0.36, 0.396)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.60, 2.86)
  const ultScaling = ult(e, 4.00, 4.32)
  const ultExtraScaling = ult(e, 1.20, 1.296)

  const defaults = {
    talentPenBuff: true,
    enemySlowed: true,
    spdBuff: true,
    e1EnemyHp50: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    talentPenBuff: {
      id: 'talentPenBuff',
      formItem: 'switch',
      text: t('Content.talentPenBuff.text'),
      content: t('Content.talentPenBuff.content', { extraPenValue: TsUtils.precisionRound(100 * extraPenValue) }),
    },
    enemySlowed: {
      id: 'enemySlowed',
      formItem: 'switch',
      text: t('Content.enemySlowed.text'),
      content: t('Content.enemySlowed.content'),
    },
    spdBuff: {
      id: 'spdBuff',
      formItem: 'switch',
      text: t('Content.spdBuff.text'),
      content: t('Content.spdBuff.content'),
    },
    e1EnemyHp50: {
      id: 'e1EnemyHp50',
      formItem: 'switch',
      text: t('Content.e1EnemyHp50.text'),
      content: t('Content.e1EnemyHp50.content'),
      disabled: e < 1,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.CR.buff((e >= 1 && r.e1EnemyHp50) ? 0.12 : 0, SOURCE_E1)
      x.SPD_P.buff((r.spdBuff) ? 0.20 : 0, SOURCE_TRACE)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.ULT_ATK_SCALING.buff((r.enemySlowed) ? ultExtraScaling : 0, SOURCE_ULT)

      // Boost
      x.RES_PEN.buff((r.talentPenBuff) ? extraPenValue : 0, SOURCE_TALENT)
      buffAbilityDmg(x, BASIC_DMG_TYPE, (r.enemySlowed) ? 0.40 : 0, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
  }
}

```

# 1300/DrRatio.ts

```ts
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

```

# 1200/Feixiao.ts

```ts
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

```

# 1300/Firefly.ts

```ts
import { AbilityType, BREAK_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityVulnerability } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Order: Flare Propulsion

Basic ATK+1+20

Deals Fire DMG equal to 100% of SAM's ATK to a single target enemy.

 Single 10

Lv6

Order: Aerial Bombardment

Skill-1

Consumes HP equal to 40% of this unit's Max HP and regenerates a fixed amount of Energy equal to 60% of this unit's Max Energy. Deals Fire DMG equal to 200% of SAM's ATK to a single target enemy. If the current HP is not sufficient, reduces SAM's HP to 1 when using this Skill. Advances this unit's next Action by 25%.

 Single 20

Lv10

Fyrefly Type-IV: Complete Combustion

Ultimate240+5

Enters the Complete Combustion state, advances this unit's Action by 100%, and gains Enhanced Basic ATK and Enhanced Skill. While in Complete Combustion, increases SPD by 60, and when using the Enhanced Basic ATK or Enhanced Skill, increases this unit's Weakness Break Efficiency by 50% and the Break DMG dealt by SAM to the enemy targets by 20%, lasting until this current attack ends.
A countdown timer for the Complete Combustion state appears on the Action Order. When the countdown timer's turn starts, SAM exits the Complete Combustion state. The countdown timer has a fixed SPD of 70.
SAM cannot use Ultimate while in Complete Combustion.

Lv10

Chrysalid Pyronexus

Talent

The lower the HP, the less DMG received. When HP is 20% or lower, the DMG Reduction reaches its maximum effect, reducing up to 40%. During the Complete Combustion, the DMG Reduction remains at its maximum effect, and the Effect RES increases by 30%.
If Energy is lower than 50% when the battle starts, regenerates Energy to 50%. Once Energy is regenerated to its maximum, dispels all debuffs on this unit.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Δ Order: Meteoric Incineration

Technique

Leaps into the air and moves about freely for 5 seconds, which can be ended early by launching a plunging attack. When the duration ends, plunges and immediately attacks all enemies within a set area. At the start of each wave, applies a Fire Weakness to all enemies, lasting for 2 turn(s). Then, deals Fire DMG equal to 200% of SAM's ATK to all enemies.

 Single 20


Fyrefly Type-IV: Deathstar Overload

Skill-1

Restores HP by an amount equal to 25% of this unit's Max HP. Applies Fire Weakness to a single target enemy, lasting for 2 turn(s). Deals Fire DMG equal to (0.2 × Break Effect + 200%) of SAM's ATK to this target. At the same time, deals Fire DMG equal to (0.1 × Break Effect + 100%) of SAM's ATK to adjacent targets. The Break Effect taken into the calculation is capped at 360%.

 Single 30 | Other 15

Lv10

Fyrefly Type-IV: Pyrogenic Decimation

Basic ATK+1

Restores HP by an amount equal to 20% of this unit's Max HP. Deals Fire DMG equal to 200% of SAM's ATK to a single target enemy.

 Single 15

Lv6

Stat Boosts

 +37.3% Break Effect
 +18.0% Effect RES
 +5.0 SPD

Module α: Antilag Outburst

During the Complete Combustion, attacking enemies that have no Fire Weakness can also reduce their Toughness, with the effect being equivalent to 55% of the original Toughness Reduction from abilities.


Module β: Autoreactive Armor

When SAM is in Complete Combustion with a Break Effect that is equal to or greater than 200%/360%, attacking a Weakness-Broken enemy target will convert the Toughness Reduction of this attack into 1 instance of 35%/50% Super Break DMG.

Super Break DMG
Super Break DMG increases with higher Break Effect, higher Toughness Reduction of the attack, and higher character levels.
Super Break DMG cannot CRIT Hit and is not affected by DMG Boost effects.
Super Break DMG is also considered Break DMG.


Module γ: Core Overload

For every 10 point(s) of SAM's ATK that exceeds 1800, increases this unit's Break Effect by 0.8%.



1 In Reddened Chrysalis, I Once Rest

When using the Enhanced Skill, ignores 15% of the target's DEF. The Enhanced Skill does not consume Skill Points.



2 From Shattered Sky, I Free Fall

While in Complete Combustion, using the Enhanced Basic ATK or the Enhanced Skill to defeat an enemy target or to Break their Weakness allows SAM to immediately gain 1 extra turn. This effect can trigger again after 1 turn(s).
Hidden Stat: 1.0

Extra Turn
Gain 1 extra turn that won't expend your remaining turns when taking action. During this extra turn, no Ultimate can be used.



3 Amidst Silenced Stars, I Deep Sleep

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Upon Lighted Fyrefly, I Soon Gaze

While in Complete Combustion, increases SAM's Effect RES by 50%.



5 From Undreamt Night, I Thence Shine

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 In Finalized Morrow, I Full Bloom

While in Complete Combustion, increases SAM's Fire RES PEN by 20%. When using the Enhanced Basic ATK or Enhanced Skill, increases Weakness Break Efficiency by 50%.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Firefly')
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
  } = Source.character('1310')

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 2.00, 2.20)

  const skillScaling = skill(e, 2.00, 2.20)
  const skillEnhancedAtkScaling = skill(e, 2.00, 2.20)

  const ultSpdBuff = ult(e, 60, 66)
  const ultWeaknessBrokenBreakVulnerability = ult(e, 0.20, 0.22)
  const talentResBuff = talent(e, 0.30, 0.34)
  const talentDmgReductionBuff = talent(e, 0.40, 0.44)

  const defaults = {
    enhancedStateActive: true,
    enhancedStateSpdBuff: true,
    superBreakDmg: true,
    atkToBeConversion: true,
    talentDmgReductionBuff: true,
    e1DefShred: true,
    e4ResBuff: true,
    e6Buffs: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedStateActive: {
      id: 'enhancedStateActive',
      formItem: 'switch',
      text: t('Content.enhancedStateActive.text'),
      content: t('Content.enhancedStateActive.content'),
    },
    enhancedStateSpdBuff: {
      id: 'enhancedStateSpdBuff',
      formItem: 'switch',
      text: t('Content.enhancedStateSpdBuff.text'),
      content: t('Content.enhancedStateSpdBuff.content', { ultSpdBuff }),
    },
    superBreakDmg: {
      id: 'superBreakDmg',
      formItem: 'switch',
      text: t('Content.superBreakDmg.text'),
      content: t('Content.superBreakDmg.content'),
    },
    atkToBeConversion: {
      id: 'atkToBeConversion',
      formItem: 'switch',
      text: t('Content.atkToBeConversion.text'),
      content: t('Content.atkToBeConversion.content'),
    },
    talentDmgReductionBuff: {
      id: 'talentDmgReductionBuff',
      formItem: 'switch',
      text: t('Content.talentDmgReductionBuff.text'),
      content: t('Content.talentDmgReductionBuff.content', {
        talentResBuff: TsUtils.precisionRound(100 * talentResBuff),
        talentDmgReductionBuff: TsUtils.precisionRound(100 * talentDmgReductionBuff),
      }),
    },
    e1DefShred: {
      id: 'e1DefShred',
      formItem: 'switch',
      text: t('Content.e1DefShred.text'),
      content: t('Content.e1DefShred.content'),
      disabled: e < 1,
    },
    e4ResBuff: {
      id: 'e4ResBuff',
      formItem: 'switch',
      text: t('Content.e4ResBuff.text'),
      content: t('Content.e4ResBuff.content'),
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
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL],
    content: () => Object.values(content),
    defaults: () => defaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.superBreakDmg) {
        x.ENEMY_WEAKNESS_BROKEN.config(1, SOURCE_TRACE)
      }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.RES.buff((r.enhancedStateActive) ? talentResBuff : 0, SOURCE_TALENT)
      x.SPD.buff((r.enhancedStateActive && r.enhancedStateSpdBuff) ? ultSpdBuff : 0, SOURCE_ULT)
      x.BREAK_EFFICIENCY_BOOST.buff((r.enhancedStateActive) ? 0.50 : 0, SOURCE_ULT)
      x.DMG_RED_MULTI.multiply((r.enhancedStateActive && r.talentDmgReductionBuff) ? (1 - talentDmgReductionBuff) : 1, SOURCE_TALENT)

      buffAbilityVulnerability(x, BREAK_DMG_TYPE, (r.enhancedStateActive && x.a[Key.ENEMY_WEAKNESS_BROKEN]) ? ultWeaknessBrokenBreakVulnerability : 0, SOURCE_ULT)

      // Should be skill def pen but skill doesnt apply to super break
      x.DEF_PEN.buff((e >= 1 && r.e1DefShred && r.enhancedStateActive) ? 0.15 : 0, SOURCE_E1)
      x.RES.buff((e >= 4 && r.e4ResBuff && r.enhancedStateActive) ? 0.50 : 0, SOURCE_E4)
      x.FIRE_RES_PEN.buff((e >= 6 && r.e6Buffs && r.enhancedStateActive) ? 0.20 : 0, SOURCE_E6)
      x.BREAK_EFFICIENCY_BOOST.buff((e >= 6 && r.e6Buffs && r.enhancedStateActive) ? 0.50 : 0, SOURCE_E6)

      x.BASIC_ATK_SCALING.buff((r.enhancedStateActive) ? basicEnhancedScaling : basicScaling, SOURCE_BASIC)

      x.BASIC_TOUGHNESS_DMG.buff((r.enhancedStateActive) ? 15 : 10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff((r.enhancedStateActive) ? 30 : 20, SOURCE_SKILL)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.SUPER_BREAK_MODIFIER.buff((r.superBreakDmg && r.enhancedStateActive && x.a[Key.BE] >= 2.00) ? 0.35 : 0, SOURCE_TRACE)
      x.SUPER_BREAK_MODIFIER.buff((r.superBreakDmg && r.enhancedStateActive && x.a[Key.BE] >= 3.60) ? 0.15 : 0, SOURCE_TRACE)

      x.SKILL_ATK_SCALING.buff(
        (r.enhancedStateActive)
          ? (0.2 * Math.min(3.60, x.a[Key.BE]) + skillEnhancedAtkScaling)
          : skillScaling
        , SOURCE_SKILL)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      return `
if (x.BE >= 2.00 && ${wgslTrue(r.superBreakDmg && r.enhancedStateActive)}) { x.SUPER_BREAK_MODIFIER += 0.35; }
if (x.BE >= 3.60 && ${wgslTrue(r.superBreakDmg && r.enhancedStateActive)}) { x.SUPER_BREAK_MODIFIER += 0.15; }

if (${wgslTrue(r.enhancedStateActive)}) {
  x.SKILL_ATK_SCALING += 0.2 * min(3.60, x.BE) + ${skillEnhancedAtkScaling};
} else {
  x.SKILL_ATK_SCALING += ${skillScaling};
}
      `
    },
    dynamicConditionals: [
      {
        id: 'FireflyConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.ATK],
        chainsTo: [Stats.BE],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.atkToBeConversion && x.a[Key.ATK] > 1800
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.ATK, Stats.BE, this, x, action, context, SOURCE_TRACE,
            (convertibleValue) => 0.008 * Math.floor((convertibleValue - 1800) / 10),
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.ATK, Stats.BE, this, action, context,
            `0.008 * floor((convertibleValue - 1800) / 10)`,
            `${wgslTrue(r.atkToBeConversion)} && x.ATK > 1800`,
          )
        },
      },
    ],
  }
}

```

# 1200/Fugue.ts

```ts
import { AbilityType, BREAK_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Radiant Streak

Basic ATK+1+20

Deals Fire DMG equal to 100% of Fugue's ATK to one designated enemy.

 Single 10

Lv6

Fiery Caress

Basic ATK+1+20

Deals Fire DMG equal to 100% of Fugue's ATK to one designated enemy and Fire DMG equal to 50% of Fugue's ATK to adjacent targets.

 Single 10 | Other 5

Lv6

Virtue Beckons Bliss

Skill-1+30

Grants one designated ally "Foxian Prayer". Enters the "Torrid Scorch" state, lasting for 3 turn(s). The duration reduces by 1 at the start of Fugue's every turn. "Foxian Prayer" only takes effect on the most recent target of Fugue's Skill.
The ally target with "Foxian Prayer" increases their Break Effect by 30% and can also reduce Toughness even when attacking enemies that don't have the corresponding Weakness Type, with the effect equivalent to 50% of the original Toughness Reduction value. This cannot stack with other Toughness Reduction effects that also ignore Weakness Type.
While in the "Torrid Scorch" state, Fugue enhances her Basic ATK. Every time an ally target with "Foxian Prayer" attacks, Fugue has a 100% base chance to reduce the attacked enemy target's DEF by 18%, lasting for 2 turn(s).

Lv10

Solar Splendor Shines Upon All

Ultimate130+5

Deals Fire DMG equal to 200% of Fugue's ATK to all enemies. This attack ignores Weakness Type to reduce all enemies' Toughness. And when breaking Weakness, triggers the Fire Weakness Break effect.

 All 20

Lv10

Fortune Follows Where Virtue Spreads

Talent

While Fugue is on the field, enemy targets will get additionally afflicted with "Cloudflame Luster," equal to 40% of their Max Toughness. When the initial Toughness is reduced to 0, "Cloudflame Luster" can continue to be reduced. When "Cloudflame Luster" is reduced to 0, the enemy will receive Weakness Break DMG again.
While Fugue is on the field and after allies attack Weakness Broken enemy targets, converts the Toughness Reduction of this attack into 1 instance of 100% Super Break DMG.

Super Break DMG
Super Break DMG increases with higher Break Effect, higher Toughness Reduction of the attack, and higher character levels.
Super Break DMG cannot CRIT Hit and is not affected by DMG Boost effects.
Super Break DMG is also considered Break DMG.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Percipient Shine

Technique

After using Technique, inflicts Daze on enemies within a certain area, lasting for 10 second(s). While Dazed, enemies will not actively attack ally targets.
After entering battle via actively attacking Dazed enemies, Fugue's action advances by 40%, with a 100% base chance to inflict each enemy target with the same DEF Reduction state as that applied by Fugue's Skill, lasting for 2 turn(s).


Stat Boosts

 +14.0 SPD
 +24.0% Break Effect
 +10.0% HP

Verdantia Renaissance

After ally targets break weakness, additionally delays the action of the enemy target by 15%.


Sylvan Enigma

Increases this unit's Break Effect by 30%. After using Skill for the first time, immediately recovers 1 Skill Point(s).


Phecda Primordia

When an enemy target's Weakness gets broken, increases teammates' (i.e., excluding this unit) Break Effect by 6%. If Fugue's Break Effect is 220% or higher, the Break Effect increase is boosted by an additional 12%, lasting for 2 turn(s). This effect can stack up to 2 time(s).



1 Earthbound I Was, Cloudward I Be

Ally target with "Foxian Prayer" increases their Weakness Break Efficiency by 50%.



2 Beatitude Dawns for the Worthy

When an enemy target's Weakness gets broken, Fugue regenerates 3 Energy. After using Ultimate, advances the action of all allies by 24%.



3 Verity Weaves Thoughts to Blade

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Bereft of Form, Which Name to Bear

Ally target with "Foxian Prayer" increases their Break DMG dealt by 20%.



5 Colored Cloud Rains Fortune

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Clairvoyance of Boom and Doom

Increases Fugue's Weakness Break Efficiency by 50%. While Fugue is in the "Torrid Scorch" state, "Foxian Prayer" takes effect on all allies.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Fugue')
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
  } = Source.character('1225')

  const skillBeValue = skill(e, 0.30, 0.33)
  const skillDefPenValue = skill(e, 0.18, 0.20)

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.00, 2.20)
  const superBreakScaling = talent(e, 1.00, 1.10)

  const defaults = {
    torridScorch: true,
    foxianPrayer: false,
    defReduction: true,
    superBreakDmg: true,
    e4BreakDmg: true,
    e6BreakEfficiency: true,
  }

  const teammateDefaults = {
    foxianPrayer: true,
    be220Buff: true,
    weaknessBreakBeStacks: 2,
    defReduction: true,
    superBreakDmg: true,
    e4BreakDmg: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    torridScorch: {
      id: 'torridScorch',
      formItem: 'switch',
      text: t('Content.torridScorch.text'),
      content: t('Content.torridScorch.content'),
    },
    foxianPrayer: {
      id: 'foxianPrayer',
      formItem: 'switch',
      text: t('Content.foxianPrayer.text'),
      content: t('Content.foxianPrayer.content', { BreakBuff: TsUtils.precisionRound(100 * skillBeValue) }),
    },
    defReduction: {
      id: 'defReduction',
      formItem: 'switch',
      text: t('Content.defReduction.text'),
      content: t('Content.defReduction.content', { DefShred: TsUtils.precisionRound(100 * skillDefPenValue) }),
    },
    superBreakDmg: {
      id: 'superBreakDmg',
      formItem: 'switch',
      text: t('Content.superBreakDmg.text'),
      content: t('Content.superBreakDmg.content', { SuperBreakMultiplier: TsUtils.precisionRound(100 * superBreakScaling) }),
    },
    e4BreakDmg: {
      id: 'e4BreakDmg',
      formItem: 'switch',
      text: t('Content.e4BreakDmg.text'),
      content: t('Content.e4BreakDmg.content'),
      disabled: e < 4,
    },
    e6BreakEfficiency: {
      id: 'e6BreakEfficiency',
      formItem: 'switch',
      text: t('Content.e6BreakEfficiency.text'),
      content: t('Content.e6BreakEfficiency.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    foxianPrayer: content.foxianPrayer,
    be220Buff: {
      id: 'be220Buff',
      formItem: 'switch',
      text: t('TeammateContent.be220Buff.text'),
      content: t('TeammateContent.be220Buff.content'),
    },
    weaknessBreakBeStacks: {
      id: 'weaknessBreakBeStacks',
      formItem: 'slider',
      text: t('TeammateContent.weaknessBreakBeStacks.text'),
      content: t('TeammateContent.weaknessBreakBeStacks.content'),
      min: 0,
      max: 2,
    },
    defReduction: content.defReduction,
    superBreakDmg: content.superBreakDmg,
    e4BreakDmg: content.e4BreakDmg,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.superBreakDmg) {
        x.ENEMY_WEAKNESS_BROKEN.config(1, SOURCE_TALENT)
      }
    },
    initializeTeammateConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      if (r.superBreakDmg) {
        x.ENEMY_WEAKNESS_BROKEN.config(1, SOURCE_TALENT)
      }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BE.buff(0.30, SOURCE_TRACE)

      x.BREAK_EFFICIENCY_BOOST.buff((e >= 6 && r.e6BreakEfficiency) ? 0.50 : 0, SOURCE_E6)

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.BE.buffSingle((m.foxianPrayer) ? skillBeValue : 0, SOURCE_SKILL)

      x.SUPER_BREAK_MODIFIER.buffTeam((m.superBreakDmg) ? superBreakScaling : 0, SOURCE_TALENT)
      x.DEF_PEN.buffTeam((m.defReduction) ? skillDefPenValue : 0, SOURCE_SKILL)

      x.BREAK_EFFICIENCY_BOOST.buffSingle((e >= 1 && m.foxianPrayer) ? 0.50 : 0, SOURCE_E1)
      buffAbilityDmg(x, BREAK_DMG_TYPE, (e >= 4 && m.foxianPrayer && m.e4BreakDmg) ? 0.20 : 0, SOURCE_E4, Target.SINGLE)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.BE.buffTeam(t.weaknessBreakBeStacks * (0.06 + (t.be220Buff ? 0.12 : 0)), SOURCE_TRACE)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {},
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}

```

# 1200/FuXuan.ts

```ts
import { AbilityType, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardHpHealFinalizer, standardHpHealFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Novaburst

Basic ATK+1+20

Deals Quantum DMG equal to 50% of Fu Xuan's Max HP to a single enemy.

 Single 10

Lv6

Known by Stars, Shown by Hearts

Skill-1+30

Activates Matrix of Prescience, via which Fu Xuan's teammates will Distribute 65% of the DMG they receive (before this DMG is mitigated by any Shields) to Fu Xuan for 3 turn(s).
While affected by Matrix of Prescience, all ally targets gain the Knowledge effect, which increases their respective Max HP by 6% of Fu Xuan's Max HP, and increases CRIT Rate by 12%.
When Fu Xuan is knocked down, the Matrix of Prescience will be dispelled.
Hidden Stat: 0

Distribute
Before DMG is calculated, distribute a part of the attacking unit's DMG to another target (or multiple other targets), with the target hit by the attack taking the rest of the DMG. DMG distributed to other targets cannot be distributed again.

Lv10

Woes of Many Morphed to One

Ultimate135+5

Deals Quantum DMG equal to 100% of Fu Xuan's Max HP to all enemies and obtains 1 trigger count for the HP Restore effect granted by Fu Xuan's Talent.

 All 20

Lv10

Bleak Breeds Bliss

Talent

While Fu Xuan is still active in battle, Misfortune Avoidance is applied to the entire team. With Misfortune Avoidance, allies take 18% less DMG.
When Fu Xuan's current HP percentage falls to 50% of her Max HP or less, HP Restore will be triggered for Fu Xuan, restoring her HP by 90% of the amount of HP she is currently missing. This effect cannot be triggered if she receives a killing blow. This effect has 1 trigger count by default and can hold up to a maximum of 2 trigger counts.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Of Fortune Comes Fate

Technique

After the Technique is used, all team members receive a Barrier, lasting for 20 seconds. This Barrier can block all enemy attacks, and the team will not enter battle when attacked. Entering battle while the Barrier is active will have Fu Xuan automatically activate Matrix of Prescience at the start of the battle, lasting for 2 turn(s).


Stat Boosts

 +18.7% CRIT Rate
 +18.0% HP
 +10.0% Effect RES

Taiyi, the Macrocosmic

When Matrix of Prescience is active, Fu Xuan will regenerate 20 extra Energy when she uses her Skill.


Dunjia, the Metamystic

When Fu Xuan's Ultimate is used, heals all other allies by an amount equal to 5% of Fu Xuan's Max HP plus 133.


Liuren, the Sexagenary

If a target enemy applies Crowd Control debuffs to allies while the "Matrix of Prescience" is active, all allies will resist all Crowd Control debuffs applied by the enemy target during the current action. This effect can only be triggered once. When "Matrix of Prescience" is activated again, the number of times this effect can be triggered will reset.

Crowd Control debuff
Freeze, Entanglement, Imprisonment, Dominated, Outrage, Strong Reverberation, Alien Dream, Snarelock, Terrified.



1 Dominus Pacis

The Knowledge effect increases CRIT DMG by 30%.



2 Optimus Felix

If any ally target is struck by a killing blow while "Matrix of Prescience" is active, then all ally targets who were struck by a killing blow during this action will not be knocked down, and 70% of their Max HP is immediately restored. This effect can trigger 1 time per battle.



3 Apex Nexus

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Fortuna Stellaris

When other allies under Matrix of Prescience are attacked, Fu Xuan regenerates 5 Energy.



5 Arbiter Primus

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Omnia Vita

Once Matrix of Prescience is activated, it will keep a tally of the total HP lost by all team members in the current battle. The DMG dealt by Fu Xuan's Ultimate will increase by 200% of this tally of HP loss.
This tally is also capped at 120% of Fu Xuan's Max HP and the tally value will reset and re-accumulate after Fu Xuan's Ultimate is used.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.FuXuan')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('1208')

  const skillCrBuffValue = skill(e, 0.12, 0.132)
  const skillHpBuffValue = skill(e, 0.06, 0.066)
  const talentDmgReductionValue = talent(e, 0.18, 0.196)

  const basicScaling = basic(e, 0.50, 0.55)
  const ultScaling = ult(e, 1.00, 1.08)

  const ultHealScaling = 0.05
  const ultHealFlat = 133

  const defaults = {
    skillActive: true,
    talentActive: true,
    e6TeamHpLostPercent: 1.2,
  }

  const teammateDefaults = {
    skillActive: true,
    talentActive: true,
    teammateHPValue: 8000,
  }

  const content: ContentDefinition<typeof defaults> = {
    talentActive: {
      id: 'talentActive',
      formItem: 'switch',
      text: t('Content.talentActive.text'),
      content: t('Content.talentActive.content', { talentDmgReductionValue: TsUtils.precisionRound(100 * talentDmgReductionValue) }),
    },
    skillActive: {
      id: 'skillActive',
      formItem: 'switch',
      text: t('Content.skillActive.text'),
      content: t('Content.skillActive.content', {
        skillHpBuffValue: TsUtils.precisionRound(100 * skillHpBuffValue),
        skillCrBuffValue: TsUtils.precisionRound(100 * skillCrBuffValue),
      }),
    },
    e6TeamHpLostPercent: {
      id: 'e6TeamHpLostPercent',
      formItem: 'slider',
      text: t('Content.e6TeamHpLostPercent.text'),
      content: t('Content.e6TeamHpLostPercent.content'),
      min: 0,
      max: 1.2,
      percent: true,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    talentActive: content.talentActive,
    skillActive: content.skillActive,
    teammateHPValue: {
      id: 'teammateHPValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateHPValue.text'),
      content: t('TeammateContent.teammateHPValue.content', { skillHpBuffValue: TsUtils.precisionRound(100 * skillHpBuffValue) }),
      min: 0,
      max: 10000,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Scaling
      x.BASIC_HP_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.ULT_HP_SCALING.buff(ultScaling, SOURCE_ULT)
      x.ULT_HP_SCALING.buff((e >= 6) ? 2.00 * r.e6TeamHpLostPercent : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      x.HEAL_TYPE.set(ULT_DMG_TYPE, SOURCE_TRACE)
      x.HEAL_SCALING.buff(ultHealScaling, SOURCE_TRACE)
      x.HEAL_FLAT.buff(ultHealFlat, SOURCE_TRACE)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.CR.buffTeam((m.skillActive) ? skillCrBuffValue : 0, SOURCE_SKILL)
      x.CD.buffTeam((e >= 1 && m.skillActive) ? 0.30 : 0, SOURCE_E1)

      // Talent ehp buff is shared
      x.DMG_RED_MULTI.multiplyTeam((m.talentActive) ? (1 - talentDmgReductionValue) : 1, SOURCE_TALENT)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const hpBuff = (t.skillActive) ? skillHpBuffValue * t.teammateHPValue : 0
      x.HP.buffTeam(hpBuff, SOURCE_SKILL)
      x.UNCONVERTIBLE_HP_BUFF.buffTeam(hpBuff, SOURCE_SKILL)

      // Skill ehp buff only applies to teammates
      x.DMG_RED_MULTI.multiplyTeam((t.skillActive) ? (1 - 0.65) : 1, SOURCE_SKILL)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardHpHealFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardHpHealFinalizer(),
    dynamicConditionals: [
      {
        id: 'FuXuanHpConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.HP],
        chainsTo: [Stats.HP],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.skillActive
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.HP, Stats.HP, this, x, action, context, SOURCE_SKILL,
            (convertibleValue) => convertibleValue * skillHpBuffValue,
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.HP, Stats.HP, this, action, context,
            `${skillHpBuffValue} * convertibleValue`,
            `${wgslTrue(r.skillActive)}`,
          )
        },
      },
    ],
  }
}

```

# 1300/Gallagher.ts

```ts
import { AbilityType, BREAK_DMG_TYPE, NONE_TYPE, SKILL_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardFlatHealFinalizer, standardFlatHealFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityVulnerability, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Corkage Fee

Basic ATK+1+20

Deals Fire DMG equal to 100% of Gallagher's ATK to a single target enemy.

 Single 10

Lv6
Nectar Blitz

Basic ATK+1+20

Deals Fire DMG equal to 250% of Gallagher's ATK to a single target enemy. Reduces the target's ATK by 15%, lasting for 2 turn(s).

 Single 30

Lv6

Special Brew

Skill-1+30

Immediately heals a target ally for 1600 HP.

Lv10

Champagne Etiquette

Ultimate110+5

Inflicts Besotted on all enemies, lasting for 2 turn(s). At the same time, deals Fire DMG equal to 150% of Gallagher's ATK to all enemies, and enhances his next Basic ATK to Nectar Blitz.

 All 20

Lv10

Tipsy Tussle

Talent

The Besotted state makes targets receive 12% more Break DMG. Every time a Besotted target gets attacked by an ally, the attacking ally's HP is restored by 640.

Break DMG
Break DMG increases with higher Break Effect, higher target max Toughness, and higher character levels.
Break DMG cannot CRIT Hit and is not affected by DMG Boost effects.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Artisan Elixir

Technique

Immediately attacks the enemy. Upon entering battle, inflicts Besotted on all enemies, lasting for 2 turn(s). And deals Fire DMG equal to 50% of Gallagher's ATK to all enemies.

 Single 20


Stat Boosts

 +28.0% Effect RES
 +13.3% Break Effect
 +18.0% HP

Novel Concoction

Increases this unit's Outgoing Healing by an amount equal to 50% of Break Effect, up to a maximum Outgoing Healing increase of 75%.


Organic Yeast

After using the Ultimate, immediately advances action for this unit by 100%.


Bottoms Up

When Gallagher uses Nectar Blitz to attack Besotted enemies, the HP Restore effect of his Talent will also apply to teammates for this time.



1 Salty Dog

When entering the battle, Gallagher regenerates 20 Energy and increases Effect RES by 50%.



2 Lion's Tail

When using the Skill, dispels 1 debuff(s) from the designated ally. At the same time, increases their Effect RES by 30% for 2 turn(s).



3 Corpse Reviver

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Last Word

Extends the duration of the Besotted state inflicted by Gallagher's Ultimate by 1 turn(s).



5 Death in the Afternoon

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Blood and Sand

Increases Gallagher's Break Effect by 20% and Weakness Break Efficiency by 20%.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Gallagher')
  const tHeal = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealAbility')
  const { basic, skill, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
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
  } = Source.character('1301')

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 2.50, 2.75)
  const ultScaling = basic(e, 1.50, 1.65)
  const talentBesottedScaling = talent(e, 0.12, 0.132)

  const skillHealFlat = skill(e, 1600, 1768)
  const talentHealFlat = talent(e, 640, 707.2)

  const defaults = {
    healAbility: NONE_TYPE,
    basicEnhanced: true,
    breakEffectToOhbBoost: true,
    e1ResBuff: true,
    e2ResBuff: false,
    e6BeBuff: true,
    targetBesotted: true,
  }

  const teammateDefaults = {
    targetBesotted: true,
    e2ResBuff: false,
  }

  const content: ContentDefinition<typeof defaults> = {
    healAbility: {
      id: 'healAbility',
      formItem: 'select',
      text: tHeal('Text'),
      content: tHeal('Content'),
      options: [
        { display: tHeal('Skill'), value: SKILL_DMG_TYPE, label: tHeal('Skill') },
        { display: tHeal('Talent'), value: NONE_TYPE, label: tHeal('Talent') },
      ],
      fullWidth: true,
    },
    basicEnhanced: {
      id: 'basicEnhanced',
      formItem: 'switch',
      text: t('Content.basicEnhanced.text'),
      content: t('Content.basicEnhanced.content'),
    },
    breakEffectToOhbBoost: {
      id: 'breakEffectToOhbBoost',
      formItem: 'switch',
      text: t('Content.breakEffectToOhbBoost.text'),
      content: t('Content.breakEffectToOhbBoost.content'),
    },
    targetBesotted: {
      id: 'targetBesotted',
      formItem: 'switch',
      text: t('Content.targetBesotted.text'),
      content: t('Content.targetBesotted.content', { talentBesottedScaling: TsUtils.precisionRound(100 * talentBesottedScaling) }),
    },
    e1ResBuff: {
      id: 'e1ResBuff',
      formItem: 'switch',
      text: t('Content.e1ResBuff.text'),
      content: t('Content.e1ResBuff.content'),
      disabled: e < 1,
    },
    e2ResBuff: {
      id: 'e2ResBuff',
      formItem: 'switch',
      text: t('Content.e2ResBuff.text'),
      content: t('Content.e2ResBuff.content'),
      disabled: e < 2,
    },
    e6BeBuff: {
      id: 'e6BeBuff',
      formItem: 'switch',
      text: t('Content.e6BeBuff.text'),
      content: t('Content.e6BeBuff.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    targetBesotted: content.targetBesotted,
    e2ResBuff: content.e2ResBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.RES.buff((e >= 1 && r.e1ResBuff) ? 0.50 : 0, SOURCE_E1)
      x.BE.buff((e >= 6) ? 0.20 : 0, SOURCE_E6)

      x.BREAK_EFFICIENCY_BOOST.buff((e >= 6) ? 0.20 : 0, SOURCE_E6)

      x.BASIC_ATK_SCALING.buff((r.basicEnhanced) ? basicEnhancedScaling : basicScaling, SOURCE_BASIC)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      x.BASIC_TOUGHNESS_DMG.buff((r.basicEnhanced) ? 30 : 10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      if (r.healAbility == SKILL_DMG_TYPE) {
        x.HEAL_TYPE.set(SKILL_DMG_TYPE, SOURCE_SKILL)
        x.HEAL_FLAT.buff(skillHealFlat, SOURCE_SKILL)
      }
      if (r.healAbility == NONE_TYPE) {
        x.HEAL_TYPE.set(NONE_TYPE, SOURCE_TALENT)
        x.HEAL_FLAT.buff(talentHealFlat, SOURCE_TALENT)
      }

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.RES.buff((e >= 2 && m.e2ResBuff) ? 0.30 : 0, SOURCE_E2)
      buffAbilityVulnerability(x, BREAK_DMG_TYPE, (m.targetBesotted) ? talentBesottedScaling : 0, SOURCE_TALENT, Target.TEAM)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
      standardFlatHealFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardFlatHealFinalizer(),
    dynamicConditionals: [
      {
        id: 'GallagherConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.BE],
        chainsTo: [Stats.OHB],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.breakEffectToOhbBoost
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          dynamicStatConversion(Stats.BE, Stats.OHB, this, x, action, context, SOURCE_TRACE,
            (convertibleValue) => Math.min(0.75, 0.50 * convertibleValue),
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.BE, Stats.OHB, this, action, context,
            `min(0.75, 0.50 * convertibleValue)`,
            `${wgslTrue(r.breakEffectToOhbBoost)}`,
          )
        },
      },
    ],
  }
}

```

# 1100/Gepard.ts

```ts
import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { gpuStandardDefShieldFinalizer, standardDefShieldFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Fist of Conviction

Basic ATK+1+20

Deals Ice DMG equal to 100% of Gepard's ATK to a single enemy.

 Single 10

Lv6

Daunting Smite

Skill-1+30

Deals Ice DMG equal to 200% of Gepard's ATK to a single enemy, with a 65% base chance to Freeze the enemy for 1 turn(s).
While Frozen, the enemy cannot take action and will take Ice Additional DMG equal to 60% of Gepard's ATK at the beginning of each turn.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

 Single 20

Lv10

Enduring Bulwark

Ultimate100+5

Applies a Shield to all allies, absorbing DMG equal to 45% of Gepard's DEF plus 600 for 3 turn(s).

Lv10

Unyielding Will

Talent

When struck with a killing blow, instead of becoming knocked down, Gepard's HP immediately restores to 50% of his Max HP. This effect can only trigger once per battle.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Comradery

Technique

After Gepard uses his Technique, when the next battle begins, a Shield will be applied to all allies, absorbing DMG equal to 24% of Gepard's DEF plus 150 for 2 turn(s).


Stat Boosts

 +22.4% Ice DMG Boost
 +18.0% Effect RES
 +12.5% DEF

Integrity

Gepard has a higher chance to be attacked by enemies.
Hidden Stat: 3.0


Commander

When "Unyielding Will" is triggered, Gepard's Energy will be restored to 100%.


Grit

Gepard's ATK increases by 35% of his current DEF. This effect will refresh at the start of each turn.



1 Due Diligence

When using Skill, increases the base chance to Freeze the attacked target enemy by 35%.



2 Lingering Cold

After an enemy Frozen by Skill is unfrozen, their SPD is reduced by 20% for 1 turn(s).



3 Never Surrender

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Faith Moves Mountains

When Gepard is in battle, all allies' Effect RES increases by 20%.



5 Cold Iron Fist

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Unyielding Resolve

When his Talent is triggered, Gepard immediately takes action and restores extra HP equal to 50% of his Max HP.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Gepard')
  const { basic, skill, ult } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5
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
  } = Source.character('1104')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)

  const ultShieldScaling = ult(e, 0.45, 0.48)
  const ultShieldFlat = ult(e, 600, 667.5)

  const defaults = {
    e4TeamResBuff: true,
  }

  const teammateDefaults = {
    e4TeamResBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    e4TeamResBuff: {
      id: 'e4TeamResBuff',
      formItem: 'switch',
      text: t('Content.e4TeamResBuff.text'),
      content: t('Content.e4TeamResBuff.content'),
      disabled: e < 4,
    },
  }
  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    e4TeamResBuff: content.e4TeamResBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)

      x.SHIELD_SCALING.buff(ultShieldScaling, SOURCE_ULT)
      x.SHIELD_FLAT.buff(ultShieldFlat, SOURCE_ULT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.RES.buffTeam((e >= 4 && m.e4TeamResBuff) ? 0.20 : 0, SOURCE_E4)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
      standardDefShieldFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardDefShieldFinalizer(),
    dynamicConditionals: [
      {
        id: 'GepardConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.DEF],
        chainsTo: [Stats.ATK],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          return true
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.DEF, Stats.ATK, this, x, action, context, SOURCE_TRACE,
            (convertibleValue) => convertibleValue * 0.35,
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          return gpuDynamicStatConversion(Stats.DEF, Stats.ATK, this, action, context,
            `0.35 * convertibleValue`,
            `true`,
          )
        },
      },
    ],
  }
}

```

# 1200/Guinaifen.ts

```ts
import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Standing Ovation

Basic ATK+1+20

Deals Fire DMG equal to 100% of Guinaifen's ATK to a single enemy.

 Single 10

Lv6

Blazing Welcome

Skill-1+30

Deals Fire DMG equal to 120% of Guinaifen's ATK to a single enemy and Fire DMG equal to 40% of Guinaifen's ATK to any adjacent enemies, with a 100% base chance to Burn the target and adjacent targets. When Burned, enemies will take a Fire DoT equal to 218.208% of Guinaifen's ATK at the beginning of each turn, lasting for 2 turn(s).

 Single 20 | Other 10

Lv10

Watch This Showstopper

Ultimate120+5

Deals Fire DMG equal to 120% of Guinaifen's ATK to all enemies. If the target enemy is currently inflicted with Burn, then their Burn status immediately produces DMG equal to 92% of their original DMG.

 All 20

Lv10

PatrAeon Benefits

Talent

When Guinaifen is on the field, there is a 100% base chance to apply Firekiss to an enemy after their Burn status causes DMG. While inflicted with Firekiss, the enemy receives 7% increased DMG, which lasts for 3 turn(s) and can stack up to 3 time(s).
Hidden Stat: 0
Hidden Stat: 0

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Skill Showcase

Technique

Immediately attacks the enemy. After entering battle, deals DMG for 4 time(s), dealing Fire DMG equal to 50% of Guinaifen's ATK to a random single enemy target each time, with a 100% base chance of inflicting Firekiss on them.

 Single 20


Stat Boosts

 +22.4% Fire DMG Boost
 +24.0% Break Effect
 +10.0% Effect Hit Rate

High Poles

Basic ATK has a 80% base chance of inflicting an enemy with a Burn equivalent to that of Skill.


Bladed Hoop

When the battle begins, Guinaifen's action advances by 25%.


Walking on Knives

Deals 20% more DMG to Burned enemies.



1 Slurping Noodles During Handstand

When Skill is used, there is a 100% base chance to reduce the attacked target enemy's Effect RES by 10% for 2 turn(s).



2 Brushing Teeth While Whistling

When an enemy target is being Burned, the DMG multiplier of the Burn status applied by her Basic ATK or Skill increases by 40%.



3 Smashing Boulder on Chest

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Blocking Pike with Neck

Every time the Burn status inflicted by Guinaifen causes DMG, Guinaifen regenerates 2 Energy.



5 Swallowing Sword to Stomach

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Catching Bullet with Hands

Increases the stackable Firekiss count by 1.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Guinaifen')
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
  } = Source.character('1210')

  const talentDebuffDmgIncreaseValue = talent(e, 0.07, 0.076)
  const talentDebuffMax = (e >= 6) ? 4 : 3

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.20, 1.32)
  const ultScaling = ult(e, 1.20, 1.296)
  const dotScaling = skill(e, 2.182, 2.40)

  const defaults = {
    talentDebuffStacks: talentDebuffMax,
    enemyBurned: true,
    skillDot: true,
    e1EffectResShred: true,
    e2BurnMultiBoost: true,
  }

  const teammateDefaults = {
    talentDebuffStacks: talentDebuffMax,
    e1EffectResShred: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    talentDebuffStacks: {
      id: 'talentDebuffStacks',
      formItem: 'slider',
      text: t('Content.talentDebuffStacks.text'),
      content: t('Content.talentDebuffStacks.content', {
        talentDebuffDmgIncreaseValue: TsUtils.precisionRound(talentDebuffDmgIncreaseValue),
        talentDebuffMax,
      }),
      min: 0,
      max: talentDebuffMax,
    },
    enemyBurned: {
      id: 'enemyBurned',
      formItem: 'switch',
      text: t('Content.enemyBurned.text'),
      content: t('Content.enemyBurned.content'),
    },
    skillDot: {
      id: 'skillDot',
      formItem: 'switch',
      text: t('Content.skillDot.text'),
      content: t('Content.skillDot.content'),
    },
    e1EffectResShred: {
      id: 'e1EffectResShred',
      formItem: 'switch',
      text: t('Content.e1EffectResShred.text'),
      content: t('Content.e1EffectResShred.content'),
      disabled: e < 1,
    },
    e2BurnMultiBoost: {
      id: 'e2BurnMultiBoost',
      formItem: 'switch',
      text: t('Content.e2BurnMultiBoost.text'),
      content: t('Content.e2BurnMultiBoost.content'),
      disabled: e < 2,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    talentDebuffStacks: content.talentDebuffStacks,
    e1EffectResShred: content.e1EffectResShred,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.DOT_ATK_SCALING.buff(dotScaling, SOURCE_SKILL)
      x.DOT_ATK_SCALING.buff((e >= 2 && r.e2BurnMultiBoost) ? 0.40 : 0, SOURCE_E2)

      // Boost
      x.ELEMENTAL_DMG.buff((r.enemyBurned) ? 0.20 : 0, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      x.DOT_CHANCE.set(r.skillDot ? 1.00 : 0.80, r.skillDot ? SOURCE_SKILL : SOURCE_TRACE)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.VULNERABILITY.buffTeam(m.talentDebuffStacks * talentDebuffDmgIncreaseValue, SOURCE_TALENT)
      x.EFFECT_RES_PEN.buffTeam((e >= 1 && m.e1EffectResShred) ? 0.10 : 0, SOURCE_E1)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
  }
}

```

# 1200/Hanya.ts

```ts
import { AbilityType, BASIC_DMG_TYPE, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Oracle Brush

Basic ATK+1+20

Deals Physical DMG equal to 100% of Hanya's ATK to a single enemy.

 Single 10

Lv6

Samsara, Locked

Skill-1+30

Deals Physical DMG equal to 240% of Hanya's ATK to a single target enemy, then applies Burden to them.
For every 2 Basic ATKs, Skills, or Ultimates allies use on an enemy with Burden, allies will immediately recover 1 Skill Point. Burden is only active on the latest target it is applied to, and will be dispelled automatically after the Skill Point recovery effect has been triggered 2 times.

 Single 20

Lv10

Ten-Lords' Decree, All Shall Obey

Ultimate140+5

Increases the SPD of a target ally by 20% of Hanya's SPD and increases the same target ally's ATK by 60%, lasting for 2 turn(s).

Lv10

Sanction

Talent

When an ally uses a Basic ATK, Skill, or Ultimate on an enemy inflicted with Burden, the DMG dealt increases by 30%, lasting for 2 turn(s).

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Netherworld Judgment

Technique

Immediately attacks the enemy. After entering battle, applies Burden equivalent to that applied by the Skill to a random enemy.

 Single 20


Stat Boosts

 +28.0% ATK
 +9.0 SPD
 +10.0% HP

Scrivener

Allies triggering Burden's Skill Point recovery effect have their ATK increased by 10% for 1 turn(s).


Netherworld

If the trigger count for the Burden's Skill Point recovery effect is 1 or lower when an enemy with Burden is defeated, then additionally recovers 1 Skill Point(s).


Reanimated

When Burden's Skill Point recovery effect is triggered, this character regenerates 2 Energy.



1 One Heart

When an ally target with Hanya's Ultimate effect defeats an enemy, Hanya's action advances by 15%. This effect can only be triggered 1 time(s) per turn.



2 Two Views

After using the Skill, this character's SPD increases by 20% for 1 turn(s).



3 Three Temptations

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Four Truths

The Ultimate's duration is additionally extended for 1 turn(s).



5 Five Skandhas

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Six Reverences

Increase the DMG Boost effect of the Talent by an additional 10%.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Hanya')
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
  } = Source.character('1215')

  const ultSpdBuffValue = ult(e, 0.20, 0.21)
  const ultAtkBuffValue = ult(e, 0.60, 0.648)
  let talentDmgBoostValue = talent(e, 0.30, 0.33)

  talentDmgBoostValue += (e >= 6) ? 0.10 : 0

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.40, 2.64)

  const defaults = {
    ultBuff: true,
    targetBurdenActive: true,
    burdenAtkBuff: true,
    e2SkillSpdBuff: false,
  }

  const teammateDefaults = {
    ultBuff: true,
    targetBurdenActive: true,
    burdenAtkBuff: true,
    teammateSPDValue: 160,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultBuff: {
      id: 'ultBuff',
      formItem: 'switch',
      text: t('Content.ultBuff.text'),
      content: t('Content.ultBuff.content', {
        ultSpdBuffValue: TsUtils.precisionRound(100 * ultSpdBuffValue),
        ultAtkBuffValue: TsUtils.precisionRound(100 * ultAtkBuffValue),
      }),
    },
    targetBurdenActive: {
      id: 'targetBurdenActive',
      formItem: 'switch',
      text: t('Content.targetBurdenActive.text'),
      content: t('Content.targetBurdenActive.content', { talentDmgBoostValue: TsUtils.precisionRound(100 * talentDmgBoostValue) }),
    },
    burdenAtkBuff: {
      id: 'burdenAtkBuff',
      formItem: 'switch',
      text: t('Content.burdenAtkBuff.text'),
      content: t('Content.burdenAtkBuff.content'),
    },
    e2SkillSpdBuff: {
      id: 'e2SkillSpdBuff',
      formItem: 'switch',
      text: t('Content.e2SkillSpdBuff.text'),
      content: t('Content.e2SkillSpdBuff.content'),
      disabled: e < 2,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    ultBuff: content.ultBuff,
    teammateSPDValue: {
      id: 'teammateSPDValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateSPDValue.text'),
      content: t('TeammateContent.teammateSPDValue.content', {
        ultSpdBuffValue: TsUtils.precisionRound(100 * ultSpdBuffValue),
        ultAtkBuffValue: TsUtils.precisionRound(100 * ultAtkBuffValue),
      }),
      min: 0,
      max: 300,
    },
    targetBurdenActive: content.targetBurdenActive,
    burdenAtkBuff: content.burdenAtkBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)

      x.SPD_P.buff((e >= 2 && r.e2SkillSpdBuff) ? 0.20 : 0, SOURCE_E2)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.ATK_P.buffTeam((m.burdenAtkBuff) ? 0.10 : 0, SOURCE_TRACE)

      buffAbilityDmg(x, BASIC_DMG_TYPE | SKILL_DMG_TYPE | ULT_DMG_TYPE, (m.targetBurdenActive) ? talentDmgBoostValue : 0, SOURCE_TALENT, Target.TEAM)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const spdBuff = (t.ultBuff) ? ultSpdBuffValue * t.teammateSPDValue : 0
      x.SPD.buffSingle(spdBuff, SOURCE_ULT)
      x.UNCONVERTIBLE_SPD_BUFF.buffSingle(spdBuff, SOURCE_ULT)
      x.ATK_P.buffSingle((t.ultBuff) ? ultAtkBuffValue : 0, SOURCE_ULT)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
    },
    gpuFinalizeCalculations: () => '',
    dynamicConditionals: [
      {
        id: 'HanyaSpdConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.SPD],
        chainsTo: [Stats.SPD],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.ultBuff
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.SPD, Stats.SPD, this, x, action, context, SOURCE_ULT,
            (convertibleValue) => convertibleValue * ultSpdBuffValue,
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.SPD, Stats.SPD, this, action, context,
            `${ultSpdBuffValue} * convertibleValue`,
            `${wgslTrue(r.ultBuff)}`,
          )
        },
      },
    ],
  }
}

```

# 1000/Herta.ts

```ts
import { AbilityType, ASHBLAZING_ATK_STACK, FUA_DMG_TYPE, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { basicAdditionalDmgAtkFinalizer, boostAshblazingAtkP, gpuBoostAshblazingAtkP } from 'lib/conditionals/conditionalFinalizers'
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

What Are You Looking At?

Basic ATK+1+20

Deals Ice DMG equal to 100% of Herta's ATK to a single enemy.

 Single 10

Lv6

One-Time Offer

Skill-1+30

Deals Ice DMG equal to 100% of Herta's ATK to all enemies. If the enemy's HP percentage is 50% or higher, DMG dealt to this target increases by 20%.

 All 10

Lv10

It's Magic, I Added Some Magic

Ultimate110+5

Deals Ice DMG equal to 200% of Herta's ATK to all enemies.

 All 20

Lv10

Fine, I'll Do It Myself

Talent+5

When an ally's attack causes an enemy's HP percentage to fall to 50% or lower, Herta will launch a Follow-up ATK, dealing Ice DMG equal to 40% of Herta's ATK to all enemies.

 All 5

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


It Can Still Be Optimized

Technique

After using her Technique, Herta's ATK increases by 40% for 3 turn(s) at the beginning of the next battle.


Stat Boosts

 +22.4% Ice DMG Boost
 +22.5% DEF
 +6.7% CRIT Rate

Efficiency

When Skill is used, the DMG Boost effect on target enemies increases by an extra 25%.


Puppet

Increases the chance to resist Crowd Control debuffs by 35%.

Crowd Control debuff
Freeze, Entanglement, Imprisonment, Dominated, Outrage, Strong Reverberation, Alien Dream, Snarelock, Terrified.


Icing

When Ultimate is used, deals 20% more DMG to Frozen enemies.



1 Kick You When You're Down

When using Basic ATK, if the designated enemy's HP percentage is at 50% or less, additionally deals Ice Additional DMG equal to 40% of Herta's ATK.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.



2 Keep the Ball Rolling

Every time Talent is triggered, this character's CRIT Rate increases by 3%. This effect can stack up to 5 time(s).



3 That's the Kind of Girl I Am

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Hit Where It Hurts

When Talent is triggered, DMG increases by 10%.



5 Cuss Big or Cuss Nothing

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 No One Can Betray Me

After using Ultimate, this character's ATK increases by 25% for 1 turn(s).
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Herta')
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
  } = Source.character('1013')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.00, 2.16)
  const fuaScaling = talent(e, 0.40, 0.43)

  function getHitMultiByTargetsAndHits(hits: number, context: OptimizerContext) {
    const div = 1 / hits

    if (context.enemyCount == 1) {
      let stacks = 1
      let multi = 0
      for (let i = 0; i < hits; i++) {
        multi += div * stacks
        stacks = Math.min(8, stacks + 1)
      }
      return multi
    }

    if (context.enemyCount == 3) {
      let stacks = 2
      let multi = 0
      for (let i = 0; i < hits; i++) {
        multi += div * stacks
        stacks = Math.min(8, stacks + 3)
      }
      return multi
    }

    if (context.enemyCount == 5) {
      let stacks = 3
      let multi = 0
      for (let i = 0; i < hits; i++) {
        multi += div * stacks
        stacks = Math.min(8, stacks + 5)
      }
      return multi
    }

    return 1
  }

  function getHitMulti(action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals as Conditionals<typeof content>

    const hitMultiStacks = getHitMultiByTargetsAndHits(r.fuaStacks, context)
    const hitMultiByTargets: NumberToNumberMap = {
      1: ASHBLAZING_ATK_STACK * hitMultiStacks,
      3: ASHBLAZING_ATK_STACK * hitMultiStacks,
      5: ASHBLAZING_ATK_STACK * hitMultiStacks,
    }

    return hitMultiByTargets[context.enemyCount]
  }

  const defaults = {
    fuaStacks: 5,
    techniqueBuff: false,
    targetFrozen: true,
    e2TalentCritStacks: 5,
    e6UltAtkBuff: true,
    enemyHpGte50: true,
    enemyHpLte50: false,
  }

  const content: ContentDefinition<typeof defaults> = {
    fuaStacks: {
      id: 'fuaStacks',
      formItem: 'slider',
      text: t('Content.fuaStacks.text'),
      content: t('Content.fuaStacks.content'),
      min: 1,
      max: 5,
    },
    targetFrozen: {
      id: 'targetFrozen',
      formItem: 'switch',
      text: t('Content.targetFrozen.text'),
      content: t('Content.targetFrozen.content'),
    },
    enemyHpGte50: {
      id: 'enemyHpGte50',
      formItem: 'switch',
      text: t('Content.enemyHpGte50.text'),
      content: t('Content.enemyHpGte50.content'),
    },
    techniqueBuff: {
      id: 'techniqueBuff',
      formItem: 'switch',
      text: t('Content.techniqueBuff.text'),
      content: t('Content.techniqueBuff.content'),
    },
    enemyHpLte50: {
      id: 'enemyHpLte50',
      formItem: 'switch',
      text: t('Content.enemyHpLte50.text'),
      content: t('Content.enemyHpLte50.content'),
      disabled: e < 1,
    },
    e2TalentCritStacks: {
      id: 'e2TalentCritStacks',
      formItem: 'slider',
      text: t('Content.e2TalentCritStacks.text'),
      content: t('Content.e2TalentCritStacks.content'),
      min: 0,
      max: 5,
      disabled: e < 2,
    },
    e6UltAtkBuff: {
      id: 'e6UltAtkBuff',
      formItem: 'switch',
      text: t('Content.e6UltAtkBuff.text'),
      content: t('Content.e6UltAtkBuff.content'),
      disabled: e < 6,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.ATK_P.buff((r.techniqueBuff) ? 0.40 : 0, SOURCE_TECHNIQUE)
      x.CR.buff((e >= 2) ? r.e2TalentCritStacks * 0.03 : 0, SOURCE_E2)
      x.ATK_P.buff((e >= 6 && r.e6UltAtkBuff) ? 0.25 : 0, SOURCE_E6)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.BASIC_ADDITIONAL_DMG_SCALING.buff((e >= 1 && r.enemyHpLte50) ? 0.40 : 0, SOURCE_E1)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_ATK_SCALING.buff(fuaScaling * r.fuaStacks, SOURCE_TALENT)

      buffAbilityDmg(x, SKILL_DMG_TYPE, (r.enemyHpGte50) ? 0.20 : 0, SOURCE_SKILL)

      // Boost
      buffAbilityDmg(x, ULT_DMG_TYPE, (r.targetFrozen) ? 0.20 : 0, SOURCE_ULT)
      buffAbilityDmg(x, FUA_DMG_TYPE, (e >= 4) ? 0.10 : 0, SOURCE_E4)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(10, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(5 * r.fuaStacks, SOURCE_TALENT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkP(x, action, context, getHitMulti(action, context))
      basicAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => gpuBoostAshblazingAtkP(getHitMulti(action, context)),
  }
}

```

# 1000/Himeko.ts

```ts
import { AbilityType, ASHBLAZING_ATK_STACK, SKILL_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
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

Sawblade Tuning

Basic ATK+1+20

Deals Fire DMG equal to 100% of Himeko's ATK to a single enemy.

 Single 10

Lv6

Molten Detonation

Skill-1+30

Deals Fire DMG equal to 200% of Himeko's ATK to a single enemy and Fire DMG equal to 80% of Himeko's ATK to enemies adjacent to it.

 Single 20 | Other 10

Lv10

Heavenly Flare

Ultimate120+5

Deals Fire DMG equal to 230% of Himeko's ATK to all enemies. Himeko regenerates 5 extra Energy for each enemy defeated.

 All 20

Lv10

Victory Rush

Talent+10

When an enemy is inflicted with Weakness Break, Himeko gains 1 point of Charge (max 3 points).
If Himeko is fully Charged when an ally performs an attack, Himeko immediately performs 1 Follow-up ATK and deals Fire DMG equal to 140% of her ATK to all enemies, consuming all Charge points.
At the start of the battle, Himeko gains 1 point of Charge.

 All 10

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Incomplete Combustion

Technique

After using Technique, creates a Special Dimension that lasts for 15 second(s). After entering battle with enemies in the Special Dimension, there is a 100% base chance to increase Fire DMG taken by enemies by 10% for 2 turn(s). Only 1 Dimension Effect created by allies can exist at the same time.


Stat Boosts

 +22.4% Fire DMG Boost
 +18.0% ATK
 +10.0% Effect RES

Starfire

After using an attack, there is a 50% base chance to inflict Burn on enemies, lasting for 2 turn(s).
When afflicted with Burn, enemies take Fire DoT equal to 30% of Himeko's ATK at the start of each turn.


Magma

Skill deals 20% more DMG to enemies currently afflicted with Burn.


Benchmark

When current HP percentage is 80% or higher, CRIT Rate increases by 15%.



1 Childhood

After "Victory Rush" is triggered, Himeko's SPD increases by 20% for 2 turn(s).



2 Convergence

Deals 15% more DMG to enemies whose HP percentage is 50% or less.



3 Poised

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Dedication

When Himeko's Skill inflicts Weakness Break on an enemy, she gains 1 extra point(s) of Charge.



5 Aspiration

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Trailblaze!

Ultimate deals 2 extra instances of Fire DMG equal to 40% of the original DMG to one random enemy.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Himeko')
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
  } = Source.character('1003')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)
  const ultScaling = ult(e, 2.30, 2.484)
  const fuaScaling = talent(e, 1.40, 1.54)
  const dotScaling = 0.30

  const hitMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.20 + 2 * 0.20 + 3 * 0.20 + 4 * 0.40), // 0.168
    3: ASHBLAZING_ATK_STACK * (2 * 0.20 + 5 * 0.20 + 8 * 0.20 + 8 * 0.40), // 0.372
    5: ASHBLAZING_ATK_STACK * (3 * 0.20 + 8 * 0.20 + 8 * 0.20 + 8 * 0.40), // 0.42
  }

  const defaults = {
    targetBurned: true,
    selfCurrentHp80Percent: true,
    e1TalentSpdBuff: false,
    e2EnemyHp50DmgBoost: true,
    e6UltExtraHits: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    targetBurned: {
      id: 'targetBurned',
      formItem: 'switch',
      text: t('Content.targetBurned.text'),
      content: t('Content.targetBurned.content'),
    },
    selfCurrentHp80Percent: {
      id: 'selfCurrentHp80Percent',
      formItem: 'switch',
      text: t('Content.selfCurrentHp80Percent.text'),
      content: t('Content.selfCurrentHp80Percent.content'),
    },
    e1TalentSpdBuff: {
      id: 'e1TalentSpdBuff',
      formItem: 'switch',
      text: t('Content.e1TalentSpdBuff.text'),
      content: t('Content.e1TalentSpdBuff.content'),
      disabled: e < 1,
    },
    e2EnemyHp50DmgBoost: {
      id: 'e2EnemyHp50DmgBoost',
      formItem: 'switch',
      text: t('Content.e2EnemyHp50DmgBoost.text'),
      content: t('Content.e2EnemyHp50DmgBoost.content'),
      disabled: e < 2,
    },
    e6UltExtraHits: {
      id: 'e6UltExtraHits',
      formItem: 'slider',
      text: t('Content.e6UltExtraHits.text'),
      content: t('Content.e6UltExtraHits.content'),
      min: 0,
      max: 2,
      disabled: e < 6,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA, AbilityType.DOT],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.CR.buff((r.selfCurrentHp80Percent) ? 0.15 : 0, SOURCE_TRACE)
      x.SPD_P.buff((e >= 1 && r.e1TalentSpdBuff) ? 0.20 : 0, SOURCE_E1)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.ULT_ATK_SCALING.buff((e >= 6) ? r.e6UltExtraHits * ultScaling * 0.40 : 0, SOURCE_E6)
      x.FUA_ATK_SCALING.buff(fuaScaling, SOURCE_TALENT)
      x.DOT_ATK_SCALING.buff(dotScaling, SOURCE_TRACE)

      // Boost
      buffAbilityDmg(x, SKILL_DMG_TYPE, (r.targetBurned) ? 0.20 : 0, SOURCE_TRACE)
      x.ELEMENTAL_DMG.buff((e >= 2 && r.e2EnemyHp50DmgBoost) ? 0.15 : 0, SOURCE_E2)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(10, SOURCE_TALENT)

      x.DOT_CHANCE.set(0.50, SOURCE_TRACE)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkP(x, action, context, hitMultiByTargets[context.enemyCount])
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => gpuBoostAshblazingAtkP(hitMultiByTargets[context.enemyCount]),
  }
}

```

# 1100/Hook.ts

```ts
import { AbilityType, SKILL_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardAdditionalDmgAtkFinalizer, standardAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Hehe! Don't Get Burned!

Basic ATK+1+20

Deals Fire DMG equal to 100% of Hook's ATK to a single enemy.

 Single 10

Lv6

Hey! Remember Hook?

Skill-1+30

Deals Fire DMG equal to 240% of Hook's ATK to a single enemy. In addition, there is a 100% base chance to inflict Burn for 2 turn(s).
When afflicted with Burn, enemies will take Fire DoT equal to 65% of Hook's ATK at the beginning of each turn.

 Single 20

Lv10

Boom! Here Comes the Fire!

Ultimate120+5

Deals Fire DMG equal to 400% of Hook's ATK to a single enemy.
After using Ultimate, the next Skill to be used is Enhanced, which deals DMG to a single enemy and enemies adjacent to it.

 Single 30

Lv10

Ha! Oil to the Flames!

Talent

When attacking a target afflicted with Burn, deals Fire Additional DMG equal to 100% of Hook's ATK and regenerates 5 extra Energy.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Ack! Look at This Mess!

Technique

Immediately attacks the enemy. Upon entering battle, Hook deals Fire DMG equal to 50% of her ATK to a random enemy. In addition, there is a 100% base chance to inflict Burn on every enemy for 3 turn(s).
When afflicted with Burn, enemies will take Fire DoT equal to 50% of Hook's ATK at the beginning of each turn.

 Single 20


Hey! Remember Hook?

Skill-1+30

Deals Fire DMG equal to 280% of Hook's ATK to a single enemy, with a 100% base chance to Burn them for 2 turn(s). Additionally, deals Fire DMG equal to 80% of Hook's ATK to enemies adjacent to it.
When afflicted with Burn, enemies will take Fire DoT equal to 65% of Hook's ATK at the beginning of each turn.

 Single 20 | Other 10

Lv10

Stat Boosts

 +28.0% ATK
 +18.0% HP
 +13.3% CRIT DMG

Innocence

Hook restores HP equal to 5% of her Max HP whenever her Talent is triggered.


Naivete

Increases the chance to resist Crowd Control debuffs by 35%.

Crowd Control debuff
Freeze, Entanglement, Imprisonment, Dominated, Outrage, Strong Reverberation, Alien Dream, Snarelock, Terrified.


Playing With Fire

After using her Ultimate, Hook has her action advanced by 20% and additionally regenerates 5 Energy.



1 Early to Bed, Early to Rise

Enhanced Skill deals 20% increased DMG.



2 Happy Tummy, Happy Body

Extends the duration of Burn caused by Skill by 1 turn(s).



3 Don't Be Picky, Nothing's Icky

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 It's Okay to Not Know

When Talent is triggered, there is a 100% base chance to Burn enemies adjacent to the designated enemy target, equivalent to that of Skill.



5 Let the Moles' Deeds Be Known

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Always Ready to Punch and Kick

Hook deals 20% more DMG to enemies afflicted with Burn.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Hook')
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
  } = Source.character('1109')

  const targetBurnedExtraScaling = talent(e, 1.00, 1.10)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.40, 2.64)
  const skillEnhancedScaling = skill(e, 2.80, 3.08)
  const ultScaling = ult(e, 4.00, 4.32)
  const dotScaling = skill(e, 0.65, 0.715)

  const defaults = {
    enhancedSkill: true,
    targetBurned: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedSkill: {
      id: 'enhancedSkill',
      formItem: 'switch',
      text: t('Content.enhancedSkill.text'),
      content: t('Content.enhancedSkill.content', { skillEnhancedScaling: TsUtils.precisionRound(100 * skillEnhancedScaling) }),
    },
    targetBurned: {
      id: 'targetBurned',
      formItem: 'switch',
      text: t('Content.targetBurned.text'),
      content: t('Content.targetBurned.content', { targetBurnedExtraScaling: TsUtils.precisionRound(100 * targetBurnedExtraScaling) }),
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff((r.enhancedSkill) ? skillEnhancedScaling : skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.BASIC_ADDITIONAL_DMG_SCALING.buff((r.targetBurned) ? targetBurnedExtraScaling : 0, SOURCE_TALENT)
      x.SKILL_ADDITIONAL_DMG_SCALING.buff((r.targetBurned) ? targetBurnedExtraScaling : 0, SOURCE_TALENT)
      x.ULT_ADDITIONAL_DMG_SCALING.buff((r.targetBurned) ? targetBurnedExtraScaling : 0, SOURCE_TALENT)
      x.DOT_ATK_SCALING.buff(dotScaling, SOURCE_SKILL)

      // Boost
      buffAbilityDmg(x, SKILL_DMG_TYPE, (e >= 1 && r.enhancedSkill) ? 0.20 : 0, SOURCE_E1)
      x.ELEMENTAL_DMG.buff((e >= 6 && r.targetBurned) ? 0.20 : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)

      x.DOT_CHANCE.set(1.00, SOURCE_SKILL)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: () => {
      return gpuStandardAdditionalDmgAtkFinalizer()
    },
  }
}

```

# 1200/Huohuo.ts

```ts
import { AbilityType, NONE_TYPE, SKILL_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardHpHealFinalizer, standardHpHealFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Banner: Stormcaller

Basic ATK+1+20

Deals Wind DMG equal to 50% of Huohuo's Max HP to a target enemy.

 Single 10

Lv6

Talisman: Protection

Skill-1+30

Dispels 1 debuff(s) from a single target ally and immediately restores this ally's HP by an amount equal to 21% of Huohuo's Max HP plus 560. At the same time, restores HP for allies that are adjacent to this target ally by an amount equal to 16.8% of Huohuo's Max HP plus 448.

Lv10

Tail: Spiritual Domination

Ultimate140+5

Regenerates Energy for all teammates (i.e., excluding this unit) by an amount equal to 20% of their respective Max Energy. At the same time, increases their ATK by 40% for 2 turn(s).

Lv10

Possession: Ethereal Metaflow

Talent

After using her Skill, Huohuo gains Divine Provision, lasting for 2 turn(s). This duration decreases by 1 turn at the start of Huohuo's every turn. If Huohuo has Divine Provision when an ally's turn starts or when an ally uses their Ultimate, restores HP for that ally by an amount equal to 4.5% of Huohuo's Max HP plus 120. At the same time, every ally with 50% HP percentage or lower receives healing once.
When Divine Provision is triggered to heal an ally, dispel 1 debuff(s) from that ally. This effect can be triggered up to 6 time(s). Using the skill again resets the effect's trigger count.
Hidden Stat: 0

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Fiend: Impeachment of Evil

Technique

Huohuo terrorizes surrounding enemies, afflicting Horror-Struck on them. Enemies in Horror-Struck will flee away from Huohuo for 10 second(s). When entering battle with enemies in Horror-Struck, there is a 100% base chance of reducing every single enemy's ATK by 25% for 2 turn(s).


Stat Boosts

 +28.0% HP
 +18.0% Effect RES
 +5.0 SPD

Fearful to Act

When battle starts, Huohuo gains Divine Provision, lasting for 1 turn(s).


The Cursed One

Increases the chance to resist Crowd Control debuffs by 35%.

Crowd Control debuff
Freeze, Entanglement, Imprisonment, Dominated, Outrage, Strong Reverberation, Alien Dream, Snarelock, Terrified.


Stress Reaction to Horror

When her Talent is triggered to heal allies, Huohuo regenerates 1 Energy.



1 Anchored to Vessel, Specters Nestled

The duration of Divine Provision produced by the Talent is extended by 1 turn(s). When Huohuo possesses Divine Provision, all allies' SPD increases by 12%.



2 Sealed in Tail, Wraith Subdued

If Huohuo possesses "Divine Provision" when an ally target is struck by a killing blow, the ally will not be knocked down and their HP will immediately be restored by an amount equal to 50% of their Max HP. This reduces the duration of "Divine Provision" by 1 turn. This effect can only be triggered 2 time(s) per battle.



3 Cursed by Fate, Moths to Flame

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Tied in Life, Bound to Strife

When healing a target ally via Skill or Talent, the less HP the target ally currently has, the higher the amount of healing they will receive. The maximum increase in healing provided by Huohuo is 80%.



5 Mandated by Edict, Evils Evicted

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Woven Together, Cohere Forever

When healing a target ally, increases the target ally's DMG dealt by 50% for 2 turn(s).
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Huohuo')
  const tHeal = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealAbility')
  const { basic, ult, skill, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5
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
  } = Source.character('1217')

  const ultBuffValue = ult(e, 0.40, 0.432)
  const basicScaling = basic(e, 0.50, 0.55)

  const skillHealScaling = talent(e, 0.21, 0.224)
  const skillHealFlat = talent(e, 560, 623)

  const talentHealScaling = skill(e, 0.045, 0.048)
  const talentHealFlat = skill(e, 120, 133.5)

  const defaults = {
    healAbility: NONE_TYPE,
    ultBuff: true,
    skillBuff: true,
    e6DmgBuff: true,
  }

  const teammateDefaults = {
    ultBuff: true,
    skillBuff: true,
    e6DmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    healAbility: {
      id: 'healAbility',
      formItem: 'select',
      text: tHeal('Text'),
      content: tHeal('Content'),
      options: [
        {
          display: tHeal('Skill'),
          value: SKILL_DMG_TYPE,
          label: tHeal('Skill'),
        },
        {
          display: tHeal('Talent'),
          value: 0,
          label: tHeal('Talent'),
        },
      ],
      fullWidth: true,
    },
    ultBuff: {
      id: 'ultBuff',
      formItem: 'switch',
      text: t('Content.ultBuff.text'),
      content: t('Content.ultBuff.content', { ultBuffValue: TsUtils.precisionRound(100 * ultBuffValue) }),
    },
    skillBuff: {
      id: 'skillBuff',
      formItem: 'switch',
      text: t('Content.skillBuff.text'),
      content: t('Content.skillBuff.content'),
      disabled: e < 1,
    },
    e6DmgBuff: {
      id: 'e6DmgBuff',
      formItem: 'switch',
      text: t('Content.e6DmgBuff.text'),
      content: t('Content.e6DmgBuff.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    ultBuff: content.ultBuff,
    skillBuff: content.skillBuff,
    e6DmgBuff: content.e6DmgBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Scaling
      x.BASIC_HP_SCALING.buff(basicScaling, SOURCE_BASIC)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)

      if (r.healAbility == SKILL_DMG_TYPE) {
        x.HEAL_TYPE.set(SKILL_DMG_TYPE, SOURCE_SKILL)
        x.HEAL_SCALING.buff(skillHealScaling, SOURCE_SKILL)
        x.HEAL_FLAT.buff(skillHealFlat, SOURCE_SKILL)
      }
      if (r.healAbility == NONE_TYPE) {
        x.HEAL_TYPE.set(NONE_TYPE, SOURCE_TALENT)
        x.HEAL_SCALING.buff(talentHealScaling, SOURCE_TALENT)
        x.HEAL_FLAT.buff(talentHealFlat, SOURCE_TALENT)
      }

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.ATK_P.buffTeam((m.ultBuff) ? ultBuffValue : 0, SOURCE_ULT)
      x.SPD_P.buffTeam((e >= 1 && m.skillBuff) ? 0.12 : 0, SOURCE_E1)

      x.ELEMENTAL_DMG.buffTeam((e >= 6 && m.e6DmgBuff) ? 0.50 : 0, SOURCE_E6)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardHpHealFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardHpHealFinalizer(),
  }
}

```

# 1200/ImbibitorLunae.ts

```ts
import { AbilityType, BASIC_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityResPen } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Beneficent Lotus

Basic ATK+1+20

Uses a 2-hit attack and deals Imaginary DMG equal to 100% of Dan Heng • Imbibitor Lunae's ATK to a single enemy target.

 Single 10

Lv6

Transcendence

Basic ATK-1+30

Uses a 3-hit attack and deals Imaginary DMG equal to 260% of Dan Heng • Imbibitor Lunae's ATK to a single enemy target.

 Single 20

Lv6

Divine Spear

Basic ATK-2+35

Uses a 5-hit attack and deals Imaginary DMG equal to 380% of Dan Heng • Imbibitor Lunae's ATK to a single enemy target. From the fourth hit onward, simultaneously deals Imaginary DMG equal to 60% of Dan Heng • Imbibitor Lunae's ATK to adjacent targets.

 Single 30 | Other 10

Lv6

Fulgurant Leap

Basic ATK-3+40

Uses a 7-hit attack and deals Imaginary DMG equal to 500% of Dan Heng • Imbibitor Lunae's ATK to a single enemy target. From the fourth hit onward, simultaneously deal Imaginary DMG equal to 180% of Dan Heng • Imbibitor Lunae's ATK to adjacent targets.

 Single 40 | Other 20

Lv6

Dracore Libre

Skill

Enhances Basic ATK. Enhancements may be applied up to 3 times consecutively. Using this ability does not consume Skill Points and is not considered as using a Skill.
Enhanced once, Beneficent Lotus becomes Transcendence.
Enhanced twice, Beneficent Lotus becomes Divine Spear.
Enhanced thrice, Beneficent Lotus becomes Fulgurant Leap.
When using Divine Spear or Fulgurant Leap, starting from the fourth hit, 1 stack of Outroar is gained before every hit. Each stack of Outroar increases Dan Heng • Imbibitor Lunae's CRIT DMG by 12%, for a max of 4 stacks. These stacks last until the end of his turn.

Lv10

Azure's Aqua Ablutes All

Ultimate140+5

Uses a 3-hit attack and deals Imaginary DMG equal to 300% of Dan Heng • Imbibitor Lunae's ATK to a single enemy target. At the same time, deals Imaginary DMG equal to 140% of Dan Heng • Imbibitor Lunae's ATK to adjacent targets. Then, obtains 2 Squama Sacrosancta.
It's possible to hold up to 3 Squama Sacrosancta, which can be used to offset Dan Heng • Imbibitor Lunae's consumption of skill points. Consuming Squama Sacrosancta is considered equivalent to consuming skill points.

 Single 20 | Other 20

Lv10

Righteous Heart

Talent

After each hit dealt during an attack, Dan Heng • Imbibitor Lunae gains 1 stack of Righteous Heart, increasing his DMG by 10%. This effect can stack up to 6 time(s), lasting until the end of his turn.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Heaven-Quelling Prismadrakon

Technique

After using his Technique, Dan Heng • Imbibitor Lunae enters the Leaping Dragon state for 20 seconds. While in the Leaping Dragon state, using his attack enables him to move forward rapidly for a set distance, attacking all enemies he touches and blocking all incoming attacks. After entering combat via attacking enemies in the Leaping Dragon state, Dan Heng • Imbibitor Lunae deals Imaginary DMG equal to 120% of his ATK to all enemies, and gains 1 Squama Sacrosancta.


Cancel

Skill

Cancel Enhancement


Stat Boosts

 +22.4% Imaginary DMG Boost
 +12.0% CRIT Rate
 +10.0% HP

Star Veil

At the start of the battle, immediately regenerates 15 Energy.


Aqua Reign

Increases the chance to resist Crowd Control debuffs by 35%.

Crowd Control debuff
Freeze, Entanglement, Imprisonment, Dominated, Outrage, Strong Reverberation, Alien Dream, Snarelock, Terrified.


Jolt Anew

When dealing DMG to enemy targets with Imaginary Weakness, CRIT DMG increases by 24%.



1 Tethered to Sky

Increases the stackable Righteous Heart count by 4, and gains 1 extra stack of Righteous Heart for each hit during an attack.



2 Imperium On Cloud Nine

After using his Ultimate, Dan Heng • Imbibitor Lunae's action advances by 100% and gains 1 extra "Squama Sacrosancta."



3 Clothed in Clouds

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Zephyr's Bliss

The buff effect granted by "Outroar" lasts until the end of this unit's next turn.



5 Fall is the Pride

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Reign, Returned

After another ally character uses their Ultimate, the Imaginary RES PEN of Dan Heng • Imbibitor Lunae's next "Fulgurant Leap" attack increases by 20%. This effect can stack up to 3 time(s).
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.ImbibitorLunae')
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
  } = Source.character('1213')

  const righteousHeartStackMax = (e >= 1) ? 10 : 6
  const outroarStackCdValue = skill(e, 0.12, 0.132)
  const righteousHeartDmgValue = talent(e, 0.10, 0.11)

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhanced1Scaling = basic(e, 2.60, 2.86)
  const basicEnhanced2Scaling = basic(e, 3.80, 4.18)
  const basicEnhanced3Scaling = basic(e, 5.00, 5.50)
  const ultScaling = ult(e, 3.00, 3.24)

  const defaults = {
    basicEnhanced: 3,
    skillOutroarStacks: 4,
    talentRighteousHeartStacks: righteousHeartStackMax,
    e6ResPenStacks: 3,
  }

  const content: ContentDefinition<typeof defaults> = {
    basicEnhanced: {
      id: 'basicEnhanced',
      formItem: 'slider',
      text: t('Content.basicEnhanced.text'),
      content: t('Content.basicEnhanced.content', {
        basicScaling: TsUtils.precisionRound(100 * basicScaling),
        basicEnhanced1Scaling: TsUtils.precisionRound(100 * basicEnhanced1Scaling),
        basicEnhanced2Scaling: TsUtils.precisionRound(100 * basicEnhanced2Scaling),
        basicEnhanced3Scaling: TsUtils.precisionRound(100 * basicEnhanced3Scaling),
      }),
      min: 0,
      max: 3,
    },
    skillOutroarStacks: {
      id: 'skillOutroarStacks',
      formItem: 'slider',
      text: t('Content.skillOutroarStacks.text'),
      content: t('Content.skillOutroarStacks.content', { outroarStackCdValue: TsUtils.precisionRound(100 * outroarStackCdValue) }),
      min: 0,
      max: 4,
    },
    talentRighteousHeartStacks: {
      id: 'talentRighteousHeartStacks',
      formItem: 'slider',
      text: t('Content.talentRighteousHeartStacks.text'),
      content: t('Content.talentRighteousHeartStacks.content', { righteousHeartDmgValue: TsUtils.precisionRound(100 * righteousHeartDmgValue) }),
      min: 0,
      max: righteousHeartStackMax,
    },
    e6ResPenStacks: {
      id: 'e6ResPenStacks',
      formItem: 'slider',
      text: t('Content.e6ResPenStacks.text'),
      content: t('Content.e6ResPenStacks.content'),
      min: 0,
      max: 3,
      disabled: e < 6,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.CD.buff((context.enemyElementalWeak) ? 0.24 : 0, SOURCE_TRACE)
      x.CD.buff(r.skillOutroarStacks * outroarStackCdValue, SOURCE_SKILL)

      // Scaling
      const basicScalingValue = {
        0: basicScaling,
        1: basicEnhanced1Scaling,
        2: basicEnhanced2Scaling,
        3: basicEnhanced3Scaling,
      }[r.basicEnhanced] ?? 0
      x.BASIC_ATK_SCALING.buff(basicScalingValue, SOURCE_BASIC)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      // Boost
      x.ELEMENTAL_DMG.buff(r.talentRighteousHeartStacks * righteousHeartDmgValue, SOURCE_TALENT)
      buffAbilityResPen(x, BASIC_DMG_TYPE, (e >= 6 && r.basicEnhanced == 3) ? 0.20 * r.e6ResPenStacks : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff(10 + 10 * r.basicEnhanced, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
  }
}

```

# 1300/Jade.ts

```ts
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

Lash of Riches

Basic ATK+1+20

Deals Quantum DMG equal to 90% of Jade's ATK to a single target enemy, and Quantum DMG equal to 30% of Jade's ATK to adjacent enemies.

 Single 10 | Other 5

Lv6

Acquisition Surety

Skill-1+30

Makes a single target ally become the Debt Collector and increases their SPD by 30, lasting for 3 turn(s).
After the Debt Collector attacks, deals 1 instance of Quantum Additional DMG equal to 25% of Jade's ATK to each enemy target hit, and consumes the Debt Collector's HP by an amount equal to 2% of their Max HP. If the current HP is insufficient, reduces HP to 1.
If Jade becomes the Debt Collector, she cannot gain the SPD boost effect, and her attacks do not consume HP.
When the Debt Collector exists on the field, Jade cannot use her Skill. At the start of Jade's every turn, the Debt Collector's duration decreases by 1 turn.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

Lv10

Vow of the Deep

Ultimate140+5

Deals Quantum DMG equal to 240% of Jade's ATK to all enemies. At the same time, Jade enhances her Talent's Follow-up ATK, increasing its DMG multiplier by 80%. This enhancement can take effect 2 time(s).

 All 20

Lv10

Fang of Flare Flaying

Talent+10

After Jade or the Debt Collector unit attacks, gains 1 point of Charge for each enemy target hit. Upon reaching 8 points of Charge, consumes the 8 points to launch 1 instance of Follow-up ATK, dealing Quantum DMG equal to 120% of Jade's ATK to all enemies. This Follow-up ATK does not generate Charge.
When launching her Talent's Follow-up ATK, Jade immediately gains 5 stack(s) of Pawned Asset, with each stack increasing CRIT DMG by 2.4%, stacking up to 50 times.

 All 10

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Visionary Predation

Technique

After using the Technique, inflicts enemies within a set area with Blind Fealty for 10 second(s). Enemies inflicted with Blind Fealty will not initiate attacks on allies. When entering battle via actively attacking enemies inflicted with Blind Fealty, all enemies with Blind Fealty will enter combat simultaneously. After entering battle, deals Quantum DMG equal to 50% of Jade's ATK to all enemies, and immediately gains 15 stack(s) of Pawned Asset.


Stat Boosts

 +22.4% Quantum DMG Boost
 +18.0% ATK
 +10.0% Effect RES

Reverse Repo

When an enemy target enters combat, Jade gains 1 stack(s) of Pawned Asset. When the Debt Collector character's turn starts, additionally gains 3 stack(s) of Pawned Asset.


Collateral Ticket

When the battle starts, action advances Jade by 50%.


Asset Forfeiture

Each Pawned Asset stack from the Talent additionally increases Jade's ATK by 0.5%.



1 Altruism? Nevertheless Tradable

The Follow-up ATK DMG from Jade's Talent increases by 32%. After the "Debt Collector" character attacks and the number of the enemy target(s) hit is either 2 or 1, Jade additionally gains 1 or 2 point(s) of Charge respectively.



2 Morality? Herein Authenticated

When there are 15 stacks of Pawned Asset, Jade's CRIT Rate increases by 18%.



3 Honesty? Soon Mortgaged

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Sincerity? Put Option Only

When using Ultimate, enables the DMG dealt by Jade to ignore 12% of enemy targets' DEF, lasting for 3 turn(s).



5 Hope? Hitherto Forfeited

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Equity? Pending Sponsorship

While the "Debt Collector" character exists on the field, Jade's Quantum RES PEN increases by 20%, and Jade gains the "Debt Collector" state.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Jade')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('1314')

  const basicScaling = basic(e, 0.90, 0.99)
  // Assuming jade is not the debt collector - skill disabled
  const skillScaling = skill(e, 0.25, 0.27)
  const ultScaling = ult(e, 2.40, 2.64)
  const ultFuaScalingBuff = ult(e, 0.80, 0.88)
  const fuaScaling = talent(e, 1.20, 1.32)
  const pawnedAssetCdScaling = talent(e, 0.024, 0.0264)

  const unenhancedHitMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.25 + 2 * 0.25 + 3 * 0.25 + 4 * 0.25), // 0.15
    3: ASHBLAZING_ATK_STACK * (2 * 0.25 + 5 * 0.25 + 8 * 0.25 + 8 * 0.25), // 0.345
    5: ASHBLAZING_ATK_STACK * (3 * 0.25 + 8 * 0.25 + 8 * 0.25 + 8 * 0.25), // 0.405
  }

  const enhancedHitMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.10 + 2 * 0.10 + 3 * 0.10 + 4 * 0.10 + 5 * 0.60), // 0.24
    3: ASHBLAZING_ATK_STACK * (2 * 0.10 + 5 * 0.10 + 8 * 0.10 + 8 * 0.10 + 8 * 0.60), // 0.426
    5: ASHBLAZING_ATK_STACK * (3 * 0.10 + 8 * 0.10 + 8 * 0.10 + 8 * 0.10 + 8 * 0.60), // 0.45
  }

  function getHitMulti(action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals as Conditionals<typeof content>
    return r.enhancedFollowUp
      ? enhancedHitMultiByTargets[context.enemyCount]
      : unenhancedHitMultiByTargets[context.enemyCount]
  }

  const defaults = {
    enhancedFollowUp: true,
    pawnedAssetStacks: 50,
    e1FuaDmgBoost: true,
    e2CrBuff: true,
    e4DefShredBuff: true,
    e6ResShredBuff: true,
  }

  const teammateDefaults = {
    debtCollectorSpdBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedFollowUp: {
      id: 'enhancedFollowUp',
      formItem: 'switch',
      text: t('Content.enhancedFollowUp.text'),
      content: t('Content.enhancedFollowUp.content', { ultFuaScalingBuff: TsUtils.precisionRound(100 * ultFuaScalingBuff) }),
    },
    pawnedAssetStacks: {
      id: 'pawnedAssetStacks',
      formItem: 'slider',
      text: t('Content.pawnedAssetStacks.text'),
      content: t('Content.pawnedAssetStacks.content', { pawnedAssetCdScaling: TsUtils.precisionRound(100 * pawnedAssetCdScaling) }),
      min: 0,
      max: 50,
    },
    e1FuaDmgBoost: {
      id: 'e1FuaDmgBoost',
      formItem: 'switch',
      text: t('Content.e1FuaDmgBoost.text'),
      content: t('Content.e1FuaDmgBoost.content'),
      disabled: e < 1,
    },
    e2CrBuff: {
      id: 'e2CrBuff',
      formItem: 'switch',
      text: t('Content.e2CrBuff.text'),
      content: t('Content.e2CrBuff.content'),
      disabled: e < 2,
    },
    e4DefShredBuff: {
      id: 'e4DefShredBuff',
      formItem: 'switch',
      text: t('Content.e4DefShredBuff.text'),
      content: t('Content.e4DefShredBuff.content'),
      disabled: e < 4,
    },
    e6ResShredBuff: {
      id: 'e6ResShredBuff',
      formItem: 'switch',
      text: t('Content.e6ResShredBuff.text'),
      content: t('Content.e6ResShredBuff.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    debtCollectorSpdBuff: {
      id: 'debtCollectorSpdBuff',
      formItem: 'switch',
      text: t('TeammateContent.debtCollectorSpdBuff.text'),
      content: t('TeammateContent.debtCollectorSpdBuff.content'),
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => (teammateDefaults),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.CD.buff(r.pawnedAssetStacks * pawnedAssetCdScaling, SOURCE_TALENT)
      x.ATK_P.buff(r.pawnedAssetStacks * 0.005, SOURCE_TRACE)
      x.CR.buff((e >= 2 && r.e2CrBuff && r.pawnedAssetStacks >= 15) ? 0.18 : 0, SOURCE_E2)

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_ATK_SCALING.buff(fuaScaling, SOURCE_TALENT)
      x.FUA_ATK_SCALING.buff((r.enhancedFollowUp) ? ultFuaScalingBuff : 0, SOURCE_ULT)

      buffAbilityDmg(x, FUA_DMG_TYPE, (e >= 1 && r.e1FuaDmgBoost) ? 0.32 : 0, SOURCE_E1)
      x.DEF_PEN.buff((e >= 4 && r.e4DefShredBuff) ? 0.12 : 0, SOURCE_E4)
      x.QUANTUM_RES_PEN.buff((e >= 6 && r.e6ResShredBuff) ? 0.20 : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(10, SOURCE_TALENT)

      return x
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.SPD.buffSingle((t.debtCollectorSpdBuff) ? 30 : 0, SOURCE_SKILL)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkP(x, action, context, getHitMulti(action, context))
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkP(getHitMulti(action, context))
    },
  }
}

```

# 1200/Jiaoqiu.ts

```ts
import { AbilityType, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityVulnerability, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Heart Afire

Basic ATK+1+20

Deals Fire DMG equal to 100% of Jiaoqiu's ATK to a single target enemy.

 Single 10

Lv6

Scorch Onslaught

Skill-1+30

Deals Fire DMG equal to 150% of Jiaoqiu's ATK to a single target enemy and Fire DMG equal to 90% of Jiaoqiu's ATK to adjacent targets, with a 100% base chance to inflict 1 stack of Ashen Roast on the primary target.

 Single 20 | Other 10

Lv10

Pyrograph Arcanum

Ultimate100+5

Sets the number of "Ashen Roast" stacks on enemy targets to the highest number of "Ashen Roast" stacks present on the battlefield. Then, activates a Zone and deals Fire DMG equal to 100% of Jiaoqiu's ATK to all enemies.
While inside the Zone, enemy targets receive 15% increased Ultimate DMG, with a 60% base chance of being inflicted with 1 stack of Ashen Roast when taking action. While the Zone exists, this effect can trigger up to 6 time(s). And for each enemy target, it can only trigger once per turn. This trigger count resets every time Jiaoqiu uses Ultimate.
The Zone lasts for 3 turn(s), and its duration decreases by 1 at the start of this unit's every turn. If Jiaoqiu gets knocked down, the Zone will also be dispelled.

 All 20

Lv10

Quartet Finesse, Octave Finery

Talent

When Jiaoqiu hits an enemy with Basic ATK, Skill or Ultimate, there is a 100% base chance to inflict 1 stack of Ashen Roast on them. At 1 stack, increases DMG received by the enemy by 15%. Then, each subsequent stack increases this by 5%.
Ashen Roast is capped at 5 stack(s) and lasts for 2 turn(s).
When an enemy target is afflicted with Ashen Roast, they are also considered as being Burned at the same time, taking Fire DoT equal to 180% of Jiaoqiu's ATK at the start of each turn.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Fiery Queller

Technique

After using Technique, creates a Special Dimension that lasts for 15 second(s). After entering combat with enemies in this Special Dimension, deals Fire DMG equal to 100% of Jiaoqiu's ATK to all enemies, with a 100% base chance of applying 1 "Ashen Roast" stack. Only 1 dimension created by allies can exist at the same time.


Stat Boosts

 +28.0% Effect Hit Rate
 +14.4% Fire DMG Boost
 +5.0 SPD

Pyre Cleanse

When battle starts, immediately regenerates 15 Energy.


Hearth Kindle

For every 15% of Jiaoqiu's Effect Hit Rate that exceeds 80%, additionally increases ATK by 60%, up to 240%.


Seared Scent

While the Zone exists, enemies entering combat will be inflicted with Ashen Roast. The number of stacks applied will match the highest number of "Ashen Roast" stacks possessed by any unit while the Zone is active, with a minimum of 1 stack(s).



1 Pentapathic Transference

Allies deal 40% increased DMG to enemy targets afflicted with Ashen Roast. Whenever inflicting Ashen Roast on an enemy target via triggering the Talent's effect, additionally increases the number of "Ashen Roast" stacks applied this time by 1.



2 From Savor Comes Suffer

When an enemy target is afflicted with Ashen Roast, increases the multiplier for the Fire DoT dealt by Ashen Roast to this target by 300%.



3 Flavored Euphony Reigns Supreme

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Leisure In, Luster Out

When the Zone exists, reduces enemy target's ATK by 15%.



5 Duel in Dawn, Dash in Dusk

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Nonamorphic Pyrobind

When an enemy target gets defeated, their accumulated "Ashen Roast" stacks will transfer to the enemy with the lowest number of "Ashen Roast" stacks on the battlefield. The maximum stack limit of Ashen Roast increases to 9, and each "Ashen Roast" stack reduces the target's All-Type RES by 3%.
Hidden Stat: 1.0
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Jiaoqiu')
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
  } = Source.character('1218')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.50, 1.65)
  const ultScaling = ult(e, 1.00, 1.08)

  const ultVulnerabilityScaling = ult(e, 0.15, 0.162)

  const talentVulnerabilityBase = talent(e, 0.15, 0.165)
  const talentVulnerabilityScaling = talent(e, 0.05, 0.055)

  const talentDotScaling = talent(e, 1.80, 1.98)

  const maxAshenRoastStacks = e >= 6 ? 9 : 5

  const defaults = {
    ashenRoastStacks: maxAshenRoastStacks,
    ultFieldActive: true,
    ehrToAtkBoost: true,
    e1DmgBoost: true,
    e2Dot: true,
    e6ResShred: true,
  }

  const teammateDefaults = {
    ashenRoastStacks: maxAshenRoastStacks,
    ultFieldActive: true,
    e1DmgBoost: true,
    e6ResShred: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ashenRoastStacks: {
      id: 'ashenRoastStacks',
      formItem: 'slider',
      text: t('Content.ashenRoastStacks.text'),
      content: t('Content.ashenRoastStacks.content', {
        AshenRoastInitialVulnerability: TsUtils.precisionRound(100 * talentVulnerabilityBase),
        AshenRoastAdditionalVulnerability: TsUtils.precisionRound(100 * talentVulnerabilityScaling),
        AshenRoastDotMultiplier: TsUtils.precisionRound(100 * talentDotScaling),
      }),
      min: 0,
      max: maxAshenRoastStacks,
    },
    ultFieldActive: {
      id: 'ultFieldActive',
      formItem: 'switch',
      text: t('Content.ultFieldActive.text'),
      content: t('Content.ultFieldActive.content', {
        UltScaling: TsUtils.precisionRound(100 * ultScaling),
        UltVulnerability: TsUtils.precisionRound(100 * ultVulnerabilityScaling),
        ZoneDebuffChance: TsUtils.precisionRound(100 * ult(e, 0.6, 0.62)),
      }),
    },
    ehrToAtkBoost: {
      id: 'ehrToAtkBoost',
      formItem: 'switch',
      text: t('Content.ehrToAtkBoost.text'),
      content: t('Content.ehrToAtkBoost.content'),
    },
    e1DmgBoost: {
      id: 'e1DmgBoost',
      formItem: 'switch',
      text: t('Content.e1DmgBoost.text'),
      content: t('Content.e1DmgBoost.content'),
      disabled: e < 1,
    },
    e2Dot: {
      id: 'e2Dot',
      formItem: 'switch',
      text: t('Content.e2Dot.text'),
      content: t('Content.e2Dot.content'),
      disabled: e < 2,
    },
    e6ResShred: {
      id: 'e6ResShred',
      formItem: 'switch',
      text: t('Content.e6ResShred.text'),
      content: t('Content.e6ResShred.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    ashenRoastStacks: content.ashenRoastStacks,
    ultFieldActive: content.ultFieldActive,
    e1DmgBoost: content.e1DmgBoost,
    e6ResShred: content.e6ResShred,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.DOT_ATK_SCALING.buff((r.ashenRoastStacks > 0) ? talentDotScaling : 0, SOURCE_TALENT)
      x.DOT_ATK_SCALING.buff((e >= 2 && r.e2Dot && r.ashenRoastStacks > 0) ? 3.00 : 0, SOURCE_E2)
      x.DOT_CHANCE.set(100, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      buffAbilityVulnerability(x, ULT_DMG_TYPE, (m.ultFieldActive) ? ultVulnerabilityScaling : 0, SOURCE_ULT, Target.TEAM)

      x.VULNERABILITY.buffTeam((m.ashenRoastStacks > 0) ? talentVulnerabilityBase : 0, SOURCE_TALENT)
      x.VULNERABILITY.buffTeam(Math.max(0, m.ashenRoastStacks - 1) * talentVulnerabilityScaling, SOURCE_TALENT)

      x.ELEMENTAL_DMG.buffTeam((e >= 1 && m.e1DmgBoost && m.ashenRoastStacks > 0) ? 0.40 : 0, SOURCE_E1)

      x.RES_PEN.buffTeam((e >= 6 && m.e6ResShred) ? m.ashenRoastStacks * 0.03 : 0, SOURCE_E6)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    gpuFinalizeCalculations: () => '',
    dynamicConditionals: [
      {
        id: 'JiaoqiuConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.EHR],
        chainsTo: [Stats.ATK],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return r.ehrToAtkBoost && x.a[Key.EHR] > 0.80
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.EHR, Stats.ATK, this, x, action, context, SOURCE_TRACE,
            (convertibleValue) => Math.min(2.40, 0.60 * Math.floor((convertibleValue - 0.80) / 0.15)) * context.baseATK,
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.EHR, Stats.ATK, this, action, context,
            `min(2.40, 0.60 * floor((convertibleValue - 0.80) / 0.15)) * baseATK`,
            `${wgslTrue(r.ehrToAtkBoost)} && x.EHR > 0.80`,
          )
        },
      },
    ],
  }
}

```

# 1200/Jingliu.ts

```ts
import { AbilityType, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Lucent Moonglow

Basic ATK+1+20

Deals Ice DMG equal to 100% of Jingliu's ATK to a single enemy.

 Single 10

Lv6

Moon On Glacial River

Skill+30

Deals Ice DMG equal to 250% of Jingliu's ATK to a single enemy, and deals Ice DMG equal to 125% of Jingliu's ATK to adjacent enemies. Consumes 1 stack(s) of Syzygy. Using this ability does not consume Skill Points.

 Single 20 | Other 10

Lv10

Transcendent Flash

Skill-1+20

Deals Ice DMG equal to 200% of Jingliu's ATK to a single enemy and obtains 1 stack(s) of Syzygy.

 Single 20

Lv10

Florephemeral Dreamflux

Ultimate140+5

Deals Ice DMG equal to 300% of Jingliu's ATK to a single enemy, and deals Ice DMG equal to 150% of Jingliu's ATK to any adjacent enemies. Gains 1 stack(s) of Syzygy after attack ends.
Hidden Stat: 1

 Single 20 | Other 20

Lv10

Crescent Transmigration

Talent

When Jingliu has 2 stack(s) of Syzygy, she enters the Spectral Transmigration state with her action advanced by 100% and her CRIT Rate increases by 50%. Then, Jingliu's Skill "Transcendent Flash" is enhanced to "Moon On Glacial River," and only this enhanced Skill is available for use in battle. When Jingliu uses an attack in the Spectral Transmigration state, she consumes HP from her teammates equal to 4% of their respective Max HP (this cannot reduce teammates' HP to lower than 1). Jingliu's ATK increases by 540% of the total HP consumed from all allies in this attack, capped at 180% of her base ATK, lasting until the current attack ends. Jingliu cannot enter the Spectral Transmigration state again until the current Spectral Transmigration state ends. Syzygy can stack up to 3 times. When Syzygy stacks become 0, Jingliu will exit the Spectral Transmigration state.
Hidden Stat: 0.3

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Shine of Truth

Technique

After using this Technique, creates a Special Dimension around Jingliu that lasts for 20 seconds, and all enemies in this Special Dimension will become Frozen. After entering combat with enemies in the Special Dimension, Jingliu immediately regenerates 15 Energy and obtains 1 stack(s) of Syzygy, with a 100% base chance of Freezing enemy targets for 1 turn(s). While Frozen, enemy targets cannot take action, and receive Ice Additional DMG equal to 80% of Jingliu's ATK at the start of every turn. Only 1 Dimension Effect created by allies can exist at the same time.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.


Stat Boosts

 +37.3% CRIT DMG
 +9.0 SPD
 +10.0% HP

Deathrealm

While in the Spectral Transmigration state, increases Effect RES by 35%.


Sword Champion

After using "Transcendent Flash," the next action advances by 10%.


Frost Wraith

While in the Spectral Transmigration state, increases DMG dealt by Ultimate by 20%.



1 Moon Crashes Tianguan Gate

When using her Ultimate or Enhanced Skill, Jingliu's CRIT DMG increases by 24% for 1 turn(s). If only one enemy target is attacked, the target will additionally be dealt Ice DMG equal to 100% of Jingliu's ATK.



2 Crescent Shadows Qixing Dipper

After using Ultimate, increases the DMG of the next Enhanced Skill by 80%.



3 Halfmoon Gapes Mercurial Haze

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Lunarlance Shines Skyward Dome

During the Spectral Transmigration state, the ATK gained from consuming teammates' HP is additionally increased by 90% of the total HP consumed from the entire team. The cap for ATK gained this way also increases by 30%.



5 Night Shades Astral Radiance

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Eclipse Hollows Corporeal Husk

When Jingliu enters the Spectral Transmigration state, the Syzygy stack limit increases by 1, and Jingliu obtains 1 stack(s) of Syzygy. While she is in the Spectral Transmigration state, her CRIT DMG increases by 50%.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Jingliu')
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
  } = Source.character('1212')

  const talentCrBuff = talent(e, 0.50, 0.52)
  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)
  const skillEnhancedScaling = skill(e, 2.50, 2.75)
  const ultScaling = ult(e, 3.00, 3.24)

  const talentHpDrainAtkBuffMax = talent(e, 1.80, 1.98) + ((e >= 4) ? 0.30 : 0)

  const defaults = {
    talentEnhancedState: true,
    talentHpDrainAtkBuff: talentHpDrainAtkBuffMax,
    e1CdBuff: true,
    e2SkillDmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    talentEnhancedState: {
      id: 'talentEnhancedState',
      formItem: 'switch',
      text: t('Content.talentEnhancedState.text'),
      content: t('Content.talentEnhancedState.content', { talentCrBuff: TsUtils.precisionRound(100 * talentCrBuff) }),
    },
    talentHpDrainAtkBuff: {
      id: 'talentHpDrainAtkBuff',
      formItem: 'slider',
      text: t('Content.talentHpDrainAtkBuff.text'),
      content: t('Content.talentHpDrainAtkBuff.content', { talentHpDrainAtkBuffMax: TsUtils.precisionRound(100 * talentHpDrainAtkBuffMax) }),
      min: 0,
      max: talentHpDrainAtkBuffMax,
      percent: true,
    },
    e1CdBuff: {
      id: 'e1CdBuff',
      formItem: 'switch',
      text: t('Content.e1CdBuff.text'),
      content: t('Content.e1CdBuff.content'),
      disabled: e < 1,
    },
    e2SkillDmgBuff: {
      id: 'e2SkillDmgBuff',
      formItem: 'switch',
      text: t('Content.e2SkillDmgBuff.text'),
      content: t('Content.e2SkillDmgBuff.content'),
      disabled: e < 2,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Skills
      x.CR.buff((r.talentEnhancedState) ? talentCrBuff : 0, SOURCE_TALENT)
      x.ATK_P.buff((r.talentEnhancedState) ? r.talentHpDrainAtkBuff : 0, SOURCE_TALENT)

      // Traces
      x.RES.buff((r.talentEnhancedState) ? 0.35 : 0, SOURCE_TRACE)

      r.talentEnhancedState && buffAbilityDmg(x, ULT_DMG_TYPE, 0.20, SOURCE_TRACE)

      // Eidolons
      x.CD.buff((e >= 1 && r.e1CdBuff) ? 0.24 : 0, SOURCE_E1)
      x.CD.buff((e >= 6 && r.talentEnhancedState) ? 0.50 : 0, SOURCE_E6)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)

      x.SKILL_ATK_SCALING.buff((r.talentEnhancedState) ? skillEnhancedScaling : skillScaling, SOURCE_SKILL)
      x.SKILL_ATK_SCALING.buff((e >= 1 && r.talentEnhancedState && (context.enemyCount ?? context.enemyCount) == 1) ? 1 : 0, SOURCE_SKILL)

      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.ULT_ATK_SCALING.buff((e >= 1 && (context.enemyCount ?? context.enemyCount) == 1) ? 1 : 0, SOURCE_ULT)

      // BOOST
      buffAbilityDmg(x, SKILL_DMG_TYPE, (e >= 2 && r.talentEnhancedState && r.e2SkillDmgBuff) ? 0.80 : 0, SOURCE_E2)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
  }
}

```

# 1200/JingYuan.ts

```ts
import { AbilityType, ASHBLAZING_ATK_STACK, BASIC_DMG_TYPE, FUA_DMG_TYPE, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { boostAshblazingAtkP, gpuBoostAshblazingAtkP } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityCd, buffAbilityDmg, buffAbilityVulnerability } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Glistening Light

Basic ATK+1+20

Jing Yuan deals Lightning DMG equal to 100% of his ATK to a single enemy.

 Single 10

Lv6

Rifting Zenith

Skill-1+30

Deals Lightning DMG equal to 100% of Jing Yuan's ATK to all enemies and increases Lightning-Lord's Hits Per Action by 2 for the next turn.

 All 10

Lv10

Lightbringer

Ultimate130+5

Deals Lightning DMG equal to 200% of Jing Yuan's ATK to all enemies and increases Lightning-Lord's Hits Per Action by 3 for the next turn.

 All 20

Lv10

Prana Extirpated

Talent

Summons Lightning-Lord at the start of the battle. Lightning-Lord has 60 base SPD and 3 base Hits Per Action. When the Lightning-Lord takes action, its hits are considered as Follow-up ATKs, with each hit dealing Lightning DMG equal to 66% of Jing Yuan's ATK to a random single enemy, and enemies adjacent to it also receive Lightning DMG equal to 25% of the DMG dealt to the primary target enemy.
The Lightning-Lord's Hits Per Action can reach a max of 10. Every time Lightning-Lord's Hits Per Action increases by 1, its SPD increases by 10. After the Lightning-Lord's action ends, its SPD and Hits Per Action return to their base values.
When Jing Yuan is knocked down, the Lightning-Lord will disappear.
When Jing Yuan is affected by Crowd Control debuff, the Lightning-Lord is unable to take action.

Crowd Control debuff
Freeze, Entanglement, Imprisonment, Dominated, Outrage, Strong Reverberation, Alien Dream, Snarelock, Terrified.

 Single 5

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Spiritus Invocation

Technique

After the Technique is used, the Lightning-Lord's Hits Per Action in the first turn increases by 3 at the start of the next battle.


Stat Boosts

 +28.0% ATK
 +12.0% CRIT Rate
 +12.5% DEF

Battalia Crush

If the Lightning-Lord's Hits Per Action is greater or equal to 6 in the next turn, its CRIT DMG increases by 25% for the next turn.


Savant Providence

At the start of the battle, immediately regenerates 15 Energy.


War Marshal

After the Skill is used, the CRIT Rate increases by 10% for 2 turn(s).



1 Slash, Seas Split

When Lightning-Lord attacks, the DMG multiplier on enemies adjacent to the target enemy increases by an extra amount equal to 25% of the DMG multiplier against the primary target enemy.



2 Swing, Skies Squashed

After Lightning-Lord takes action, DMG dealt by Jing Yuan's Basic ATK, Skill, and Ultimate increases by 20%, lasting for 2 turn(s).



3 Strike, Suns Subdued

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Spin, Stars Sieged

For each hit performed by the Lightning-Lord when it takes action, Jing Yuan regenerates 2 Energy.



5 Stride, Spoils Seized

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Sweep, Souls Slain

Each hit performed by the Lightning-Lord when it takes action will make the target enemy Vulnerable.
While Vulnerable, enemies receive 12% more DMG until the end of the Lightning-Lord's current turn, stacking up to 3 time(s).
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.JingYuan')
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
  } = Source.character('1204')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.00, 2.16)
  const fuaScaling = talent(e, 0.66, 0.726)

  function getHitMulti(action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals as Conditionals<typeof content>

    let hitMulti = 0
    const stacks = r.talentHitsPerAction
    const hits = r.talentAttacks
    const stacksPerMiss = (context.enemyCount >= 3) ? 2 : 0
    const stacksPerHit = (context.enemyCount >= 3) ? 3 : 1
    const stacksPreHit = (context.enemyCount >= 3) ? 2 : 1

    // Calc stacks on miss
    let ashblazingStacks = stacksPerMiss * (stacks - hits)

    // Calc stacks on hit
    ashblazingStacks += stacksPreHit
    let atkBoostSum = 0
    for (let i = 0; i < hits; i++) {
      atkBoostSum += Math.min(8, ashblazingStacks) * (1 / hits)
      ashblazingStacks += stacksPerHit
    }

    hitMulti = atkBoostSum * ASHBLAZING_ATK_STACK

    return hitMulti
  }

  const defaults = {
    skillCritBuff: true,
    talentHitsPerAction: 10,
    talentAttacks: 10,
    e2DmgBuff: true,
    e6FuaVulnerabilityStacks: 3,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillCritBuff: {
      id: 'skillCritBuff',
      formItem: 'switch',
      text: t('Content.skillCritBuff.text'),
      content: t('Content.skillCritBuff.content'),
    },
    talentHitsPerAction: {
      id: 'talentHitsPerAction',
      formItem: 'slider',
      text: t('Content.talentHitsPerAction.text'),
      content: t('Content.talentHitsPerAction.content'),
      min: 3,
      max: 10,
    },
    talentAttacks: {
      id: 'talentAttacks',
      formItem: 'slider',
      text: t('Content.talentAttacks.text'),
      content: t('Content.talentAttacks.content'),
      min: 0,
      max: 10,
    },
    e2DmgBuff: {
      id: 'e2DmgBuff',
      formItem: 'switch',
      text: t('Content.e2DmgBuff.text'),
      content: t('Content.e2DmgBuff.content'),
      disabled: e < 2,
    },
    e6FuaVulnerabilityStacks: {
      id: 'e6FuaVulnerabilityStacks',
      formItem: 'slider',
      text: t('Content.e6FuaVulnerabilityStacks.text'),
      content: t('Content.e6FuaVulnerabilityStacks.content'),
      min: 0,
      max: 3,
      disabled: e < 6,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    defaults: () => defaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.SUMMONS.set(1, SOURCE_TALENT)
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      r.talentHitsPerAction = Math.max(r.talentHitsPerAction, r.talentAttacks)

      // Stats
      x.CR.buff((r.skillCritBuff) ? 0.10 : 0, SOURCE_TRACE)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_ATK_SCALING.buff(fuaScaling * r.talentAttacks, SOURCE_TALENT)

      // Boost
      buffAbilityCd(x, FUA_DMG_TYPE, (r.talentHitsPerAction >= 6) ? 0.25 : 0, SOURCE_TRACE)
      buffAbilityDmg(x, BASIC_DMG_TYPE | SKILL_DMG_TYPE | ULT_DMG_TYPE, (e >= 2 && r.e2DmgBuff) ? 0.20 : 0, SOURCE_E2)
      buffAbilityVulnerability(x, FUA_DMG_TYPE, (e >= 6) ? r.e6FuaVulnerabilityStacks * 0.12 : 0, SOURCE_E6)

      // Lightning lord calcs
      const hits = r.talentAttacks

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(10, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(5 * hits, SOURCE_TALENT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkP(x, action, context, getHitMulti(action, context))
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => gpuBoostAshblazingAtkP(getHitMulti(action, context)),
  }
}

```

# 1000/Kafka.ts

```ts
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

```

# 1200/Lingsha.ts

```ts
import { AbilityType, ASHBLAZING_ATK_STACK, BREAK_DMG_TYPE, NONE_TYPE, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { boostAshblazingAtkP, gpuBoostAshblazingAtkP, gpuStandardAtkHealFinalizer, standardAtkHealFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityVulnerability, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Votive Incense

Basic ATK+1+20

Deals Fire DMG equal to 100% of Lingsha's ATK to a single target enemy.

 Single 10

Lv6

Smoke and Splendor

Skill-1+30

Deals Fire DMG equal to 80% of Lingsha's ATK to all enemies and at the same time, restores HP equal to 14% of Lingsha's ATK plus 420 for all allies. Fuyuan's action advances by 20%.

 All 10

Lv10

Dripping Mistscape

Ultimate110+5

Inflicts "Befog" on all enemies. While in "Befog," targets receive 25% increased Break DMG, lasting for 2 turn(s).
Deals Fire DMG equal to 150% of Lingsha's ATK to all enemies, and at the same time restores HP equal to 12% of Lingsha's ATK plus 360 for all allies. Fuyuan's action advances by 100%.

Break DMG
Break DMG increases with higher Break Effect, higher target max Toughness, and higher character levels.
Break DMG cannot CRIT Hit and is not affected by DMG Boost effects.

 All 20

Lv10

Mistdance Manifest

Talent

When using Skill, summons Fuyuan, with an initial SPD of 90 and an initial action count of 3.
When taking action, Fuyuan launches Follow-up ATK, dealing Fire DMG equal to 75% of Lingsha's ATK to all enemies. Additionally deals Fire DMG equal to 75% of Lingsha's ATK to a single random enemy, and this DMG prioritizes targets that have both Toughness greater than 0 and Fire Weakness. Dispels 1 debuff(s) from all allies and restores HP equal to 12% of Lingsha's ATK plus 360.
Fuyuan's action count can accumulate up to 5. When the action count reaches 0 or when Lingsha is knocked down, Fuyuan disappears.
While Fuyuan is on the field, using Skill can increase Fuyuan's action count by 3.

 All 10

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Wisps of Aurora

Technique

After using Technique, immediately summons Fuyuan at the start of the next battle and inflicts "Befog" on all enemies, lasting for 2 turn(s).


Stat Boosts

 +37.3% Break Effect
 +18.0% HP
 +10.0% ATK

Vermilion Waft

Increases this unit's ATK or Outgoing Healing by an amount equal to 25%/10% of Break Effect, up to a maximum increase of 50%/20% respectively.


Sylvan Smoke

When using Basic ATK, additionally regenerates 10 Energy.


Ember's Echo

While "Fuyuan" is on the field and any ally character takes DMG or consumes HP, if a character in the team has their current HP percentage lower than or equal to 60%, "Fuyuan" will immediately launch the Talent's Follow-up ATK against enemies. This does not consume Fuyuan's action count. This effect can trigger again after 2 turn(s).



1 Bloom on Vileward Bouquet

Lingsha's Weakness Break Efficiency increases by 50%. When an enemy unit's Weakness is Broken, reduces their DEF by 20%.



2 Leisure in Carmine Smokeveil

When using Ultimate, increases all allies' Break Effect by 40%, lasting for 3 turn(s).



3 Shine of Floral Wick

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Redolence from Canopied Banquet

When Fuyuan takes action, restores HP equal to 40% of Lingsha's ATK for the ally target whose current HP is the lowest.



5 Poise Atop Twists and Turns

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Arcadia Under Deep Seclusion

While "Fuyuan" is on the field, reduces all enemies' All-Type RES by 20%. When "Fuyuan" attacks, additionally deals 4 instance(s) of DMG, with each instance dealing Fire DMG equal to 50% of Lingsha's ATK and 5 Toughness Reduction to one random enemy. This prioritizes targets with both Toughness greater than 0 and Fire Weakness.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Lingsha')
  const tHeal = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealAbility')
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
  } = Source.character('1222')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.80, 0.88)
  const ultScaling = ult(e, 1.50, 1.65)
  const ultBreakVulnerability = ult(e, 0.25, 0.27)
  const fuaScaling = talent(e, 0.75, 0.825)

  const skillHealScaling = skill(e, 0.14, 0.148)
  const skillHealFlat = skill(e, 420, 467.25)

  const ultHealScaling = ult(e, 0.12, 0.128)
  const ultHealFlat = ult(e, 360, 400.5)

  const talentHealScaling = talent(e, 0.12, 0.128)
  const talentHealFlat = talent(e, 360, 400.5)

  const hitMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 2 + 2 * 1 / 2),
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 2 + 3 * 1 / 2),
    5: ASHBLAZING_ATK_STACK * (3 * 1 / 2 + 4 * 1 / 2),
  }

  const defaults = {
    healAbility: NONE_TYPE,
    beConversion: true,
    befogState: true,
    e1DefShred: true,
    e2BeBuff: true,
    e6ResShred: true,
  }

  const teammateDefaults = {
    befogState: true,
    e1DefShred: true,
    e2BeBuff: true,
    e6ResShred: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    healAbility: {
      id: 'healAbility',
      formItem: 'select',
      text: tHeal('Text'),
      content: tHeal('Content'),
      options: [
        { display: tHeal('Skill'), value: SKILL_DMG_TYPE, label: tHeal('Skill') },
        { display: tHeal('Ult'), value: ULT_DMG_TYPE, label: tHeal('Ult') },
        { display: tHeal('Talent'), value: NONE_TYPE, label: tHeal('Talent') },
      ],
      fullWidth: true,
    },
    beConversion: {
      id: 'beConversion',
      formItem: 'switch',
      text: t('Content.beConversion.text'),
      content: t('Content.beConversion.content'),
    },
    befogState: {
      id: 'befogState',
      formItem: 'switch',
      text: t('Content.befogState.text'),
      content: t('Content.befogState.content', {
        BefogVulnerability: TsUtils.precisionRound(100 * ultBreakVulnerability),
      }),
    },
    e1DefShred: {
      id: 'e1DefShred',
      formItem: 'switch',
      text: t('Content.e1DefShred.text'),
      content: t('Content.e1DefShred.content'),
      disabled: e < 1,
    },
    e2BeBuff: {
      id: 'e2BeBuff',
      formItem: 'switch',
      text: t('Content.e2BeBuff.text'),
      content: t('Content.e2BeBuff.content'),
      disabled: e < 2,
    },
    e6ResShred: {
      id: 'e6ResShred',
      formItem: 'switch',
      text: t('Content.e6ResShred.text'),
      content: t('Content.e6ResShred.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    befogState: content.befogState,
    e1DefShred: content.e1DefShred,
    e2BeBuff: content.e2BeBuff,
    e6ResShred: content.e6ResShred,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.SUMMONS.set(1, SOURCE_TALENT)
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.FUA_ATK_SCALING.buff(fuaScaling * 2, SOURCE_TALENT)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      x.BREAK_EFFICIENCY_BOOST.buff((e >= 1) ? 0.50 : 0, SOURCE_E1)
      x.FUA_ATK_SCALING.buff((e >= 6 && r.e6ResShred) ? 0.50 : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(10, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(10 * 2, SOURCE_TALENT)
      x.FUA_TOUGHNESS_DMG.buff((e >= 6) ? 5 : 0, SOURCE_E6)

      if (r.healAbility == SKILL_DMG_TYPE) {
        x.HEAL_TYPE.set(SKILL_DMG_TYPE, SOURCE_SKILL)
        x.HEAL_SCALING.buff(skillHealScaling, SOURCE_SKILL)
        x.HEAL_FLAT.buff(skillHealFlat, SOURCE_SKILL)
      }
      if (r.healAbility == ULT_DMG_TYPE) {
        x.HEAL_TYPE.set(ULT_DMG_TYPE, SOURCE_ULT)
        x.HEAL_SCALING.buff(ultHealScaling, SOURCE_ULT)
        x.HEAL_FLAT.buff(ultHealFlat, SOURCE_ULT)
      }
      if (r.healAbility == NONE_TYPE) {
        x.HEAL_TYPE.set(NONE_TYPE, SOURCE_TALENT)
        x.HEAL_SCALING.buff(talentHealScaling, SOURCE_TALENT)
        x.HEAL_FLAT.buff(talentHealFlat, SOURCE_TALENT)
      }
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      if (x.a[Key.ENEMY_WEAKNESS_BROKEN]) {
        x.DEF_PEN.buffTeam((e >= 1 && m.e1DefShred) ? 0.20 : 0, SOURCE_E1)
      }

      buffAbilityVulnerability(x, BREAK_DMG_TYPE, (m.befogState) ? ultBreakVulnerability : 0, SOURCE_ULT, Target.TEAM)

      x.BE.buffTeam((e >= 2 && m.e2BeBuff) ? 0.40 : 0, SOURCE_E2)
      x.RES_PEN.buffTeam((e >= 6 && m.e6ResShred) ? 0.20 : 0, SOURCE_E6)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkP(x, action, context, hitMultiByTargets[context.enemyCount])
      standardAtkHealFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkP(hitMultiByTargets[context.enemyCount]) + gpuStandardAtkHealFinalizer()
    },
    dynamicConditionals: [{
      id: 'LingshaConversionConditional',
      type: ConditionalType.ABILITY,
      activation: ConditionalActivation.CONTINUOUS,
      dependsOn: [Stats.BE],
      chainsTo: [Stats.ATK, Stats.OHB],
      condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
        return true
      },
      effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>
        if (!r.beConversion) {
          return
        }

        const stateValue = action.conditionalState[this.id] || 0
        const buffValueAtk = Math.min(0.50, 0.25 * x.a[Key.BE]) * context.baseATK
        const buffValueOhb = Math.min(0.20, 0.10 * x.a[Key.BE])

        const stateBuffValueAtk = Math.min(0.50, 0.25 * stateValue) * context.baseATK
        const stateBuffValueOhb = Math.min(0.20, 0.10 * stateValue)

        action.conditionalState[this.id] = x.a[Key.BE]

        const finalBuffAtk = buffValueAtk - (stateValue ? stateBuffValueAtk : 0)
        const finalBuffOhb = buffValueOhb - (stateValue ? stateBuffValueOhb : 0)

        x.ATK.buffDynamic(finalBuffAtk, SOURCE_TRACE, action, context)
        x.OHB.buffDynamic(finalBuffOhb, SOURCE_TRACE, action, context)
      },
      gpu: function (action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>

        return conditionalWgslWrapper(this, `
if (${wgslFalse(r.beConversion)}) {
  return;
}

let stateValue: f32 = (*p_state).LingshaConversionConditional;

let buffValueAtk = min(0.50, 0.25 * x.BE) * baseATK;
let buffValueOhb = min(0.20, 0.10 * x.BE);

let stateBuffValueAtk = min(0.50, 0.25 * stateValue) * baseATK;
let stateBuffValueOhb = min(0.20, 0.10 * stateValue);

(*p_state).LingshaConversionConditional = x.BE;

let finalBuffAtk = buffValueAtk - select(0.0, stateBuffValueAtk, stateValue > 0.0);
let finalBuffOhb = buffValueOhb - select(0.0, stateBuffValueOhb, stateValue > 0.0);

(*p_x).ATK += finalBuffAtk;
(*p_x).OHB += finalBuffOhb;
`)
      },
    }],
  }
}

```

# 1100/Luka.ts

```ts
import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Direct Punch

Basic ATK+1+20

Deals Physical DMG equal to 100% of Luka's ATK to a single enemy.

 Single 10

Lv6

Sky-Shatter Fist

Basic ATK+1+20

Consumes 2 stacks of Fighting Will. First, uses Direct Punch to deal 3 hits, with each hit dealing Physical DMG equal to 20% of Luka's ATK to a single enemy target.
Then, uses Rising Uppercut to deal 1 hit, dealing Physical DMG equal to 80% of Luka's ATK to the single enemy target.

 Single 20

Lv6

Lacerating Fist

Skill-1+30

Deals Physical DMG equal to 120% of Luka's ATK to a single enemy target. In addition, there is a 100% base chance to inflict Bleed on them, lasting for 3 turn(s).
While Bleeding, the enemy will take 24% of their Max HP as Physical DoT at the start of each turn. This DMG will not exceed more than 338% of Luka's ATK.

 Single 20

Lv10

Coup de Grâce

Ultimate130+5

Receives 2 stack(s) of Fighting Will, with a 100% base chance to increase a single enemy target's DMG received by 20% for 3 turn(s). Then, deals Physical DMG equal to 330% of Luka's ATK to the target.

 Single 30

Lv10

Flying Sparks

Talent

After Luka uses his Basic ATK "Direct Punch" or Skill "Lacerating Fist," he receives 1 stack of Fighting Will, up to 4 stacks. When he has 2 or more stacks of Fighting Will, his Basic ATK "Direct Punch" is enhanced to "Sky-Shatter Fist." After his Enhanced Basic ATK's "Rising Uppercut" hits a Bleeding enemy target, the Bleed status will immediately deal DMG for 1 time equal to 85% of the original DMG to the target. At the start of battle, Luka will possess 1 stack of Fighting Will.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Anticipator

Technique

Immediately attacks the enemy. Upon entering battle, Luka deals Physical DMG equal to 50% of his ATK to a random single enemy with a 100% base chance to inflict his Skill's Bleed effect on the target. Then, Luka gains 1 additional stack of Fighting Will.

 Single 20


Stat Boosts

 +28.0% ATK
 +18.0% Effect Hit Rate
 +12.5% DEF

Kinetic Overload

When using Skill, immediately dispels 1 buff(s) from the enemy target.


Cycle Braking

For every stack of Fighting Will obtained, additionally regenerates 3 Energy.


Crush Fighting Will

When using Enhanced Basic ATK, every hit of "Direct Punch" has a 50% fixed chance for Luka to use 1 additional hit. This effect does not apply to additional hits generated in this way.



1 Fighting Endlessly

When Luka takes action, if the target enemy is Bleeding, increases DMG dealt by Luka by 15% for 2 turn(s).



2 The Enemy is Weak, I am Strong

If the Skill hits an enemy target with Physical Weakness, gain 1 stack(s) of Fighting Will.



3 Born for the Ring

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Never Turning Back

For every stack of Fighting Will obtained, increases ATK by 5%, stacking up to 4 time(s).



5 The Spirit of Wildfire

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 A Champion's Applause

After the Enhanced Basic ATK's "Rising Uppercut" hits a Bleeding enemy target, the Bleed status will immediately deal DMG 1 time equal to 8% of the original DMG for every hit of Direct Punch already unleashed during the current Enhanced Basic ATK.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Luka')
  const { basic, skill, ult } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('1111')

  const basicEnhancedHitValue = basic(e, 0.20, 0.22)
  const targetUltDebuffDmgTakenValue = ult(e, 0.20, 0.216)

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 0.20 * 3 + 0.80, 0.22 * 3 + 0.88)
  const skillScaling = skill(e, 1.20, 1.32)
  const ultScaling = ult(e, 3.30, 3.564)
  const dotScaling = skill(e, 3.38, 3.718)

  const defaults = {
    basicEnhanced: true,
    targetUltDebuffed: true,
    e1TargetBleeding: true,
    basicEnhancedExtraHits: 3,
    e4TalentStacks: 4,
  }

  const teammateDefaults = {
    targetUltDebuffed: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    basicEnhanced: {
      id: 'basicEnhanced',
      formItem: 'switch',
      text: t('Content.basicEnhanced.text'),
      content: t('Content.basicEnhanced.content'),
    },
    targetUltDebuffed: {
      id: 'targetUltDebuffed',
      formItem: 'switch',
      text: t('Content.targetUltDebuffed.text'),
      content: t('Content.targetUltDebuffed.content', { targetUltDebuffDmgTakenValue: TsUtils.precisionRound(100 * targetUltDebuffDmgTakenValue) }),
    },
    basicEnhancedExtraHits: {
      id: 'basicEnhancedExtraHits',
      formItem: 'slider',
      text: t('Content.basicEnhancedExtraHits.text'),
      content: t('Content.basicEnhancedExtraHits.content'),
      min: 0,
      max: 3,
    },
    e1TargetBleeding: {
      id: 'e1TargetBleeding',
      formItem: 'switch',
      text: t('Content.e1TargetBleeding.text'),
      content: t('Content.e1TargetBleeding.content'),
      disabled: e < 1,
    },
    e4TalentStacks: {
      id: 'e4TalentStacks',
      formItem: 'slider',
      text: t('Content.e4TalentStacks.text'),
      content: t('Content.e4TalentStacks.content'),
      min: 0,
      max: 4,
      disabled: e < 4,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    targetUltDebuffed: content.targetUltDebuffed,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.ATK_P.buff((e >= 4) ? r.e4TalentStacks * 0.05 : 0, SOURCE_E4)

      // Scaling
      x.BASIC_ATK_SCALING.buff((r.basicEnhanced) ? basicEnhancedScaling : basicScaling, SOURCE_BASIC)
      x.BASIC_ATK_SCALING.buff((r.basicEnhanced && r.basicEnhancedExtraHits) * basicEnhancedHitValue, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.DOT_ATK_SCALING.buff(dotScaling, SOURCE_SKILL)

      // Boost
      x.ELEMENTAL_DMG.buff((e >= 1 && r.e1TargetBleeding) ? 0.15 : 0, SOURCE_E1)

      x.BASIC_TOUGHNESS_DMG.buff((r.basicEnhanced) ? 20 : 10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)

      x.DOT_CHANCE.set(1.00, SOURCE_SKILL)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.VULNERABILITY.buffTeam((m.targetUltDebuffed) ? targetUltDebuffDmgTakenValue : 0, SOURCE_ULT)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
  }
}

```

# 1200/Luocha.ts

```ts
import { AbilityType, NONE_TYPE, SKILL_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardAtkHealFinalizer, standardAtkHealFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Thorns of the Abyss

Basic ATK+1+20

Deals Imaginary DMG equal to 100% of Luocha's ATK to a single enemy.

 Single 10

Lv6

Prayer of Abyss Flower

Skill-1+30

After using his Skill, Luocha immediately restores the target ally's HP equal to 60% of Luocha's ATK plus 800. Meanwhile, Luocha gains 1 stack of Abyss Flower.
When any ally's HP percentage drops to 50% or lower, an effect equivalent to Luocha's Skill will immediately be triggered and applied to this ally for one time (without consuming Skill Points). This effect can be triggered again after 2 turn(s).

Lv10

Death Wish

Ultimate100+5

Removes 1 buff(s) from all enemies and deals all enemies Imaginary DMG equal to 200% of Luocha's ATK. At the same time, Luocha gains 1 stack of Abyss Flower.

 All 20

Lv10

Cycle of Life

Talent

When Abyss Flower reaches 2 stacks, Luocha consumes all stacks of Abyss Flower to deploy a Zone against the enemy.
When any enemy in the Zone is attacked by an ally, the attacking ally's HP is immediately restored by an amount equal to 18% of Luocha's ATK plus 240.
The Zone's effect lasts for 2 turns. When Luocha is knocked down, the Zone will be dispelled.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Mercy of a Fool

Technique

After the Technique is used, the Talent will be immediately triggered at the start of the next battle.


Stat Boosts

 +28.0% ATK
 +18.0% HP
 +12.5% DEF

Cleansing Revival

When Skill's effect is triggered, dispel 1 debuff(s) from one designated ally.


Sanctified

When any enemy in the Zone is attacked by an ally, all allies (except the attacker) restore HP equal to 7% of Luocha's ATK plus 93.


Through the Valley

Increases the chance to resist Crowd Control debuffs by 70%.

Crowd Control debuff
Freeze, Entanglement, Imprisonment, Dominated, Outrage, Strong Reverberation, Alien Dream, Snarelock, Terrified.



1 Ablution of the Quick

While the Zone is active, ATK of all allies increases by 20%.



2 Bestowal From the Pure

When his Skill is triggered, if the target ally's HP percentage is lower than 50%, Luocha's Outgoing Healing increases by 30%. If the target ally's HP percentage is at 50% or higher, the ally receives a Shield that can absorb DMG equal to 18% of Luocha's ATK plus 240, lasting for 2 turns.



3 Surveyal by the Fool

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Heavy Lies the Crown

When Luocha's Zone is active, enemies become Weakened and deal 12% less DMG.



5 Cicatrix 'Neath the Pain

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Reunion With the Dust

When Ultimate is used, there is a 100% fixed chance to reduce all enemies' All-Type RES by 20% for 2 turn(s).
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Luocha')
  const tHeal = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealAbility')
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
  } = Source.character('1203')

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.00, 2.16)

  const skillHealScaling = skill(e, 0.60, 0.64)
  const skillHealFlat = skill(e, 800, 890)

  const talentHealScaling = talent(e, 0.18, 0.192)
  const talentHealFlat = talent(e, 240, 267)

  const defaults = {
    healAbility: NONE_TYPE,
    fieldActive: true,
    e6ResReduction: true,
  }

  const teammateDefaults = {
    fieldActive: true,
    e6ResReduction: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    healAbility: {
      id: 'healAbility',
      formItem: 'select',
      text: tHeal('Text'),
      content: tHeal('Content'),
      options: [
        {
          display: tHeal('Skill'),
          value: SKILL_DMG_TYPE,
          label: tHeal('Skill'),
        },
        {
          display: tHeal('Talent'),
          value: NONE_TYPE,
          label: tHeal('Talent'),
        },
      ],
      fullWidth: true,
    },
    fieldActive: {
      id: 'fieldActive',
      formItem: 'switch',
      text: t('Content.fieldActive.text'),
      content: t('Content.fieldActive.content'),
      // disabled: e < 1, Not disabling this one since technically the field can be active at E0
    },
    e6ResReduction: {
      id: 'e6ResReduction',
      formItem: 'switch',
      text: t('Content.e6ResReduction.text'),
      content: t('Content.e6ResReduction.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    fieldActive: content.fieldActive,
    e6ResReduction: content.e6ResReduction,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      if (r.healAbility == SKILL_DMG_TYPE) {
        x.HEAL_TYPE.set(SKILL_DMG_TYPE, SOURCE_SKILL)
        x.HEAL_SCALING.buff(skillHealScaling, SOURCE_SKILL)
        x.HEAL_FLAT.buff(skillHealFlat, SOURCE_SKILL)
      }
      if (r.healAbility == NONE_TYPE) {
        x.HEAL_TYPE.set(NONE_TYPE, SOURCE_TALENT)
        x.HEAL_SCALING.buff(talentHealScaling, SOURCE_TALENT)
        x.HEAL_FLAT.buff(talentHealFlat, SOURCE_TALENT)
      }

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.ATK_P.buffTeam((e >= 1 && m.fieldActive) ? 0.20 : 0, SOURCE_E1)

      x.RES_PEN.buffTeam((e >= 6 && m.e6ResReduction) ? 0.20 : 0, SOURCE_E6)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
      standardAtkHealFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardAtkHealFinalizer(),
  }
}

```

# 1100/Lynx.ts

```ts
import { AbilityType, NONE_TYPE, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardHpHealFinalizer, standardHpHealFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Ice Crampon Technique

Basic ATK+1+20

Deals Quantum DMG equal to 50% of this character's Max HP to a single enemy.

 Single 10

Lv6

Salted Camping Cans

Skill-1+30

Applies "Survival Response" to a single target ally and increases their Max HP by 7.5% of Lynx's Max HP plus 200. If the target ally is a character on the Path of Destruction or Preservation, the chance of them being attacked by enemies will greatly increase. "Survival Response" lasts for 2 turn(s).
Restores the target's HP by 12% of Lynx's Max HP plus 320.
Hidden Stat: 5

Lv10

Snowfield First Aid

Ultimate100+5

Dispels 1 debuff(s) from all allies and immediately restores their respective HP by an amount equal to 13.5% of Lynx's Max HP plus 360.

Lv10

Outdoor Survival Experience

Talent

When using Lynx's Skill or Ultimate, applies continuous healing to the target ally for 2 turn(s), restoring the target ally's HP by an amount equal to 3.6% of Lynx's Max HP plus 96 at the start of each turn. If the target has "Survival Response," the continuous healing effect additionally restores HP by an amount equal to 4.5% of Lynx's Max HP plus 120.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Chocolate Energy Bar

Technique

After Lynx uses her Technique, at the start of the next battle, all allies are granted her Talent's continuous healing effect, lasting for 2 turn(s).


Stat Boosts

 +28.0% HP
 +22.5% DEF
 +10.0% Effect RES

Advance Surveying

After a target with "Survival Response" is hit, Lynx regenerates 2 Energy immediately.


Exploration Techniques

Increases the chance to resist Crowd Control debuffs by 35%.

Crowd Control debuff
Freeze, Entanglement, Imprisonment, Dominated, Outrage, Strong Reverberation, Alien Dream, Snarelock, Terrified.


Survival in the Extreme

Extends the duration of the continuous healing effect granted by Talent for 1 turn(s).



1 Morning of Snow Hike

When healing allies with HP percentage equal to or lower than 50%, Lynx's Outgoing Healing increases by 20%. This effect also works on continuous healing.



2 Noon of Portable Furnace

A target with "Survival Response" can resist debuff application for 1 time(s).



3 Afternoon of Avalanche Beacon

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Dusk of Warm Campfire

When "Survival Response" is gained, increases the target's ATK by an amount equal to 3% of Lynx's Max HP for 1 turn(s).



5 Night of Aurora Tea

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Dawn of Explorers' Chart

Additionally boosts the Max HP increasing effect of "Survival Response" by an amount equal to 6% of Lynx's Max HP and increases Effect RES by 30%.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Lynx')
  const tHeal = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealAbility')
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
  } = Source.character('1110')

  const skillHpPercentBuff = skill(e, 0.075, 0.08)
  const skillHpFlatBuff = skill(e, 200, 223)

  const basicScaling = basic(e, 0.50, 0.55)

  const skillHealScaling = skill(e, 0.12, 0.128)
  const skillHealFlat = skill(e, 320, 356)

  const ultHealScaling = ult(e, 0.135, 0.144)
  const ultHealFlat = ult(e, 360, 400.5)

  const talentHealScaling = talent(e, 0.036, 0.0384)
  const talentHealFlat = talent(e, 96, 106.8)

  const atkBuffPercent = (e >= 4 ? 0.03 : 0)

  const content: ContentDefinition<typeof defaults> = {
    healAbility: {
      id: 'healAbility',
      formItem: 'select',
      text: tHeal('Text'),
      content: tHeal('Content'),
      options: [
        { display: tHeal('Skill'), value: SKILL_DMG_TYPE, label: tHeal('Skill') },
        { display: tHeal('Ult'), value: ULT_DMG_TYPE, label: tHeal('Ult') },
        { display: tHeal('Talent'), value: NONE_TYPE, label: tHeal('Talent') },
      ],
      fullWidth: true,
    },
    skillBuff: {
      id: 'skillBuff',
      formItem: 'switch',
      text: t('Content.skillBuff.text'),
      content: t('Content.skillBuff.content', {
        skillHpPercentBuff: TsUtils.precisionRound(100 * skillHpPercentBuff),
        skillHpFlatBuff: skillHpFlatBuff,
      }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillBuff: content.skillBuff,
    teammateHPValue: {
      id: 'teammateHPValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateHPValue.text'),
      content: t('TeammateContent.teammateHPValue.content', {
        skillHpPercentBuff: TsUtils.precisionRound(100 * skillHpPercentBuff),
        skillHpFlatBuff: skillHpFlatBuff,
      }),
      min: 0,
      max: 10000,
    },
  }

  const defaults = {
    healAbility: ULT_DMG_TYPE,
    skillBuff: true,
  }

  const teammateDefaults = {
    skillBuff: true,
    teammateHPValue: 6000,
  }

  return {
    activeAbilities: [AbilityType.BASIC],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_HP_SCALING.buff(basicScaling, SOURCE_BASIC)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)

      if (r.healAbility == SKILL_DMG_TYPE) {
        x.HEAL_TYPE.set(SKILL_DMG_TYPE, SOURCE_SKILL)
        x.HEAL_SCALING.buff(skillHealScaling, SOURCE_SKILL)
        x.HEAL_FLAT.buff(skillHealFlat, SOURCE_SKILL)
      }
      if (r.healAbility == ULT_DMG_TYPE) {
        x.HEAL_TYPE.set(ULT_DMG_TYPE, SOURCE_ULT)
        x.HEAL_SCALING.buff(ultHealScaling, SOURCE_ULT)
        x.HEAL_FLAT.buff(ultHealFlat, SOURCE_ULT)
      }
      if (r.healAbility == NONE_TYPE) {
        x.HEAL_TYPE.set(NONE_TYPE, SOURCE_TALENT)
        x.HEAL_SCALING.buff(talentHealScaling, SOURCE_TALENT)
        x.HEAL_FLAT.buff(talentHealFlat, SOURCE_TALENT)
      }

      if (r.skillBuff) {
        x.HP.buff(skillHpFlatBuff, SOURCE_SKILL)
        x.UNCONVERTIBLE_HP_BUFF.buff(skillHpFlatBuff, SOURCE_SKILL)
      }

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.RES.buffTeam((e >= 6 && m.skillBuff) ? 0.30 : 0, SOURCE_E6)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.HP.buffTeam((t.skillBuff) ? skillHpPercentBuff * t.teammateHPValue : 0, SOURCE_SKILL)
      x.HP.buffTeam((t.skillBuff) ? skillHpFlatBuff : 0, SOURCE_SKILL)
      x.HP.buffTeam((e >= 6 && t.skillBuff) ? 0.06 * t.teammateHPValue : 0, SOURCE_E6)

      const atkBuffValue = (e >= 4 && t.skillBuff) ? 0.03 * t.teammateHPValue : 0
      x.ATK.buffTeam(atkBuffValue, SOURCE_E4)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardHpHealFinalizer(x)
    },
    gpuFinalizeCalculations: () => {
      return gpuStandardHpHealFinalizer()
    },
    dynamicConditionals: [
      {
        id: 'LynxHpConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.HP],
        chainsTo: [Stats.HP],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.skillBuff
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const hpBuffPercent = skillHpPercentBuff + (e >= 6 ? 0.06 : 0)

          dynamicStatConversion(Stats.HP, Stats.HP, this, x, action, context, SOURCE_SKILL,
            (convertibleValue) => convertibleValue * hpBuffPercent,
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          const hpBuffPercent = skillHpPercentBuff + (e >= 6 ? 0.06 : 0)

          return gpuDynamicStatConversion(Stats.HP, Stats.HP, this, action, context,
            `${hpBuffPercent} * convertibleValue`,
            `${wgslTrue(r.skillBuff)}`,
          )
        },
      },
      {
        id: 'LynxHpAtkConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.HP],
        chainsTo: [Stats.ATK],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.skillBuff
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.HP, Stats.ATK, this, x, action, context, SOURCE_E4,
            (convertibleValue) => convertibleValue * atkBuffPercent,
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.HP, Stats.ATK, this, action, context,
            `${atkBuffPercent} * convertibleValue`,
            `${wgslTrue(r.skillBuff)}`,
          )
        },
      },
    ],
  }
}

```

# 1000/March7th.ts

```ts
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

```

# 1200/March7thImaginary.ts

```ts
import { AbilityType, ADDITIONAL_DMG_TYPE, ASHBLAZING_ATK_STACK, BASIC_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { boostAshblazingAtkP, gpuBoostAshblazingAtkP, gpuStandardAdditionalDmgAtkFinalizer, standardAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityCd, buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

My Sword Zaps Demons

Basic ATK+1+20

Deals Imaginary DMG equal to 100% of March 7th's ATK to a single target enemy and gains 1 point(s) of Charge.

 Single 10

Lv6

Brows Be Smitten, Heart Be Bitten

Basic ATK+30

Initially, deals 3 hits, each causing Imaginary DMG equal to 80% of March 7th's ATK to a single target enemy. Whenever dealing the final hit, there is a 60% fixed chance to deal 1 additional hit of DMG, up to a max of 3 additional hit(s). Energy regenerated from using Enhanced Basic ATK does not increase with the number of hits.
Enhanced Basic ATK cannot recover Skill Points.

 Single 5

Lv6

Master, It's Tea Time!

Skill-1+30

Designates a single ally (excluding this unit) as "Shifu" and increases "Shifu"'s SPD by 10%. Only the most recent target of March 7th's Skill is considered as "Shifu."


Whenever using Basic ATK or dealing 1 hit of Enhanced Basic ATK's DMG, triggers the corresponding effect if "Shifu" with the specified Path is present on the field:

Erudition, Destruction, The Hunt, Remembrance: Deals Additional DMG (DMG Type based on "Shifu"'s Combat Type) equal to 20% of March 7th's ATK.

Harmony, Nihility, Preservation, Abundance: Increases the Toughness Reduction of this instance of DMG by 100%.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

Lv10

March 7th, the Apex Heroine

Ultimate110+5

Deals Imaginary DMG equal to 240% of March 7th's ATK to a single target enemy.
Increases the initial Hits Per Action of the next Enhanced Basic ATK by 2 hits and increase the fixed chance of additionally dealing DMG by 20%.

 Single 30

Lv10

Master, I've Ascended!

Talent+5

After Shifu uses an attack or Ultimate, March 7th gains up to 1 point of Charge each time.
Upon reaching 7 or more points of Charge, March 7th immediately takes action and increases the DMG she deals by 80%. Her Basic ATK gets Enhanced, and her Skill cannot be used. After using Enhanced Basic ATK, consumes 7 point(s) of Charge. Charge is capped at 10 points.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Feast in One Go

Technique

If March 7th is on the team, she gains 1 point of Charge at the start of the next battle whenever a teammate uses Technique, up to a max of 3 point(s).
After using Technique, March 7th regenerates 30 Energy when the next battle starts.


Stat Boosts

 +28.0% ATK
 +24.0% CRIT DMG
 +12.5% DEF

Swan Soar

When the battle starts, March 7th's action advances by 25%.


Filigree

March 7th can reduce the Toughness of enemies whose Weakness Type is the same as Shifu's Combat Type. When Breaking Weakness, triggers the Imaginary Weakness Break effect.


Tide Tamer

After using Enhanced Basic ATK, increases Shifu's CRIT DMG by 60% and Break Effect by 36%, lasting for 2 turn(s).



1 My Sword Stirs Starlight

When Shifu is on the field, increases March 7th's SPD by 10%.



2 Blade Dances on Waves' Fight

After "Shifu" uses Basic ATK or Skill to attack an enemy target, March 7th immediately launches a Follow-up ATK and deals Imaginary DMG equal to 60% of March 7th's ATK to the primary target of this attack. Additionally, triggers the corresponding effect based on "Shifu"'s Path and then gains 1 point(s) of Charge. If there is no primary target available to attack, then she attacks a single random enemy instead. This effect can only trigger once per turn. This attack deals a base Toughness reduction DMG of 5.0 and regenerates 5.0 Energy.



3 Sharp Wit in Martial Might

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Being Fabulous Never Frights

At the start of the turn, regenerates 5 Energy.



5 Sword Delights, Sugar Blights

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Me, the Best Girl in Sight

After using Ultimate, increases the CRIT DMG dealt by the next Enhanced Basic ATK by 50%.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.March7thImaginary')
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
  } = Source.character('1224')

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 0.80, 0.88)
  const basicExtraScalingMasterBuff = basic(e, 0.20, 0.22)
  const ultScaling = ult(e, 2.40, 2.592)
  const talentDmgBuff = talent(e, 0.80, 0.88)
  const skillSpdScaling = skill(e, 0.10, 0.108)

  // 0.06
  const fuaHitCountMulti = ASHBLAZING_ATK_STACK * (1 * 0.40 + 2 * 0.60)

  const defaults = {
    enhancedBasic: true,
    basicAttackHits: 6,
    talentDmgBuff: true,
    selfSpdBuff: true,
    masterAdditionalDmgBuff: true,
    masterToughnessRedBuff: true,
    e6CdBuff: true,
  }

  const teammateDefaults = {
    masterBuff: true,
    masterCdBeBuffs: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedBasic: {
      id: 'enhancedBasic',
      formItem: 'switch',
      text: t('Content.enhancedBasic.text'),
      content: t('Content.enhancedBasic.content', { BasicEnhancedScaling: TsUtils.precisionRound(100 * basicEnhancedScaling) }),
    },
    basicAttackHits: {
      id: 'basicAttackHits',
      formItem: 'slider',
      text: t('Content.basicAttackHits.text'),
      content: t('Content.basicAttackHits.content', { BasicEnhancedScaling: TsUtils.precisionRound(100 * basicEnhancedScaling) }),
      min: 3,
      max: 6,
    },
    masterAdditionalDmgBuff: {
      id: 'masterAdditionalDmgBuff',
      formItem: 'switch',
      text: t('Content.masterAdditionalDmgBuff.text'),
      content: t('Content.masterAdditionalDmgBuff.content', { ShifuDmgBuff: TsUtils.precisionRound(100 * basicExtraScalingMasterBuff) }),
    },
    masterToughnessRedBuff: {
      id: 'masterToughnessRedBuff',
      formItem: 'switch',
      text: t('Content.masterToughnessRedBuff.text'),
      content: t('Content.masterToughnessRedBuff.content'),
    },
    talentDmgBuff: {
      id: 'talentDmgBuff',
      formItem: 'switch',
      text: t('Content.talentDmgBuff.text'),
      content: t('Content.talentDmgBuff.content', { TalentDmgBuff: TsUtils.precisionRound(100 * talentDmgBuff) }),
    },
    selfSpdBuff: {
      id: 'selfSpdBuff',
      formItem: 'switch',
      text: t('Content.selfSpdBuff.text'),
      content: t('Content.selfSpdBuff.content'),
      disabled: e < 1,
    },
    e6CdBuff: {
      id: 'e6CdBuff',
      formItem: 'switch',
      text: t('Content.e6CdBuff.text'),
      content: t('Content.e6CdBuff.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    masterBuff: {
      id: 'masterBuff',
      formItem: 'switch',
      text: t('TeammateContent.masterBuff.text'),
      content: t('TeammateContent.masterBuff.content', { ShifuSpeedBuff: TsUtils.precisionRound(100 * skillSpdScaling) }),
    },
    masterCdBeBuffs: {
      id: 'masterCdBeBuffs',
      formItem: 'switch',
      text: t('TeammateContent.masterCdBeBuffs.text'),
      content: t('TeammateContent.masterCdBeBuffs.content'),
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => (teammateDefaults),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.SPD_P.buff((e >= 1 && r.selfSpdBuff) ? 0.10 : 0, SOURCE_E1)
      buffAbilityDmg(x, BASIC_DMG_TYPE | ADDITIONAL_DMG_TYPE, (r.talentDmgBuff) ? talentDmgBuff : 0, SOURCE_TALENT)

      buffAbilityCd(x, BASIC_DMG_TYPE | ADDITIONAL_DMG_TYPE, (e >= 6 && r.e6CdBuff && r.enhancedBasic) ? 0.50 : 0, SOURCE_E6)

      const additionalMasterBuffScaling = (r.masterAdditionalDmgBuff)
        ? basicExtraScalingMasterBuff * r.basicAttackHits
        : 0
      x.BASIC_ATK_SCALING.buff((r.enhancedBasic) ? basicEnhancedScaling * r.basicAttackHits : basicScaling, SOURCE_BASIC)
      x.BASIC_ADDITIONAL_DMG_SCALING.buff((r.enhancedBasic) ? additionalMasterBuffScaling : basicExtraScalingMasterBuff, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_ATK_SCALING.buff((e >= 2) ? 0.60 : 0, SOURCE_E2)

      const toughnessDmgBoost = (r.masterToughnessRedBuff) ? 2.0 : 1.0
      x.BASIC_TOUGHNESS_DMG.buff(toughnessDmgBoost * ((r.enhancedBasic) ? 5 * r.basicAttackHits : 10), SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff((e >= 2) ? 10 : 0, SOURCE_E2)

      return x
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.SPD_P.buffSingle((t.masterBuff) ? skillSpdScaling : 0, SOURCE_SKILL)

      x.CD.buffSingle((t.masterBuff && t.masterCdBeBuffs) ? 0.60 : 0, SOURCE_TRACE)
      x.BE.buffSingle((t.masterBuff && t.masterCdBeBuffs) ? 0.36 : 0, SOURCE_TRACE)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkP(x, action, context, fuaHitCountMulti)
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkP(fuaHitCountMulti) + gpuStandardAdditionalDmgAtkFinalizer()
    },
  }
}

```

# 1300/Misha.ts

```ts
import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

E—Excuse Me, Please!

Basic ATK+1+20

Deals Ice DMG equal to 100% of Misha's ATK to a single target enemy.

 Single 10

Lv6

R—Room Service!

Skill-1+30

Increases the Hits Per Action for Misha's next Ultimate by 1 hit(s). Deals Ice DMG equal to 200% of Misha's ATK to a single target enemy, and Ice DMG equal to 80% of Misha's ATK to adjacent targets.

 Single 20 | Other 10

Lv10

G—Gonna Be Late!

Ultimate100+5

Has 3 Hits Per Action by default. First, uses 1 hit to deal Ice DMG equal to 60% of Misha's ATK to a single target enemy. Then, the rest of the hits each deals Ice DMG equal to 60% of Misha's ATK to a single random enemy. Just before each hit lands, there is a 20% base chance to Freeze the target, lasting for 1 turn.
While Frozen, enemy targets cannot take any actions, and at the start of their turn, they receive Ice Additional DMG equal to 30% of Misha's ATK.
This Ultimate can possess up to 10 Hits Per Action. After the Ultimate is used, its Hits Per Action will be reset to the default level.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

 Single 10

Lv10

Horological Escapement

Talent

For every 1 Skill Point allies consume, Misha's next Ultimate delivers 1 more Hit(s) Per Action, and Misha regenerates 2 Energy.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Wait, You Are So Beautiful!

Technique

After using the Technique, creates a Special Dimension that lasts for 15 seconds. Enemies caught in the Special Dimension are inflicted with Dream Prison and stop all their actions. Upon entering battle against enemies afflicted with Dream Prison, increases the Hits Per Action for Misha's next Ultimate by 2 hit(s). Only 1 Dimension Effect created by allies can exist at the same time.


Stat Boosts

 +22.4% Ice DMG Boost
 +22.5% DEF
 +6.7% CRIT Rate

Release

Before the Ultimate's first hit, increases the base chance of Freezing the target by 80%.


Interlock

When using the Ultimate, increases the Effect Hit Rate by 60%, lasting until the end of the current Ultimate's action.


Transmission

When dealing DMG to Frozen enemies, increases CRIT DMG by 30%.



1 Whimsicality of Fancy

When using the Ultimate, for every enemy on the field, additionally increases the Hits Per Action for the current Ultimate by 1 hit(s), up to a maximum increase of 5 hit(s).



2 Yearning of Youth

Before each hit of the Ultimate lands, there is a 24% base chance of reducing the target's DEF by 16% for 3 turn(s).



3 Vestige of Happiness

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Visage of Kinship

Increases the DMG multiplier for each hit of the Ultimate by 6%.



5 Genesis of First Love

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Estrangement of Dream

When using the Ultimate, increases own DMG by 30%, lasting until the end of the turn. In addition, the next time the Skill is used, recovers 1 Skill Point(s) for the team.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Misha')
  const { basic, skill, ult } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
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
  } = Source.character('1312')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)
  let ultStackScaling = ult(e, 0.60, 0.65)
  ultStackScaling += (e >= 4 ? 0.06 : 0)

  const defaults = {
    ultHitsOnTarget: 10,
    enemyFrozen: true,
    e2DefReduction: true,
    e6UltDmgBoost: true,
  }

  const teammateDefaults = {
    e2DefReduction: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultHitsOnTarget: {
      id: 'ultHitsOnTarget',
      formItem: 'slider',
      text: t('Content.ultHitsOnTarget.text'),
      content: t('Content.ultHitsOnTarget.content', { ultStackScaling: TsUtils.precisionRound(100 * ultStackScaling) }),
      min: 1,
      max: 10,
    },
    enemyFrozen: {
      id: 'enemyFrozen',
      formItem: 'switch',
      text: t('Content.enemyFrozen.text'),
      content: t('Content.enemyFrozen.content'),
    },
    e2DefReduction: {
      id: 'e2DefReduction',
      formItem: 'switch',
      text: t('Content.e2DefReduction.text'),
      content: t('Content.e2DefReduction.content'),
      disabled: e < 2,
    },
    e6UltDmgBoost: {
      id: 'e6UltDmgBoost',
      formItem: 'switch',
      text: t('Content.e6UltDmgBoost.text'),
      content: t('Content.e6UltDmgBoost.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    e2DefReduction: content.e2DefReduction,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.CD.buff((r.enemyFrozen) ? 0.30 : 0, SOURCE_TRACE)

      x.ELEMENTAL_DMG.buff((e >= 6 && r.e6UltDmgBoost) ? 0.30 : 0, SOURCE_E6)

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultStackScaling * (r.ultHitsOnTarget), SOURCE_ULT)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(10 + 5 * (r.ultHitsOnTarget - 1), SOURCE_ULT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.DEF_PEN.buffTeam((e >= 2 && m.e2DefReduction) ? 0.16 : 0, SOURCE_E2)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {},
    gpuFinalizeCalculations: () => '',
  }
}

```

# 1200/Moze.ts

```ts
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

```

# 1100/Natasha.ts

```ts
import { AbilityType, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardHpHealFinalizer, standardHpHealFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Behind the Kindness

Basic ATK+1+20

Deals Physical DMG equal to 100% of Natasha's ATK to a single enemy.

 Single 10

Lv6

Love, Heal, and Choose

Skill-1+30

Restores a single ally for 10.5% of Natasha's Max HP plus 280. Restores the ally for another 7.2% of Natasha's Max HP plus 192 at the beginning of each turn for 2 turn(s).

Lv10

Gift of Rebirth

Ultimate90+5

Heals all allies for 13.8% of Natasha's Max HP plus 368.

Lv10

Innervation

Talent

When healing allies with HP percentage at 30% or lower, increases Natasha's Outgoing Healing by 50%. This effect also works on continuous healing.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Hypnosis Research

Technique

Immediately attacks the enemy. After entering battle, deals Physical DMG equal to 80% of Natasha's ATK to a random enemy, with a 100% base chance to Weaken all enemies.
While Weakened, enemies deal 30% less DMG to allies for 1 turn(s).

 Single 20


Stat Boosts

 +28.0% HP
 +18.0% Effect RES
 +12.5% DEF

Soothe

When using Skill, dispels 1 debuff(s) from one designated ally.


Healer

Natasha's Outgoing Healing increases by 10%.


Recuperation

Increases the duration of Skill's continuous healing effect for 1 turn(s).



1 Pharmacology Expertise

After being attacked, if the current HP percentage is 30% or lower, heals self for 1 time to restore HP by an amount equal to 15% of Max HP plus 400. This effect can only be triggered 1 time per battle.



2 Clinical Research

When Natasha uses her Ultimate, grant continuous healing for 1 turn(s) to allies whose HP percentage is at 30% or lower. And at the beginning of their turn, their HP is restored by an amount equal to 6% of Natasha's Max HP plus 160.



3 The Right Cure

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Miracle Cure

After being attacked, regenerates 5 extra Energy.



5 Preventive Treatment

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Doctor's Grace

Natasha's Basic ATK additionally deals Physical DMG equal to 40% of her Max HP.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Natasha')
  const tHeal = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealAbility')
  const { basic, skill, ult } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
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
  } = Source.character('1105')

  const basicScaling = basic(e, 1.00, 1.10)

  const ultHealScaling = ult(e, 0.138, 0.1472)
  const ultHealFlat = ult(e, 368, 409.4)

  const skillHealScaling = skill(e, 0.105, 0.112)
  const skillHealFlat = skill(e, 280, 311.5)

  const content: ContentDefinition<typeof defaults> = {
    healAbility: {
      id: 'healAbility',
      formItem: 'select',
      text: tHeal('Text'),
      content: tHeal('Content'),
      options: [
        { display: tHeal('Skill'), value: SKILL_DMG_TYPE, label: tHeal('Skill') },
        { display: tHeal('Ult'), value: ULT_DMG_TYPE, label: tHeal('Ult') },
      ],
      fullWidth: true,
    },
  }

  const defaults = {
    healAbility: ULT_DMG_TYPE,
  }

  return {
    activeAbilities: [AbilityType.BASIC],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.OHB.buff(0.10, SOURCE_TRACE)

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.BASIC_HP_SCALING.buff((e >= 6) ? 0.40 : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)

      if (r.healAbility == SKILL_DMG_TYPE) {
        x.HEAL_TYPE.set(SKILL_DMG_TYPE, SOURCE_SKILL)
        x.HEAL_SCALING.buff(skillHealScaling, SOURCE_SKILL)
        x.HEAL_FLAT.buff(skillHealFlat, SOURCE_SKILL)
      }
      if (r.healAbility == ULT_DMG_TYPE) {
        x.HEAL_TYPE.set(ULT_DMG_TYPE, SOURCE_ULT)
        x.HEAL_SCALING.buff(ultHealScaling, SOURCE_ULT)
        x.HEAL_FLAT.buff(ultHealFlat, SOURCE_ULT)
      }

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardHpHealFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardHpHealFinalizer(),
  }
}

```

# 1100/Pela.ts

```ts
import { AbilityType, BASIC_DMG_TYPE, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardAdditionalDmgAtkFinalizer, standardAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Frost Shot

Basic ATK+1+20

Deals Ice DMG equal to 100% of Pela's ATK to a single target enemy.

 Single 10

Lv6

Frostbite

Skill-1+30

Removes 1 buff(s) and deals Ice DMG equal to 210% of Pela's ATK to one designated target enemy.

 Single 20

Lv10

Zone Suppression

Ultimate110+5

Deals Ice DMG equal to 100% of Pela's ATK to all enemies, with a 100% base chance to inflict Exposed on all enemies.
When Exposed, enemies' DEF is reduced by 40% for 2 turn(s).

 All 20

Lv10

Data Collecting

Talent

If the enemy is debuffed after Pela's attack, Pela will restore 10 additional Energy. This effect can only be triggered 1 time per attack.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Preemptive Strike

Technique

Immediately attacks the enemy. Upon entering battle, Pela deals Ice DMG equal to 80% of her ATK to a random enemy, with a 100% base chance of lowering the DEF of all enemies by 20% for 2 turn(s).

 Single 20


Stat Boosts

 +22.4% Ice DMG Boost
 +18.0% ATK
 +10.0% Effect Hit Rate

Bash

Deals 20% more DMG to debuffed enemy targets.


The Secret Strategy

When Pela is on the battlefield, all allies' Effect Hit Rate increases by 10%.


Wipe Out

When using Skill to dispel buff(s), increases the DMG dealt by the next attack by 20%.



1 Victory Report

When an enemy is defeated, Pela regenerates 5 Energy.



2 Adamant Charge

Using Skill to dispel buff(s) increases SPD by 10% for 2 turn(s).
Hidden Stat: 1.0



3 Suppressive Force

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Full Analysis

When using Skill, there is a 100% base chance to reduce the target enemy's Ice RES by 12% for 2 turn(s).



5 Absolute Jeopardy

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Feeble Pursuit

After Pela attacks, if the enemy target is debuffed, deals Ice Additional DMG equal to 40% of Pela's ATK to the enemy.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Pela')
  const { basic, skill, ult } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
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
  } = Source.character('1106')

  const ultDefPenValue = ult(e, 0.40, 0.42)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.10, 2.31)
  const ultScaling = ult(e, 1.00, 1.08)

  const defaults = {
    teamEhrBuff: true,
    enemyDebuffed: true,
    skillRemovedBuff: false,
    ultDefPenDebuff: true,
    e4SkillResShred: true,
  }

  const teammateDefaults = {
    teamEhrBuff: true,
    ultDefPenDebuff: true,
    e4SkillResShred: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    teamEhrBuff: {
      id: 'teamEhrBuff',
      formItem: 'switch',
      text: t('Content.teamEhrBuff.text'),
      content: t('Content.teamEhrBuff.content'),
    },
    enemyDebuffed: {
      id: 'enemyDebuffed',
      formItem: 'switch',
      text: t('Content.enemyDebuffed.text'),
      content: t('Content.enemyDebuffed.content'),
    },
    skillRemovedBuff: {
      id: 'skillRemovedBuff',
      formItem: 'switch',
      text: t('Content.skillRemovedBuff.text'),
      content: t('Content.skillRemovedBuff.content'),
    },
    ultDefPenDebuff: {
      id: 'ultDefPenDebuff',
      formItem: 'switch',
      text: t('Content.ultDefPenDebuff.text'),
      content: t('Content.ultDefPenDebuff.content', { ultDefPenValue: TsUtils.precisionRound(100 * ultDefPenValue) }),
    },
    e4SkillResShred: {
      id: 'e4SkillResShred',
      formItem: 'switch',
      text: t('Content.e4SkillResShred.text'),
      content: t('Content.e4SkillResShred.content'),
      disabled: e < 4,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    teamEhrBuff: content.teamEhrBuff,
    ultDefPenDebuff: content.ultDefPenDebuff,
    e4SkillResShred: content.e4SkillResShred,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.SPD_P.buff((e >= 2 && r.skillRemovedBuff) ? 0.10 : 0, SOURCE_E2)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      buffAbilityDmg(x, BASIC_DMG_TYPE | SKILL_DMG_TYPE | ULT_DMG_TYPE, (r.skillRemovedBuff) ? 0.20 : 0, SOURCE_TRACE)
      x.ELEMENTAL_DMG.buff((r.enemyDebuffed) ? 0.20 : 0, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      x.BASIC_ADDITIONAL_DMG_SCALING.buff((e >= 6 && r.enemyDebuffed) ? 0.40 : 0, SOURCE_TALENT)
      x.SKILL_ADDITIONAL_DMG_SCALING.buff((e >= 6 && r.enemyDebuffed) ? 0.40 : 0, SOURCE_TALENT)
      x.ULT_ADDITIONAL_DMG_SCALING.buff((e >= 6 && r.enemyDebuffed) ? 0.40 : 0, SOURCE_TALENT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.EHR.buffTeam((m.teamEhrBuff) ? 0.10 : 0, SOURCE_TRACE)

      x.DEF_PEN.buffTeam((m.ultDefPenDebuff) ? ultDefPenValue : 0, SOURCE_ULT)
      x.ICE_RES_PEN.buffTeam((e >= 4 && m.e4SkillResShred) ? 0.12 : 0, SOURCE_E4)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardAdditionalDmgAtkFinalizer(),
  }
}

```

# 1200/Qingque.ts

```ts
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

```

# 1300/Rappa.ts

```ts
import { AbilityType, BREAK_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityVulnerability, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Ninjutsu: Rise Above Tumbles

Basic ATK+1+20

Deals Imaginary DMG equal to 100% of Rappa's ATK to one designated enemy.

 Single 10

Lv6

Ninja Strike: Rooted Resolute

Skill-1+30

Deals Imaginary DMG equal to 120% of Rappa's ATK to all enemies.

 All 10

Lv10

Nindō Supreme: Aishiteru

Ultimate140+5

Enters the "Sealform" state, immediately gains 1 extra turn, obtains 3 points of "Chroma Ink," and increases Weakness Break Efficiency by 50% and Break Effect by 30%.
While in the "Sealform" state, Basic ATK is enhanced, and Skill and Ultimate cannot be used. After using Enhanced Basic ATK, consumes 1 point of "Chroma Ink." When "Chroma Ink" is depleted, exits the "Sealform" state.

Extra Turn
Gain 1 extra turn that won't expend your remaining turns when taking action. During this extra turn, no Ultimate can be used.

Lv10

Ninja Tech: Endurance Gauge

Talent

Each time the enemy target is Weakness Broken, Rappa gains 1 point of Charge, up to a max of 10 points of Charge. When Rappa next launches the third hit of "Ningu: Demonbane Petalblade," additionally deals Break DMG equal to 60% of Rappa's Imaginary Break DMG to all enemies. This DMG can ignore Weakness Type to reduce 2 Toughness, consuming all Charge. Each point of Charge increases the Break DMG multiplier by 50% and increases the Toughness Reduction that can ignore Weakness Type by 1.
When Breaking Weakness, triggers the Imaginary Weakness Break effect.
Hidden Stat: 0

 Single 2

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Ninja Dash: By Leaps and Bounds

Technique

After using Technique, enters the "Graffiti" state for 20 seconds. While in the "Graffiti" state, moves forward rapidly for a set distance and attacks any enemies touched. During the rapid movement, can block all enemies' attacks. Using an attack in the "Graffiti" state can end the state's duration early. After entering combat via attacking enemies, deals 30 Toughness Reduction regardless of Weakness Type and Break DMG equal to 200% of Rappa's Imaginary Break DMG to each enemy target, and deals Break DMG equal to 180% of Rappa's Imaginary Break DMG to adjacent targets. At the same time, this unit regenerates 10 Energy.

 Single 30


Ningu: Demonbane Petalblade

Basic ATK+5


Hidden Stat: 1
Hidden Stat: 0.5
Hidden Stat: 1
Hidden Stat: 0.5

 Single 10 | Other 5

Lv6

Ningu: Demonbane Petalblade

Basic ATK+5


Hidden Stat: 1
Hidden Stat: 0.5

 Single 10 | Other 5

Lv6

Ningu: Demonbane Petalblade

Basic ATK+10


Hidden Stat: 1

 All 5

Lv6

Ningu: Demonbane Petalblade

Basic ATK

Launches "Ningu: Demonbane Petalblade." The first 2 hits deal Imaginary DMG equal to 100% of Rappa's ATK to one designated enemy and Imaginary DMG equal to 50% of Rappa's ATK to adjacent targets, and the 3rd hit deals Imaginary DMG equal to 100% of Rappa's ATK to all enemies.
Enhanced Basic ATK will not recover Skill Points. Attacking enemies that don't have Imaginary Weakness can also reduce Toughness, whose effect is equal to 50% of the original Toughness Reduction. When Breaking Weakness, triggers the Imaginary Weakness Break effect.

 Single 25 | Other 15

Lv6

Stat Boosts

 +28.0% ATK
 +9.0 SPD
 +13.3% Break Effect

Ninjutsu Inscription: Sky High

When the Weakness of an elite-level or higher enemy is broken, Rappa additionally gains 1 point(s) of Charge and regenerates 10 Energy.


Ninjutsu Inscription: Sea Echo

While in the "Sealform" state, after Rappa uses Enhanced Basic ATK to deal DMG to a Weakness Broken enemy target, converts the Toughness Reduction from this instance of DMG to 1 instance of 60% Super Break DMG.

Super Break DMG
Super Break DMG increases with higher Break Effect, higher Toughness Reduction of the attack, and higher character levels.
Super Break DMG cannot CRIT Hit and is not affected by DMG Boost effects.
Super Break DMG is also considered Break DMG.


Ninjutsu Inscription: Withered Leaf

When an enemy target becomes Weakness Broken, increases the Break DMG taken by 2%. If Rappa's current ATK is higher than 2400, for every 100 excess ATK, additionally increases this value by 1%, up to a max additional increase of 8%. This effect lasts for 2 turn(s).

Break DMG
Break DMG increases with higher Break Effect, higher target max Toughness, and higher character levels.
Break DMG cannot CRIT Hit and is not affected by DMG Boost effects.



1 Returned Is the Revenant With No Ferry Toll

During the "Sealform" state entered by using Ultimate, DMG dealt by Rappa ignores 15% of the targets' DEF. After exiting the "Sealform" state, regenerates 20 Energy.



2 Free Is the Mind Enlightened by Haikus

The Enhanced Basic ATK's first 2 hits have their Toughness Reduction against the one designated enemy increased by 50%.



3 Many Are the Shrines That Repel No Hell

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Lost Is the Nindō Devoured by Time

While in the "Sealform" state, increases all allies' SPD by 12%.



5 Steady Is The Ranger With Unerring Arrows

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Righteous Is the Wrath That Spares No Evil

When battle starts, Rappa gains 5 point(s) of her Talent's Charge, and its upper limit increases by 5 point(s). After launching the third hit of "Ningu: Demonbane Petalblade," gains 5 point(s) of Charge.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Rappa')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('1317')

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 2.00, 2.32)

  const skillScaling = skill(e, 1.20, 1.32)

  const ultBeBuff = ult(e, 0.30, 0.34)

  const talentBreakDmgModifier = talent(e, 0.60, 0.66)
  const talentChargeMultiplier = talent(e, 0.50, 0.55)

  const maxChargeStacks = e >= 6 ? 15 : 10

  const teammateDefaults = {
    teammateBreakVulnerability: 0.10,
    e4SpdBuff: true,
  }

  const defaults = {
    sealformActive: true,
    atkToBreakVulnerability: true,
    chargeStacks: e >= 6 ? 10 : 5,
    e1DefPen: true,
    e2Buffs: true,
    e4SpdBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    sealformActive: {
      id: 'sealformActive',
      formItem: 'switch',
      text: t('Content.sealformActive.text'),
      content: t('Content.sealformActive.content', { ultBeBuff: TsUtils.precisionRound(100 * ultBeBuff) }),
    },
    atkToBreakVulnerability: {
      id: 'atkToBreakVulnerability',
      formItem: 'switch',
      text: t('Content.atkToBreakVulnerability.text'),
      content: t('Content.atkToBreakVulnerability.content'),
    },
    chargeStacks: {
      id: 'chargeStacks',
      formItem: 'slider',
      text: t('Content.chargeStacks.text'),
      content: t('Content.chargeStacks.content', { talentChargeMultiplier: TsUtils.precisionRound(100 * talentChargeMultiplier) }),
      min: 0,
      max: maxChargeStacks,
    },
    e1DefPen: {
      id: 'e1DefPen',
      formItem: 'switch',
      text: t('Content.e1DefPen.text'),
      content: t('Content.e1DefPen.content'),
      disabled: e < 1,
    },
    e2Buffs: {
      id: 'e2Buffs',
      formItem: 'switch',
      text: t('Content.e2Buffs.text'),
      content: t('Content.e2Buffs.content'),
      disabled: e < 2,
    },
    e4SpdBuff: {
      id: 'e4SpdBuff',
      formItem: 'switch',
      text: t('Content.e4SpdBuff.text'),
      content: t('Content.e4SpdBuff.content'),
      disabled: e < 4,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    teammateBreakVulnerability: {
      id: 'teammateBreakVulnerability',
      formItem: 'slider',
      text: t('TeammateContent.teammateBreakVulnerability.text'),
      content: t('TeammateContent.teammateBreakVulnerability.content'),
      min: 0,
      max: 0.10,
      percent: true,
    },
    e4SpdBuff: {
      id: 'e4SpdBuff',
      formItem: 'switch',
      text: t('TeammateContent.e4SpdBuff.text'),
      content: t('TeammateContent.e4SpdBuff.content'),
      disabled: e < 4,
    },
  }
  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.sealformActive) {
        x.ENEMY_WEAKNESS_BROKEN.config(1, SOURCE_TRACE)
      }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BE.buff((r.sealformActive) ? ultBeBuff : 0, SOURCE_ULT)
      x.BREAK_EFFICIENCY_BOOST.buff((r.sealformActive) ? 0.50 : 0, SOURCE_ULT)

      x.DEF_PEN.buff((e >= 1 && r.sealformActive && r.e1DefPen) ? 0.15 : 0, SOURCE_E1)

      x.SPD_P.buff((e >= 4 && r.sealformActive && r.e4SpdBuff) ? 0.12 : 0, SOURCE_E4)

      x.BASIC_SUPER_BREAK_MODIFIER.buff((r.sealformActive) ? 0.60 : 0, SOURCE_TRACE)

      x.BASIC_BREAK_DMG_MODIFIER.set(talentBreakDmgModifier + r.chargeStacks * talentChargeMultiplier, SOURCE_TALENT)

      x.BASIC_ATK_SCALING.buff((r.sealformActive) ? basicEnhancedScaling : basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)

      x.BASIC_TOUGHNESS_DMG.buff((r.sealformActive) ? 25 + (2 + r.chargeStacks) : 10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(10, SOURCE_SKILL)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      buffAbilityVulnerability(x, BREAK_DMG_TYPE, t.teammateBreakVulnerability, SOURCE_TRACE, Target.TEAM)

      x.SPD_P.buffTeam((e >= 4 && t.e4SpdBuff) ? 0.12 : 0, SOURCE_E4)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const atkOverStacks = Math.floor(TsUtils.precisionRound((x.a[Key.ATK] - 2400) / 100))
      const buffValue = Math.min(0.08, Math.max(0, atkOverStacks) * 0.01) + 0.02
      buffAbilityVulnerability(x, BREAK_DMG_TYPE, buffValue, SOURCE_TRACE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(r.atkToBreakVulnerability)}) {
  let atkOverStacks: f32 = floor((x.ATK - 2400) / 100);
  let buffValue: f32 = min(0.08, max(0, atkOverStacks) * 0.01) + 0.02;
  
  buffAbilityVulnerability(p_x, BREAK_DMG_TYPE, buffValue, 1);
}
      `
    },
  }
}

```

# 1300/Robin.ts

```ts
import { AbilityType, FUA_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuUltAdditionalDmgAtkFinalizer, ultAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityCd, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Wingflip White Noise

Basic ATK+1+20

Deals Physical DMG equal to 100% of Robin's ATK to a single target enemy.

 Single 10

Lv6

Pinion's Aria

Skill-1+30

Increase DMG dealt by all allies by 50%, lasting for 3 turn(s). This duration decreases by 1 at the start of Robin's every turn.

Lv10

Vox Harmonique, Opus Cosmique

Ultimate160+5

Robin enters the Concerto state and makes all teammates (i.e., excluding this unit) immediately take action.
While in the Concerto state, increases all allies' ATK by 22.8% of Robin's ATK plus 200. Moreover, after every attack by ally targets, Robin deals Physical Additional DMG equal to 120% of her ATK for 1 time, with a fixed CRIT Rate for this damage set at 100% and fixed CRIT DMG set at 150%.
While in the Concerto state, Robin is immune to Crowd Control debuffs and cannot enter her turn or take action until the Concerto state ends.
A Concerto countdown appears on the Action Order bar. When the countdown's turn begins, Robin exits the Concerto state and immediately takes action. The countdown has its own fixed SPD of 90.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

Crowd Control debuff
Freeze, Entanglement, Imprisonment, Dominated, Outrage, Strong Reverberation, Alien Dream, Snarelock, Terrified.

Lv10

Tonal Resonance

Talent

Increase all allies' CRIT DMG by 20%. Moreover, after allies attack enemy targets, Robin additionally regenerates 2 Energy for herself.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Overture of Inebriation

Technique

After using Technique, creates a Special Dimension around the character that lasts for 15 seconds. Enemies within this dimension will not attack Robin and will follow Robin while the dimension is active. After entering battle while the dimension is active, Robin regenerates 5 Energy at the start of each wave. Only 1 Dimension Effect created by allies can exist at the same time.


Stat Boosts

 +28.0% ATK
 +18.0% HP
 +5.0 SPD

Coloratura Cadenza

When the battle begins, action advances this character by 25%.


Impromptu Flourish

While the Concerto state is active, the CRIT DMG dealt when all allies launch Follow-up ATK increases by 25%.


Sequential Passage

When using Skill, additionally regenerates 5 Energy.



1 Land of Smiles

While the "Concerto" state is active, all allies' All-Type RES PEN increases by 24%.



2 Afternoon Tea For Two

While the Concerto state is active, all allies' SPD increases by 16%. The Talent's Energy Regeneration effect additionally increases by 1.



3 Inverted Tuning

Skill Lv. +2, up to a maximum of Lv. 15.
Ultimate Lv. +2, up to a maximum of Lv. 15.



4 Raindrop Key

When using the Ultimate, dispels Crowd Control debuffs from all allies. While Robin is in the "Concerto" state, increases the Effect RES of all allies by 50%.

Crowd Control debuff
Freeze, Entanglement, Imprisonment, Dominated, Outrage, Strong Reverberation, Alien Dream, Snarelock, Terrified.



5 Lonestar's Lament

Basic ATK Lv. +1, up to a maximum of Lv. 10.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Moonless Midnight

While the "Concerto" state is active, the CRIT DMG for the Physical Additional DMG caused by the Ultimate increases by 450%. The effect of "Moonless Midnight" can trigger up to 8 time(s) and the trigger count is resets each time the Ultimate is used.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Robin')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_ULT_3_BASIC_TALENT_5
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
  } = Source.character('1309')

  const skillDmgBuffValue = skill(e, 0.50, 0.55)
  const talentCdBuffValue = talent(e, 0.20, 0.23)
  const ultAtkBuffScalingValue = ult(e, 0.228, 0.2432)
  const ultAtkBuffFlatValue = ult(e, 200, 230)

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 1.20, 1.296)

  const defaults = {
    concertoActive: true,
    skillDmgBuff: true,
    talentCdBuff: true,
    e1UltResPen: true,
    e2UltSpdBuff: false,
    e4TeamResBuff: false,
    e6UltCDBoost: true,
  }

  const teammateDefaults = {
    concertoActive: true,
    skillDmgBuff: true,
    talentCdBuff: true,
    teammateATKValue: 4500,
    traceFuaCdBoost: true,
    e1UltResPen: true,
    e2UltSpdBuff: true,
    e4TeamResBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    concertoActive: {
      id: 'concertoActive',
      formItem: 'switch',
      text: t('Content.concertoActive.text'),
      content: t('Content.concertoActive.content', {
        ultAtkBuffScalingValue: TsUtils.precisionRound(100 * ultAtkBuffScalingValue),
        ultAtkBuffFlatValue: ultAtkBuffFlatValue,
        ultScaling: TsUtils.precisionRound(100 * ultScaling),
      }),
    },
    skillDmgBuff: {
      id: 'skillDmgBuff',
      formItem: 'switch',
      text: t('Content.skillDmgBuff.text'),
      content: t('Content.skillDmgBuff.content', { skillDmgBuffValue: TsUtils.precisionRound(100 * skillDmgBuffValue) }),
    },
    talentCdBuff: {
      id: 'talentCdBuff',
      formItem: 'switch',
      text: t('Content.talentCdBuff.text'),
      content: t('Content.talentCdBuff.content', { talentCdBuffValue: TsUtils.precisionRound(100 * talentCdBuffValue) }),
    },
    e1UltResPen: {
      id: 'e1UltResPen',
      formItem: 'switch',
      text: t('Content.e1UltResPen.text'),
      content: t('Content.e1UltResPen.content'),
      disabled: e < 1,
    },
    e2UltSpdBuff: {
      id: 'e2UltSpdBuff',
      formItem: 'switch',
      text: t('TeammateContent.e2UltSpdBuff.text'),
      content: t('TeammateContent.e2UltSpdBuff.content'),
      disabled: e < 2,
    },
    e4TeamResBuff: {
      id: 'e4TeamResBuff',
      formItem: 'switch',
      text: t('Content.e4TeamResBuff.text'),
      content: t('Content.e4TeamResBuff.content'),
      disabled: e < 4,
    },
    e6UltCDBoost: {
      id: 'e6UltCDBoost',
      formItem: 'switch',
      text: t('Content.e6UltCDBoost.text'),
      content: t('Content.e6UltCDBoost.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    concertoActive: content.concertoActive,
    skillDmgBuff: content.skillDmgBuff,
    teammateATKValue: {
      id: 'teammateATKValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateATKValue.text'),
      content: t('TeammateContent.teammateATKValue.content', {
        ultAtkBuffFlatValue: TsUtils.precisionRound(ultAtkBuffFlatValue),
        ultAtkBuffScalingValue: TsUtils.precisionRound(100 * ultAtkBuffScalingValue),
      }),
      min: 0,
      max: 7000,
    },
    talentCdBuff: content.talentCdBuff,
    traceFuaCdBoost: {
      id: 'traceFuaCdBoost',
      formItem: 'switch',
      text: t('TeammateContent.traceFuaCdBoost.text'),
      content: t('TeammateContent.traceFuaCdBoost.content'),
    },
    e1UltResPen: content.e1UltResPen,
    e2UltSpdBuff: content.e2UltSpdBuff,
    e4TeamResBuff: content.e4TeamResBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.ULT_ADDITIONAL_DMG_SCALING.buff((r.concertoActive) ? ultScaling : 0, SOURCE_ULT)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)

      if (r.concertoActive) {
        x.ATK.buff(ultAtkBuffFlatValue, SOURCE_ULT)
        x.UNCONVERTIBLE_ATK_BUFF.buff(ultAtkBuffFlatValue, SOURCE_ULT)
      }

      x.ULT_ADDITIONAL_DMG_CR_OVERRIDE.buff(1.00, SOURCE_ULT)
      x.ULT_ADDITIONAL_DMG_CD_OVERRIDE.buff((e >= 6 && r.concertoActive && r.e6UltCDBoost) ? 6.00 : 1.50, SOURCE_ULT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.CD.buffTeam((m.talentCdBuff) ? talentCdBuffValue : 0, SOURCE_TALENT)
      x.RES.buffTeam((e >= 4 && m.concertoActive && m.e4TeamResBuff) ? 0.50 : 0, SOURCE_E4)

      x.SPD_P.buffTeam((e >= 2 && m.concertoActive && m.e2UltSpdBuff) ? 0.16 : 0, SOURCE_E2)

      x.ELEMENTAL_DMG.buffTeam((m.skillDmgBuff) ? skillDmgBuffValue : 0, SOURCE_SKILL)
      x.RES_PEN.buffTeam((e >= 1 && m.concertoActive && m.e1UltResPen) ? 0.24 : 0, SOURCE_E1)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const atkBuff = (t.concertoActive) ? t.teammateATKValue * ultAtkBuffScalingValue + ultAtkBuffFlatValue : 0
      x.ATK.buffTeam(atkBuff, SOURCE_ULT)
      x.UNCONVERTIBLE_ATK_BUFF.buffTeam(atkBuff, SOURCE_ULT)

      buffAbilityCd(x, FUA_DMG_TYPE, t.traceFuaCdBoost && t.concertoActive ? 0.25 : 0, SOURCE_TRACE, Target.TEAM)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      ultAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => gpuUltAdditionalDmgAtkFinalizer(),
    dynamicConditionals: [
      {
        id: 'RobinAtkConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.ATK],
        chainsTo: [Stats.ATK],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.concertoActive
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.ATK, Stats.ATK, this, x, action, context, SOURCE_ULT,
            (convertibleValue) => convertibleValue * ultAtkBuffScalingValue,
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.ATK, Stats.ATK, this, action, context,
            `convertibleValue * ${ultAtkBuffScalingValue}`,
            `${wgslTrue(r.concertoActive)}`,
          )
        },
      },
    ],
  }
}

```

# 1300/RuanMei.ts

```ts
import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Threading Fragrance

Basic ATK+1+20

Deals Ice DMG equal to 100% of Ruan Mei's ATK to a single target enemy.

 Single 10

Lv6

String Sings Slow Swirls

Skill-1+30

After using her Skill, Ruan Mei gains Overtone, lasting for 3 turn(s). This duration decreases by 1 at the start of Ruan Mei's every turn. When Ruan Mei has Overtone, all allies' DMG increases by 32% and Weakness Break Efficiency increases by 50%.

Lv10

Petals to Stream, Repose in Dream

Ultimate130+5

Ruan Mei deploys a Zone that lasts for 2 turns. The Zone's duration decreases by 1 at the start of her turn.
While inside the Zone, all allies' All-Type RES PEN increases by 25% and their attacks apply Thanatoplum Rebloom to the enemies hit.
When these enemies attempt to recover from Weakness Break, Thanatoplum Rebloom is triggered, extending the duration of their Weakness Break, delaying their action by an amount equal to 20% of Ruan Mei's Break Effect plus 10%, and dealing Break DMG equal to 50% of Ruan Mei's Ice Break DMG.
Enemy targets cannot have Thanatoplum Rebloom re-applied to them until they recover from Weakness Break.

Break DMG
Break DMG increases with higher Break Effect, higher target max Toughness, and higher character levels.
Break DMG cannot CRIT Hit and is not affected by DMG Boost effects.

Lv10

Somatotypical Helix

Talent

Increases SPD by 10% for all teammates (i.e., excluding this unit). When allies Break an enemy target's Weakness, Ruan Mei deals to this enemy target Break DMG equal to 120% of her Ice Break DMG.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Silken Serenade

Technique

After using the Technique, gains Silken Serenade. At the start of the next battle, automatically triggers the Skill for 1 time(s) without consuming Skill Points.
In Simulated Universe or Divergent Universe, when Ruan Mei has Silken Serenade, the team actively attacking enemies will always be regarded as attacking their Weakness to enter battle, and this attack can reduce all enemies' Toughness regardless of Weakness types. When breaking Weakness, triggers Weakness Break Effect corresponding to the attacker's Type. For every Blessing in possession (up to a max of 20 Blessings will be taken into account), additionally increases the Toughness Reduction of this attack by 100%. After breaking an enemy target's Weakness, additionally deals to the enemy target Break DMG equal to 100% of Ruan Mei's Ice Break DMG.


Stat Boosts

 +37.3% Break Effect
 +22.5% DEF
 +5.0 SPD

Inert Respiration

Increases Break Effect by 20% for all allies.


Days Wane, Thoughts Wax

Ruan Mei regenerates 5 Energy at the start of her turn.


Candle Lights on Still Waters

In battle, for every 10% of Ruan Mei's Break Effect that exceeds 120%, her Skill additionally increases allies' DMG by 6%, up to a maximum of 36%.



1 Neuronic Embroidery

While the Ultimate's Zone is deployed, the DMG dealt by all allies ignores 20% of the target's DEF.



2 Reedside Promenade

While Ruan Mei is on the field, all allies increase their ATK by 40% when dealing DMG to enemies that are Weakness Broken.



3 Viridescent Pirouette

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Chatoyant Éclat

When an enemy target's Weakness is Broken, Ruan Mei's Break Effect increases by 100% for 3 turn(s).



5 Languid Barrette

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Sash Cascade

Extends the duration of the Ultimate's Zone by 1 turn(s). The Talent's Break DMG multiplier additionally increases by 200%.

Break DMG
Break DMG increases with higher Break Effect, higher target max Toughness, and higher character levels.
Break DMG cannot CRIT Hit and is not affected by DMG Boost effects.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.RuanMei')
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
  } = Source.character('1303')

  const fieldResPenValue = ult(e, 0.25, 0.27)
  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.32, 0.352)
  const talentSpdScaling = talent(e, 0.10, 0.104)

  const defaults = {
    skillOvertoneBuff: true,
    teamBEBuff: true,
    ultFieldActive: true,
    e2AtkBoost: false,
    e4BeBuff: false,
  }

  const teammateDefaults = {
    skillOvertoneBuff: true,
    teamSpdBuff: true,
    teamBEBuff: true,
    ultFieldActive: true,
    e2AtkBoost: false,
    teamDmgBuff: 0.36,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillOvertoneBuff: {
      id: 'skillOvertoneBuff',
      formItem: 'switch',
      text: t('Content.skillOvertoneBuff.text'),
      content: t('Content.skillOvertoneBuff.content', { skillScaling: TsUtils.precisionRound(100 * skillScaling) }),
    },
    teamBEBuff: {
      id: 'teamBEBuff',
      formItem: 'switch',
      text: t('Content.teamBEBuff.text'),
      content: t('Content.teamBEBuff.content'),
    },
    ultFieldActive: {
      id: 'ultFieldActive',
      formItem: 'switch',
      text: t('Content.ultFieldActive.text'),
      content: t('Content.ultFieldActive.content', { fieldResPenValue: TsUtils.precisionRound(100 * fieldResPenValue) }),
    },
    e2AtkBoost: {
      id: 'e2AtkBoost',
      formItem: 'switch',
      text: t('Content.e2AtkBoost.text'),
      content: t('Content.e2AtkBoost.content'),
      disabled: (e < 2),
    },
    e4BeBuff: {
      id: 'e4BeBuff',
      formItem: 'switch',
      text: t('Content.e4BeBuff.text'),
      content: t('Content.e4BeBuff.content'),
      disabled: (e < 4),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillOvertoneBuff: content.skillOvertoneBuff,
    teamSpdBuff: {
      id: 'teamSpdBuff',
      formItem: 'switch',
      text: t('TeammateContent.teamSpdBuff.text'),
      content: t('TeammateContent.teamSpdBuff.content', { talentSpdScaling: TsUtils.precisionRound(100 * talentSpdScaling) }),
    },
    teamBEBuff: content.teamBEBuff,
    teamDmgBuff: {
      id: 'teamDmgBuff',
      formItem: 'slider',
      text: t('TeammateContent.teamDmgBuff.text'),
      content: t('TeammateContent.teamDmgBuff.content'),
      min: 0,
      max: 0.36,
      percent: true,
    },
    ultFieldActive: content.ultFieldActive,
    e2AtkBoost: content.e2AtkBoost,
  }

  return {
    activeAbilities: [AbilityType.BASIC],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.ATK_P.buff((e >= 2 && r.e2AtkBoost) ? 0.40 : 0, SOURCE_E2)
      x.BE.buff((e >= 4 && r.e4BeBuff) ? 1.00 : 0, SOURCE_E4)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.BE.buffTeam((m.teamBEBuff) ? 0.20 : 0, SOURCE_TRACE)

      x.ELEMENTAL_DMG.buffTeam((m.skillOvertoneBuff) ? skillScaling : 0, SOURCE_SKILL)
      x.BREAK_EFFICIENCY_BOOST.buffTeam((m.skillOvertoneBuff) ? 0.50 : 0, SOURCE_SKILL)

      x.RES_PEN.buffTeam((m.ultFieldActive) ? fieldResPenValue : 0, SOURCE_ULT)
      x.DEF_PEN.buffTeam((e >= 1 && m.ultFieldActive) ? 0.20 : 0, SOURCE_E1)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.SPD_P.buffTeam((t.teamSpdBuff) ? talentSpdScaling : 0, SOURCE_TALENT)
      x.ELEMENTAL_DMG.buffTeam(t.teamDmgBuff, SOURCE_TRACE)

      x.ATK_P_BOOST.buffTeam((e >= 2 && t.e2AtkBoost) ? 0.40 : 0, SOURCE_E2)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const beOver = Math.floor(TsUtils.precisionRound((x.a[Key.BE] * 100 - 120) / 10))
      const buffValue = Math.min(0.36, Math.max(0, beOver) * 0.06)
      x.ELEMENTAL_DMG.buff(buffValue, SOURCE_TRACE)
    },
    gpuFinalizeCalculations: () => {
      return `
let beOver = (x.BE * 100 - 120) / 10;
let buffValue: f32 = min(0.36, floor(max(0, beOver)) * 0.06);
x.ELEMENTAL_DMG += buffValue;
      `
    },
  }
}

```

# 1100/Sampo.ts

```ts
import { AbilityType, DOT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityVulnerability, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Dazzling Blades

Basic ATK+1+20

Deals Wind DMG equal to 100% of Sampo's ATK to a single enemy.

 Single 10

Lv6

Ricochet Love

Skill-1+6

Deals Wind DMG equal to 56% of Sampo's ATK to a single enemy, and further deals DMG for 4 extra time(s), with each time dealing Wind DMG equal to 56% of Sampo's ATK to a random enemy.

 Single 10

Lv10

Surprise Present

Ultimate120+5

Deals Wind DMG equal to 160% of Sampo's ATK to all enemies, with a 100% base chance to increase the targets' DoT taken by 30% for 2 turn(s).

 All 20

Lv10

Windtorn Dagger

Talent

Sampo's attacks have a 65% base chance to inflict Wind Shear for 3 turn(s).
Enemies inflicted with Wind Shear will take Wind DoT equal to 52% of Sampo's ATK at the beginning of each turn. Wind Shear can stack up to 5 time(s).

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Shining Bright

Technique

After Sampo uses his Technique, enemies in a set area are afflicted with Blind for 10 second(s). Blinded enemies cannot detect ally targets.
When initiating combat against a Blinded enemy, there is a 100% fixed chance to delay all enemies' action by 25%.


Stat Boosts

 +28.0% ATK
 +18.0% Effect Hit Rate
 +10.0% Effect RES

Trap

Extends the duration of Wind Shear caused by Talent by 1 turn(s).


Defensive Position

Using Ultimate additionally regenerates 10 Energy.


Spice Up

Enemies with Wind Shear effect deal 15% less DMG to Sampo.



1 Rising Love

When using Skill, deals DMG for 1 extra time(s) to a random enemy.



2 Infectious Enthusiasm

Defeating an enemy afflicted with Wind Shear has a 100% base chance to inflict all enemies with 1 stack(s) of Wind Shear, equivalent to that of Skill.



3 Big Money!

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 The Deeper the Love, the Stronger the Hate

When Skill hits an enemy with 5 or more stack(s) of Wind Shear, the enemy immediately takes 8% of current Wind Shear DMG.



5 Huuuuge Money!

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Increased Spending

Talent's Wind Shear DMG multiplier increases by 15%.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sampo')
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
  } = Source.character('1108')

  const dotVulnerabilityValue = ult(e, 0.30, 0.32)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.56, 0.616)
  const ultScaling = ult(e, 1.60, 1.728)
  const dotScaling = talent(e, 0.52, 0.572)

  const maxExtraHits = e < 1 ? 4 : 5
  const defaults = {
    targetDotTakenDebuff: true,
    skillExtraHits: maxExtraHits,
    targetWindShear: true,
  }

  const teammateDefaults = {
    targetDotTakenDebuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    targetDotTakenDebuff: {
      id: 'targetDotTakenDebuff',
      formItem: 'switch',
      text: t('Content.targetDotTakenDebuff.text'),
      content: t('Content.targetDotTakenDebuff.content', { dotVulnerabilityValue: TsUtils.precisionRound(100 * dotVulnerabilityValue) }),
    },
    skillExtraHits: {
      id: 'skillExtraHits',
      formItem: 'slider',
      text: t('Content.skillExtraHits.text'),
      content: t('Content.skillExtraHits.content'),
      min: 1,
      max: maxExtraHits,
    },
    targetWindShear: {
      id: 'targetWindShear',
      formItem: 'switch',
      text: t('Content.targetWindShear.text'),
      content: t('Content.targetWindShear.content'),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    targetDotTakenDebuff: content.targetDotTakenDebuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.SKILL_ATK_SCALING.buff((r.skillExtraHits) * skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.DOT_ATK_SCALING.buff(dotScaling, SOURCE_TALENT)
      x.DOT_ATK_SCALING.buff((e >= 6) ? 0.15 : 0, SOURCE_E6)

      // Boost
      x.DMG_RED_MULTI.multiply((r.targetWindShear) ? (1 - 0.15) : 1, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(10 + 5 * r.skillExtraHits, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      x.DOT_CHANCE.set(0.65, SOURCE_TALENT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      buffAbilityVulnerability(x, DOT_DMG_TYPE, (m.targetDotTakenDebuff) ? dotVulnerabilityValue : 0, SOURCE_ULT, Target.TEAM)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
  }
}

```

# 1100/Seele.ts

```ts
import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { gpuStandardAdditionalDmgAtkFinalizer, standardAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Thwack

Basic ATK+1+20

Deals Quantum DMG equal to 100% of Seele's ATK to a single enemy.

 Single 10

Lv6

Sheathed Blade

Skill-1+30

Increases Seele's SPD by 25% for 2 turn(s) and deals Quantum DMG equal to 220% of Seele's ATK to a single enemy.

 Single 20

Lv10

Butterfly Flurry

Ultimate120+5

Seele enters the Amplification state and deals Quantum DMG equal to 425% of her ATK to a single enemy.

 Single 30

Lv10

Resurgence

Talent

Enters the Amplification state upon defeating an enemy with Basic ATK, Skill, or Ultimate, and receives an extra turn. While in the Amplification state, the DMG of Seele's attacks increases by 80% for 1 turn(s).
Enemies defeated in the extra turn provided by "Resurgence" will not trigger another "Resurgence."

Extra Turn
Gain 1 extra turn that won't expend your remaining turns when taking action. During this extra turn, no Ultimate can be used.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Phantom Illusion

Technique

After using her Technique, Seele gains Stealth for 20 second(s). While Stealth is active, Seele cannot be detected by enemies. And when entering battle by attacking enemies, Seele will immediately enter the Amplification state.


Stat Boosts

 +28.0% ATK
 +24.0% CRIT DMG
 +12.5% DEF

Nightshade

When current HP percentage is 50% or lower, reduces the chance of being attacked by enemies.
Hidden Stat: 0.5


Lacerate

While Seele is in the Amplification state, her Quantum RES PEN increases by 20%.


Rippling Waves

After using a Basic ATK, Seele's next action advances by 20%.



1 Extirpating Slash

When dealing DMG to an enemy whose HP percentage is 80% or lower, CRIT Rate increases by 15%.



2 Dancing Butterfly

The SPD Boost effect of Seele's Skill can stack up to 2 time(s).



3 Dazzling Tumult

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Flitting Phantasm

Seele regenerates 15 Energy when she defeats an enemy.



5 Piercing Shards

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Shattering Shambles

After Seele uses Ultimate, inflict the attacked enemy with "Butterfly Flurry" for 1 turn(s). Enemies in "Butterfly Flurry" will additionally take 1 instance of Quantum Additional DMG equal to 15% of Seele's Ultimate DMG every time they are attacked. If the target is defeated by the "Butterfly Flurry" state's Additional DMG triggered by other allies' attacks, Seele's Talent will not be triggered.
When Seele is knocked down, the "Butterfly Flurry" inflicted on the enemies will be removed.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Seele')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('1102')

  const buffedStateDmgBuff = talent(e, 0.80, 0.88)
  const speedBoostStacksMax = (e >= 2 ? 2 : 1)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.20, 2.42)
  const ultScaling = ult(e, 4.25, 4.59)

  const defaults = {
    buffedState: true,
    speedBoostStacks: speedBoostStacksMax,
    e1EnemyHp80CrBoost: false,
    e6UltTargetDebuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    buffedState: {
      id: 'buffedState',
      formItem: 'switch',
      text: t('Content.buffedState.text'),
      content: t('Content.buffedState.content', { buffedStateDmgBuff: TsUtils.precisionRound(100 * buffedStateDmgBuff) }),
    },
    speedBoostStacks: {
      id: 'speedBoostStacks',
      formItem: 'slider',
      text: t('Content.speedBoostStacks.text'),
      content: t('Content.speedBoostStacks.content'),
      min: 0,
      max: speedBoostStacksMax,
    },
    e1EnemyHp80CrBoost: {
      id: 'e1EnemyHp80CrBoost',
      formItem: 'switch',
      text: t('Content.e1EnemyHp80CrBoost.text'),
      content: t('Content.e1EnemyHp80CrBoost.content'),
      disabled: e < 1,
    },
    e6UltTargetDebuff: {
      id: 'e6UltTargetDebuff',
      formItem: 'switch',
      text: t('Content.e6UltTargetDebuff.text'),
      content: t('Content.e6UltTargetDebuff.content'),
      disabled: e < 6,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.CR.buff((e >= 1 && r.e1EnemyHp80CrBoost) ? 0.15 : 0, SOURCE_E1)
      x.SPD_P.buff(0.25 * r.speedBoostStacks, SOURCE_SKILL)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      x.BASIC_ADDITIONAL_DMG_SCALING.buff((e >= 6 && r.e6UltTargetDebuff) ? 0.15 * x.a[Key.ULT_ATK_SCALING] : 0, Source.NONE)
      x.SKILL_ADDITIONAL_DMG_SCALING.buff((e >= 6 && r.e6UltTargetDebuff) ? 0.15 * x.a[Key.ULT_ATK_SCALING] : 0, Source.NONE)
      x.ULT_ADDITIONAL_DMG_SCALING.buff((e >= 6 && r.e6UltTargetDebuff) ? 0.15 * x.a[Key.ULT_ATK_SCALING] : 0, Source.NONE)

      // Boost
      x.ELEMENTAL_DMG.buff((r.buffedState) ? buffedStateDmgBuff : 0, SOURCE_TALENT)
      x.RES_PEN.buff((r.buffedState) ? 0.20 : 0, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      // TODO: Seele's E6 should have a teammate effect but its kinda hard to calc
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => gpuStandardAdditionalDmgAtkFinalizer(),
  }
}

```

# 1100/Serval.ts

```ts
import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { gpuStandardAdditionalDmgAtkFinalizer, standardAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Roaring Thunderclap

Basic ATK+1+20

Deals Lightning DMG equal to 100% of Serval's ATK to a single enemy.

 Single 10

Lv6

Lightning Flash

Skill-1+30

Deals Lightning DMG equal to 140% of Serval's ATK to a single enemy and Lightning DMG equal to 60% of Serval's ATK to enemies adjacent to it, with a 80% base chance for enemies hit to become Shocked for 2 turn(s).
While Shocked, enemies take Lightning DoT equal to 104% of Serval's ATK at the beginning of each turn.

 Single 20 | Other 10

Lv10

Here Comes the Mechanical Fever

Ultimate100+5

Deals Lightning DMG equal to 180% of Serval's ATK to all enemies. Enemies already Shocked will extend the duration of their Shock state by 2 turn(s).

 All 20

Lv10
Galvanic Chords

Talent

After Serval attacks, deals Lightning Additional DMG equal to 72% of Serval's ATK to all Shocked enemies.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Good Night, Belobog

Technique

Immediately attacks the enemy. After entering battle, deals Lightning DMG equal to 50% of Serval's ATK to a random enemy, with a 100% base chance for all enemies to become Shocked for 3 turn(s).
While Shocked, enemies will take Lightning DoT equal to 50% of Serval's ATK at the beginning of each turn.

 Single 20


Stat Boosts

 +18.7% CRIT Rate
 +18.0% Effect Hit Rate
 +10.0% Effect RES

Rock 'n' Roll

When using skill, increases the base chance for the attacked enemy target to become Shocked by 20%.


String Vibration

At the start of the battle, immediately regenerates 15 Energy.


Mania

Upon defeating an enemy, ATK is increased by 20% for 2 turn(s).



1 Echo Chamber

Basic ATK deals Lightning DMG equal to 60% of Basic ATK DMG to a random target adjacent to the target enemy.



2 Encore!

Every time Serval's Talent is triggered to deal Additional DMG, she regenerates 4 Energy.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.



3 Listen, the Heartbeat of the Gears

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Make Some Noise!

Ultimate has a 100% base chance to apply Shock to any enemies not currently Shocked. This Shock has the same effects as the one applied by Skill.



5 Belobog's Loudest Roar!

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 This Song Rocks to Heaven!

Serval deals 30% more DMG to Shocked enemies.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Serval')
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
  } = Source.character('1103')

  const talentExtraDmgScaling = talent(e, 0.72, 0.792)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.40, 1.54)
  const ultScaling = ult(e, 1.80, 1.944)
  const dotScaling = skill(e, 1.04, 1.144)

  const defaults = {
    targetShocked: true,
    enemyDefeatedBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    targetShocked: {
      id: 'targetShocked',
      formItem: 'switch',
      text: t('Content.targetShocked.text'),
      content: t('Content.targetShocked.content', { talentExtraDmgScaling: TsUtils.precisionRound(100 * talentExtraDmgScaling) }),
    },
    enemyDefeatedBuff: {
      id: 'enemyDefeatedBuff',
      formItem: 'switch',
      text: t('Content.enemyDefeatedBuff.text'),
      content: t('Content.enemyDefeatedBuff.content'),
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.ATK_P.buff((r.enemyDefeatedBuff) ? 0.20 : 0, SOURCE_TRACE)

      // Scaling;
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.DOT_ATK_SCALING.buff(dotScaling, SOURCE_SKILL)

      x.BASIC_ADDITIONAL_DMG_SCALING.buff((r.targetShocked) ? talentExtraDmgScaling : 0, SOURCE_TALENT)
      x.SKILL_ADDITIONAL_DMG_SCALING.buff((r.targetShocked) ? talentExtraDmgScaling : 0, SOURCE_TALENT)
      x.ULT_ADDITIONAL_DMG_SCALING.buff((r.targetShocked) ? talentExtraDmgScaling : 0, SOURCE_TALENT)

      // Boost
      x.ELEMENTAL_DMG.buff((e >= 6 && r.targetShocked) ? 0.30 : 0, SOURCE_ULT)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      x.DOT_CHANCE.set(1.00, SOURCE_SKILL)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardAdditionalDmgAtkFinalizer(),
  }
}

```

# 1000/SilverWolf.ts

```ts
import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { standardAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

System Warning

Basic ATK+1+20

Deals Quantum DMG equal to 100% of Silver Wolf's ATK to a single enemy.

 Single 10

Lv6

Allow Changes?

Skill-1+30

There is a 85% base chance to add 1 Weakness of an on-field character's Type to the target enemy. This also reduces the enemy's DMG RES to that Weakness Type by 20% for 2 turn(s). If the enemy already has that Type Weakness, the effect of DMG RES reduction to that Weakness Type will not be triggered.
Each enemy can only have 1 Weakness implanted by Silver Wolf. When Silver Wolf implants another Weakness to the target, only the most recent implanted Weakness will be kept.
In addition, there is a 100% base chance to further reduce the All-Type RES of the enemy by 10% for 2 turn(s).
Deals Quantum DMG equal to 196% of Silver Wolf's ATK to this enemy.

 Single 20

Lv10

User Banned

Ultimate110+5

There's a 100% base chance to decrease the target enemy's DEF by 45% for 3 turn(s). And at the same time, deals Quantum DMG equal to 380% of Silver Wolf's ATK to the target enemy.

 Single 30

Lv10

Awaiting System Response...

Talent

Silver Wolf can create three types of Bugs: Reduce ATK by 10%, reduce DEF by 8%, and reduce SPD by 6%.
Every time Silver Wolf attacks, she has a 72% base chance to implant a random Bug that lasts for 3 turn(s) in an enemy target.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Force Quit Program

Technique

Immediately attacks the enemy. After entering battle, deals Quantum DMG equal to 80% of Silver Wolf's ATK to all enemies, and ignores Weakness Types and reduces Toughness from all enemies. Enemies with their Weakness Broken in this way will trigger the Quantum Weakness Break effect.

 Single 20


Stat Boosts

 +28.0% ATK
 +18.0% Effect Hit Rate
 +8.0% Quantum DMG Boost

Generate

"Bug"'s duration is extended for 1 turn(s). Every time an enemy is inflicted with Weakness Break, Silver Wolf has a 65% base chance of implanting a random "Bug" in the enemy.


Inject

The duration of the Weakness implanted by Silver Wolf's Skill increases by 1 turn(s).


Side Note

If there are 3 or more debuff(s) affecting the enemy when the Skill is used, then the Skill decreases the enemy's All-Type RES by an additional 3%.



1 Social Engineering

After using her Ultimate to attack enemies, Silver Wolf regenerates 7 Energy for every debuff that the target enemy currently has. This effect can be triggered up to 5 time(s) in each use of her Ultimate.



2 Zombie Network

When an enemy enters battle, reduces their Effect RES by 20%.



3 Payload

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Bounce Attack

After using her Ultimate to attack enemies, deals Quantum Additional DMG equal to 20% of Silver Wolf's ATK for every debuff currently on the enemy target. This effect can be triggered for a maximum of 5 time(s) during each use of her Ultimate.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.



5 Brute Force Attack

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Overlay Network

For every debuff the enemy target has, the DMG dealt by Silver Wolf increases by 20%, up to a limit of 100%.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.SilverWolf')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('1006')

  const skillResShredValue = skill(e, 0.10, 0.105)
  const talentDefShredDebuffValue = talent(e, 0.08, 0.088)
  const ultDefShredValue = ult(e, 0.45, 0.468)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.96, 2.156)
  const ultScaling = ult(e, 3.80, 4.104)

  const defaults = {
    skillWeaknessResShredDebuff: false,
    skillResShredDebuff: true,
    talentDefShredDebuff: true,
    ultDefShredDebuff: true,
    targetDebuffs: 5,
  }

  const teammateDefaults = {
    skillWeaknessResShredDebuff: false,
    skillResShredDebuff: true,
    talentDefShredDebuff: true,
    ultDefShredDebuff: true,
    targetDebuffs: 5,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillResShredDebuff: {
      id: 'skillResShredDebuff',
      formItem: 'switch',
      text: t('Content.skillResShredDebuff.text'),
      content: t('Content.skillResShredDebuff.content', { skillResShredValue: TsUtils.precisionRound(100 * skillResShredValue) }),
    },
    skillWeaknessResShredDebuff: {
      id: 'skillWeaknessResShredDebuff',
      formItem: 'switch',
      text: t('Content.skillWeaknessResShredDebuff.text'),
      content: t('Content.skillWeaknessResShredDebuff.content', { implantChance: TsUtils.precisionRound(skill(e, 85, 87)) }),
    },
    talentDefShredDebuff: {
      id: 'talentDefShredDebuff',
      formItem: 'switch',
      text: t('Content.talentDefShredDebuff.text'),
      content: t('Content.talentDefShredDebuff.content', { talentDefShredDebuffValue: TsUtils.precisionRound(100 * talentDefShredDebuffValue) }),
    },
    ultDefShredDebuff: {
      id: 'ultDefShredDebuff',
      formItem: 'switch',
      text: t('Content.ultDefShredDebuff.text'),
      content: t('Content.ultDefShredDebuff.content', { ultDefShredValue: TsUtils.precisionRound(100 * ultDefShredValue) }),
    },
    targetDebuffs: {
      id: 'targetDebuffs',
      formItem: 'slider',
      text: t('Content.targetDebuffs.text'),
      content: t('Content.targetDebuffs.content'),
      min: 0,
      max: 5,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillResShredDebuff: content.skillResShredDebuff,
    skillWeaknessResShredDebuff: content.skillWeaknessResShredDebuff,
    talentDefShredDebuff: content.talentDefShredDebuff,
    ultDefShredDebuff: content.ultDefShredDebuff,
    targetDebuffs: content.targetDebuffs,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.ULT_ADDITIONAL_DMG_SCALING.buff((e >= 4) ? r.targetDebuffs * 0.20 : 0, SOURCE_E4)

      // Boost
      x.ELEMENTAL_DMG.buff((e >= 6) ? r.targetDebuffs * 0.20 : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.RES_PEN.buffTeam((m.skillWeaknessResShredDebuff) ? 0.20 : 0, SOURCE_SKILL)
      x.RES_PEN.buffTeam((m.skillResShredDebuff) ? skillResShredValue : 0, SOURCE_SKILL)
      x.RES_PEN.buffTeam((m.skillResShredDebuff && m.targetDebuffs >= 3) ? 0.03 : 0, SOURCE_TRACE)
      x.DEF_PEN.buffTeam((m.ultDefShredDebuff) ? ultDefShredValue : 0, SOURCE_ULT)
      x.DEF_PEN.buffTeam((m.talentDefShredDebuff) ? talentDefShredDebuffValue : 0, SOURCE_TALENT)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: () => {
      return `x.ULT_ADDITIONAL_DMG += x.ULT_ADDITIONAL_DMG_SCALING * x.ATK;`
    },
  }
}

```

# 1300/Sparkle.ts

```ts
import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition, countTeamElement } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, ElementNames, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Monodrama

Basic ATK+1+20

Deals Quantum DMG equal to 100% of Sparkle's ATK to a single target enemy.

 Single 10

Lv6

Dreamdiver

Skill-1+30

Increases the CRIT DMG of a single target ally by 24% of Sparkle's CRIT DMG plus 45%, lasting for 1 turn(s). And at the same time, Advances Forward this ally's action by 50%.
When Sparkle uses this ability on herself, the Action Advance effect will not trigger.

Lv10

The Hero with a Thousand Faces

Ultimate110+5

Recovers 4 Skill Points for the team and grants all allies Cipher. For allies with Cipher, each stack of the DMG Boost effect provided by Sparkle's Talent additionally increases by 10%, lasting for 2 turns.
Hidden Stat: 2

Lv10

Red Herring

Talent

While Sparkle is on the battlefield, additionally increases the max number of Skill Points by 2. Whenever an ally consumes 1 Skill Point, all allies' DMG dealt increases by 6%. This effect lasts for 2 turn(s) and can stack up to 3 time(s).

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Unreliable Narrator

Technique

Using the Technique grants all allies Misdirect for 20 seconds. Characters with Misdirect will not be detected by enemies, and entering battle in the Misdirect state recovers 3 Skill Point(s) for the team.


Stat Boosts

 +28.0% HP
 +24.0% CRIT DMG
 +10.0% Effect RES

Almanac

When using Basic ATK, additionally regenerates 10 Energy.


Artificial Flower

The CRIT DMG Boost effect provided by the Skill will be extended until the start of the target's next turn.


Nocturne

Increases all allies' ATK by 15%. When there are 1/2/3 Quantum-Type allies in the team, additionally increases Quantum-Type allies' ATK by 5%/15%/30%.



1 Suspension of Disbelief

The Cipher effect granted by the Ultimate lasts for 1 extra turn. All allies with Cipher have their ATK increased by 40%.



2 Purely Fictitious

Every stack of the Talent's effect allows allies to additionally ignore 8% of the target's DEF when dealing DMG.



3 Pipedream

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Life Is a Gamble

The Ultimate recovers 1 more Skill Point. The Talent additionally increases the Max Skill Points by 1.



5 Parallax Truth

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Narrative Polysemy

The CRIT DMG Boost effect provided by the Skill additionally increases by an amount equal to 30% of Sparkle's CRIT DMG. When Sparkle uses Skill, her Skill's CRIT DMG Boost effect will apply to all teammates with Cipher. When Sparkle uses her Ultimate, any single ally who benefits from her Skill's CRIT DMG Boost will spread that effect to teammates with Cipher.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sparkle')
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
  } = Source.character('1306')

  const skillCdBuffScaling = skill(e, 0.24, 0.264)
  const skillCdBuffBase = skill(e, 0.45, 0.486)
  const cipherTalentStackBoost = ult(e, 0.10, 0.108)
  const talentBaseStackBoost = talent(e, 0.06, 0.066)

  const basicScaling = basic(e, 1.00, 1.10)

  const atkBoostByQuantumAllies: Record<number, number> = {
    0: 0,
    1: 0.05,
    2: 0.15,
    3: 0.30,
    4: 0.30,
  }

  const defaults = {
    skillCdBuff: false,
    cipherBuff: true,
    talentStacks: 3,
    quantumAlliesAtkBuff: true,
  }

  const teammateDefaults = {
    ...defaults,
    ...{
      skillCdBuff: true,
      teammateCDValue: 2.5,
    },
  }

  const content: ContentDefinition<typeof defaults> = {
    skillCdBuff: {
      id: 'skillCdBuff',
      formItem: 'switch',
      text: t('Content.skillCdBuff.text'),
      content: t('Content.skillCdBuff.content', {
        skillCdBuffScaling: TsUtils.precisionRound(100 * skillCdBuffScaling),
        skillCdBuffBase: TsUtils.precisionRound(100 * skillCdBuffBase),
      }),
    },
    cipherBuff: {
      id: 'cipherBuff',
      formItem: 'switch',
      text: t('Content.cipherBuff.text'),
      content: t('Content.cipherBuff.content', { cipherTalentStackBoost: TsUtils.precisionRound(100 * cipherTalentStackBoost) }),
    },
    talentStacks: {
      id: 'talentStacks',
      formItem: 'slider',
      text: t('Content.talentStacks.text'),
      content: t('Content.talentStacks.content', { talentBaseStackBoost: TsUtils.precisionRound(100 * talentBaseStackBoost) }),
      min: 0,
      max: 3,
    },
    quantumAlliesAtkBuff: {
      id: 'quantumAlliesAtkBuff',
      formItem: 'switch',
      text: t('Content.quantumAlliesAtkBuff.text'),
      content: t('Content.quantumAlliesAtkBuff.content'),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillCdBuff: content.skillCdBuff,
    teammateCDValue: {
      id: 'teammateCDValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateCDValue.text'),
      content: t('TeammateContent.teammateCDValue.content', {
        skillCdBuffScaling: TsUtils.precisionRound(100 * skillCdBuffScaling),
        skillCdBuffBase: TsUtils.precisionRound(100 * skillCdBuffBase),
      }),
      min: 0,
      max: 3.50,
      percent: true,
    },
    cipherBuff: content.cipherBuff,
    talentStacks: content.talentStacks,
    quantumAlliesAtkBuff: content.quantumAlliesAtkBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)

      if (r.skillCdBuff) {
        x.CD.buff(skillCdBuffBase, SOURCE_SKILL)
        x.UNCONVERTIBLE_CD_BUFF.buff(skillCdBuffBase, SOURCE_SKILL)
      }
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Main damage type
      x.ATK_P.buffTeam(0.15, SOURCE_TRACE)
      x.ATK_P.buffDual(context.element == ElementNames.Quantum && m.quantumAlliesAtkBuff
        ? atkBoostByQuantumAllies[countTeamElement(context, ElementNames.Quantum)]
        : 0, SOURCE_TRACE)
      x.ATK_P.buffTeam((e >= 1 && m.cipherBuff) ? 0.40 : 0, SOURCE_E1)

      x.ELEMENTAL_DMG.buffTeam(
        (m.cipherBuff)
          ? m.talentStacks * (talentBaseStackBoost + cipherTalentStackBoost)
          : m.talentStacks * talentBaseStackBoost,
        SOURCE_TALENT)
      x.DEF_PEN.buffTeam((e >= 2) ? 0.08 * m.talentStacks : 0, SOURCE_E2)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const cdBuff = t.skillCdBuff
        ? skillCdBuffBase + (skillCdBuffScaling + (e >= 6 ? 0.30 : 0)) * t.teammateCDValue
        : 0
      if (e >= 6) {
        x.CD.buffTeam(cdBuff, SOURCE_SKILL)
        x.UNCONVERTIBLE_CD_BUFF.buffTeam(cdBuff, SOURCE_SKILL)
      } else {
        x.CD.buffSingle(cdBuff, SOURCE_SKILL)
        x.UNCONVERTIBLE_CD_BUFF.buffSingle(cdBuff, SOURCE_SKILL)
      }
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
    },
    gpuFinalizeCalculations: () => '',
    dynamicConditionals: [
      {
        id: 'SparkleCdConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CD],
        chainsTo: [Stats.CD],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.skillCdBuff
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.CD, Stats.CD, this, x, action, context, SOURCE_SKILL,
            (convertibleValue) => convertibleValue * (skillCdBuffScaling + (e >= 6 ? 0.30 : 0)),
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.CD, Stats.CD, this, action, context,
            `${skillCdBuffScaling + (e >= 6 ? 0.30 : 0)} * convertibleValue`,
            `${wgslTrue(r.skillCdBuff)}`,
          )
        },
      },
    ],
  }
}

```

# 1300/Sunday.ts

```ts
import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Gleaming Admonition

Basic ATK+1+20

Deals Imaginary DMG equal to 100% of Sunday's ATK to one designated enemy.

 Single 10

Lv6

Benison of Paper and Rites

Skill-1+30

Enables one designated ally character and their summon to immediately take action, and increases their DMG dealt by 30%. If the target has a summon, then the dealt DMG increase is further boosted by an additional 50%, lasting for 2 turn(s).
After using Skill on The Beatified, recovers 1 Skill Point.
When Sunday uses this ability on characters following the Path of Harmony, cannot trigger the "immediate action" effect.
Hidden Stat: 1

Lv10

Ode to Caress and Cicatrix

Ultimate130+5

Regenerates Energy by 20% of Max Energy for one designated ally character, and turns the target and their summon into "The Beatified." "The Beatified" have their CRIT DMG increased by an amount equal to 30% of Sunday's CRIT DMG plus 12%.
At the start of Sunday's each turn, the duration of "The Beatified" decreases by 1 turn, lasting for a total of 3 turn(s). And it only takes effect on the most recent target of the Ultimate (excluding Sunday himself). When Sunday is knocked down, "The Beatified" will also be dispelled.

Lv10

The Sorrowing Body

Talent

When using Skill, increases the target's CRIT Rate by 20%, lasting for 3 turn(s).

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


The Glorious Mysteries

Technique

After this Technique is used, the first time Sunday uses an ability on an ally target in the next battle, the target's DMG dealt increases by 50%, lasting for 2 turn(s).


Stat Boosts

 +37.3% CRIT DMG
 +18.0% Effect RES
 +12.5% DEF

Rest Day's Longing

When using Ultimate, if the Energy regenerated for the target is less than 40, increases the regenerated Energy to 40.


Exalted Sweep

When battle starts, Sunday regenerates 25 Energy.


Haven in Palm

When using Skill, dispels 1 debuff(s) from the target.



1 Millennium's Quietus

When Sunday uses Skill, the target character can ignore 16% of enemy target's DEF to deal DMG and their summon can ignore 40% of enemy target's DEF to deal DMG, lasting for 2 turn(s).



2 Faith Outstrips Frailty

After the first use of Ultimate, recovers 2 Skill Point(s). The DMG dealt by "The Beatified" increases by 30%.



3 Hermitage of Thorns

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Sculpture's Preamble

When the turn starts, regenerates 8 Energy.



5 Paper Raft in Silver Bay

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Dawn of Sidereal Cacophony

The Talent's CRIT Rate boost effect becomes stackable up to 3 time(s), and the Talent's duration increases by 1 turn(s). When Sunday uses Ultimate, can also apply the Talent's CRIT Rate boost effect to the target. When the Talent's CRIT Rate boost takes effect and the target's CRIT Rate exceeds 100%, every 1% of excess CRIT Rate increases CRIT DMG by 2%.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sunday')
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
  } = Source.character('1313')

  const skillDmgBoostValue = skill(e, 0.30, 0.33)
  const skillDmgBoostSummonValue = skill(e, 0.50, 0.55)
  const ultCdBoostValue = ult(e, 0.30, 0.336)
  const ultCdBoostBaseValue = ult(e, 0.12, 0.128)
  const talentCrBuffValue = talent(e, 0.20, 0.22)

  const basicScaling = basic(e, 1.00, 1.10)

  const defaults = {
    skillDmgBuff: false,
    talentCrBuffStacks: 0,
    techniqueDmgBuff: false,
    e1DefPen: false,
    e2DmgBuff: false,
  }

  const teammateDefaults = {
    skillDmgBuff: true,
    talentCrBuffStacks: e < 6 ? 1 : 3,
    beatified: true,
    teammateCDValue: 2.50,
    techniqueDmgBuff: false,
    e1DefPen: true,
    e2DmgBuff: true,
    e6CrToCdConversion: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillDmgBuff: {
      id: 'skillDmgBuff',
      formItem: 'switch',
      text: t('Content.skillDmgBuff.text'),
      content: t(
        'Content.skillDmgBuff.content',
        {
          DmgBoost: TsUtils.precisionRound(100 * skillDmgBoostValue),
          SummonDmgBoost: TsUtils.precisionRound(100 * skillDmgBoostSummonValue),
        }),
    },
    talentCrBuffStacks: {
      id: 'talentCrBuffStacks',
      formItem: 'slider',
      text: t('Content.talentCrBuffStacks.text'),
      content: t('Content.talentCrBuffStacks.content', { CritRateBoost: TsUtils.precisionRound(100 * talentCrBuffValue) }),
      min: 0,
      max: e < 6 ? 1 : 3,
    },
    techniqueDmgBuff: {
      id: 'techniqueDmgBuff',
      formItem: 'switch',
      text: t('Content.techniqueDmgBuff.text'),
      content: t('Content.techniqueDmgBuff.content'),
    },
    e1DefPen: {
      id: 'e1DefPen',
      formItem: 'switch',
      text: t('Content.e1DefPen.text'),
      content: t('Content.e1DefPen.content'),
      disabled: e < 1,
    },
    e2DmgBuff: {
      id: 'e2DmgBuff',
      formItem: 'switch',
      text: t('Content.e2DmgBuff.text'),
      content: t('Content.e2DmgBuff.content'),
      disabled: e < 2,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillDmgBuff: content.skillDmgBuff,
    talentCrBuffStacks: content.talentCrBuffStacks,
    beatified: {
      id: 'beatified',
      formItem: 'switch',
      text: t('TeammateContent.beatified.text'),
      content: t(
        'TeammateContent.beatified.content',
        {
          CritBuffScaling: TsUtils.precisionRound(100 * ultCdBoostValue),
          CritBuffFlat: TsUtils.precisionRound(100 * ultCdBoostBaseValue),
        }),
    },
    teammateCDValue: {
      id: 'teammateCDValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateCDValue.text'),
      content: t(
        'TeammateContent.teammateCDValue.content',
        {
          CritBuffScaling: TsUtils.precisionRound(100 * ultCdBoostValue),
          CritBuffFlat: TsUtils.precisionRound(100 * ultCdBoostBaseValue),
        }),
      min: 0,
      max: 4.00,
      percent: true,
    },
    techniqueDmgBuff: content.techniqueDmgBuff,
    e1DefPen: content.e1DefPen,
    e2DmgBuff: content.e2DmgBuff,
    e6CrToCdConversion: {
      id: 'e6CrToCdConversion',
      formItem: 'switch',
      text: t('TeammateContent.e6CrToCdConversion.text'),
      content: t('TeammateContent.e6CrToCdConversion.content'),
      disabled: e < 6,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)

      x.BASIC_TOUGHNESS_DMG.set(10, SOURCE_BASIC)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.CR.buffDual(m.talentCrBuffStacks * talentCrBuffValue, SOURCE_TALENT)
      x.ELEMENTAL_DMG.buffDual((m.skillDmgBuff) ? skillDmgBoostValue : 0, SOURCE_SKILL)
      x.ELEMENTAL_DMG.buffDual((m.skillDmgBuff && x.a[Key.SUMMONS] > 0) ? skillDmgBoostSummonValue : 0, SOURCE_SKILL)
      x.ELEMENTAL_DMG.buffDual((m.techniqueDmgBuff) ? 0.50 : 0, SOURCE_TECHNIQUE)

      x.DEF_PEN.buffDual((e >= 1 && m.e1DefPen && m.skillDmgBuff) ? 0.16 : 0, SOURCE_E1)
      x.DEF_PEN.buffDual((e >= 1 && m.e1DefPen && m.skillDmgBuff && x.a[Key.SUMMONS] > 0) ? 0.24 : 0, SOURCE_E1)

      x.ELEMENTAL_DMG.buffDual((e >= 2 && m.e2DmgBuff) ? 0.30 : 0, SOURCE_E2)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const cdBuff = (t.beatified) ? ultCdBoostValue * t.teammateCDValue + ultCdBoostBaseValue : 0
      x.CD.buffDual(cdBuff, SOURCE_ULT)
      x.UNCONVERTIBLE_CD_BUFF.buffDual(cdBuff, SOURCE_ULT)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
    teammateDynamicConditionals: [
      {
        id: 'SundayMemoCrConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CR],
        chainsTo: [Stats.CD],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          return x.m.a[Key.CR] > 1.00
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.teammateCharacterConditionals as Conditionals<typeof teammateContent>
          if (!(e >= 6 && r.e6CrToCdConversion && !x.a[Key.DEPRIORITIZE_BUFFS])) {
            return
          }

          const stateValue = action.conditionalState[this.id] || 0
          const buffValue = Math.floor((x.m.a[Key.CR] - x.m.a[Key.UNCONVERTIBLE_CR_BUFF] - 1.00) / 0.01) * 2.00 * 0.01

          action.conditionalState[this.id] = buffValue
          x.m.CD.buffDynamic(buffValue - stateValue, SOURCE_E6, action, context)
          x.m.UNCONVERTIBLE_CD_BUFF.buffDynamic(buffValue - stateValue, SOURCE_E6, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.teammateCharacterConditionals as Conditionals<typeof teammateContent>

          return conditionalWgslWrapper(this, `
if (${wgslFalse(e >= 6 && r.e6CrToCdConversion)}) {
  return;
}

if (x.DEPRIORITIZE_BUFFS > 0) {
  return;
}

let cr = (*p_m).CR;
let unconvertibleCr = (*p_m).UNCONVERTIBLE_CR_BUFF;

if (cr > 1.00) {
  let buffValue: f32 = floor((cr - unconvertibleCr - 1.00) / 0.01) * 2.00 * 0.01;
  let stateValue: f32 = (*p_state).${this.id};

  (*p_state).${this.id} = buffValue;
  (*p_m).CD += buffValue - stateValue;
  (*p_m).UNCONVERTIBLE_CD_BUFF += buffValue - stateValue;
}
          `)
        },
      },
      {
        id: 'SundayCrConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CR],
        chainsTo: [Stats.CD],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          return x.a[Key.CR] > 1.00
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.teammateCharacterConditionals as Conditionals<typeof teammateContent>
          if (!(e >= 6 && r.e6CrToCdConversion && !x.a[Key.DEPRIORITIZE_BUFFS])) {
            return
          }

          const stateValue = action.conditionalState[this.id] || 0
          const buffValue = Math.floor(((x.a[Key.CR] - x.a[Key.UNCONVERTIBLE_CR_BUFF]) - 1.00) / 0.01) * 2.00 * 0.01

          action.conditionalState[this.id] = buffValue
          x.CD.buffDynamic(buffValue - stateValue, SOURCE_E6, action, context)
          x.UNCONVERTIBLE_CD_BUFF.buffDynamic(buffValue - stateValue, SOURCE_E6, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.teammateCharacterConditionals as Conditionals<typeof teammateContent>

          return conditionalWgslWrapper(this, `
if (${wgslFalse(e >= 6 && r.e6CrToCdConversion)}) {
  return;
}

if (x.DEPRIORITIZE_BUFFS > 0) {
  return;
}

if (x.CR > 1.00) {
  let buffValue: f32 = floor((x.CR - x.UNCONVERTIBLE_CR_BUFF - 1.00) / 0.01) * 2.00 * 0.01;
  let stateValue: f32 = (*p_state).${this.id};

  (*p_state).${this.id} = buffValue;
  (*p_x).CD += buffValue - stateValue;
  (*p_x).UNCONVERTIBLE_CD_BUFF += buffValue - stateValue;
}
    `)
        },
      },
    ],
  }
}

```

# 1200/Sushang.ts

```ts
import { AbilityType, ADDITIONAL_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardAdditionalDmgAtkFinalizer, standardAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Cloudfencer Art: Starshine

Basic ATK+1+20

Deals Physical DMG equal to 100% of Sushang's ATK to a single enemy.

 Single 10

Lv6

Cloudfencer Art: Mountainfall

Skill-1+30

Deals Physical DMG equal to 210% of Sushang's ATK to a single enemy. In addition, there is a 33% chance to trigger Sword Stance on the final hit, dealing Physical Additional DMG equal to 100% of Sushang's ATK to the enemy.
If the enemy is inflicted with Weakness Break, Sword Stance is guaranteed to trigger.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

 Single 20

Lv10

Shape of Taixu: Dawn Herald

Ultimate120+5

Deals Physical DMG equal to 320% of Sushang's ATK to a single enemy target, and she immediately takes action. In addition, Sushang's ATK increases by 30% and using her Skill has 2 extra chances to trigger Sword Stance for 2 turn(s).
Sword Stance triggered from the extra chances deals 50% of the original DMG.

 Single 30

Lv10

Dancing Blade

Talent

When an enemy has their Weakness Broken on the field, Sushang's SPD increases by 20% for 2 turn(s).

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Cloudfencer Art: Warcry

Technique

Immediately attacks the enemy. Upon entering battle, Sushang deals Physical DMG equal to 80% of her ATK to all enemies.

 Single 20


Stat Boosts

 +28.0% ATK
 +18.0% HP
 +12.5% DEF

Guileless

When current HP percentage is 50% or lower, reduces the chance of being attacked by enemies.
Hidden Stat: 0.5


Riposte

For every Sword Stance triggered, the DMG dealt by Sword Stance increases by 2.5%. Stacks up to 10 time(s).


Vanquisher

After using Basic ATK or Skill, if there are enemies on the field that are Weakness Broken, Sushang's action advances by 15%.



1 Cut With Ease

After using Skill against a Weakness Broken enemy, regenerates 1 Skill Point.



2 Refine in Toil

After Sword Stance is triggered, the DMG taken by Sushang is reduced by 20% for 1 turn.



3 Rise From Fame

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Cleave With Heart

Sushang's Break Effect increases by 40%.



5 Prevail via Taixu

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Dwell Like Water

Talent's SPD Boost is stackable and can stack up to 2 times. Additionally, after entering battle, Sushang immediately gains 1 stack of her Talent's SPD Boost.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sushang')
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
  } = Source.character('1206')

  const talentSpdBuffValue = talent(e, 0.20, 0.21)
  const ultBuffedAtk = ult(e, 0.30, 0.324)
  const talentSpdBuffStacksMax = (e >= 6) ? 2 : 1

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.10, 2.31)
  const skillExtraHitScaling = skill(e, 1.00, 1.10)
  const ultScaling = ult(e, 3.20, 3.456)

  const defaults = {
    ultBuffedState: true,
    e2DmgReductionBuff: true,
    skillExtraHits: 3,
    skillTriggerStacks: 10,
    talentSpdBuffStacks: talentSpdBuffStacksMax,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultBuffedState: {
      id: 'ultBuffedState',
      formItem: 'switch',
      text: t('Content.ultBuffedState.text'),
      content: t('Content.ultBuffedState.content', { ultBuffedAtk: TsUtils.precisionRound(100 * ultBuffedAtk) }),
    },
    skillExtraHits: {
      id: 'skillExtraHits',
      formItem: 'slider',
      text: t('Content.skillExtraHits.text'),
      content: t('Content.skillExtraHits.content'),
      min: 0,
      max: 3,
    },
    skillTriggerStacks: {
      id: 'skillTriggerStacks',
      formItem: 'slider',
      text: t('Content.skillTriggerStacks.text'),
      content: t('Content.skillTriggerStacks.content'),
      min: 0,
      max: 10,
    },
    talentSpdBuffStacks: {
      id: 'talentSpdBuffStacks',
      formItem: 'slider',
      text: t('Content.talentSpdBuffStacks.text'),
      content: t('Content.talentSpdBuffStacks.content', { talentSpdBuffValue: TsUtils.precisionRound(100 * talentSpdBuffValue) }),
      min: 0,
      max: talentSpdBuffStacksMax,
    },
    e2DmgReductionBuff: {
      id: 'e2DmgReductionBuff',
      formItem: 'switch',
      text: t('Content.e2DmgReductionBuff.text'),
      content: t('Content.e2DmgReductionBuff.content'),
      disabled: e < 2,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.BE.buff((e >= 4) ? 0.40 : 0, SOURCE_E4)
      x.ATK_P.buff((r.ultBuffedState) ? ultBuffedAtk : 0, SOURCE_ULT)
      x.SPD_P.buff((r.talentSpdBuffStacks) * talentSpdBuffValue, SOURCE_TALENT)

      /*
       * Scaling
       * Trace only affects stance damage not skill damage - boost this based on proportion of stance : total skill dmg
       */
      const originalSkillScaling = skillScaling
      let stanceSkillScaling = 0
      stanceSkillScaling += (r.skillExtraHits >= 1) ? skillExtraHitScaling : 0
      stanceSkillScaling += (r.ultBuffedState && r.skillExtraHits >= 2) ? skillExtraHitScaling * 0.5 : 0
      stanceSkillScaling += (r.ultBuffedState && r.skillExtraHits >= 3) ? skillExtraHitScaling * 0.5 : 0

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(originalSkillScaling, SOURCE_SKILL)
      x.SKILL_ADDITIONAL_DMG_SCALING.buff(stanceSkillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      // Boost
      buffAbilityDmg(x, ADDITIONAL_DMG_TYPE, r.skillTriggerStacks * 0.025, SOURCE_SKILL)
      x.DMG_RED_MULTI.multiply((e >= 2 && r.e2DmgReductionBuff) ? (1 - 0.20) : 1, SOURCE_E2)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardAdditionalDmgAtkFinalizer(),
  }
}

```

# 1200/Tingyun.ts

```ts
import { AbilityType, BASIC_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardAdditionalDmgAtkFinalizer, standardAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Dislodged

Basic ATK+1+20

Tingyun deals Lightning DMG equal to 100% of her ATK to a single enemy.

 Single 10

Lv6

Soothing Melody

Skill-1+30

Grants a single ally with Benediction to increase their ATK by 50%, up to 25% of Tingyun's current ATK.
When the ally with Benediction attacks, they will deal Lightning Additional DMG equal to 40% of that ally's ATK for 1 time.
Benediction lasts for 3 turn(s) and is only effective on the most recent receiver of Tingyun's Skill.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

Lv10

Amidst the Rejoicing Clouds

Ultimate130+5

Regenerates 50 Energy for a single ally and increases the target's DMG by 50% for 2 turn(s).

Lv10

Violet Sparknado

Talent

When an enemy is attacked by Tingyun, the ally with Benediction immediately deals Lightning Additional DMG equal to 60% of that ally's ATK to the same enemy.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Gentle Breeze

Technique

Tingyun immediately regenerates 50 Energy upon using her Technique.


Stat Boosts

 +28.0% ATK
 +22.5% DEF
 +8.0% Lightning DMG Boost

Nourished Joviality

Tingyun's SPD increases by 20% for 1 turn after using Skill.


Knell Subdual

DMG dealt by Basic ATK increases by 40%.


Jubilant Passage

Tingyun immediately regenerates 5 Energy at the start of her turn.



1 Windfall of Lucky Springs

After using their Ultimate, the ally with Benediction gains a 20% increase in SPD for 1 turn.



2 Gainfully Gives, Givingly Gains

The ally with Benediction regenerates 5 Energy after defeating an enemy. This effect can only be triggered once per turn.



3 Halcyon Bequest

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Jovial Versatility

The DMG multiplier provided by Benediction increases by 20%.



5 Sauntering Coquette

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Peace Brings Wealth to All

Ultimate regenerates 10 more Energy for the target ally.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Tingyun')
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
  } = Source.character('1202')

  const skillAtkBoostMax = skill(e, 0.25, 0.27)
  const ultDmgBoost = ult(e, 0.50, 0.56)
  const skillAtkBoostScaling = skill(e, 0.50, 0.55)
  const skillLightningDmgBoostScaling = skill(e, 0.40, 0.44) + ((e >= 4) ? 0.20 : 0)
  const talentScaling = talent(e, 0.60, 0.66) + ((e >= 4) ? 0.20 : 0)

  const basicScaling = basic(e, 1.00, 1.10)

  const defaults = {
    benedictionBuff: false,
    skillSpdBuff: false,
    ultSpdBuff: false,
    ultDmgBuff: false,
  }

  const teammateDefaults = {
    benedictionBuff: true,
    ultSpdBuff: false,
    ultDmgBuff: true,
    teammateAtkBuffValue: skillAtkBoostScaling,
  }

  const content: ContentDefinition<typeof defaults> = {
    benedictionBuff: {
      id: 'benedictionBuff',
      formItem: 'switch',
      text: t('Content.benedictionBuff.text'),
      content: t('Content.benedictionBuff.content', {
        skillAtkBoostScaling: TsUtils.precisionRound(100 * skillAtkBoostScaling),
        skillAtkBoostMax: TsUtils.precisionRound(100 * skillAtkBoostMax),
        skillLightningDmgBoostScaling: TsUtils.precisionRound(100 * skillLightningDmgBoostScaling),
      }),
    },
    skillSpdBuff: {
      id: 'skillSpdBuff',
      formItem: 'switch',
      text: t('Content.skillSpdBuff.text'),
      content: t('Content.skillSpdBuff.content'),
    },
    ultDmgBuff: {
      id: 'ultDmgBuff',
      formItem: 'switch',
      text: t('Content.ultDmgBuff.text'),
      content: t('Content.ultDmgBuff.content', { ultDmgBoost: TsUtils.precisionRound(100 * ultDmgBoost) }),
    },
    ultSpdBuff: {
      id: 'ultSpdBuff',
      formItem: 'switch',
      text: t('Content.ultSpdBuff.text'),
      content: t('Content.ultSpdBuff.content'),
      disabled: e < 1,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    benedictionBuff: content.benedictionBuff,
    teammateAtkBuffValue: {
      id: 'teammateAtkBuffValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateAtkBuffValue.text'),
      content: t('TeammateContent.teammateAtkBuffValue.content', {
        skillAtkBoostScaling: TsUtils.precisionRound(100 * skillAtkBoostScaling),
        skillAtkBoostMax: TsUtils.precisionRound(100 * skillAtkBoostMax),
        skillLightningDmgBoostScaling: TsUtils.precisionRound(100 * skillLightningDmgBoostScaling),
      }),
      min: 0,
      max: skillAtkBoostScaling,
      percent: true,
    },
    ultDmgBuff: content.ultDmgBuff,
    ultSpdBuff: content.ultSpdBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.SPD_P.buff((r.skillSpdBuff) ? 0.20 : 0, SOURCE_TRACE)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)

      x.BASIC_ADDITIONAL_DMG_SCALING.buff((r.benedictionBuff) ? skillLightningDmgBoostScaling + talentScaling : 0, SOURCE_SKILL)

      // Boost
      buffAbilityDmg(x, BASIC_DMG_TYPE, 0.40, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.SPD_P.buffSingle((e >= 1 && m.ultSpdBuff) ? 0.20 : 0, SOURCE_E1)

      x.ELEMENTAL_DMG.buffSingle((m.ultDmgBuff) ? ultDmgBoost : 0, SOURCE_ULT)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.ATK_P.buffSingle((t.benedictionBuff) ? t.teammateAtkBuffValue : 0, SOURCE_SKILL)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => gpuStandardAdditionalDmgAtkFinalizer(),
    dynamicConditionals: [
      {
        id: 'TingyunAtkConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.ATK],
        chainsTo: [Stats.ATK],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.benedictionBuff
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.ATK, Stats.ATK, this, x, action, context, SOURCE_TRACE,
            (convertibleValue) => convertibleValue * skillAtkBoostMax,
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.ATK, Stats.ATK, this, action, context,
            `${skillAtkBoostMax} * convertibleValue`,
            `${wgslTrue(r.benedictionBuff)}`,
          )
        },
      },
    ],
  }
}

```

# 1100/Topaz.ts

```ts
import { AbilityType, ASHBLAZING_ATK_STACK, BASIC_DMG_TYPE, FUA_DMG_TYPE, SKILL_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, calculateAshblazingSetP, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityCd, buffAbilityResPen, buffAbilityVulnerability, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Deficit...

Basic ATK+1+20

Deals Fire DMG equal to 100% of Topaz's ATK to a single enemy.

 Single 10

Lv6

Difficulty Paying?

Skill-1+30

Inflicts a single target enemy with a Proof of Debt status, increasing the Follow-up ATK DMG it receives by 50%. Proof of Debt only takes effect on the most recent target it is applied to. If there are no enemies inflicted with Proof of Debt on the field when an ally's turn starts or when an ally takes action, Topaz will inflict a random enemy with Proof of Debt.
Numby deals Fire DMG equal to 150% of Topaz's ATK to this target. Using this Skill to deal DMG is considered as launching a Follow-up ATK.

 Single 20

Lv10

Turn a Profit!

Ultimate130+5

Numby enters the Windfall Bonanza! state and its DMG multiplier increases by 150% and CRIT DMG increases by 25%. Also, when enemies with Proof of Debt are hit by an ally's Basic ATK, Skill, or Ultimate, Numby's action is Advanced Forward by 50%. Numby exits the Windfall Bonanza! state after using 2 attacks.

Lv10

Trotter Market!?

Talent

Summons Numby at the start of battle. Numby has 80 SPD by default. When taking action, Numby launches Follow-up ATKs on a single enemy target afflicted with Proof of Debt, dealing Fire DMG equal to 150% of Topaz's ATK.
When enemies afflicted with Proof of Debt receive an ally's Follow-up ATKs, Numby's action is Advanced Forward by 50%. The action Advance Forward effect cannot be triggered during Numby's own turn.
When Topaz is downed, Numby disappears.

 Single 20

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Explicit Subsidy

Technique

Summons Numby when Topaz enters the overworld. Numby will automatically search for Basic Treasures and Trotters within a set radius.
Using her Technique will regenerate 60 Energy for Topaz after Numby's first attack in the next battle.
If Topaz is still in the team after using her Technique and defeating overworld enemies, a small bonus amount of credits will be added to the earned credits. A maximum of 10000 bonus credits can be received per calendar day.
After using her Technique and defeating enemies in Simulated Universe or Divergent Universe, additionally receive a small amount of Cosmic Fragments with a small chance to obtain 1 random Curio.


Stat Boosts

 +22.4% Fire DMG Boost
 +12.0% CRIT Rate
 +10.0% HP

Overdraft

When Topaz uses Basic ATK to deal DMG, it is considered as a Follow-up ATK.


Financial Turmoil

Increases Topaz & Numby's DMG dealt to enemy targets with Fire Weakness by 15%.


Stonks Market

After Numby uses an attack while in the Windfall Bonanza! state, Topaz additionally regenerates 10 Energy.



1 Future Market

When enemies afflicted with "Proof of Debt" receive Follow-up ATKs, they will enter the "Debtor" state. This can take effect only once within a single attack.
The "Debtor" state increases the CRIT DMG of Follow-up ATKs inflicted on the target enemies by 25%, stacking up to 2 time(s). When "Proof of Debt" is removed, the "Debtor" state is also removed.



2 Bona Fide Acquisition

After Numby takes action and launches an attack, Topaz regenerates 5 Energy.



3 Seize the Big and Free the Small

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Agile Operation

After Numby's turn begins, Topaz's action advances by 20%.



5 Inflationary Demand

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Incentive Mechanism

Numby's attack count during the "Windfall Bonanza!" state increases by 1, and its Fire RES PEN increases by 10% when it attacks.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Topaz')
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
  } = Source.character('1112')

  const proofOfDebtFuaVulnerability = skill(e, 0.50, 0.55)
  const enhancedStateFuaScalingBoost = ult(e, 1.50, 1.65)
  const enhancedStateFuaCdBoost = ult(e, 0.25, 0.275)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.50, 1.65)
  const fuaScaling = talent(e, 1.50, 1.65)

  // 0.06
  const basicHitCountMulti = ASHBLAZING_ATK_STACK
    * (1 * 1 / 1)

  // 0.18
  const fuaHitCountMulti = ASHBLAZING_ATK_STACK
    * (1 * 1 / 7 + 2 * 1 / 7 + 3 * 1 / 7 + 4 * 1 / 7 + 5 * 1 / 7 + 6 * 1 / 7 + 7 * 1 / 7)

  // 0.252
  const fuaEnhancedHitCountMulti = ASHBLAZING_ATK_STACK
    * (1 * 1 / 10 + 2 * 1 / 10 + 3 * 1 / 10 + 4 * 1 / 10 + 5 * 1 / 10 + 6 * 1 / 10 + 7 * 1 / 10 + 8 * 3 / 10)

  const defaults = {
    enemyProofOfDebtDebuff: true,
    numbyEnhancedState: true,
    e1DebtorStacks: 2,
  }

  const teammateDefaults = {
    enemyProofOfDebtDebuff: true,
    e1DebtorStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    enemyProofOfDebtDebuff: {
      id: 'enemyProofOfDebtDebuff',
      formItem: 'switch',
      text: t('Content.enemyProofOfDebtDebuff.text'),
      content: t('Content.enemyProofOfDebtDebuff.content', { proofOfDebtFuaVulnerability: TsUtils.precisionRound(100 * proofOfDebtFuaVulnerability) }),
    },
    numbyEnhancedState: {
      id: 'numbyEnhancedState',
      formItem: 'switch',
      text: t('Content.numbyEnhancedState.text'),
      content: t('Content.numbyEnhancedState.content', {
        enhancedStateFuaCdBoost: TsUtils.precisionRound(100 * enhancedStateFuaCdBoost),
        enhancedStateFuaScalingBoost: TsUtils.precisionRound(100 * enhancedStateFuaScalingBoost),
      }),
    },
    e1DebtorStacks: {
      id: 'e1DebtorStacks',
      formItem: 'slider',
      text: t('Content.e1DebtorStacks.text'),
      content: t('Content.e1DebtorStacks.content'),
      min: 0,
      max: 2,
      disabled: e < 1,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    enemyProofOfDebtDebuff: content.enemyProofOfDebtDebuff,
    e1DebtorStacks: content.e1DebtorStacks,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.FUA],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      x.BASIC_DMG_TYPE.set(BASIC_DMG_TYPE | FUA_DMG_TYPE, SOURCE_TRACE)
      x.SKILL_DMG_TYPE.set(SKILL_DMG_TYPE | FUA_DMG_TYPE, SOURCE_SKILL)
      x.SUMMONS.set(1, SOURCE_TALENT)
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      buffAbilityCd(x, SKILL_DMG_TYPE | FUA_DMG_TYPE, (r.numbyEnhancedState) ? enhancedStateFuaCdBoost : 0, SOURCE_ULT)
      buffAbilityResPen(x, SKILL_DMG_TYPE | FUA_DMG_TYPE, (e >= 6) ? 0.10 : 0, SOURCE_E6)

      // Numby buffs only applies to the skill/fua not basic, we deduct it from basic
      buffAbilityCd(x, BASIC_DMG_TYPE, (r.numbyEnhancedState) ? -enhancedStateFuaCdBoost : 0, SOURCE_ULT)
      buffAbilityResPen(x, BASIC_DMG_TYPE, (e >= 6) ? -0.10 : 0, SOURCE_E6)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.SKILL_ATK_SCALING.buff((r.numbyEnhancedState) ? enhancedStateFuaScalingBoost : 0, SOURCE_ULT)
      x.FUA_ATK_SCALING.buff(fuaScaling, SOURCE_TALENT)
      x.FUA_ATK_SCALING.buff((r.numbyEnhancedState) ? enhancedStateFuaScalingBoost : 0, SOURCE_ULT)

      // Boost
      x.ELEMENTAL_DMG.buff((context.enemyElementalWeak) ? 0.15 : 0, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.FUA_TOUGHNESS_DMG.buff(20, SOURCE_TALENT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      buffAbilityVulnerability(x, FUA_DMG_TYPE, (m.enemyProofOfDebtDebuff) ? proofOfDebtFuaVulnerability : 0, SOURCE_SKILL, Target.TEAM)
      buffAbilityCd(x, FUA_DMG_TYPE, (e >= 1 && m.enemyProofOfDebtDebuff) ? 0.25 * m.e1DebtorStacks : 0, SOURCE_E1, Target.TEAM)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const hitMulti = (r.numbyEnhancedState) ? fuaEnhancedHitCountMulti : fuaHitCountMulti
      const basicAshblazingAtkP = calculateAshblazingSetP(x, action, context, basicHitCountMulti)
      const fuaAshblazingAtkP = calculateAshblazingSetP(x, action, context, hitMulti)

      x.BASIC_ATK_P_BOOST.buff(basicAshblazingAtkP, Source.NONE)
      x.SKILL_ATK_P_BOOST.buff(fuaAshblazingAtkP, Source.NONE)
      x.FUA_ATK_P_BOOST.buff(fuaAshblazingAtkP, Source.NONE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const hitMulti = (r.numbyEnhancedState) ? fuaEnhancedHitCountMulti : fuaHitCountMulti

      return `
x.BASIC_ATK_P_BOOST += calculateAshblazingSetP(sets.TheAshblazingGrandDuke, action.setConditionals.valueTheAshblazingGrandDuke, ${basicHitCountMulti});
x.SKILL_ATK_P_BOOST += calculateAshblazingSetP(sets.TheAshblazingGrandDuke, action.setConditionals.valueTheAshblazingGrandDuke, ${hitMulti});
x.FUA_ATK_P_BOOST += calculateAshblazingSetP(sets.TheAshblazingGrandDuke, action.setConditionals.valueTheAshblazingGrandDuke, ${hitMulti});
      `
    },
  }
}

```

# 8000/TrailblazerDestruction.ts

```ts
import { AbilityType, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Farewell Hit

Basic ATK+1+20

Deals Physical DMG equal to 100% of the Trailblazer's ATK to a single enemy.

 Single 10

Lv6

RIP Home Run

Skill-1+30

Deals Physical DMG equal to 125% of the Trailblazer's ATK to a single enemy and enemies adjacent to it.

 Single 20 | Other 10

Lv10

Stardust Ace

Ultimate120+5

Choose between two attack modes to deliver a full strike.
Blowout: Farewell Hit deals Physical DMG equal to 450% of the Trailblazer's ATK to a single enemy.
Blowout: RIP Home Run deals Physical DMG equal to 270% of the Trailblazer's ATK to a single enemy, and Physical DMG equal to 162% of the Trailblazer's ATK to enemies adjacent to it.

Lv10

Perfect Pickoff

Talent

Each time after this character inflicts Weakness Break on an enemy, ATK increases by 20%. This effect stacks up to 2 time(s).

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Immortal Third Strike

Technique

Immediately heals all allies for 15% of their respective Max HP after using this Technique.

Blowout: Farewell Hit


Ultimate120+5

Deals Physical DMG equal to 450% of the Trailblazer's ATK to a single enemy.

 Single 30

Lv10
Blowout: RIP Home Run


Ultimate120+5

Deals Physical DMG equal to 270% of Trailblazer's ATK to a single enemy and Physical DMG equal to 162% of Trailblazer's ATK to enemies adjacent to it.

 Single 20 | Other 20

Lv10

Stat Boosts

 +28.0% ATK
 +18.0% HP
 +12.5% DEF

Ready for Battle

At the start of the battle, immediately regenerates 15 Energy.


Tenacity

Each Talent stack increases the Trailblazer's DEF by 10%.


Fighting Will

When using Skill or Ultimate "Blowout: RIP Home Run," DMG dealt to the target enemy is increased by 25%.



1 A Falling Star

When enemies are defeated due to the Trailblazer's Ultimate, the Trailblazer regenerates 10 extra Energy. This effect can only be triggered once per attack.



2 An Unwilling Host

Attacking enemies with Physical Weakness restores the Trailblazer's HP equal to 5% of the Trailblazer's ATK.



3 A Leading Whisper

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 A Destructing Glance

When attacking an enemy that is Weakness Broken, increases CRIT Rate by 25%.



5 A Surviving Hope

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 A Trailblazing Will

The Trailblazer's Talent is also triggered when they defeat an enemy.
Hidden Stat: 1.0
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.TrailblazerDestruction')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('8002')

  const talentAtkScalingValue = talent(e, 0.20, 0.22)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.25, 1.375)
  const ultScaling = ult(e, 4.5, 4.80)
  const ultEnhancedScaling = ult(e, 2.70, 2.88)
  const ultEnhancedScaling2 = ult(e, 1.62, 1.728)

  const defaults = {
    enhancedUlt: true,
    talentStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedUlt: {
      id: 'enhancedUlt',
      formItem: 'switch',
      text: t('Content.enhancedUlt.text'),
      content: t('Content.enhancedUlt.content', {
        ultScaling: TsUtils.precisionRound(100 * ultScaling),
        ultEnhancedScaling: TsUtils.precisionRound(100 * ultEnhancedScaling),
        ultEnhancedScaling2: TsUtils.precisionRound(100 * ultEnhancedScaling2),
      }),
    },
    talentStacks: {
      id: 'talentStacks',
      formItem: 'slider',
      text: t('Content.talentStacks.text'),
      content: t('Content.talentStacks.content', { talentAtkScalingValue: TsUtils.precisionRound(100 * talentAtkScalingValue) }),
      min: 0,
      max: 2,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.ATK_P.buff(r.talentStacks * talentAtkScalingValue, SOURCE_TALENT)
      x.DEF_P.buff(r.talentStacks * 0.10, SOURCE_TRACE)
      x.CR.buff((e >= 4 && x.a[Key.ENEMY_WEAKNESS_BROKEN]) ? 0.25 : 0, SOURCE_E4)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff((r.enhancedUlt) ? ultEnhancedScaling : ultScaling, SOURCE_ULT)

      // Boost
      buffAbilityDmg(x, SKILL_DMG_TYPE, 0.25, SOURCE_TRACE)
      buffAbilityDmg(x, ULT_DMG_TYPE, (r.enhancedUlt) ? 0.25 : 0, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff((r.enhancedUlt) ? 20 : 30, SOURCE_ULT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
  }
}

```

# 8000/TrailblazerHarmony.ts

```ts
import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Swing Dance Etiquette

Basic ATK+1+20

Deals Imaginary DMG equal to 100% of the Trailblazer's ATK to a single enemy.

 Single 10

Lv6

Halftime to Make It Rain

Skill-1+6

Deals Imaginary DMG equal to 50% of the Trailblazer's ATK to a single enemy and deals DMG for 4 extra times, dealing Imaginary DMG equal to 50% of the Trailblazer's ATK to a random enemy each time.
Hidden Stat: 2

 Single 10 | Other 10

Lv10

All-Out Footlight Parade

Ultimate140+5

Applies the Backup Dancer effect to all allies, lasting for 3 turn(s). Decreases its duration by 1 turn at the start of Trailblazer's every turn. Allies with Backup Dancer increase their Break Effect by 30%. When they attack enemy targets that are in the Weakness Broken state, they will convert the Toughness-Reducing DMG of this attack to Super Break DMG 1 time.
Hidden Stat: 1

Weakness Break State
When enemy targets' Toughness is reduced to 0, they will enter the Weakness Break State, which delays their actions.

Super Break DMG
Super Break DMG increases with higher Break Effect, higher Toughness-Reducing DMG from this attack, and higher character levels.
Super Break DMG cannot CRIT Hit and is not affected by DMG Boost effects.

 All 10

Lv10

Full-on Aerial Dance

Talent

The Trailblazer immediately regenerates 10 Energy when an enemy target's Weakness is Broken.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Now! I'm the Band!

Technique

After using the Technique, at the start of the next battle, all allies' Break Effect increases by 30%, lasting for 2 turn(s).


Stat Boosts

 +37.3% Break Effect
 +14.4% Imaginary DMG Boost
 +10.0% Effect RES

Dance With the One

When there are 5 or more/4/3/2/1 enemy target(s) currently on the field, the Super Break DMG triggered by the Backup Dancer effect increases by 20.0%/30.0%/40.0%/50.0%/60.0%.


Shuffle Along

When using Skill, increase the first Toughness-Reducing DMG inflicted in a battle by 100.0%.


Hat of the Theater

Additionally delays the enemy target's action by 30.0% when teammates Break enemy Weaknesses.



1 Best Seat in the House

Recovers 1.0 Skill Point(s) after using the Skill for the first time in a battle.



2 Jailbreaking Rainbowwalk

At the start of the battle, the Trailblazer's Energy Regeneration Rate increases by 25.0%, lasting for 3.0 turn(s).



3 Sanatorium for Rest Notes

Skill Lv. +2, up to a maximum of Lv. 15. Talent Lv. +2, up to a maximum of Lv. 15.



4 Dove in Tophat

While the Trailblazer is on the field, increase the Break Effect of all allies except the Trailblazer. The increase is equal to 15.0% of the Trailblazer's Break Effect.



5 Poem Favors Rhythms of Old

Ultimate Lv. +2, up to a maximum of Lv. 15. Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Tomorrow, Rest in Spotlight

Increases the Skill's additional DMG by 2.0 hit(s).
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.TrailblazerHarmony')
  const { basic, skill, ult } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('8006')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.50, 0.55)
  const ultBeScaling = ult(e, 0.30, 0.33)
  const skillMaxHits = e >= 6 ? 6 : 4

  const targetsToSuperBreakMulti: Record<number, number> = {
    1: 1.60,
    3: 1.40,
    5: 1.20,
  }

  const defaults = {
    skillHitsOnTarget: skillMaxHits,
    backupDancer: true,
    superBreakDmg: true,
    e2EnergyRegenBuff: false,
  }

  const teammateDefaults = {
    backupDancer: true,
    superBreakDmg: true,
    teammateBeValue: 2.00,
  }

  const content: ContentDefinition<typeof defaults> = {
    backupDancer: {
      id: 'backupDancer',
      formItem: 'switch',
      text: t('Content.backupDancer.text'),
      content: t('Content.backupDancer.content', { ultBeScaling: TsUtils.precisionRound(100 * ultBeScaling) }),
    },
    superBreakDmg: {
      id: 'superBreakDmg',
      formItem: 'switch',
      text: t('Content.superBreakDmg.text'),
      content: t('Content.superBreakDmg.content'),
    },
    skillHitsOnTarget: {
      id: 'skillHitsOnTarget',
      formItem: 'slider',
      text: t('Content.skillHitsOnTarget.text'),
      content: t('Content.skillHitsOnTarget.content'),
      min: 0,
      max: skillMaxHits,
    },
    e2EnergyRegenBuff: {
      id: 'e2EnergyRegenBuff',
      formItem: 'switch',
      text: t('Content.e2EnergyRegenBuff.text'),
      content: t('Content.e2EnergyRegenBuff.content'),
      disabled: e < 2,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    backupDancer: content.backupDancer,
    superBreakDmg: content.superBreakDmg,
    teammateBeValue: {
      id: 'teammateBeValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateBeValue.text'),
      content: t('TeammateContent.teammateBeValue.content'),
      min: 0,
      max: 4.00,
      percent: true,
      disabled: e < 4,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      if (r.superBreakDmg) {
        x.ENEMY_WEAKNESS_BROKEN.config(1, SOURCE_ULT)
      }
    },
    initializeTeammateConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      if (r.superBreakDmg) {
        x.ENEMY_WEAKNESS_BROKEN.config(1, SOURCE_ULT)
      }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.ERR.buff((e >= 2 && r.e2EnergyRegenBuff) ? 0.25 : 0, SOURCE_E2)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.SKILL_ATK_SCALING.buff(r.skillHitsOnTarget * skillScaling, SOURCE_SKILL)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(10 * r.skillHitsOnTarget, SOURCE_SKILL)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.BE.buffTeam((m.backupDancer) ? ultBeScaling : 0, SOURCE_ULT)
      x.SUPER_BREAK_MODIFIER.buffTeam(
        (m.backupDancer && m.superBreakDmg)
          ? targetsToSuperBreakMulti[context.enemyCount]
          : 0,
        SOURCE_ULT)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const beBuff = (e >= 4) ? 0.15 * t.teammateBeValue : 0
      x.BE.buffTeam(beBuff, SOURCE_E4)
      x.UNCONVERTIBLE_BE_BUFF.buffTeam(beBuff, SOURCE_E4)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
    },
    gpuFinalizeCalculations: () => '',
  }
}

```

# 8000/TrailblazerPreservation.ts

```ts
import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { gpuStandardDefShieldFinalizer, standardDefShieldFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Ice-Breaking Light

Basic ATK+1+20

Deals Fire DMG equal to 100% of the Trailblazer's ATK to a single enemy and gains 1 stack of Magma Will.

 Single 10

Lv6

Ice-Breaking Light

Basic ATK+1+30

Consumes 4 stacks of Magma Will to enhance Basic ATK, dealing Fire DMG equal to 135% of the Trailblazer's ATK to a single enemy and Fire DMG to equal to 54% of the Trailblazer's ATK to enemies adjacent to it.

 Single 20 | Other 10

Lv6

Ever-Burning Amber

Skill-1+30

Increases the Trailblazer's DMG Reduction by 50% and gains 1 stack of Magma Will, with a 100% base chance to Taunt all enemies for 1 turn(s).

Lv10

War-Flaming Lance

Ultimate120+5

Deals Fire DMG equal to 100% of the Trailblazer's ATK plus 150% of the Trailblazer's DEF to all enemies. The next Basic ATK will be automatically enhanced and does not cost Magma Will.

 All 20

Lv10

Treasure of the Architects

Talent

Each time the Trailblazer is hit, they gain 1 stack of Magma Will for a max of 8 stack(s).
When Magma Will has no fewer than 4 stacks, the Trailblazer's Basic ATK becomes enhanced, dealing DMG to a single enemy and enemies adjacent to it.
When the Trailblazer uses Basic ATK, Skill, or Ultimate, apply a Shield to all allies that absorbs DMG equal to 6% of the Trailblazer's DEF plus 80. The Shield lasts for 2 turn(s).

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Call of the Guardian

Technique

After using Technique, at the start of the next battle, gains a Shield that absorbs DMG equal to 30% of the Trailblazer's DEF plus 384 for 1 turn(s).


Stat Boosts

 +35.0% DEF
 +18.0% ATK
 +10.0% HP

The Strong Defend the Weak

After using the Skill, the DMG taken by all allies reduces by 15% for 1 turn(s).
Hidden Stat: 10.0


Unwavering Gallantry

Using Enhanced Basic ATK restores the Trailblazer's HP by 5% of their Max HP.


Action Beats Overthinking

When the Trailblazer is protected by a Shield at the beginning of the turn, increases their ATK by 15% and regenerates 5 Energy until the action is over.



1 Earth-Shaking Resonance

When the Trailblazer uses their Basic ATK, additionally deals Fire DMG equal to 25% of the Trailblazer's DEF. When the Trailblazer uses their enhanced Basic ATK, additionally deals Fire DMG equal to 50% of the Trailblazer's DEF.



2 Time-Defying Tenacity

The Shield applied to all allies from the Trailblazer's Talent will block extra DMG equal to 2% of the Trailblazer's DEF plus 27.



3 Trail-Blazing Blueprint

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Nation-Building Oath

At the start of the battle, immediately gains 4 stack(s) of Magma Will.



5 Spirit-Warming Flame

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 City-Forging Bulwarks

After the Trailblazer uses enhanced Basic ATK or Ultimate, their DEF increases by 10%. Stacks up to 3 time(s).
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.TrailblazerPreservation')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('8004')

  const skillDamageReductionValue = skill(e, 0.50, 0.52)

  const basicAtkScaling = basic(e, 1.00, 1.10)
  const basicDefScaling = (e >= 1) ? 0.25 : 0
  const basicEnhancedAtkScaling = basic(e, 1.35, 1.463)
  const basicEnhancedDefScaling = (e >= 1) ? 0.50 : 0
  const ultAtkScaling = ult(e, 1.00, 1.10)
  const ultDefScaling = ult(e, 1.50, 1.65)

  const talentShieldScaling = talent(e, 0.06, 0.064)
  const talentShieldFlat = talent(e, 80, 89)

  const defaults = {
    enhancedBasic: true,
    skillActive: true,
    shieldActive: true,
    e6DefStacks: 3,
  }

  const teammateDefaults = {
    skillActive: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedBasic: {
      id: 'enhancedBasic',
      formItem: 'switch',
      text: t('Content.enhancedBasic.text'),
      content: t('Content.enhancedBasic.content', { basicEnhancedAtkScaling: TsUtils.precisionRound(100 * basicEnhancedAtkScaling) }),
    },
    skillActive: {
      id: 'skillActive',
      formItem: 'switch',
      text: t('Content.skillActive.text'),
      content: t('Content.skillActive.content', { skillDamageReductionValue: TsUtils.precisionRound(100 * skillDamageReductionValue) }),
    },
    shieldActive: {
      id: 'shieldActive',
      formItem: 'switch',
      text: t('Content.shieldActive.text'),
      content: t('Content.shieldActive.content'),
    },
    e6DefStacks: {
      id: 'e6DefStacks',
      formItem: 'slider',
      text: t('Content.e6DefStacks.text'),
      content: t('Content.e6DefStacks.content'),
      min: 0,
      max: 3,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillActive: content.skillActive,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.DEF_P.buff((e >= 6) ? r.e6DefStacks * 0.10 : 0, SOURCE_E6)
      x.ATK_P.buff((r.shieldActive) ? 0.15 : 0, SOURCE_TRACE)

      if (r.enhancedBasic) {
        x.BASIC_ATK_SCALING.buff(basicEnhancedAtkScaling, SOURCE_BASIC)
        x.BASIC_DEF_SCALING.buff(basicEnhancedDefScaling, SOURCE_BASIC)
      } else {
        x.BASIC_ATK_SCALING.buff(basicAtkScaling, SOURCE_BASIC)
        x.BASIC_DEF_SCALING.buff(basicDefScaling, SOURCE_BASIC)
      }

      x.ULT_ATK_SCALING.buff(ultAtkScaling, Source.NONE)
      x.ULT_DEF_SCALING.buff(ultDefScaling, Source.NONE)

      // Boost
      // This EHP buff only applies to self
      x.DMG_RED_MULTI.multiply((r.skillActive) ? (1 - skillDamageReductionValue) : 1, SOURCE_SKILL)

      x.BASIC_TOUGHNESS_DMG.buff((r.enhancedBasic) ? 20 : 10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      x.SHIELD_SCALING.buff(talentShieldScaling, SOURCE_TALENT)
      x.SHIELD_FLAT.buff(talentShieldFlat, SOURCE_TALENT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // This EHP buff applies to all
      x.DMG_RED_MULTI.multiplyTeam((m.skillActive) ? (1 - 0.15) : 1, SOURCE_TRACE)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardDefShieldFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => gpuStandardDefShieldFinalizer(),
  }
}

```

# 8000/TrailblazerRemembrance.ts

```ts
import { AbilityType, BUFF_PRIORITY_MEMO, BUFF_PRIORITY_SELF } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Almighty Companion

Talent

Memosprite Mem has an initial SPD of 130 and Max HP equal to 80% of Trailblazer's Max HP plus 640. For every 10 Energy regenerated by all allies in total, Mem gains 1% Charge.

Lv10

Baddies! Trouble!

Memosprite Skill+10

Deals 4 instance(s) of DMG, with each instance dealing Ice DMG equal to 36% of Mem's ATK to one random enemy. Finally, deals Ice DMG equal to 90% of Mem's ATK to all enemies.

 Single 5 | All 10

Lv6

Friends! Together!

Memosprite Talent

All allies' CRIT DMG increases by 12% of Mem's CRIT DMG plus 24%.
If the Charge has yet to reach 100%, Mem automatically uses "Baddies! Trouble!" during action. When the Charge reaches 100%, Mem immediately takes action, and can select one ally unit to use "Lemme! Help You!" in the next action.

Lv6

Go, Mem, Go!

Memosprite Talent

When Mem is summoned, immediately gains 50% Charge.

Lv6

No... Regrets

Memosprite Talent

When Mem disappears, advances Trailblazer's action by 25%.

Lv6

Lemme! Help You!

Memosprite Skill+10

Advances the action of one designated ally by 100% and grants them "Mem's Support," lasting for 3 turn(s).
For every 1 instance of DMG dealt by the target that has "Mem's Support," additionally deals 1 instance of True DMG equal to 28% of the original DMG.
When using this ability on this unit, cannot trigger the action advance effect.

True DMG
Non-Type DMG that is not affected by any effects. This DMG is not considered as using 1 attack.

Lv6

Leave It to Me!

Basic ATK+1+20

Deals Ice DMG equal to 100% of Trailblazer's ATK to one designated enemy.

 Single 10

Lv6

I Choose You!

Skill-1+30

Summons the memosprite Mem. If Mem is already on the field, restores Mem's HP by an amount equal to 60% of Mem's Max HP, and grants Mem 10% Charge.

Summon Memosprite
Summon the memosprite to the field. If the memosprite is already on the field, dispels all Crowd Control debuffs the memosprite is afflicted with.

Lv10

Together, Mem!

Ultimate160+5

Summons memosprite Mem. Grants Mem 40% Charge, then enables Mem to deal Ice DMG equal to 240% of Mem's ATK to all enemies.

 All 20

Lv10

Almighty Companion

Talent

Memosprite Mem has an initial SPD of 130 and Max HP equal to 80% of Trailblazer's Max HP plus 640. For every 10 Energy regenerated by all allies in total, Mem gains 1% Charge.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Memories Back as Echoes

Technique

After using Technique, creates a Special Dimension that lasts for 10 second(s). Enemies within the Special Dimension are placed in a Time Stop state, halting all their actions.
After entering battle against enemies afflicted with the Time Stop state, delays the action of all enemies by 50%, and then deals Ice DMG to all enemies equal to 100% of Trailblazer's ATK.
Only 1 Dimension Effect created by allies can exist at the same time.


I Choose You!

Skill-1+30

Lv10

Stat Boosts

 +37.3% CRIT DMG
 +14.0% ATK
 +14.0% HP

Rhapsode's Scepter

When the battle starts, Trailblazer's action advances by 30%. When Mem is first summoned, grants Mem 40% Charge.


Petite Parable

When using "Baddies! Trouble!," Mem immediately gains 5% Charge.


Magnets and Long Chains

When the Max Energy of the ally target that has "Mem's Support" exceeds 100, for every 10 excess Energy, additionally increases the multiplier of the True DMG dealt via "Mem's Support" by 2%, up to a max increase of 20%.

True DMG
Non-Type DMG that is not affected by any effects. This DMG is not considered as using 1 attack.



1 Narrator of the Present

Increases the CRIT Rate of the ally target with "Mem's Support" by 10%. When an ally target has "Mem's Support," its effect also takes effect on the target's memosprite/memomaster. This effect cannot stack.



2 Gleaner of the Past

When ally memosprites (aside from Mem) take action, Trailblazer regenerates 8 Energy. This effect can trigger a max of 1 time(s) per turn. The trigger count resets at the start of Trailblazer's turn.



3 Chanter of the Future

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.
Memosprite Talent Lv. +1, up to a maximum of Lv. 10.



4 Dancer of the Muse

When an ally target with 0 Max Energy actively uses an ability, Mem can also gain 3% Charge, and the multiplier of the True DMG dealt by this target via "Mem's Support" additionally increases by 6%.



5 Seamster of the Ode

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.
Memosprite Skill Lv. +1, up to a maximum of Lv. 10.



6 Bearer of the Revelation

Ultimate's CRIT Rate is set at 100%.
Hidden Stat: 1.0
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.TrailblazerRemembrance')
  const tBuff = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.BuffPriority')
  const { basic, skill, ult, talent, memoSkill, memoTalent } = AbilityEidolon.SKILL_TALENT_MEMO_TALENT_3_ULT_BASIC_MEMO_SKILL_5
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
  } = Source.character('8008')

  const basicScaling = basic(e, 1.00, 1.10)

  const ultScaling = ult(e, 2.40, 2.64)

  const memoHpScaling = talent(e, 0.80, 0.86)
  const memoHpFlat = talent(e, 640, 688)

  const memoSkillHitScaling = memoSkill(e, 0.36, 0.396)
  const memoSkillFinalScaling = memoSkill(e, 0.90, 0.99)

  const memoTalentCdBuffScaling = memoTalent(e, 0.12, 0.132)
  const memoTalentCdBuffFlat = memoTalent(e, 0.24, 0.264)

  const trueDmgScaling = memoSkill(e, 0.28, 0.30)
  // When the Max Energy of the ally target that has "Mem's Support" exceeds 100, for every 10 excess Energy,
  // additionally increases the multiplier of the True DMG dealt via "Mem's Support" by 2%, up to a max increase of 20%.

  const defaults = {
    buffPriority: BUFF_PRIORITY_SELF,
    memoSkillHits: 4,
    teamCdBuff: true,
    memsSupport: false,
    energyTrueDmgValue: false,
    e1CrBuff: false,
    e4TrueDmgBoost: false,
    e6UltCrBoost: true,
  }

  const teammateDefaults = {
    teamCdBuff: true,
    memCDValue: 2.50,
    memsSupport: true,
    energyTrueDmgValue: true,
    e1CrBuff: true,
    e4TrueDmgBoost: false,
  }

  const content: ContentDefinition<typeof defaults> = {
    buffPriority: {
      id: 'buffPriority',
      formItem: 'select',
      text: tBuff('Text'),
      content: tBuff('Content'),
      options: [
        { display: tBuff('Self'), value: BUFF_PRIORITY_SELF, label: tBuff('Self') },
        { display: tBuff('Memo'), value: BUFF_PRIORITY_MEMO, label: tBuff('Memo') },
      ],
      fullWidth: true,
    },
    memoSkillHits: {
      id: 'memoSkillHits',
      formItem: 'slider',
      text: t('Content.memoSkillHits.text'),
      content: t('Content.memoSkillHits.content',
        { SingleScaling: TsUtils.precisionRound(memoSkillHitScaling * 100), AoeScaling: TsUtils.precisionRound(memoSkillFinalScaling * 100) }),
      min: 0,
      max: 4,
    },
    teamCdBuff: {
      id: 'teamCdBuff',
      formItem: 'switch',
      text: t('Content.teamCdBuff.text'),
      content: t('Content.teamCdBuff.content',
        { ScalingBuff: TsUtils.precisionRound(memoTalentCdBuffScaling * 100), FlatBuff: TsUtils.precisionRound(memoTalentCdBuffFlat * 100) }),
    },
    memsSupport: {
      id: 'memsSupport',
      formItem: 'switch',
      text: t('Content.memsSupport.text'),
      content: t('Content.memsSupport.content', { TrueDmgScaling: TsUtils.precisionRound(trueDmgScaling * 100) }),
    },
    energyTrueDmgValue: {
      id: 'energyTrueDmgValue',
      formItem: 'switch',
      text: t('Content.energyTrueDmgValue.text'),
      content: t('Content.energyTrueDmgValue.content'),
    },
    e1CrBuff: {
      id: 'e1CrBuff',
      formItem: 'switch',
      text: t('Content.e1CrBuff.text'),
      content: t('Content.e1CrBuff.content'),
      disabled: e < 1,
    },
    e4TrueDmgBoost: {
      id: 'e4TrueDmgBoost',
      formItem: 'switch',
      text: t('Content.e4TrueDmgBoost.text'),
      content: t('Content.e4TrueDmgBoost.content'),
      disabled: e < 4,
    },
    e6UltCrBoost: {
      id: 'e6UltCrBoost',
      formItem: 'switch',
      text: t('Content.e6UltCrBoost.text'),
      content: t('Content.e6UltCrBoost.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    teamCdBuff: content.teamCdBuff,
    memCDValue: {
      id: 'memCDValue',
      formItem: 'slider',
      text: t('TeammateContent.memCDValue.text'),
      content: t('TeammateContent.memCDValue.content', {
        ScalingBuff: TsUtils.precisionRound(memoTalentCdBuffScaling * 100),
        FlatBuff: TsUtils.precisionRound(memoTalentCdBuffFlat * 100),
      }),
      min: 0,
      max: 4.00,
      percent: true,
    },
    memsSupport: content.memsSupport,
    energyTrueDmgValue: content.energyTrueDmgValue,
    e1CrBuff: content.e1CrBuff,
    e4TrueDmgBoost: content.e4TrueDmgBoost,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT, AbilityType.MEMO_SKILL],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.SUMMONS.set(1, SOURCE_TALENT)
      x.MEMOSPRITE.set(1, SOURCE_TALENT)
      x.MEMO_BUFF_PRIORITY.set(r.buffPriority == BUFF_PRIORITY_SELF ? BUFF_PRIORITY_SELF : BUFF_PRIORITY_MEMO, SOURCE_TALENT)
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)

      x.MEMO_BASE_HP_SCALING.buff(memoHpScaling, SOURCE_MEMO)
      x.MEMO_BASE_HP_FLAT.buff(memoHpFlat, SOURCE_MEMO)
      x.MEMO_BASE_SPD_SCALING.buff(0, SOURCE_MEMO)
      x.MEMO_BASE_SPD_FLAT.buff(130, SOURCE_MEMO)
      x.MEMO_BASE_DEF_SCALING.buff(1, SOURCE_MEMO)
      x.MEMO_BASE_ATK_SCALING.buff(1, SOURCE_MEMO)

      x.m.MEMO_SKILL_ATK_SCALING.buff(r.memoSkillHits * memoSkillHitScaling + memoSkillFinalScaling, SOURCE_MEMO)
      x.m.ULT_ATK_SCALING.buff(ultScaling, SOURCE_MEMO)

      x.m.ULT_CR_BOOST.buff((e >= 6 && r.e6UltCrBoost) ? 1.00 : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
      x.m.MEMO_SKILL_TOUGHNESS_DMG.buff(15, SOURCE_MEMO)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      if (m.memsSupport) {
        const energyTrueDmg = Math.min(0.20, (m.energyTrueDmgValue ? Math.max((context.baseEnergy - 100) / 10, 0) * 2 * 0.01 : 0))
        const trueDmg = trueDmgScaling
          + energyTrueDmg
          + (e >= 4 && m.e4TrueDmgBoost ? 0.06 : 0)

        if (e >= 1) {
          x.CR.buffDual((m.e1CrBuff) ? 0.10 : 0, SOURCE_E1)
          x.TRUE_DMG_MODIFIER.buffDual(trueDmg, SOURCE_MEMO)
        } else {
          x.TRUE_DMG_MODIFIER.buffSingle(trueDmg, SOURCE_MEMO)
        }
      }
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const teamCDBuff = t.teamCdBuff ? memoTalentCdBuffScaling * t.memCDValue + memoTalentCdBuffFlat : 0
      x.CD.buffTeam(teamCDBuff, Source.NONE)
      x.UNCONVERTIBLE_CD_BUFF.buffTeam(teamCDBuff, SOURCE_MEMO)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
    dynamicConditionals: [
      {
        id: 'TrailblazerRemembranceCdConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CD],
        chainsTo: [Stats.CD],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          return true
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          if (!r.teamCdBuff) {
            return
          }
          if (x.a[Key.MEMOSPRITE]) {
            return this.effect(x.m, action, context)
          }

          const stateValue = action.conditionalState[this.id] || 0
          const convertibleCdValue = x.a[Key.CD] - x.a[Key.UNCONVERTIBLE_CD_BUFF]

          const buffCD = memoTalentCdBuffScaling * convertibleCdValue + memoTalentCdBuffFlat
          const stateBuffCD = memoTalentCdBuffScaling * stateValue + memoTalentCdBuffFlat

          action.conditionalState[this.id] = convertibleCdValue

          const finalBuffCd = Math.max(0, buffCD - (stateValue ? stateBuffCD : 0))
          x.UNCONVERTIBLE_CD_BUFF.buff(finalBuffCd, SOURCE_MEMO)

          x.CD.buffDynamic(finalBuffCd, SOURCE_MEMO, action, context)
          x.summoner().CD.buffDynamic(finalBuffCd, SOURCE_MEMO, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return conditionalWgslWrapper(this, `
if (${wgslFalse(r.teamCdBuff)}) {
  return;
}

let stateValue: f32 = (*p_state).TrailblazerRemembranceCdConditional;
let convertibleCdValue: f32 = (*p_m).CD - (*p_m).UNCONVERTIBLE_CD_BUFF;

var buffCD: f32 = ${memoTalentCdBuffScaling} * convertibleCdValue + ${memoTalentCdBuffFlat};
var stateBuffCD: f32 = ${memoTalentCdBuffScaling} * stateValue + ${memoTalentCdBuffFlat};

(*p_state).TrailblazerRemembranceCdConditional = (*p_m).CD;

let finalBuffCd = max(0.0, buffCD - select(0.0, stateBuffCD, stateValue > 0.0));
(*p_m).UNCONVERTIBLE_CD_BUFF += finalBuffCd;

(*p_m).CD += finalBuffCd;
(*p_x).CD += finalBuffCd;
`)
        },
      },
    ],
  }
}

```

# 1000/Welt.ts

```ts
import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { gpuStandardAdditionalDmgAtkFinalizer, standardAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Gravity Suppression

Basic ATK+1+20

Deals Imaginary DMG equal to 100% of Welt's ATK to a single enemy.

 Single 10

Lv6

Edge of the Void

Skill-1+10

Deals Imaginary DMG equal to 72% of Welt's ATK to a single enemy and further deals DMG 2 extra times, with each time dealing Imaginary DMG equal to 72% of Welt's ATK to a random enemy. On hit, there is a 75% base chance to reduce the enemy's SPD by 10% for 2 turn(s).

 Single 10

Lv10

Synthetic Black Hole

Ultimate120+5

Deals Imaginary DMG equal to 150% of Welt's ATK to all enemies, with a 100% base chance for enemies hit by this ability to be Imprisoned for 1 turn.
Imprisoned enemies have their actions delayed by 40% and SPD reduced by 10%.

 All 20

Lv10

Time Distortion

Talent

When hitting an enemy that is already Slowed, Welt deals Imaginary Additional DMG equal to 60% of his ATK to the enemy.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Gravitational Imprisonment

Technique

After using Welt's Technique, create a Special Dimension that lasts for 15 second(s). Enemies in this Special Dimension have their movement speed reduced by 50%. After entering battle with enemies in the Special Dimension, there is a 100% base chance to Imprison the enemies for 1 turn.
Imprisoned enemies have their actions delayed by 20% and SPD reduced by 10%. Only 1 Dimension Effect created by allies can exist at the same time.


Stat Boosts

 +28.0% ATK
 +14.4% Imaginary DMG Boost
 +10.0% Effect RES

Retribution

When using Ultimate, there is a 100% base chance to increase the DMG taken by the targets by 12% for 2 turn(s).


Judgment

Using Ultimate additionally regenerates 10 Energy.


Punishment

Deals 20% more DMG to enemies inflicted with Weakness Break.



1 Legacy of Honor

After using Ultimate, Welt gets enhanced. Then, the next 2 time(s) he uses Basic ATK or Skill, deals 1 extra instance of Additional DMG to the enemy target. The Additional DMG dealt when using Basic ATK is equal to 50% of Basic ATK DMG multiplier. The Additional DMG dealt when using Skill is equal to 80% of Skill DMG multiplier.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.



2 Conflux of Stars

When his Talent is triggered, Welt regenerates 3 Energy.



3 Prayer of Peace

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Appellation of Justice

When using Skill, increases the base chance of reducing the attacked enemy target's SPD by 35%.



5 Power of Kindness

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Prospect of Glory

When using Skill, deals DMG for 1 extra time to a random enemy.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Welt')
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
  } = Source.character('1004')

  const skillExtraHitsMax = (e >= 6) ? 3 : 2

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.72, 0.792)
  const ultScaling = ult(e, 1.50, 1.62)
  const talentScaling = talent(e, 0.60, 0.66)

  const content: ContentDefinition<typeof defaults> = {
    enemyDmgTakenDebuff: {
      id: 'enemyDmgTakenDebuff',
      formItem: 'switch',
      text: t('Content.enemyDmgTakenDebuff.text'),
      content: t('Content.enemyDmgTakenDebuff.content'),
    },
    enemySlowed: {
      id: 'enemySlowed',
      formItem: 'switch',
      text: t('Content.enemySlowed.text'),
      content: t('Content.enemySlowed.content', { talentScaling: TsUtils.precisionRound(100 * talentScaling) }),
    },
    skillExtraHits: {
      id: 'skillExtraHits',
      formItem: 'slider',
      text: t('Content.skillExtraHits.text'),
      content: t('Content.skillExtraHits.content', { skillScaling: TsUtils.precisionRound(100 * skillScaling) }),
      min: 0,
      max: skillExtraHitsMax,
    },
    e1EnhancedState: {
      id: 'e1EnhancedState',
      formItem: 'switch',
      text: t('Content.e1EnhancedState.text'),
      content: t('Content.e1EnhancedState.content'),
      disabled: (e < 1),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    enemyDmgTakenDebuff: content.enemyDmgTakenDebuff,
  }

  const defaults = {
    enemySlowed: true,
    enemyDmgTakenDebuff: true,
    skillExtraHits: skillExtraHitsMax,
    e1EnhancedState: true,
  }

  const teammateDefaults = {
    enemyDmgTakenDebuff: true,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.ELEMENTAL_DMG.buff((x.a[Key.ENEMY_WEAKNESS_BROKEN]) ? 0.20 : 0, SOURCE_TRACE)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      x.BASIC_ADDITIONAL_DMG_SCALING.buff((r.enemySlowed) ? talentScaling : 0, SOURCE_TALENT)
      x.SKILL_ADDITIONAL_DMG_SCALING.buff((r.enemySlowed) ? talentScaling : 0, SOURCE_TALENT)
      x.ULT_ADDITIONAL_DMG_SCALING.buff((r.enemySlowed) ? talentScaling : 0, SOURCE_TALENT)

      x.BASIC_ADDITIONAL_DMG_SCALING.buff((e >= 1 && r.e1EnhancedState) ? 0.50 * basicScaling : 0, SOURCE_E1)
      x.SKILL_ADDITIONAL_DMG_SCALING.buff((e >= 1 && r.e1EnhancedState) ? 0.80 * skillScaling : 0, SOURCE_E1)

      x.SKILL_ATK_SCALING.buff(r.skillExtraHits * skillScaling, SOURCE_SKILL)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(10 + 10 * r.skillExtraHits, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.VULNERABILITY.buffTeam((m.enemyDmgTakenDebuff) ? 0.12 : 0, SOURCE_TRACE)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: () => {
      return gpuStandardAdditionalDmgAtkFinalizer()
    },
  }
}

```

# 1200/Xueyi.ts

```ts
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

```

# 1200/Yanqing.ts

```ts
import { AbilityType, ASHBLAZING_ATK_STACK } from 'lib/conditionals/conditionalConstants'
import { boostAshblazingAtkP, gpuBoostAshblazingAtkP, gpuStandardAdditionalDmgAtkFinalizer, standardAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Frost Thorn

Basic ATK+1+20

Deals Ice DMG equal to 100% of Yanqing's ATK to a single enemy.

 Single 10

Lv6

Darting Ironthorn

Skill-1+30

Deals Ice DMG equal to 220% of Yanqing's ATK to a single enemy and activates Soulsteel Sync for 1 turn.

 Single 20

Lv10

Amidst the Raining Bliss

Ultimate140+5

Increases Yanqing's CRIT Rate by 60%. When Soulsteel Sync is active, increases Yanqing's CRIT DMG by an extra 50%. This buff lasts for one turn. Afterwards, deals Ice DMG equal to 350% of Yanqing's ATK to a single enemy.

 Single 30

Lv10

One With the Sword

Talent+10

When Soulsteel Sync is active, Yanqing is less likely to be attacked by enemies. Yanqing's CRIT Rate increases by 20% and his CRIT DMG increases by 30%. After Yanqing attacks an enemy, there is a 60% fixed chance to launch Follow-up ATK, dealing Ice DMG equal to 50% of Yanqing's ATK to the enemy, which has a 65% base chance to Freeze the enemy for 1 turn.
The Frozen target cannot take action and receives Ice Additional DMG equal to 50% of Yanqing's ATK at the beginning of each turn.
When Yanqing receives DMG, the Soulsteel Sync effect will disappear.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

 Single 10

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


The One True Sword

Technique

After using his Technique, at the start of the next battle, Yanqing deals 30% more DMG for 2 turn(s) to enemies whose current HP percentage is 50% or higher.


Stat Boosts

 +28.0% ATK
 +14.4% Ice DMG Boost
 +10.0% HP

Icing on the Kick

After Yanqing attacks, deals Ice Additional DMG equal to 30% of Yanqing's ATK to enemies with Ice Weakness.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.


Frost Favors the Brave

When Soulsteel Sync is active, Effect RES increases by 20%.


Gentle Blade

When a CRIT Hit is triggered, increases SPD by 10% for 2 turn(s).



1 Svelte Saber

When Yanqing attacks a Frozen enemy, he deals Ice Additional DMG equal to 60% of his ATK.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.



2 Supine Serenade

When Soulsteel Sync is active, Energy Regeneration Rate increases by an extra 10%.



3 Sword Savant

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Searing Sting

When the current HP percentage is 80% or higher, this unit's Ice RES PEN increases by 12%.



5 Surging Strife

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Swift Swoop

If the buffs from "Soulsteel Sync" or the Ultimate are in effect when an enemy is defeated, the duration of these buffs is extended by 1 turn.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Yanqing')
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
  } = Source.character('1209')

  const ultCdBuffValue = ult(e, 0.50, 0.54)
  const talentCdBuffValue = ult(e, 0.30, 0.33)
  const talentCrBuffValue = ult(e, 0.20, 0.21)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.20, 2.42)
  const ultScaling = ult(e, 3.50, 3.78)
  const fuaScaling = talent(e, 0.50, 0.55)

  const hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  const defaults = {
    ultBuffActive: true,
    soulsteelBuffActive: true,
    critSpdBuff: true,
    e1TargetFrozen: true,
    e4CurrentHp80: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultBuffActive: {
      id: 'ultBuffActive',
      formItem: 'switch',
      text: t('Content.ultBuffActive.text'),
      content: t('Content.ultBuffActive.content', { ultCdBuffValue: TsUtils.precisionRound(100 * ultCdBuffValue) }),
    },
    soulsteelBuffActive: {
      id: 'soulsteelBuffActive',
      formItem: 'switch',
      text: t('Content.soulsteelBuffActive.text'),
      content: t('Content.soulsteelBuffActive.content', {
        talentCdBuffValue: TsUtils.precisionRound(100 * talentCdBuffValue),
        talentCrBuffValue: TsUtils.precisionRound(100 * talentCrBuffValue),
        ultCdBuffValue: TsUtils.precisionRound(100 * ultCdBuffValue),
      }),
    },
    critSpdBuff: {
      id: 'critSpdBuff',
      formItem: 'switch',
      text: t('Content.critSpdBuff.text'),
      content: t('Content.critSpdBuff.content'),
    },
    e1TargetFrozen: {
      id: 'e1TargetFrozen',
      formItem: 'switch',
      text: t('Content.e1TargetFrozen.text'),
      content: t('Content.e1TargetFrozen.content'),
      disabled: (e < 1),
    },
    e4CurrentHp80: {
      id: 'e4CurrentHp80',
      formItem: 'switch',
      text: t('Content.e4CurrentHp80.text'),
      content: t('Content.e4CurrentHp80.content'),
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
      x.CR.buff((r.ultBuffActive) ? 0.60 : 0, SOURCE_ULT)
      x.CD.buff((r.ultBuffActive && r.soulsteelBuffActive) ? ultCdBuffValue : 0, SOURCE_ULT)
      x.CR.buff((r.soulsteelBuffActive) ? talentCrBuffValue : 0, SOURCE_TALENT)
      x.CD.buff((r.soulsteelBuffActive) ? talentCdBuffValue : 0, SOURCE_TALENT)
      x.RES.buff((r.soulsteelBuffActive) ? 0.20 : 0, SOURCE_TRACE)
      x.SPD_P.buff((r.critSpdBuff) ? 0.10 : 0, SOURCE_TRACE)
      x.ERR.buff((e >= 2 && r.soulsteelBuffActive) ? 0.10 : 0, SOURCE_E2)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_ATK_SCALING.buff(fuaScaling, SOURCE_TALENT)

      x.BASIC_ADDITIONAL_DMG_SCALING.buff((context.enemyElementalWeak) ? 0.30 : 0, SOURCE_BASIC)
      x.SKILL_ADDITIONAL_DMG_SCALING.buff((context.enemyElementalWeak) ? 0.30 : 0, SOURCE_SKILL)
      x.ULT_ADDITIONAL_DMG_SCALING.buff((context.enemyElementalWeak) ? 0.30 : 0, SOURCE_ULT)
      x.FUA_ADDITIONAL_DMG_SCALING.buff((context.enemyElementalWeak) ? 0.30 : 0, SOURCE_TALENT)

      x.BASIC_ATK_SCALING.buff((e >= 1 && r.e1TargetFrozen) ? 0.60 : 0, SOURCE_E1)
      x.SKILL_ATK_SCALING.buff((e >= 1 && r.e1TargetFrozen) ? 0.60 : 0, SOURCE_E1)
      x.ULT_ATK_SCALING.buff((e >= 1 && r.e1TargetFrozen) ? 0.60 : 0, SOURCE_E1)
      x.FUA_ATK_SCALING.buff((e >= 1 && r.e1TargetFrozen) ? 0.60 : 0, SOURCE_E1)

      // Boost
      x.ICE_RES_PEN.buff((e >= 4 && r.e4CurrentHp80) ? 0.12 : 0, SOURCE_E4)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(10, SOURCE_TALENT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkP(x, action, context, hitMulti)
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkP(hitMulti) + gpuStandardAdditionalDmgAtkFinalizer()
    },
  }
}

```

# 1200/Yukong.ts

```ts
import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Arrowslinger

Basic ATK+1+20

Deals 100% of Yukong's ATK as Imaginary DMG to a target enemy.

 Single 10

Lv6

Emboldening Salvo

Skill-1+30

Obtains 2 stack(s) of "Roaring Bowstrings" (to a maximum of 2 stacks). When "Roaring Bowstrings" is active, the ATK of all allies increases by 80%, and every time an ally's turn (including Yukong's) ends, Yukong loses 1 stack of "Roaring Bowstrings."
When it's the turn where Yukong gains "Roaring Bowstrings" by using Skill, "Roaring Bowstrings" will not be removed.

Lv10

Diving Kestrel

Ultimate130+5

If "Roaring Bowstrings" is active on Yukong when her Ultimate is used, additionally increases all allies' CRIT Rate by 28% and CRIT DMG by 65%. At the same time, deals Imaginary DMG equal to 380% of Yukong's ATK to a single enemy.

 Single 30

Lv10

Seven Layers, One Arrow

Talent

Basic ATK additionally deals Imaginary DMG equal to 80% of Yukong's ATK, and increases the Toughness Reduction of this attack by 100%. This effect can be triggered again after 1 turn(s).

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Windchaser

Technique

After using her Technique, Yukong enters Sprint mode for 20 seconds. In Sprint mode, her movement speed increases by 35%, and Yukong gains 2 stack(s) of "Roaring Bowstrings" when she enters battle by attacking enemies.


Stat Boosts

 +22.4% Imaginary DMG Boost
 +18.0% HP
 +10.0% ATK

Archerion

Yukong can resist 1 debuff application for 1 time. This effect can be triggered again after 2 turn(s).


Bowmaster

When Yukong is on the field, Imaginary DMG dealt by all allies increases by 12%.


Majestas

When "Roaring Bowstrings" is active, Yukong regenerates 2 additional Energy every time an ally takes action.



1 Aerial Marshal

At the start of battle, increases the SPD of all allies by 10% for 2 turn(s).



2 Skyward Command

When any ally's current energy is equal to its energy limit, Yukong regenerates an additional 5 energy. This effect can only be triggered once for each ally. The trigger count is reset after Yukong uses her Ultimate.



3 Torrential Fusillade

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Zephyrean Echoes

When "Roaring Bowstrings" is active, Yukong deals 30% more DMG to enemies.



5 August Deadshot

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Bowstring Thunderclap

When Yukong uses her Ultimate, she immediately gains 1 stack(s) of "Roaring Bowstrings."
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Yukong')
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
  } = Source.character('1207')

  const skillAtkBuffValue = skill(e, 0.80, 0.88)
  const ultCdBuffValue = skill(e, 0.65, 0.702)
  const ultCrBuffValue = skill(e, 0.28, 0.294)
  const talentAtkScaling = talent(e, 0.80, 0.88)

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 3.80, 4.104)

  const defaults = {
    teamImaginaryDmgBoost: true,
    roaringBowstringsActive: true,
    ultBuff: true,
    initialSpeedBuff: true,
  }

  const teammateDefaults = {
    teamImaginaryDmgBoost: true,
    roaringBowstringsActive: true,
    ultBuff: true,
    initialSpeedBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    teamImaginaryDmgBoost: {
      id: 'teamImaginaryDmgBoost',
      formItem: 'switch',
      text: t('Content.teamImaginaryDmgBoost.text'),
      content: t('Content.teamImaginaryDmgBoost.content'),
    },
    roaringBowstringsActive: {
      id: 'roaringBowstringsActive',
      formItem: 'switch',
      text: t('Content.roaringBowstringsActive.text'),
      content: t('Content.roaringBowstringsActive.content', { skillAtkBuffValue: TsUtils.precisionRound(100 * skillAtkBuffValue) }),
    },
    ultBuff: {
      id: 'ultBuff',
      formItem: 'switch',
      text: t('Content.ultBuff.text'),
      content: t('Content.ultBuff.content', {
        ultCrBuffValue: TsUtils.precisionRound(100 * ultCrBuffValue),
        ultCdBuffValue: TsUtils.precisionRound(100 * ultCdBuffValue),
        ultScaling: TsUtils.precisionRound(100 * ultScaling),
      }),
    },
    initialSpeedBuff: {
      id: 'initialSpeedBuff',
      formItem: 'switch',
      text: t('Content.initialSpeedBuff.text'),
      content: t('Content.initialSpeedBuff.content'),
      disabled: e < 1,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    teamImaginaryDmgBoost: content.teamImaginaryDmgBoost,
    roaringBowstringsActive: content.roaringBowstringsActive,
    ultBuff: content.ultBuff,
    initialSpeedBuff: content.initialSpeedBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.BASIC_ATK_SCALING.buff(talentAtkScaling, SOURCE_TALENT)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      // Boost
      x.ELEMENTAL_DMG.buff((e >= 4 && r.roaringBowstringsActive) ? 0.30 : 0, SOURCE_E4)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.ATK_P.buffTeam((m.roaringBowstringsActive) ? skillAtkBuffValue : 0, SOURCE_SKILL)
      x.CR.buffTeam((m.ultBuff && m.roaringBowstringsActive) ? ultCrBuffValue : 0, SOURCE_ULT)
      x.CD.buffTeam((m.ultBuff && m.roaringBowstringsActive) ? ultCdBuffValue : 0, SOURCE_ULT)
      x.SPD_P.buffTeam((e >= 1 && m.initialSpeedBuff) ? 0.10 : 0, SOURCE_E1)

      x.IMAGINARY_DMG_BOOST.buffTeam((m.teamImaginaryDmgBoost) ? 0.12 : 0, SOURCE_TRACE)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
  }
}

```

# 1200/Yunli.ts

```ts
import { AbilityType, ASHBLAZING_ATK_STACK, FUA_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { boostAshblazingAtkP, gpuBoostAshblazingAtkP } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityCd, buffAbilityCr, buffAbilityDefPen, buffAbilityDmg, buffAbilityResPen } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Galespin Summersault

Basic ATK+1+20

Deals Physical DMG equal to 100% of Yunli's ATK to a single target enemy.

 Single 10

Lv6

Bladeborne Quake

Skill-1+30

Restores HP equal to 30% of Yunli's ATK plus 200. Deals Physical DMG equal to 120% of Yunli's ATK to a single target enemy and Physical DMG equal to 60% of Yunli's ATK to adjacent targets.

 Single 20 | Other 10

Lv10

Earthbind, Etherbreak

Ultimate120+5

Consumes 120 Energy. Yunli gains Parry and Taunts all enemies, lasting until the end of the next ally's or enemy's turn. Increases the CRIT DMG dealt by Yunli's next Counter by 100%. When triggering the Counter effect from Talent, launches the Counter "Intuit: Cull" instead and removes the Parry effect. If no Counter is triggered while Parry is active, Yunli will immediately launch the Counter "Intuit: Slash" on a random enemy target.

"Intuit: Slash": Deals Physical DMG equal to 220% of Yunli's ATK to the target, and deals Physical DMG equal to 110% of Yunli's ATK to adjacent targets.
"Intuit: Cull": Deals Physical DMG equal to 220% of Yunli's ATK to the target, and deals Physical DMG equal to 110% of Yunli's ATK to adjacent targets. Then, additionally deals 6 instances of DMG, each dealing Physical DMG equal to 72% of Yunli's ATK to a random single enemy.

When Yunli deals DMG via this ability, it's considered as dealing Ultimate DMG.
Each instance of Intuit: Cull's bounce DMG deals 25% of the Toughness reduction DMG of this skill's central target DMG.

Counter
An effect that automatically triggers when the target is attacked, which unleashes an extra attack on the attacker.
Counter is also considered a Follow-up ATK.

 Single 10 | Other 10

Lv10

Flashforge

Talent+10

When Yunli gets attacked by an enemy target, additionally regenerates 15 Energy and immediately launches a Counter on the attacker, dealing Physical DMG equal to 120% of Yunli's ATK to the attacker and Physical DMG equal to 60% of Yunli's ATK to adjacent targets.
If there is no immediate target to Counter, then Counters a random enemy target instead.
Ordinary counters only regenerate 50% of this ability's energy.

 Single 10 | Other 10

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Posterior Precedence

Technique

This unit gains the Ward effect, lasting for 20 seconds. During this time, upon entering combat by either attacking enemies or receiving an attack, immediately casts "Intuit: Cull" on a random enemy, and increases the DMG dealt by this attack by 80%.


Stat Boosts

 +28.0% ATK
 +18.0% HP
 +6.7% CRIT Rate

Fiery Wheel

After each use of "Intuit: Slash," the next "Intuit: Slash" will be replaced by "Intuit: Cull."


Demon Quell

While in the "Parry" state, resists Crowd Control debuffs received and reduces DMG received by 20%.


True Sunder

When using a Counter, increases Yunli's ATK by 30%, lasting for 1 turn.

Counter
An effect that automatically triggers when the target is attacked, which unleashes an extra attack on the attacker.
Counter is also considered a Follow-up ATK.



1 Weathered Blade Does Not Sully

Increases DMG dealt by "Intuit: Slash" and "Intuit: Cull" by 20%. Increases the number of additional DMG instances for "Intuit: Cull" by 3.



2 First Luster Breaks Dawn

When dealing DMG via Counter, ignores 20% of the target's DEF.

Counter
An effect that automatically triggers when the target is attacked, which unleashes an extra attack on the attacker.
Counter is also considered a Follow-up ATK.



3 Mastlength Twirls Mountweight

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Artisan's Ironsong

After launching "Intuit: Slash" or "Intuit: Cull," increases this unit's Effect RES by 50%, lasting for 1 turn(s).



5 Blade of Old Outlasts All

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Walk in Blade, Talk in Zither

While "Parry" is active, if an enemy actively uses their abilities, regardless of whether it attacks Yunli or not, it will trigger "Intuit: Cull" and remove the "Parry" effect. When dealing DMG via "Intuit: Slash" or "Intuit: Cull," increases CRIT Rate by 15% and Physical RES PEN by 20%.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Yunli')
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
  } = Source.character('1221')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.20, 1.32)
  const ultSlashScaling = ult(e, 2.20, 2.376)
  const ultCullScaling = ult(e, 2.20, 2.376)
  const ultCullHitsScaling = ult(e, 0.72, 0.7776)

  const blockCdBuff = ult(e, 1.00, 1.08)

  const talentCounterScaling = talent(e, 1.20, 1.32)

  const maxCullHits = (e >= 1) ? 9 : 6

  // Slash is the same, 1 hit
  const fuaHitCountMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1), // 0.06
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 1), // 0.12
    5: ASHBLAZING_ATK_STACK * (3 * 1 / 1), // 0.18
  }

  const cullHitCountMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.12 + 2 * 0.12 + 3 * 0.12 + 4 * 0.12 + 5 * 0.12 + 6 * 0.12 + 7 * 0.12 + 8 * 0.16), // 0.2784
    3: ASHBLAZING_ATK_STACK * (2 * 0.12 + 5 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.16), // 0.4152
    5: ASHBLAZING_ATK_STACK * (3 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.16), // 0.444
  }

  function getHitMulti(action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals as Conditionals<typeof content>
    return (r.blockActive && r.ultCull)
      ? cullHitCountMultiByTargets[context.enemyCount]
      : fuaHitCountMultiByTargets[context.enemyCount]
  }

  const defaults = {
    blockActive: true,
    ultCull: true,
    ultCullHits: maxCullHits,
    counterAtkBuff: true,
    e1UltBuff: true,
    e2DefShred: true,
    e4ResBuff: true,
    e6Buffs: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    blockActive: {
      id: 'blockActive',
      formItem: 'switch',
      text: t('Content.blockActive.text'),
      content: t('Content.blockActive.content'),
    },
    ultCull: {
      id: 'ultCull',
      formItem: 'switch',
      text: t('Content.ultCull.text'),
      content: t('Content.ultCull.content', {
        CullScaling: TsUtils.precisionRound(100 * ultCullScaling),
        CullAdjacentScaling: TsUtils.precisionRound(100 * 0.5 * ultCullScaling),
        CullAdditionalScaling: TsUtils.precisionRound(100 * ultCullHitsScaling),
      }),
    },
    ultCullHits: {
      id: 'ultCullHits',
      formItem: 'slider',
      text: t('Content.ultCullHits.text'),
      content: t('Content.ultCullHits.content', {
        CullScaling: TsUtils.precisionRound(100 * ultCullScaling),
        CullAdjacentScaling: TsUtils.precisionRound(100 * 0.5 * ultCullScaling),
        CullAdditionalScaling: TsUtils.precisionRound(100 * ultCullHitsScaling),
      }),
      min: 0,
      max: maxCullHits,
    },
    counterAtkBuff: {
      id: 'counterAtkBuff',
      formItem: 'switch',
      text: t('Content.counterAtkBuff.text'),
      content: t('Content.counterAtkBuff.content'),
    },
    e1UltBuff: {
      id: 'e1UltBuff',
      formItem: 'switch',
      text: t('Content.e1UltBuff.text'),
      content: t('Content.e1UltBuff.content'),
      disabled: e < 1,
    },
    e2DefShred: {
      id: 'e2DefShred',
      formItem: 'switch',
      text: t('Content.e2DefShred.text'),
      content: t('Content.e2DefShred.content'),
      disabled: e < 2,
    },
    e4ResBuff: {
      id: 'e4ResBuff',
      formItem: 'switch',
      text: t('Content.e4ResBuff.text'),
      content: t('Content.e4ResBuff.content'),
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
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.FUA],
    content: () => Object.values(content),
    defaults: () => defaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      if (r.blockActive && r.ultCull) {
        x.FUA_DMG_TYPE.set(ULT_DMG_TYPE | FUA_DMG_TYPE, SOURCE_ULT)
      }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      if (r.blockActive) {
        if (r.ultCull) {
          x.FUA_ATK_SCALING.buff(ultCullScaling + r.ultCullHits * ultCullHitsScaling, SOURCE_ULT)
        } else {
          x.FUA_ATK_SCALING.buff(ultSlashScaling, SOURCE_ULT)
        }
      } else {
        x.FUA_ATK_SCALING.buff(talentCounterScaling, SOURCE_TALENT)
      }

      buffAbilityCd(x, FUA_DMG_TYPE, (r.blockActive) ? blockCdBuff : 0, SOURCE_ULT)
      x.ATK_P.buff((r.counterAtkBuff) ? 0.30 : 0, SOURCE_TRACE)

      x.DMG_RED_MULTI.multiply((r.blockActive) ? 1 - 0.20 : 1, SOURCE_TRACE)

      buffAbilityDmg(x, FUA_DMG_TYPE, (e >= 1 && r.e1UltBuff && r.blockActive) ? 0.20 : 0, SOURCE_E1)
      buffAbilityDefPen(x, FUA_DMG_TYPE, (e >= 2 && r.e2DefShred) ? 0.20 : 0, SOURCE_E2)
      x.RES.buff((e >= 4 && r.e4ResBuff) ? 0.50 : 0, SOURCE_E4)
      buffAbilityCr(x, FUA_DMG_TYPE, (e >= 6 && r.e6Buffs && r.blockActive) ? 0.15 : 0, SOURCE_E6)
      buffAbilityResPen(x, FUA_DMG_TYPE, (e >= 6 && r.e6Buffs && r.blockActive) ? 0.20 : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.FUA_TOUGHNESS_DMG.buff((r.blockActive) ? 20 : 10, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff((r.blockActive && r.ultCull) ? r.ultCullHits * 5 : 0, SOURCE_ULT)

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

```

