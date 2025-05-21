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
