import { AbilityType, ASHBLAZING_ATK_STACK, BASIC_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { boostAshblazingAtkP, gpuBoostAshblazingAtkP } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityCr } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Windrider Bullet

Basic ATK+1+20

Deals Wind DMG equal to 100% of Bronya's ATK to a single enemy.

 Single 10

Lv6

Combat Redeployment

Skill-1+30

Dispels a debuff from a single ally, allows them to immediately take action, and increases their DMG by 66% for 1 turn(s).
When this Skill is used on Bronya herself, she cannot immediately take action again.
Hidden Stat: 0
Hidden Stat: 1

Lv10

The Belobog March

Ultimate120+5

Increases the ATK of all allies by 55%, and increases their CRIT DMG equal to 16% of Bronya's CRIT DMG plus 20% for 2 turn(s).

Lv10

Leading the Way

Talent+5

After using her Basic ATK, Bronya's next action will be Advanced Forward by 30%.

 Single 10

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Banner of Command

Technique

After using Bronya's Technique, at the start of the next battle, all allies' ATK increases by 15% for 2 turn(s).


Stat Boosts

 +22.4% Wind DMG Boost
 +24.0% CRIT DMG
 +10.0% Effect RES

Command

The CRIT Rate for Basic ATK increases to 100%.


Battlefield

At the start of the battle, all allies' DEF increases by 20% for 2 turn(s).


Military Might

When Bronya is on the field, all allies deal 10% more DMG.



1 Hone Your Strength

When using Skill, there is a 50% fixed chance of recovering 1 Skill Point. This effect has a 1-turn cooldown.



2 Quick March

When using Skill, the target ally's SPD increases by 30% after taking action, lasting for 1 turn.



3 Bombardment

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Take by Surprise

After any other ally character uses Basic ATK on an enemy target that has Wind Weakness, Bronya immediately launches 1 instance of Follow-up ATK, dealing Wind DMG to this target equal to 80% of her Basic ATK DMG. This effect can only trigger once per turn.



5 Unstoppable

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Piercing Rainbow

