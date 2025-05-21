import { AbilityType, NONE_TYPE, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardHpHealFinalizer, standardHpHealFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Ice Crampon Technique

Basic ATK+1+20

Deals Quantum DMG equal to 50% of this character's Max HP to a single enemy.

 Single 10

Lv6

Salted Camping Cans

Skill-1+30

Applies "Survival Response" to a single target ally and increases their Max HP by 7.5% of Lynx's Max HP plus 200. If the target ally is a character on the Path of Destruction or Preservation, the chance of them being attacked by enemies will greatly increase. "Survival Response" lasts for 2 turn(s).
Restores the target's HP by 12% of Lynx's Max HP plus 320.
Hidden Stat: 5

Lv10

Snowfield First Aid

Ultimate100+5

Dispels 1 debuff(s) from all allies and immediately restores their respective HP by an amount equal to 13.5% of Lynx's Max HP plus 360.

Lv10

Outdoor Survival Experience

Talent

When using Lynx's Skill or Ultimate, applies continuous healing to the target ally for 2 turn(s), restoring the target ally's HP by an amount equal to 3.6% of Lynx's Max HP plus 96 at the start of each turn. If the target has "Survival Response," the continuous healing effect additionally restores HP by an amount equal to 4.5% of Lynx's Max HP plus 120.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Chocolate Energy Bar

Technique

After Lynx uses her Technique, at the start of the next battle, all allies are granted her Talent's continuous healing effect, lasting for 2 turn(s).


Stat Boosts

 +28.0% HP
 +22.5% DEF
 +10.0% Effect RES

Advance Surveying

After a target with "Survival Response" is hit, Lynx regenerates 2 Energy immediately.


Exploration Techniques

Increases the chance to resist Crowd Control debuffs by 35%.

Crowd Control debuff
Freeze, Entanglement, Imprisonment, Dominated, Outrage, Strong Reverberation, Alien Dream, Snarelock, Terrified.


Survival in the Extreme

Extends the duration of the continuous healing effect granted by Talent for 1 turn(s).



1 Morning of Snow Hike

When healing allies with HP percentage equal to or lower than 50%, Lynx's Outgoing Healing increases by 20%. This effect also works on continuous healing.



2 Noon of Portable Furnace

A target with "Survival Response" can resist debuff application for 1 time(s).



3 Afternoon of Avalanche Beacon

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Dusk of Warm Campfire

When "Survival Response" is gained, increases the target's ATK by an amount equal to 3% of Lynx's Max HP for 1 turn(s).



5 Night of Aurora Tea

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Dawn of Explorers' Chart

Additionally boosts the Max HP increasing effect of "Survival Response" by an amount equal to 6% of Lynx's Max HP and increases Effect RES by 30%.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Lynx')
  const tHeal = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealAbility')
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
  } = Source.character('1110')

  const skillHpPercentBuff = skill(e, 0.075, 0.08)
  const skillHpFlatBuff = skill(e, 200, 223)

  const basicScaling = basic(e, 0.50, 0.55)

  const skillHealScaling = skill(e, 0.12, 0.128)
  const skillHealFlat = skill(e, 320, 356)

  const ultHealScaling = ult(e, 0.135, 0.144)
  const ultHealFlat = ult(e, 360, 400.5)

  const talentHealScaling = talent(e, 0.036, 0.0384)
  const talentHealFlat = talent(e, 96, 106.8)

  const atkBuffPercent = (e >= 4 ? 0.03 : 0)

  const content: ContentDefinition<typeof defaults> = {
    healAbility: {
      id: 'healAbility',
      formItem: 'select',
      text: tHeal('Text'),
      content: tHeal('Content'),
      options: [
        { display: tHeal('Skill'), value: SKILL_DMG_TYPE, label: tHeal('Skill') },
        { display: tHeal('Ult'), value: ULT_DMG_TYPE, label: tHeal('Ult') },
        { display: tHeal('Talent'), value: NONE_TYPE, label: tHeal('Talent') },
      ],
      fullWidth: true,
    },
    skillBuff: {
      id: 'skillBuff',
      formItem: 'switch',
      text: t('Content.skillBuff.text'),
      content: t('Content.skillBuff.content', {
        skillHpPercentBuff: TsUtils.precisionRound(100 * skillHpPercentBuff),
        skillHpFlatBuff: skillHpFlatBuff,
      }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillBuff: content.skillBuff,
    teammateHPValue: {
      id: 'teammateHPValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateHPValue.text'),
      content: t('TeammateContent.teammateHPValue.content', {
        skillHpPercentBuff: TsUtils.precisionRound(100 * skillHpPercentBuff),
        skillHpFlatBuff: skillHpFlatBuff,
      }),
      min: 0,
      max: 10000,
    },
  }

  const defaults = {
    healAbility: ULT_DMG_TYPE,
    skillBuff: true,
  }

  const teammateDefaults = {
    skillBuff: true,
    teammateHPValue: 6000,
  }

  return {
    activeAbilities: [AbilityType.BASIC],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_HP_SCALING.buff(basicScaling, SOURCE_BASIC)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)

      if (r.healAbility == SKILL_DMG_TYPE) {
        x.HEAL_TYPE.set(SKILL_DMG_TYPE, SOURCE_SKILL)
        x.HEAL_SCALING.buff(skillHealScaling, SOURCE_SKILL)
        x.HEAL_FLAT.buff(skillHealFlat, SOURCE_SKILL)
      }
      if (r.healAbility == ULT_DMG_TYPE) {
        x.HEAL_TYPE.set(ULT_DMG_TYPE, SOURCE_ULT)
        x.HEAL_SCALING.buff(ultHealScaling, SOURCE_ULT)
        x.HEAL_FLAT.buff(ultHealFlat, SOURCE_ULT)
      }
      if (r.healAbility == NONE_TYPE) {
        x.HEAL_TYPE.set(NONE_TYPE, SOURCE_TALENT)
        x.HEAL_SCALING.buff(talentHealScaling, SOURCE_TALENT)
        x.HEAL_FLAT.buff(talentHealFlat, SOURCE_TALENT)
      }

      if (r.skillBuff) {
        x.HP.buff(skillHpFlatBuff, SOURCE_SKILL)
        x.UNCONVERTIBLE_HP_BUFF.buff(skillHpFlatBuff, SOURCE_SKILL)
      }

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.RES.buffTeam((e >= 6 && m.skillBuff) ? 0.30 : 0, SOURCE_E6)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.HP.buffTeam((t.skillBuff) ? skillHpPercentBuff * t.teammateHPValue : 0, SOURCE_SKILL)
      x.HP.buffTeam((t.skillBuff) ? skillHpFlatBuff : 0, SOURCE_SKILL)
      x.HP.buffTeam((e >= 6 && t.skillBuff) ? 0.06 * t.teammateHPValue : 0, SOURCE_E6)

      const atkBuffValue = (e >= 4 && t.skillBuff) ? 0.03 * t.teammateHPValue : 0
      x.ATK.buffTeam(atkBuffValue, SOURCE_E4)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardHpHealFinalizer(x)
    },
    gpuFinalizeCalculations: () => {
      return gpuStandardHpHealFinalizer()
    },
    dynamicConditionals: [
      {
        id: 'LynxHpConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.HP],
        chainsTo: [Stats.HP],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.skillBuff
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const hpBuffPercent = skillHpPercentBuff + (e >= 6 ? 0.06 : 0)

          dynamicStatConversion(Stats.HP, Stats.HP, this, x, action, context, SOURCE_SKILL,
            (convertibleValue) => convertibleValue * hpBuffPercent,
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          const hpBuffPercent = skillHpPercentBuff + (e >= 6 ? 0.06 : 0)

          return gpuDynamicStatConversion(Stats.HP, Stats.HP, this, action, context,
            `${hpBuffPercent} * convertibleValue`,
            `${wgslTrue(r.skillBuff)}`,
          )
        },
      },
      {
        id: 'LynxHpAtkConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.HP],
        chainsTo: [Stats.ATK],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.skillBuff
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.HP, Stats.ATK, this, x, action, context, SOURCE_E4,
            (convertibleValue) => convertibleValue * atkBuffPercent,
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.HP, Stats.ATK, this, action, context,
            `${atkBuffPercent} * convertibleValue`,
            `${wgslTrue(r.skillBuff)}`,
          )
        },
      },
    ],
  }
}
