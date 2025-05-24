import { AbilityType, SKILL_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardAdditionalDmgAtkFinalizer, standardAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Hehe! Don't Get Burned!

Basic ATK+1+20

Deals Fire DMG equal to 100% of Hook's ATK to a single enemy.

 Single 10

Lv6

Hey! Remember Hook?

Skill-1+30

Deals Fire DMG equal to 240% of Hook's ATK to a single enemy. In addition, there is a 100% base chance to inflict Burn for 2 turn(s).
When afflicted with Burn, enemies will take Fire DoT equal to 65% of Hook's ATK at the beginning of each turn.

 Single 20

Lv10

Boom! Here Comes the Fire!

Ultimate120+5

Deals Fire DMG equal to 400% of Hook's ATK to a single enemy.
After using Ultimate, the next Skill to be used is Enhanced, which deals DMG to a single enemy and enemies adjacent to it.

 Single 30

Lv10

Ha! Oil to the Flames!

Talent

When attacking a target afflicted with Burn, deals Fire Additional DMG equal to 100% of Hook's ATK and regenerates 5 extra Energy.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Ack! Look at This Mess!

Technique

Immediately attacks the enemy. Upon entering battle, Hook deals Fire DMG equal to 50% of her ATK to a random enemy. In addition, there is a 100% base chance to inflict Burn on every enemy for 3 turn(s).
When afflicted with Burn, enemies will take Fire DoT equal to 50% of Hook's ATK at the beginning of each turn.

 Single 20


Hey! Remember Hook?

Skill-1+30

Deals Fire DMG equal to 280% of Hook's ATK to a single enemy, with a 100% base chance to Burn them for 2 turn(s). Additionally, deals Fire DMG equal to 80% of Hook's ATK to enemies adjacent to it.
When afflicted with Burn, enemies will take Fire DoT equal to 65% of Hook's ATK at the beginning of each turn.

 Single 20 | Other 10

Lv10

Stat Boosts

 +28.0% ATK
 +18.0% HP
 +13.3% CRIT DMG

Innocence

Hook restores HP equal to 5% of her Max HP whenever her Talent is triggered.


Naivete

Increases the chance to resist Crowd Control debuffs by 35%.

Crowd Control debuff
Freeze, Entanglement, Imprisonment, Dominated, Outrage, Strong Reverberation, Alien Dream, Snarelock, Terrified.


Playing With Fire

After using her Ultimate, Hook has her action advanced by 20% and additionally regenerates 5 Energy.



1 Early to Bed, Early to Rise

Enhanced Skill deals 20% increased DMG.



2 Happy Tummy, Happy Body

Extends the duration of Burn caused by Skill by 1 turn(s).



3 Don't Be Picky, Nothing's Icky

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 It's Okay to Not Know

When Talent is triggered, there is a 100% base chance to Burn enemies adjacent to the designated enemy target, equivalent to that of Skill.



5 Let the Moles' Deeds Be Known

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Always Ready to Punch and Kick

Hook deals 20% more DMG to enemies afflicted with Burn.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Hook')
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
  } = Source.character('1109')

  const targetBurnedExtraScaling = talent(e, 1.00, 1.10)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.40, 2.64)
  const skillEnhancedScaling = skill(e, 2.80, 3.08)
  const ultScaling = ult(e, 4.00, 4.32)
  const dotScaling = skill(e, 0.65, 0.715)

  const defaults = {
    enhancedSkill: true,
    targetBurned: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedSkill: {
      id: 'enhancedSkill',
      formItem: 'switch',
      text: t('Content.enhancedSkill.text'),
      content: t('Content.enhancedSkill.content', { skillEnhancedScaling: TsUtils.precisionRound(100 * skillEnhancedScaling) }),
    },
    targetBurned: {
      id: 'targetBurned',
      formItem: 'switch',
      text: t('Content.targetBurned.text'),
      content: t('Content.targetBurned.content', { targetBurnedExtraScaling: TsUtils.precisionRound(100 * targetBurnedExtraScaling) }),
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff((r.enhancedSkill) ? skillEnhancedScaling : skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.BASIC_ADDITIONAL_DMG_SCALING.buff((r.targetBurned) ? targetBurnedExtraScaling : 0, SOURCE_TALENT)
      x.SKILL_ADDITIONAL_DMG_SCALING.buff((r.targetBurned) ? targetBurnedExtraScaling : 0, SOURCE_TALENT)
      x.ULT_ADDITIONAL_DMG_SCALING.buff((r.targetBurned) ? targetBurnedExtraScaling : 0, SOURCE_TALENT)
      x.DOT_ATK_SCALING.buff(dotScaling, SOURCE_SKILL)

      // Boost
      buffAbilityDmg(x, SKILL_DMG_TYPE, (e >= 1 && r.enhancedSkill) ? 0.20 : 0, SOURCE_E1)
      x.ELEMENTAL_DMG.buff((e >= 6 && r.targetBurned) ? 0.20 : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)

      x.DOT_CHANCE.set(1.00, SOURCE_SKILL)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: () => {
      return gpuStandardAdditionalDmgAtkFinalizer()
    },
  }
}