The duration of the DMG Boost effect placed by the Skill on the target ally increases by 1 turn(s).
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Bronya')
  const { basic, skill, ult } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5
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
  } = Source.character('1101')

  const skillDmgBoostValue = skill(e, 0.66, 0.726)
  const ultAtkBoostValue = ult(e, 0.55, 0.594)
  const ultCdBoostValue = ult(e, 0.16, 0.168)
  const ultCdBoostBaseValue = ult(e, 0.20, 0.216)

  const basicScaling = basic(e, 1.0, 1.1)
  const fuaScaling = basicScaling * 0.80

  const hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  const defaults = {
    teamDmgBuff: true,
    skillBuff: true,
    ultBuff: true,
    battleStartDefBuff: false,
    techniqueBuff: false,
    e2SkillSpdBuff: false,
  }

  const teammateDefaults = {
    ...defaults,
    ...{
      teammateCDValue: 2.50,
    },
  }

  const content: ContentDefinition<typeof defaults> = {
    teamDmgBuff: {
      id: 'teamDmgBuff',
      formItem: 'switch',
      text: t('Content.teamDmgBuff.text'),
      content: t('Content.teamDmgBuff.content'),
    },
    skillBuff: {
      id: 'skillBuff',
      formItem: 'switch',
      text: t('Content.skillBuff.text'),
      content: t('Content.skillBuff.content', { skillDmgBoostValue: TsUtils.precisionRound(100 * skillDmgBoostValue) }),
    },
    ultBuff: {
      id: 'ultBuff',
      formItem: 'switch',
      text: t('Content.ultBuff.text'),
      content: t('Content.ultBuff.content', {
        ultAtkBoostValue: TsUtils.precisionRound(100 * ultAtkBoostValue),
        ultCdBoostValue: TsUtils.precisionRound(100 * ultCdBoostValue),
        ultCdBoostBaseValue: TsUtils.precisionRound(100 * ultCdBoostBaseValue),
      }),
    },
    battleStartDefBuff: {
      id: 'battleStartDefBuff',
      formItem: 'switch',
      text: t('Content.battleStartDefBuff.text'),
      content: t('Content.battleStartDefBuff.content'),
    },
    techniqueBuff: {
      id: 'techniqueBuff',
      formItem: 'switch',
      text: t('Content.techniqueBuff.text'),
      content: t('Content.techniqueBuff.content'),
    },
    e2SkillSpdBuff: {
      id: 'e2SkillSpdBuff',
      formItem: 'switch',
      text: t('Content.e2SkillSpdBuff.text'),
      content: t('Content.e2SkillSpdBuff.content'),
      disabled: e < 2,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    teamDmgBuff: content.teamDmgBuff,
    skillBuff: content.skillBuff,
    ultBuff: content.ultBuff,
    battleStartDefBuff: content.battleStartDefBuff,
    techniqueBuff: content.techniqueBuff,
    teammateCDValue: {
      id: 'teammateCDValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateCDValue.text'),
      content: t('TeammateContent.teammateCDValue.content', {
        ultAtkBoostValue: TsUtils.precisionRound(100 * ultAtkBoostValue),
        ultCdBoostValue: TsUtils.precisionRound(100 * ultCdBoostValue),
        ultCdBoostBaseValue: TsUtils.precisionRound(100 * ultCdBoostBaseValue),
      }),
      min: 0,
      max: 4.00,
      percent: true,
    },
    e2SkillSpdBuff: content.e2SkillSpdBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.FUA],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      buffAbilityCr(x, BASIC_DMG_TYPE, 1.00, SOURCE_TRACE)

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.FUA_ATK_SCALING.buff((e >= 4) ? fuaScaling : 0, SOURCE_E4)

      if (r.ultBuff) {
        x.CD.buff(ultCdBoostBaseValue, SOURCE_ULT)
        x.UNCONVERTIBLE_CD_BUFF.buff(ultCdBoostBaseValue, SOURCE_ULT)
      }

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.FUA_TOUGHNESS_DMG.buff((e >= 4) ? 10 : 0, SOURCE_E4)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.DEF_P.buffTeam((m.battleStartDefBuff) ? 0.20 : 0, SOURCE_TRACE)
      x.SPD_P.buffSingle((m.e2SkillSpdBuff) ? 0.30 : 0, SOURCE_E2)
      x.ATK_P.buffTeam((m.techniqueBuff) ? 0.15 : 0, SOURCE_TECHNIQUE)
      x.ATK_P.buffTeam((m.ultBuff) ? ultAtkBoostValue : 0, SOURCE_ULT)

      x.ELEMENTAL_DMG.buffTeam((m.teamDmgBuff) ? 0.10 : 0, SOURCE_TRACE)
      x.ELEMENTAL_DMG.buffSingle((m.skillBuff) ? skillDmgBoostValue : 0, SOURCE_SKILL)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const cdBuff = (t.ultBuff) ? ultCdBoostValue * t.teammateCDValue + ultCdBoostBaseValue : 0
      x.CD.buffTeam(cdBuff, SOURCE_ULT)
      x.UNCONVERTIBLE_CD_BUFF.buffTeam(cdBuff, SOURCE_ULT)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkP(x, action, context, hitMulti)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => gpuBoostAshblazingAtkP(hitMulti),
    dynamicConditionals: [
      {
        id: 'BronyaCdConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CD],
        chainsTo: [Stats.CD],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.ultBuff
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.CD, Stats.CD, this, x, action, context, SOURCE_ULT,
            (convertibleValue) => convertibleValue * ultCdBoostValue,
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.CD, Stats.CD, this, action, context,
            `${ultCdBoostValue} * convertibleValue`,
            `${wgslTrue(r.ultBuff)}`,
          )
        },
      },
    ],
  }
}
