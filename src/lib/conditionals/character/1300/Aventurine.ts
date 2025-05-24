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
