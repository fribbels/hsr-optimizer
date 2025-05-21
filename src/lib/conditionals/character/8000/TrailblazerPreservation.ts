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
