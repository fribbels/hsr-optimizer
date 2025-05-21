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
