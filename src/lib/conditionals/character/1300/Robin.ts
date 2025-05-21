import { AbilityType, FUA_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuUltAdditionalDmgAtkFinalizer, ultAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityCd, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Wingflip White Noise

Basic ATK+1+20

Deals Physical DMG equal to 100% of Robin's ATK to a single target enemy.

 Single 10

Lv6

Pinion's Aria

Skill-1+30

Increase DMG dealt by all allies by 50%, lasting for 3 turn(s). This duration decreases by 1 at the start of Robin's every turn.

Lv10

Vox Harmonique, Opus Cosmique

Ultimate160+5

Robin enters the Concerto state and makes all teammates (i.e., excluding this unit) immediately take action.
While in the Concerto state, increases all allies' ATK by 22.8% of Robin's ATK plus 200. Moreover, after every attack by ally targets, Robin deals Physical Additional DMG equal to 120% of her ATK for 1 time, with a fixed CRIT Rate for this damage set at 100% and fixed CRIT DMG set at 150%.
While in the Concerto state, Robin is immune to Crowd Control debuffs and cannot enter her turn or take action until the Concerto state ends.
A Concerto countdown appears on the Action Order bar. When the countdown's turn begins, Robin exits the Concerto state and immediately takes action. The countdown has its own fixed SPD of 90.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

Crowd Control debuff
Freeze, Entanglement, Imprisonment, Dominated, Outrage, Strong Reverberation, Alien Dream, Snarelock, Terrified.

Lv10

Tonal Resonance

Talent

Increase all allies' CRIT DMG by 20%. Moreover, after allies attack enemy targets, Robin additionally regenerates 2 Energy for herself.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Overture of Inebriation

Technique

After using Technique, creates a Special Dimension around the character that lasts for 15 seconds. Enemies within this dimension will not attack Robin and will follow Robin while the dimension is active. After entering battle while the dimension is active, Robin regenerates 5 Energy at the start of each wave. Only 1 Dimension Effect created by allies can exist at the same time.


Stat Boosts

 +28.0% ATK
 +18.0% HP
 +5.0 SPD

Coloratura Cadenza

When the battle begins, action advances this character by 25%.


Impromptu Flourish

While the Concerto state is active, the CRIT DMG dealt when all allies launch Follow-up ATK increases by 25%.


Sequential Passage

When using Skill, additionally regenerates 5 Energy.



1 Land of Smiles

While the "Concerto" state is active, all allies' All-Type RES PEN increases by 24%.



2 Afternoon Tea For Two

While the Concerto state is active, all allies' SPD increases by 16%. The Talent's Energy Regeneration effect additionally increases by 1.



3 Inverted Tuning

Skill Lv. +2, up to a maximum of Lv. 15.
Ultimate Lv. +2, up to a maximum of Lv. 15.



4 Raindrop Key

When using the Ultimate, dispels Crowd Control debuffs from all allies. While Robin is in the "Concerto" state, increases the Effect RES of all allies by 50%.

Crowd Control debuff
Freeze, Entanglement, Imprisonment, Dominated, Outrage, Strong Reverberation, Alien Dream, Snarelock, Terrified.



5 Lonestar's Lament

Basic ATK Lv. +1, up to a maximum of Lv. 10.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Moonless Midnight

While the "Concerto" state is active, the CRIT DMG for the Physical Additional DMG caused by the Ultimate increases by 450%. The effect of "Moonless Midnight" can trigger up to 8 time(s) and the trigger count is resets each time the Ultimate is used.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Robin')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_ULT_3_BASIC_TALENT_5
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
  } = Source.character('1309')

  const skillDmgBuffValue = skill(e, 0.50, 0.55)
  const talentCdBuffValue = talent(e, 0.20, 0.23)
  const ultAtkBuffScalingValue = ult(e, 0.228, 0.2432)
  const ultAtkBuffFlatValue = ult(e, 200, 230)

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 1.20, 1.296)

  const defaults = {
    concertoActive: true,
    skillDmgBuff: true,
    talentCdBuff: true,
    e1UltResPen: true,
    e2UltSpdBuff: false,
    e4TeamResBuff: false,
    e6UltCDBoost: true,
  }

  const teammateDefaults = {
    concertoActive: true,
    skillDmgBuff: true,
    talentCdBuff: true,
    teammateATKValue: 4500,
    traceFuaCdBoost: true,
    e1UltResPen: true,
    e2UltSpdBuff: true,
    e4TeamResBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    concertoActive: {
      id: 'concertoActive',
      formItem: 'switch',
      text: t('Content.concertoActive.text'),
      content: t('Content.concertoActive.content', {
        ultAtkBuffScalingValue: TsUtils.precisionRound(100 * ultAtkBuffScalingValue),
        ultAtkBuffFlatValue: ultAtkBuffFlatValue,
        ultScaling: TsUtils.precisionRound(100 * ultScaling),
      }),
    },
    skillDmgBuff: {
      id: 'skillDmgBuff',
      formItem: 'switch',
      text: t('Content.skillDmgBuff.text'),
      content: t('Content.skillDmgBuff.content', { skillDmgBuffValue: TsUtils.precisionRound(100 * skillDmgBuffValue) }),
    },
    talentCdBuff: {
      id: 'talentCdBuff',
      formItem: 'switch',
      text: t('Content.talentCdBuff.text'),
      content: t('Content.talentCdBuff.content', { talentCdBuffValue: TsUtils.precisionRound(100 * talentCdBuffValue) }),
    },
    e1UltResPen: {
      id: 'e1UltResPen',
      formItem: 'switch',
      text: t('Content.e1UltResPen.text'),
      content: t('Content.e1UltResPen.content'),
      disabled: e < 1,
    },
    e2UltSpdBuff: {
      id: 'e2UltSpdBuff',
      formItem: 'switch',
      text: t('TeammateContent.e2UltSpdBuff.text'),
      content: t('TeammateContent.e2UltSpdBuff.content'),
      disabled: e < 2,
    },
    e4TeamResBuff: {
      id: 'e4TeamResBuff',
      formItem: 'switch',
      text: t('Content.e4TeamResBuff.text'),
      content: t('Content.e4TeamResBuff.content'),
      disabled: e < 4,
    },
    e6UltCDBoost: {
      id: 'e6UltCDBoost',
      formItem: 'switch',
      text: t('Content.e6UltCDBoost.text'),
      content: t('Content.e6UltCDBoost.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    concertoActive: content.concertoActive,
    skillDmgBuff: content.skillDmgBuff,
    teammateATKValue: {
      id: 'teammateATKValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateATKValue.text'),
      content: t('TeammateContent.teammateATKValue.content', {
        ultAtkBuffFlatValue: TsUtils.precisionRound(ultAtkBuffFlatValue),
        ultAtkBuffScalingValue: TsUtils.precisionRound(100 * ultAtkBuffScalingValue),
      }),
      min: 0,
      max: 7000,
    },
    talentCdBuff: content.talentCdBuff,
    traceFuaCdBoost: {
      id: 'traceFuaCdBoost',
      formItem: 'switch',
      text: t('TeammateContent.traceFuaCdBoost.text'),
      content: t('TeammateContent.traceFuaCdBoost.content'),
    },
    e1UltResPen: content.e1UltResPen,
    e2UltSpdBuff: content.e2UltSpdBuff,
    e4TeamResBuff: content.e4TeamResBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.ULT_ADDITIONAL_DMG_SCALING.buff((r.concertoActive) ? ultScaling : 0, SOURCE_ULT)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)

      if (r.concertoActive) {
        x.ATK.buff(ultAtkBuffFlatValue, SOURCE_ULT)
        x.UNCONVERTIBLE_ATK_BUFF.buff(ultAtkBuffFlatValue, SOURCE_ULT)
      }

      x.ULT_ADDITIONAL_DMG_CR_OVERRIDE.buff(1.00, SOURCE_ULT)
      x.ULT_ADDITIONAL_DMG_CD_OVERRIDE.buff((e >= 6 && r.concertoActive && r.e6UltCDBoost) ? 6.00 : 1.50, SOURCE_ULT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.CD.buffTeam((m.talentCdBuff) ? talentCdBuffValue : 0, SOURCE_TALENT)
      x.RES.buffTeam((e >= 4 && m.concertoActive && m.e4TeamResBuff) ? 0.50 : 0, SOURCE_E4)

      x.SPD_P.buffTeam((e >= 2 && m.concertoActive && m.e2UltSpdBuff) ? 0.16 : 0, SOURCE_E2)

      x.ELEMENTAL_DMG.buffTeam((m.skillDmgBuff) ? skillDmgBuffValue : 0, SOURCE_SKILL)
      x.RES_PEN.buffTeam((e >= 1 && m.concertoActive && m.e1UltResPen) ? 0.24 : 0, SOURCE_E1)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const atkBuff = (t.concertoActive) ? t.teammateATKValue * ultAtkBuffScalingValue + ultAtkBuffFlatValue : 0
      x.ATK.buffTeam(atkBuff, SOURCE_ULT)
      x.UNCONVERTIBLE_ATK_BUFF.buffTeam(atkBuff, SOURCE_ULT)

      buffAbilityCd(x, FUA_DMG_TYPE, t.traceFuaCdBoost && t.concertoActive ? 0.25 : 0, SOURCE_TRACE, Target.TEAM)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      ultAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => gpuUltAdditionalDmgAtkFinalizer(),
    dynamicConditionals: [
      {
        id: 'RobinAtkConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.ATK],
        chainsTo: [Stats.ATK],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.concertoActive
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.ATK, Stats.ATK, this, x, action, context, SOURCE_ULT,
            (convertibleValue) => convertibleValue * ultAtkBuffScalingValue,
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.ATK, Stats.ATK, this, action, context,
            `convertibleValue * ${ultAtkBuffScalingValue}`,
            `${wgslTrue(r.concertoActive)}`,
          )
        },
      },
    ],
  }
}
