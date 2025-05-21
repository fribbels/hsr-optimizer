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
