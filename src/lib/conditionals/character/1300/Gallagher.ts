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
