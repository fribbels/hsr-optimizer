import { AbilityType, ADDITIONAL_DMG_TYPE, ASHBLAZING_ATK_STACK, BASIC_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { boostAshblazingAtkP, gpuBoostAshblazingAtkP, gpuStandardAdditionalDmgAtkFinalizer, standardAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityCd, buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

My Sword Zaps Demons

Basic ATK+1+20

Deals Imaginary DMG equal to 100% of March 7th's ATK to a single target enemy and gains 1 point(s) of Charge.

 Single 10

Lv6

Brows Be Smitten, Heart Be Bitten

Basic ATK+30

Initially, deals 3 hits, each causing Imaginary DMG equal to 80% of March 7th's ATK to a single target enemy. Whenever dealing the final hit, there is a 60% fixed chance to deal 1 additional hit of DMG, up to a max of 3 additional hit(s). Energy regenerated from using Enhanced Basic ATK does not increase with the number of hits.
Enhanced Basic ATK cannot recover Skill Points.

 Single 5

Lv6

Master, It's Tea Time!

Skill-1+30

Designates a single ally (excluding this unit) as "Shifu" and increases "Shifu"'s SPD by 10%. Only the most recent target of March 7th's Skill is considered as "Shifu."


Whenever using Basic ATK or dealing 1 hit of Enhanced Basic ATK's DMG, triggers the corresponding effect if "Shifu" with the specified Path is present on the field:

Erudition, Destruction, The Hunt, Remembrance: Deals Additional DMG (DMG Type based on "Shifu"'s Combat Type) equal to 20% of March 7th's ATK.

Harmony, Nihility, Preservation, Abundance: Increases the Toughness Reduction of this instance of DMG by 100%.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

Lv10

March 7th, the Apex Heroine

Ultimate110+5

Deals Imaginary DMG equal to 240% of March 7th's ATK to a single target enemy.
Increases the initial Hits Per Action of the next Enhanced Basic ATK by 2 hits and increase the fixed chance of additionally dealing DMG by 20%.

 Single 30

Lv10

Master, I've Ascended!

Talent+5

After Shifu uses an attack or Ultimate, March 7th gains up to 1 point of Charge each time.
Upon reaching 7 or more points of Charge, March 7th immediately takes action and increases the DMG she deals by 80%. Her Basic ATK gets Enhanced, and her Skill cannot be used. After using Enhanced Basic ATK, consumes 7 point(s) of Charge. Charge is capped at 10 points.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Feast in One Go

Technique

If March 7th is on the team, she gains 1 point of Charge at the start of the next battle whenever a teammate uses Technique, up to a max of 3 point(s).
After using Technique, March 7th regenerates 30 Energy when the next battle starts.


Stat Boosts

 +28.0% ATK
 +24.0% CRIT DMG
 +12.5% DEF

Swan Soar

When the battle starts, March 7th's action advances by 25%.


Filigree

March 7th can reduce the Toughness of enemies whose Weakness Type is the same as Shifu's Combat Type. When Breaking Weakness, triggers the Imaginary Weakness Break effect.


Tide Tamer

After using Enhanced Basic ATK, increases Shifu's CRIT DMG by 60% and Break Effect by 36%, lasting for 2 turn(s).



1 My Sword Stirs Starlight

When Shifu is on the field, increases March 7th's SPD by 10%.



2 Blade Dances on Waves' Fight

After "Shifu" uses Basic ATK or Skill to attack an enemy target, March 7th immediately launches a Follow-up ATK and deals Imaginary DMG equal to 60% of March 7th's ATK to the primary target of this attack. Additionally, triggers the corresponding effect based on "Shifu"'s Path and then gains 1 point(s) of Charge. If there is no primary target available to attack, then she attacks a single random enemy instead. This effect can only trigger once per turn. This attack deals a base Toughness reduction DMG of 5.0 and regenerates 5.0 Energy.



3 Sharp Wit in Martial Might

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Being Fabulous Never Frights

At the start of the turn, regenerates 5 Energy.



5 Sword Delights, Sugar Blights

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Me, the Best Girl in Sight

After using Ultimate, increases the CRIT DMG dealt by the next Enhanced Basic ATK by 50%.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.March7thImaginary')
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
  } = Source.character('1224')

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 0.80, 0.88)
  const basicExtraScalingMasterBuff = basic(e, 0.20, 0.22)
  const ultScaling = ult(e, 2.40, 2.592)
  const talentDmgBuff = talent(e, 0.80, 0.88)
  const skillSpdScaling = skill(e, 0.10, 0.108)

  // 0.06
  const fuaHitCountMulti = ASHBLAZING_ATK_STACK * (1 * 0.40 + 2 * 0.60)

  const defaults = {
    enhancedBasic: true,
    basicAttackHits: 6,
    talentDmgBuff: true,
    selfSpdBuff: true,
    masterAdditionalDmgBuff: true,
    masterToughnessRedBuff: true,
    e6CdBuff: true,
  }

  const teammateDefaults = {
    masterBuff: true,
    masterCdBeBuffs: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedBasic: {
      id: 'enhancedBasic',
      formItem: 'switch',
      text: t('Content.enhancedBasic.text'),
      content: t('Content.enhancedBasic.content', { BasicEnhancedScaling: TsUtils.precisionRound(100 * basicEnhancedScaling) }),
    },
    basicAttackHits: {
      id: 'basicAttackHits',
      formItem: 'slider',
      text: t('Content.basicAttackHits.text'),
      content: t('Content.basicAttackHits.content', { BasicEnhancedScaling: TsUtils.precisionRound(100 * basicEnhancedScaling) }),
      min: 3,
      max: 6,
    },
    masterAdditionalDmgBuff: {
      id: 'masterAdditionalDmgBuff',
      formItem: 'switch',
      text: t('Content.masterAdditionalDmgBuff.text'),
      content: t('Content.masterAdditionalDmgBuff.content', { ShifuDmgBuff: TsUtils.precisionRound(100 * basicExtraScalingMasterBuff) }),
    },
    masterToughnessRedBuff: {
      id: 'masterToughnessRedBuff',
      formItem: 'switch',
      text: t('Content.masterToughnessRedBuff.text'),
      content: t('Content.masterToughnessRedBuff.content'),
    },
    talentDmgBuff: {
      id: 'talentDmgBuff',
      formItem: 'switch',
      text: t('Content.talentDmgBuff.text'),
      content: t('Content.talentDmgBuff.content', { TalentDmgBuff: TsUtils.precisionRound(100 * talentDmgBuff) }),
    },
    selfSpdBuff: {
      id: 'selfSpdBuff',
      formItem: 'switch',
      text: t('Content.selfSpdBuff.text'),
      content: t('Content.selfSpdBuff.content'),
      disabled: e < 1,
    },
    e6CdBuff: {
      id: 'e6CdBuff',
      formItem: 'switch',
      text: t('Content.e6CdBuff.text'),
      content: t('Content.e6CdBuff.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    masterBuff: {
      id: 'masterBuff',
      formItem: 'switch',
      text: t('TeammateContent.masterBuff.text'),
      content: t('TeammateContent.masterBuff.content', { ShifuSpeedBuff: TsUtils.precisionRound(100 * skillSpdScaling) }),
    },
    masterCdBeBuffs: {
      id: 'masterCdBeBuffs',
      formItem: 'switch',
      text: t('TeammateContent.masterCdBeBuffs.text'),
      content: t('TeammateContent.masterCdBeBuffs.content'),
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => (teammateDefaults),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.SPD_P.buff((e >= 1 && r.selfSpdBuff) ? 0.10 : 0, SOURCE_E1)
      buffAbilityDmg(x, BASIC_DMG_TYPE | ADDITIONAL_DMG_TYPE, (r.talentDmgBuff) ? talentDmgBuff : 0, SOURCE_TALENT)

      buffAbilityCd(x, BASIC_DMG_TYPE | ADDITIONAL_DMG_TYPE, (e >= 6 && r.e6CdBuff && r.enhancedBasic) ? 0.50 : 0, SOURCE_E6)

      const additionalMasterBuffScaling = (r.masterAdditionalDmgBuff)
        ? basicExtraScalingMasterBuff * r.basicAttackHits
        : 0
      x.BASIC_ATK_SCALING.buff((r.enhancedBasic) ? basicEnhancedScaling * r.basicAttackHits : basicScaling, SOURCE_BASIC)
      x.BASIC_ADDITIONAL_DMG_SCALING.buff((r.enhancedBasic) ? additionalMasterBuffScaling : basicExtraScalingMasterBuff, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_ATK_SCALING.buff((e >= 2) ? 0.60 : 0, SOURCE_E2)

      const toughnessDmgBoost = (r.masterToughnessRedBuff) ? 2.0 : 1.0
      x.BASIC_TOUGHNESS_DMG.buff(toughnessDmgBoost * ((r.enhancedBasic) ? 5 * r.basicAttackHits : 10), SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff((e >= 2) ? 10 : 0, SOURCE_E2)

      return x
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.SPD_P.buffSingle((t.masterBuff) ? skillSpdScaling : 0, SOURCE_SKILL)

      x.CD.buffSingle((t.masterBuff && t.masterCdBeBuffs) ? 0.60 : 0, SOURCE_TRACE)
      x.BE.buffSingle((t.masterBuff && t.masterCdBeBuffs) ? 0.36 : 0, SOURCE_TRACE)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkP(x, action, context, fuaHitCountMulti)
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkP(fuaHitCountMulti) + gpuStandardAdditionalDmgAtkFinalizer()
    },
  }
}
