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
