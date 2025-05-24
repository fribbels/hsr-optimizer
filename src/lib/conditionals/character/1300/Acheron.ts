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
