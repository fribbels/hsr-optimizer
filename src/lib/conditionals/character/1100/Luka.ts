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
