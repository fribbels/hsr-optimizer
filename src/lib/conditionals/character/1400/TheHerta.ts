import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition, countTeamPath, mainIsPath } from 'lib/conditionals/conditionalUtils'
import { PathNames } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Did You Get It

Basic ATK+1+20

Deals Ice DMG equal to 100% of The Herta's ATK to one designated enemy target.
Hidden Stat: 3
Hidden Stat: 1
Hidden Stat: 0.3

 Single 10

Lv6

Big Brain Energy

Skill-1+30

Deals Ice DMG equal to 70% of The Herta's ATK to one designated enemy, and inflicts 1 stack(s) of "Interpretation." Deals Ice DMG equal to 70% of The Herta's ATK to the targets hit by this instance of Skill and their respective adjacent targets. This effect can repeat 2 times.

 Single 15 | All 5 | Other 10

Lv10

Told Ya! Magic Happens

Ultimate220+5

Rearranges the number of "Interpretation" stacks on all enemies, prioritizing the transfer of a higher number of "Interpretation" stacks to Elite-level targets and above. Then, deals Ice DMG equal to 200% The Herta's ATK to all enemies. When using Ultimate, increases The Herta's ATK by 80%, lasting for 3 turn(s). After using the Ultimate, The Herta immediately takes action and gains 1 stack of "Inspiration." "Inspiration" can stack up to 4 time(s). While having "Inspiration," enhances Skill to "Hear Me Out."
Hidden Stat: 2
Hidden Stat: 1

 All 20

Lv10

Hand Them Over

Talent+30

When enemy targets enter battle, The Herta inflicts 1 stack of "Interpretation" on them. At the start of each wave, applies 25 stack(s) of "Interpretation" to a random enemy target, prioritizing Elite enemy targets or higher. When the Enhanced Skill's primary target has "Interpretation," the multiplier for the DMG dealt increases, with each stack granting an increase of 8%/4% on the primary target/other targets respectively. If 2 or more characters follow the Path of Erudition in the team, each stack grants an additional increase of 8%/4% on the primary target/other targets respectively. "Interpretation" can stack up to 42 time(s). When using the Enhanced Skill, resets the number of "Interpretation" stacks on the primary target to 1. After the enemy target leaves the battle or gets defeated by any unit, "Interpretation" will be transferred, prioritizing the transfer to Elite-level targets and above.
Hidden Stat: 1
Hidden Stat: 42

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Vibe Checker

Technique

After using Technique, The Herta's ATK increases by 60% at the start of the next battle, lasting for 2 turn(s).
If there are Basic Treasures in this current map, using Technique will mark up to 3 Basic Treasures' locations.
After entering battle by using Technique in Simulated Universe or Divergent Universe, deals True DMG equal to 99% of the target's Max HP to enemy targets lower than Elite-level, and True DMG equal to 30% of the target's Max HP to enemy targets at Elite-level and above.
Hidden Stat: 25

True DMG
Non-Type DMG that is not affected by any effects. This DMG is not considered as using 1 attack.


Hear Me Out

Skill-1+30

Consumes 1 stack of "Inspiration." Deals Ice DMG equal to 80% of The Herta's ATK to one designated enemy and inflicts 1 stack(s) of "Interpretation." Deals Ice DMG equal to 80% of The Herta's ATK to the target hit by this instance of Skill and adjacent targets, repeating 2 times. Finally, deals Ice DMG equal to 40% of The Herta's ATK to all enemies.

 Single 20 | All 5 | Other 10

Lv10

Stat Boosts

 +22.4% Ice DMG Boost
 +18.0% ATK
 +5.0 SPD

Aloofly Honest

When ally targets attack, inflicts 1 stack of "Interpretation" on the hit enemy target. After attacking, for every 1 target hit by this attack, regenerates 3 fixed Energy for The Herta, counting up to a maximum of 5 targets. When using Enhanced Skill and if the primary target's "Interpretation" stack reaches 42, increases Ice DMG dealt by The Herta by 50% until the end of this attack.


Message From Beyond the Veil

When entering battle, if the team has 2 or more characters following the Path of Erudition, then increases all allies' CRIT DMG by 80%, calculates at least 3 targets when the Trace "Aloofly Honest" calculates hit targets, applies 1 stack(s) of "Interpretation" to the target that has the highest current "Interpretation" stacks among the hit enemy targets after attacking, and additionally applies 2 stack(s) of "Interpretation" if the attacker is a character following the Path of Erudition.


Starved Landscape of Vacua

For every 1 stack of "Interpretation" inflicted on enemy targets, The Herta gains 1 stack of "Answer" up to 99 stack(s). When using the Ultimate, every stack of "Answer" increases the Ultimate's DMG multiplier by 1%.



1 Night at Shorefall

When Enhanced Skill calculates "Interpretation," additionally calculates 50% of the "Interpretation" stacks on the 1 target with the highest stacks out of the primary target and adjacent targets. When using Enhanced Skill to reset "Interpretation," reset the stack number to 15 instead.



2 Wind Through Keyhole

After The Herta enters battle and uses her Ultimate, she additionally gains 1 stack of "Inspiration." After using Enhanced Skill, The Herta's subsequent action is advanced by 35%.
Hidden Stat: 42.0
Hidden Stat: 0.25



