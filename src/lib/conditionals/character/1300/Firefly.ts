import { AbilityType, BREAK_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityVulnerability } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Order: Flare Propulsion

Basic ATK+1+20

Deals Fire DMG equal to 100% of SAM's ATK to a single target enemy.

 Single 10

Lv6

Order: Aerial Bombardment

Skill-1

Consumes HP equal to 40% of this unit's Max HP and regenerates a fixed amount of Energy equal to 60% of this unit's Max Energy. Deals Fire DMG equal to 200% of SAM's ATK to a single target enemy. If the current HP is not sufficient, reduces SAM's HP to 1 when using this Skill. Advances this unit's next Action by 25%.

 Single 20

Lv10

Fyrefly Type-IV: Complete Combustion

Ultimate240+5

Enters the Complete Combustion state, advances this unit's Action by 100%, and gains Enhanced Basic ATK and Enhanced Skill. While in Complete Combustion, increases SPD by 60, and when using the Enhanced Basic ATK or Enhanced Skill, increases this unit's Weakness Break Efficiency by 50% and the Break DMG dealt by SAM to the enemy targets by 20%, lasting until this current attack ends.
A countdown timer for the Complete Combustion state appears on the Action Order. When the countdown timer's turn starts, SAM exits the Complete Combustion state. The countdown timer has a fixed SPD of 70.
SAM cannot use Ultimate while in Complete Combustion.

Lv10

Chrysalid Pyronexus

Talent

The lower the HP, the less DMG received. When HP is 20% or lower, the DMG Reduction reaches its maximum effect, reducing up to 40%. During the Complete Combustion, the DMG Reduction remains at its maximum effect, and the Effect RES increases by 30%.
If Energy is lower than 50% when the battle starts, regenerates Energy to 50%. Once Energy is regenerated to its maximum, dispels all debuffs on this unit.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Δ Order: Meteoric Incineration

Technique

Leaps into the air and moves about freely for 5 seconds, which can be ended early by launching a plunging attack. When the duration ends, plunges and immediately attacks all enemies within a set area. At the start of each wave, applies a Fire Weakness to all enemies, lasting for 2 turn(s). Then, deals Fire DMG equal to 200% of SAM's ATK to all enemies.

 Single 20


Fyrefly Type-IV: Deathstar Overload

Skill-1

Restores HP by an amount equal to 25% of this unit's Max HP. Applies Fire Weakness to a single target enemy, lasting for 2 turn(s). Deals Fire DMG equal to (0.2 × Break Effect + 200%) of SAM's ATK to this target. At the same time, deals Fire DMG equal to (0.1 × Break Effect + 100%) of SAM's ATK to adjacent targets. The Break Effect taken into the calculation is capped at 360%.

 Single 30 | Other 15

Lv10

Fyrefly Type-IV: Pyrogenic Decimation

Basic ATK+1

Restores HP by an amount equal to 20% of this unit's Max HP. Deals Fire DMG equal to 200% of SAM's ATK to a single target enemy.

 Single 15

Lv6

Stat Boosts

 +37.3% Break Effect
 +18.0% Effect RES
 +5.0 SPD

Module α: Antilag Outburst

During the Complete Combustion, attacking enemies that have no Fire Weakness can also reduce their Toughness, with the effect being equivalent to 55% of the original Toughness Reduction from abilities.


Module β: Autoreactive Armor

When SAM is in Complete Combustion with a Break Effect that is equal to or greater than 200%/360%, attacking a Weakness-Broken enemy target will convert the Toughness Reduction of this attack into 1 instance of 35%/50% Super Break DMG.

Super Break DMG
Super Break DMG increases with higher Break Effect, higher Toughness Reduction of the attack, and higher character levels.
Super Break DMG cannot CRIT Hit and is not affected by DMG Boost effects.
Super Break DMG is also considered Break DMG.


Module γ: Core Overload

