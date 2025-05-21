import { AbilityType, ASHBLAZING_ATK_STACK } from 'lib/conditionals/conditionalConstants'
import { boostAshblazingAtkP, gpuBoostAshblazingAtkP, gpuStandardAdditionalDmgAtkFinalizer, standardAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Frost Thorn

Basic ATK+1+20

Deals Ice DMG equal to 100% of Yanqing's ATK to a single enemy.

 Single 10

Lv6

Darting Ironthorn

Skill-1+30

Deals Ice DMG equal to 220% of Yanqing's ATK to a single enemy and activates Soulsteel Sync for 1 turn.

 Single 20

Lv10

Amidst the Raining Bliss

Ultimate140+5

Increases Yanqing's CRIT Rate by 60%. When Soulsteel Sync is active, increases Yanqing's CRIT DMG by an extra 50%. This buff lasts for one turn. Afterwards, deals Ice DMG equal to 350% of Yanqing's ATK to a single enemy.

 Single 30

Lv10

One With the Sword

Talent+10

When Soulsteel Sync is active, Yanqing is less likely to be attacked by enemies. Yanqing's CRIT Rate increases by 20% and his CRIT DMG increases by 30%. After Yanqing attacks an enemy, there is a 60% fixed chance to launch Follow-up ATK, dealing Ice DMG equal to 50% of Yanqing's ATK to the enemy, which has a 65% base chance to Freeze the enemy for 1 turn.
The Frozen target cannot take action and receives Ice Additional DMG equal to 50% of Yanqing's ATK at the beginning of each turn.
When Yanqing receives DMG, the Soulsteel Sync effect will disappear.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

 Single 10

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


The One True Sword

Technique

After using his Technique, at the start of the next battle, Yanqing deals 30% more DMG for 2 turn(s) to enemies whose current HP percentage is 50% or higher.


Stat Boosts

 +28.0% ATK
 +14.4% Ice DMG Boost
 +10.0% HP

Icing on the Kick

After Yanqing attacks, deals Ice Additional DMG equal to 30% of Yanqing's ATK to enemies with Ice Weakness.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.


Frost Favors the Brave

When Soulsteel Sync is active, Effect RES increases by 20%.


Gentle Blade

When a CRIT Hit is triggered, increases SPD by 10% for 2 turn(s).



1 Svelte Saber

When Yanqing attacks a Frozen enemy, he deals Ice Additional DMG equal to 60% of his ATK.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.



2 Supine Serenade

When Soulsteel Sync is active, Energy Regeneration Rate increases by an extra 10%.



3 Sword Savant

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Searing Sting

When the current HP percentage is 80% or higher, this unit's Ice RES PEN increases by 12%.



5 Surging Strife

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Swift Swoop

If the buffs from "Soulsteel Sync" or the Ultimate are in effect when an enemy is defeated, the duration of these buffs is extended by 1 turn.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Yanqing')
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
  } = Source.character('1209')

  const ultCdBuffValue = ult(e, 0.50, 0.54)
  const talentCdBuffValue = ult(e, 0.30, 0.33)
  const talentCrBuffValue = ult(e, 0.20, 0.21)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.20, 2.42)
  const ultScaling = ult(e, 3.50, 3.78)
  const fuaScaling = talent(e, 0.50, 0.55)

  const hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  const defaults = {
    ultBuffActive: true,
    soulsteelBuffActive: true,
    critSpdBuff: true,
    e1TargetFrozen: true,
    e4CurrentHp80: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultBuffActive: {
      id: 'ultBuffActive',
      formItem: 'switch',
      text: t('Content.ultBuffActive.text'),
      content: t('Content.ultBuffActive.content', { ultCdBuffValue: TsUtils.precisionRound(100 * ultCdBuffValue) }),
    },
    soulsteelBuffActive: {
      id: 'soulsteelBuffActive',
      formItem: 'switch',
      text: t('Content.soulsteelBuffActive.text'),
      content: t('Content.soulsteelBuffActive.content', {
        talentCdBuffValue: TsUtils.precisionRound(100 * talentCdBuffValue),
        talentCrBuffValue: TsUtils.precisionRound(100 * talentCrBuffValue),
        ultCdBuffValue: TsUtils.precisionRound(100 * ultCdBuffValue),
      }),
    },
    critSpdBuff: {
      id: 'critSpdBuff',
      formItem: 'switch',
      text: t('Content.critSpdBuff.text'),
      content: t('Content.critSpdBuff.content'),
    },
    e1TargetFrozen: {
      id: 'e1TargetFrozen',
      formItem: 'switch',
      text: t('Content.e1TargetFrozen.text'),
      content: t('Content.e1TargetFrozen.content'),
      disabled: (e < 1),
    },
    e4CurrentHp80: {
      id: 'e4CurrentHp80',
      formItem: 'switch',
      text: t('Content.e4CurrentHp80.text'),
      content: t('Content.e4CurrentHp80.content'),
      disabled: (e < 4),
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.CR.buff((r.ultBuffActive) ? 0.60 : 0, SOURCE_ULT)
      x.CD.buff((r.ultBuffActive && r.soulsteelBuffActive) ? ultCdBuffValue : 0, SOURCE_ULT)
      x.CR.buff((r.soulsteelBuffActive) ? talentCrBuffValue : 0, SOURCE_TALENT)
      x.CD.buff((r.soulsteelBuffActive) ? talentCdBuffValue : 0, SOURCE_TALENT)
      x.RES.buff((r.soulsteelBuffActive) ? 0.20 : 0, SOURCE_TRACE)
      x.SPD_P.buff((r.critSpdBuff) ? 0.10 : 0, SOURCE_TRACE)
      x.ERR.buff((e >= 2 && r.soulsteelBuffActive) ? 0.10 : 0, SOURCE_E2)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_ATK_SCALING.buff(fuaScaling, SOURCE_TALENT)

      x.BASIC_ADDITIONAL_DMG_SCALING.buff((context.enemyElementalWeak) ? 0.30 : 0, SOURCE_BASIC)
      x.SKILL_ADDITIONAL_DMG_SCALING.buff((context.enemyElementalWeak) ? 0.30 : 0, SOURCE_SKILL)
      x.ULT_ADDITIONAL_DMG_SCALING.buff((context.enemyElementalWeak) ? 0.30 : 0, SOURCE_ULT)
      x.FUA_ADDITIONAL_DMG_SCALING.buff((context.enemyElementalWeak) ? 0.30 : 0, SOURCE_TALENT)

      x.BASIC_ATK_SCALING.buff((e >= 1 && r.e1TargetFrozen) ? 0.60 : 0, SOURCE_E1)
      x.SKILL_ATK_SCALING.buff((e >= 1 && r.e1TargetFrozen) ? 0.60 : 0, SOURCE_E1)
      x.ULT_ATK_SCALING.buff((e >= 1 && r.e1TargetFrozen) ? 0.60 : 0, SOURCE_E1)
      x.FUA_ATK_SCALING.buff((e >= 1 && r.e1TargetFrozen) ? 0.60 : 0, SOURCE_E1)

      // Boost
      x.ICE_RES_PEN.buff((e >= 4 && r.e4CurrentHp80) ? 0.12 : 0, SOURCE_E4)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(10, SOURCE_TALENT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkP(x, action, context, hitMulti)
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkP(hitMulti) + gpuStandardAdditionalDmgAtkFinalizer()
    },
  }
}