3 Door into Summer

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 The Sixteenth Key

The SPD of characters following the Path of Erudition in the team increases by 12%.



5 Bitter Pill of Truth

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Sweet Lure of Answer

The Herta's Ice RES PEN increases by 20%. When the number of enemy targets on the field is 3 (or more)/2/1, Ultimate's DMG multiplier increases by 140%/250%/400%.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.TheHerta')
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
  } = Source.character('1401')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.70, 0.77)
  const enhancedSkillScaling = skill(e, 0.80, 0.88)
  const enhancedSkillAoeScaling = skill(e, 0.40, 0.44)
  const talentStackScaling = talent(e, 0.08, 0.088)

  const ultScaling = ult(e, 2.00, 2.20)
  const ultAtkBuffScaling = ult(e, 0.80, 0.88)

  const defaults = {
    enhancedSkill: true,
    eruditionTeammate: true,
    ultAtkBuff: true,
    interpretationStacks: 42,
    totalInterpretationStacks: 99,
    e1BonusStacks: true,
    e4EruditionSpdBuff: true,
    e6Buffs: true,
  }

  const teammateDefaults = {
    eruditionTeammate: true,
    e4EruditionSpdBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedSkill: {
      id: 'enhancedSkill',
      formItem: 'switch',
      text: t('Content.enhancedSkill.text'),
      content: t('Content.enhancedSkill.content'),
    },
    eruditionTeammate: {
      id: 'eruditionTeammate',
      formItem: 'switch',
      text: t('Content.eruditionTeammate.text'),
      content: t('Content.eruditionTeammate.content', {
        PrimaryScalingBonus: TsUtils.precisionRound(talentStackScaling * 100),
        AdjacentScalingBonus: TsUtils.precisionRound(talentStackScaling * 0.5 * 100),
      }),
    },
    ultAtkBuff: {
      id: 'ultAtkBuff',
      formItem: 'switch',
      text: t('Content.ultAtkBuff.text'),
      content: t('Content.ultAtkBuff.content', { AtkBuff: TsUtils.precisionRound(ultAtkBuffScaling * 100) }),
    },
    interpretationStacks: {
      id: 'interpretationStacks',
      formItem: 'slider',
      text: t('Content.interpretationStacks.text'),
      content: t('Content.interpretationStacks.content', {
        PrimaryScalingBonus: TsUtils.precisionRound(talentStackScaling * 100),
        AdjacentScalingBonus: TsUtils.precisionRound(talentStackScaling * 0.5 * 100),
      }),
      min: 1,
      max: 42,
    },
    totalInterpretationStacks: {
      id: 'totalInterpretationStacks',
      formItem: 'slider',
      text: t('Content.totalInterpretationStacks.text'),
      content: t('Content.totalInterpretationStacks.content'),
      min: 1,
      max: 99,
    },
    e1BonusStacks: {
      id: 'e1BonusStacks',
      formItem: 'switch',
      text: t('Content.e1BonusStacks.text'),
      content: t('Content.e1BonusStacks.content'),
      disabled: e < 1,
    },
    e4EruditionSpdBuff: {
      id: 'e4EruditionSpdBuff',
      formItem: 'switch',
      text: t('Content.e4EruditionSpdBuff.text'),
      content: t('Content.e4EruditionSpdBuff.content'),
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

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    eruditionTeammate: content.eruditionTeammate,
    e4EruditionSpdBuff: content.e4EruditionSpdBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.ATK_P.buff((r.ultAtkBuff) ? ultAtkBuffScaling : 0, SOURCE_ULT)

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)

      const e6DamageMultiplier = context.enemyCount == 1 ? 4.00 : 1.40
      x.ULT_ATK_SCALING.buff(ultScaling + r.totalInterpretationStacks * 0.01, SOURCE_TRACE)
      x.ULT_ATK_SCALING.buff((e >= 6 && r.e6Buffs ? e6DamageMultiplier : 0), SOURCE_E6)

      const eruditionStackMultiplier = r.eruditionTeammate
        ? Math.min(2, countTeamPath(context, PathNames.Erudition))
        : 1
      const enhancedSkillStackScaling = talentStackScaling
        * (r.interpretationStacks + ((e >= 1 && r.e1BonusStacks) ? r.interpretationStacks * 0.5 : 0))
        * eruditionStackMultiplier

      x.SKILL_ATK_SCALING.buff((r.enhancedSkill ? enhancedSkillScaling * 3 + enhancedSkillStackScaling + enhancedSkillAoeScaling : skillScaling * 3), SOURCE_SKILL)
      x.SKILL_DMG_BOOST.buff((r.enhancedSkill && r.interpretationStacks >= ((e >= 1 && r.e1BonusStacks) ? 28 : 42)) ? 0.50 : 0, SOURCE_TRACE)
      x.ICE_RES_PEN.buff((e >= 6 && r.e6Buffs) ? 0.20 : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff((r.enhancedSkill) ? 25 : 20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.CD.buff((m.eruditionTeammate && countTeamPath(context, PathNames.Erudition) >= 2) ? 0.80 : 0, SOURCE_TRACE)

      x.SPD_P.buff((e >= 4 && m.e4EruditionSpdBuff && mainIsPath(context, PathNames.Erudition)) ? 0.12 : 0, SOURCE_E4)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}
