import { AbilityType, BASIC_DMG_TYPE, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Oracle Brush

Basic ATK+1+20

Deals Physical DMG equal to 100% of Hanya's ATK to a single enemy.

 Single 10

Lv6

Samsara, Locked

Skill-1+30

Deals Physical DMG equal to 240% of Hanya's ATK to a single target enemy, then applies Burden to them.
For every 2 Basic ATKs, Skills, or Ultimates allies use on an enemy with Burden, allies will immediately recover 1 Skill Point. Burden is only active on the latest target it is applied to, and will be dispelled automatically after the Skill Point recovery effect has been triggered 2 times.

 Single 20

Lv10

Ten-Lords' Decree, All Shall Obey

Ultimate140+5

Increases the SPD of a target ally by 20% of Hanya's SPD and increases the same target ally's ATK by 60%, lasting for 2 turn(s).

Lv10

Sanction

Talent

When an ally uses a Basic ATK, Skill, or Ultimate on an enemy inflicted with Burden, the DMG dealt increases by 30%, lasting for 2 turn(s).

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Netherworld Judgment

Technique

Immediately attacks the enemy. After entering battle, applies Burden equivalent to that applied by the Skill to a random enemy.

 Single 20


Stat Boosts

 +28.0% ATK
 +9.0 SPD
 +10.0% HP

Scrivener

Allies triggering Burden's Skill Point recovery effect have their ATK increased by 10% for 1 turn(s).


Netherworld

If the trigger count for the Burden's Skill Point recovery effect is 1 or lower when an enemy with Burden is defeated, then additionally recovers 1 Skill Point(s).


Reanimated

When Burden's Skill Point recovery effect is triggered, this character regenerates 2 Energy.



1 One Heart

When an ally target with Hanya's Ultimate effect defeats an enemy, Hanya's action advances by 15%. This effect can only be triggered 1 time(s) per turn.



2 Two Views

After using the Skill, this character's SPD increases by 20% for 1 turn(s).



3 Three Temptations

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Four Truths

The Ultimate's duration is additionally extended for 1 turn(s).



5 Five Skandhas

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Six Reverences

Increase the DMG Boost effect of the Talent by an additional 10%.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Hanya')
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
  } = Source.character('1215')

  const ultSpdBuffValue = ult(e, 0.20, 0.21)
  const ultAtkBuffValue = ult(e, 0.60, 0.648)
  let talentDmgBoostValue = talent(e, 0.30, 0.33)

  talentDmgBoostValue += (e >= 6) ? 0.10 : 0

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.40, 2.64)

  const defaults = {
    ultBuff: true,
    targetBurdenActive: true,
    burdenAtkBuff: true,
    e2SkillSpdBuff: false,
  }

  const teammateDefaults = {
    ultBuff: true,
    targetBurdenActive: true,
    burdenAtkBuff: true,
    teammateSPDValue: 160,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultBuff: {
      id: 'ultBuff',
      formItem: 'switch',
      text: t('Content.ultBuff.text'),
      content: t('Content.ultBuff.content', {
        ultSpdBuffValue: TsUtils.precisionRound(100 * ultSpdBuffValue),
        ultAtkBuffValue: TsUtils.precisionRound(100 * ultAtkBuffValue),
      }),
    },
    targetBurdenActive: {
      id: 'targetBurdenActive',
      formItem: 'switch',
      text: t('Content.targetBurdenActive.text'),
      content: t('Content.targetBurdenActive.content', { talentDmgBoostValue: TsUtils.precisionRound(100 * talentDmgBoostValue) }),
    },
    burdenAtkBuff: {
      id: 'burdenAtkBuff',
      formItem: 'switch',
      text: t('Content.burdenAtkBuff.text'),
      content: t('Content.burdenAtkBuff.content'),
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
    ultBuff: content.ultBuff,
    teammateSPDValue: {
      id: 'teammateSPDValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateSPDValue.text'),
      content: t('TeammateContent.teammateSPDValue.content', {
        ultSpdBuffValue: TsUtils.precisionRound(100 * ultSpdBuffValue),
        ultAtkBuffValue: TsUtils.precisionRound(100 * ultAtkBuffValue),
      }),
      min: 0,
      max: 300,
    },
    targetBurdenActive: content.targetBurdenActive,
    burdenAtkBuff: content.burdenAtkBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)

      x.SPD_P.buff((e >= 2 && r.e2SkillSpdBuff) ? 0.20 : 0, SOURCE_E2)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.ATK_P.buffTeam((m.burdenAtkBuff) ? 0.10 : 0, SOURCE_TRACE)

      buffAbilityDmg(x, BASIC_DMG_TYPE | SKILL_DMG_TYPE | ULT_DMG_TYPE, (m.targetBurdenActive) ? talentDmgBoostValue : 0, SOURCE_TALENT, Target.TEAM)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const spdBuff = (t.ultBuff) ? ultSpdBuffValue * t.teammateSPDValue : 0
      x.SPD.buffSingle(spdBuff, SOURCE_ULT)
      x.UNCONVERTIBLE_SPD_BUFF.buffSingle(spdBuff, SOURCE_ULT)
      x.ATK_P.buffSingle((t.ultBuff) ? ultAtkBuffValue : 0, SOURCE_ULT)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
    },
    gpuFinalizeCalculations: () => '',
    dynamicConditionals: [
      {
        id: 'HanyaSpdConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.SPD],
        chainsTo: [Stats.SPD],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.ultBuff
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.SPD, Stats.SPD, this, x, action, context, SOURCE_ULT,
            (convertibleValue) => convertibleValue * ultSpdBuffValue,
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.SPD, Stats.SPD, this, action, context,
            `${ultSpdBuffValue} * convertibleValue`,
            `${wgslTrue(r.ultBuff)}`,
          )
        },
      },
    ],
  }
}
