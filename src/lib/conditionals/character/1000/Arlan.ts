import { AbilityType, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Lightning Rush

Basic ATK+1+20

Deals Lightning DMG equal to 100% of Arlan's ATK to a single enemy.

 Single 10

Lv6

Shackle Breaker

Skill+30

Consumes Arlan's HP equal to 15% of his Max HP to deal Lightning DMG equal to 240% of Arlan's ATK to a single enemy. If Arlan does not have sufficient HP, his HP will be reduced to 1 after using his Skill.

 Single 20

Lv10

Frenzied Punishment

Ultimate110+5

Deals Lightning DMG equal to 320% of Arlan's ATK to a single enemy and Lightning DMG equal to 160% of Arlan's ATK to enemies adjacent to it.

 Single 20 | Other 20

Lv10

Pain and Anger

Talent

Based on Arlan's current missing HP percentage, gains DMG bonus, up to a maximum increase of 72% DMG dealt by Arlan.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Swift Harvest

Technique

Immediately attacks the enemy. After entering battle, deals Lightning DMG equal to 80% of Arlan's ATK to all enemies.

 Single 20


Stat Boosts

 +28.0% ATK
 +18.0% Effect RES
 +10.0% HP

Revival

If the current HP percentage is 30% or lower when defeating an enemy, immediately restores HP equal to 20% of Max HP.


Endurance

The chance to resist DoT Debuffs increases by 50%.


Repel

Upon entering battle, if Arlan's HP percentage is less than or equal to 50%, he can nullify all DMG received except for DoTs until he is attacked.



1 To the Bitter End

When HP percentage is lower than or equal to 50% of Max HP, increases DMG dealt by Skill by 10%.



2 Breaking Free

Using Skill or Ultimate removes 1 debuff from this unit.



3 Power Through

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Turn the Tables

When struck by a killing blow after entering battle, instead of becoming knocked down, Arlan immediately restores his HP to 25% of his Max HP. This effect is automatically removed after it is triggered once or after 2 turn(s) have elapsed.



5 Hammer and Tongs

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Self-Sacrifice

When the current HP percentage drops to 50% or below, Ultimate deals 20% more DMG, and the DMG multiplier for adjacent targets is raised to the same level as that for the primary target.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Arlan')
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
  } = Source.character('1008')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.40, 2.64)
  const ultScaling = ult(e, 3.20, 3.456)

  const talentMissingHpDmgBoostMax = talent(e, 0.72, 0.792)

  const defaults = {
    selfCurrentHpPercent: 1.00,
  }

  const content: ContentDefinition<typeof defaults> = {
    selfCurrentHpPercent: {
      id: 'selfCurrentHpPercent',
      formItem: 'slider',
      text: t('Content.selfCurrentHpPercent.text'),
      content: t('Content.selfCurrentHpPercent.content', { talentMissingHpDmgBoostMax: TsUtils.precisionRound(100 * talentMissingHpDmgBoostMax) }),
      min: 0.01,
      max: 1.0,
      percent: true,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => [],
    defaults: () => defaults,
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.ELEMENTAL_DMG.buff(Math.min(talentMissingHpDmgBoostMax, 1 - r.selfCurrentHpPercent), SOURCE_TALENT)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      // Boost
      buffAbilityDmg(x, SKILL_DMG_TYPE, (e >= 1 && r.selfCurrentHpPercent <= 0.50) ? 0.10 : 0, SOURCE_E1)
      buffAbilityDmg(x, ULT_DMG_TYPE, (e >= 6 && r.selfCurrentHpPercent <= 0.50) ? 0.20 : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
  }
}