For every 10 point(s) of SAM's ATK that exceeds 1800, increases this unit's Break Effect by 0.8%.



1 In Reddened Chrysalis, I Once Rest

When using the Enhanced Skill, ignores 15% of the target's DEF. The Enhanced Skill does not consume Skill Points.



2 From Shattered Sky, I Free Fall

While in Complete Combustion, using the Enhanced Basic ATK or the Enhanced Skill to defeat an enemy target or to Break their Weakness allows SAM to immediately gain 1 extra turn. This effect can trigger again after 1 turn(s).
Hidden Stat: 1.0

Extra Turn
Gain 1 extra turn that won't expend your remaining turns when taking action. During this extra turn, no Ultimate can be used.



3 Amidst Silenced Stars, I Deep Sleep

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Upon Lighted Fyrefly, I Soon Gaze

While in Complete Combustion, increases SAM's Effect RES by 50%.



5 From Undreamt Night, I Thence Shine

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 In Finalized Morrow, I Full Bloom

While in Complete Combustion, increases SAM's Fire RES PEN by 20%. When using the Enhanced Basic ATK or Enhanced Skill, increases Weakness Break Efficiency by 50%.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Firefly')
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
  } = Source.character('1310')

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 2.00, 2.20)

  const skillScaling = skill(e, 2.00, 2.20)
  const skillEnhancedAtkScaling = skill(e, 2.00, 2.20)

  const ultSpdBuff = ult(e, 60, 66)
  const ultWeaknessBrokenBreakVulnerability = ult(e, 0.20, 0.22)
  const talentResBuff = talent(e, 0.30, 0.34)
  const talentDmgReductionBuff = talent(e, 0.40, 0.44)

  const defaults = {
    enhancedStateActive: true,
    enhancedStateSpdBuff: true,
    superBreakDmg: true,
    atkToBeConversion: true,
    talentDmgReductionBuff: true,
    e1DefShred: true,
    e4ResBuff: true,
    e6Buffs: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedStateActive: {
      id: 'enhancedStateActive',
      formItem: 'switch',
      text: t('Content.enhancedStateActive.text'),
      content: t('Content.enhancedStateActive.content'),
    },
    enhancedStateSpdBuff: {
      id: 'enhancedStateSpdBuff',
      formItem: 'switch',
      text: t('Content.enhancedStateSpdBuff.text'),
      content: t('Content.enhancedStateSpdBuff.content', { ultSpdBuff }),
    },
    superBreakDmg: {
      id: 'superBreakDmg',
      formItem: 'switch',
      text: t('Content.superBreakDmg.text'),
      content: t('Content.superBreakDmg.content'),
    },
    atkToBeConversion: {
      id: 'atkToBeConversion',
      formItem: 'switch',
      text: t('Content.atkToBeConversion.text'),
      content: t('Content.atkToBeConversion.content'),
    },
    talentDmgReductionBuff: {
      id: 'talentDmgReductionBuff',
      formItem: 'switch',
      text: t('Content.talentDmgReductionBuff.text'),
      content: t('Content.talentDmgReductionBuff.content', {
        talentResBuff: TsUtils.precisionRound(100 * talentResBuff),
        talentDmgReductionBuff: TsUtils.precisionRound(100 * talentDmgReductionBuff),
      }),
    },
    e1DefShred: {
      id: 'e1DefShred',
      formItem: 'switch',
      text: t('Content.e1DefShred.text'),
      content: t('Content.e1DefShred.content'),
      disabled: e < 1,
    },
    e4ResBuff: {
      id: 'e4ResBuff',
      formItem: 'switch',
      text: t('Content.e4ResBuff.text'),
      content: t('Content.e4ResBuff.content'),
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

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL],
    content: () => Object.values(content),
    defaults: () => defaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.superBreakDmg) {
        x.ENEMY_WEAKNESS_BROKEN.config(1, SOURCE_TRACE)
      }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.RES.buff((r.enhancedStateActive) ? talentResBuff : 0, SOURCE_TALENT)
      x.SPD.buff((r.enhancedStateActive && r.enhancedStateSpdBuff) ? ultSpdBuff : 0, SOURCE_ULT)
      x.BREAK_EFFICIENCY_BOOST.buff((r.enhancedStateActive) ? 0.50 : 0, SOURCE_ULT)
      x.DMG_RED_MULTI.multiply((r.enhancedStateActive && r.talentDmgReductionBuff) ? (1 - talentDmgReductionBuff) : 1, SOURCE_TALENT)

      buffAbilityVulnerability(x, BREAK_DMG_TYPE, (r.enhancedStateActive && x.a[Key.ENEMY_WEAKNESS_BROKEN]) ? ultWeaknessBrokenBreakVulnerability : 0, SOURCE_ULT)

      // Should be skill def pen but skill doesnt apply to super break
      x.DEF_PEN.buff((e >= 1 && r.e1DefShred && r.enhancedStateActive) ? 0.15 : 0, SOURCE_E1)
      x.RES.buff((e >= 4 && r.e4ResBuff && r.enhancedStateActive) ? 0.50 : 0, SOURCE_E4)
      x.FIRE_RES_PEN.buff((e >= 6 && r.e6Buffs && r.enhancedStateActive) ? 0.20 : 0, SOURCE_E6)
      x.BREAK_EFFICIENCY_BOOST.buff((e >= 6 && r.e6Buffs && r.enhancedStateActive) ? 0.50 : 0, SOURCE_E6)

      x.BASIC_ATK_SCALING.buff((r.enhancedStateActive) ? basicEnhancedScaling : basicScaling, SOURCE_BASIC)

      x.BASIC_TOUGHNESS_DMG.buff((r.enhancedStateActive) ? 15 : 10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff((r.enhancedStateActive) ? 30 : 20, SOURCE_SKILL)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.SUPER_BREAK_MODIFIER.buff((r.superBreakDmg && r.enhancedStateActive && x.a[Key.BE] >= 2.00) ? 0.35 : 0, SOURCE_TRACE)
      x.SUPER_BREAK_MODIFIER.buff((r.superBreakDmg && r.enhancedStateActive && x.a[Key.BE] >= 3.60) ? 0.15 : 0, SOURCE_TRACE)

      x.SKILL_ATK_SCALING.buff(
        (r.enhancedStateActive)
          ? (0.2 * Math.min(3.60, x.a[Key.BE]) + skillEnhancedAtkScaling)
          : skillScaling
        , SOURCE_SKILL)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      return `
if (x.BE >= 2.00 && ${wgslTrue(r.superBreakDmg && r.enhancedStateActive)}) { x.SUPER_BREAK_MODIFIER += 0.35; }
if (x.BE >= 3.60 && ${wgslTrue(r.superBreakDmg && r.enhancedStateActive)}) { x.SUPER_BREAK_MODIFIER += 0.15; }

if (${wgslTrue(r.enhancedStateActive)}) {
  x.SKILL_ATK_SCALING += 0.2 * min(3.60, x.BE) + ${skillEnhancedAtkScaling};
} else {
  x.SKILL_ATK_SCALING += ${skillScaling};
}
      `
    },
    dynamicConditionals: [
      {
        id: 'FireflyConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.ATK],
        chainsTo: [Stats.BE],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.atkToBeConversion && x.a[Key.ATK] > 1800
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.ATK, Stats.BE, this, x, action, context, SOURCE_TRACE,
            (convertibleValue) => 0.008 * Math.floor((convertibleValue - 1800) / 10),
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.ATK, Stats.BE, this, action, context,
            `0.008 * floor((convertibleValue - 1800) / 10)`,
            `${wgslTrue(r.atkToBeConversion)} && x.ATK > 1800`,
          )
        },
      },
    ],
  }
}
