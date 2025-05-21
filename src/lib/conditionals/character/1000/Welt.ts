import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { gpuStandardAdditionalDmgAtkFinalizer, standardAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Gravity Suppression

Basic ATK+1+20

Deals Imaginary DMG equal to 100% of Welt's ATK to a single enemy.

 Single 10

Lv6

Edge of the Void

Skill-1+10

Deals Imaginary DMG equal to 72% of Welt's ATK to a single enemy and further deals DMG 2 extra times, with each time dealing Imaginary DMG equal to 72% of Welt's ATK to a random enemy. On hit, there is a 75% base chance to reduce the enemy's SPD by 10% for 2 turn(s).

 Single 10

Lv10

Synthetic Black Hole

Ultimate120+5

Deals Imaginary DMG equal to 150% of Welt's ATK to all enemies, with a 100% base chance for enemies hit by this ability to be Imprisoned for 1 turn.
Imprisoned enemies have their actions delayed by 40% and SPD reduced by 10%.

 All 20

Lv10

Time Distortion

Talent

When hitting an enemy that is already Slowed, Welt deals Imaginary Additional DMG equal to 60% of his ATK to the enemy.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Gravitational Imprisonment

Technique

After using Welt's Technique, create a Special Dimension that lasts for 15 second(s). Enemies in this Special Dimension have their movement speed reduced by 50%. After entering battle with enemies in the Special Dimension, there is a 100% base chance to Imprison the enemies for 1 turn.
Imprisoned enemies have their actions delayed by 20% and SPD reduced by 10%. Only 1 Dimension Effect created by allies can exist at the same time.


Stat Boosts

 +28.0% ATK
 +14.4% Imaginary DMG Boost
 +10.0% Effect RES

Retribution

When using Ultimate, there is a 100% base chance to increase the DMG taken by the targets by 12% for 2 turn(s).


Judgment

Using Ultimate additionally regenerates 10 Energy.


Punishment

Deals 20% more DMG to enemies inflicted with Weakness Break.



1 Legacy of Honor

After using Ultimate, Welt gets enhanced. Then, the next 2 time(s) he uses Basic ATK or Skill, deals 1 extra instance of Additional DMG to the enemy target. The Additional DMG dealt when using Basic ATK is equal to 50% of Basic ATK DMG multiplier. The Additional DMG dealt when using Skill is equal to 80% of Skill DMG multiplier.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.



2 Conflux of Stars

When his Talent is triggered, Welt regenerates 3 Energy.



3 Prayer of Peace

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Appellation of Justice

When using Skill, increases the base chance of reducing the attacked enemy target's SPD by 35%.



5 Power of Kindness

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Prospect of Glory

When using Skill, deals DMG for 1 extra time to a random enemy.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Welt')
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
  } = Source.character('1004')

  const skillExtraHitsMax = (e >= 6) ? 3 : 2

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.72, 0.792)
  const ultScaling = ult(e, 1.50, 1.62)
  const talentScaling = talent(e, 0.60, 0.66)

  const content: ContentDefinition<typeof defaults> = {
    enemyDmgTakenDebuff: {
      id: 'enemyDmgTakenDebuff',
      formItem: 'switch',
      text: t('Content.enemyDmgTakenDebuff.text'),
      content: t('Content.enemyDmgTakenDebuff.content'),
    },
    enemySlowed: {
      id: 'enemySlowed',
      formItem: 'switch',
      text: t('Content.enemySlowed.text'),
      content: t('Content.enemySlowed.content', { talentScaling: TsUtils.precisionRound(100 * talentScaling) }),
    },
    skillExtraHits: {
      id: 'skillExtraHits',
      formItem: 'slider',
      text: t('Content.skillExtraHits.text'),
      content: t('Content.skillExtraHits.content', { skillScaling: TsUtils.precisionRound(100 * skillScaling) }),
      min: 0,
      max: skillExtraHitsMax,
    },
    e1EnhancedState: {
      id: 'e1EnhancedState',
      formItem: 'switch',
      text: t('Content.e1EnhancedState.text'),
      content: t('Content.e1EnhancedState.content'),
      disabled: (e < 1),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    enemyDmgTakenDebuff: content.enemyDmgTakenDebuff,
  }

  const defaults = {
    enemySlowed: true,
    enemyDmgTakenDebuff: true,
    skillExtraHits: skillExtraHitsMax,
    e1EnhancedState: true,
  }

  const teammateDefaults = {
    enemyDmgTakenDebuff: true,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.ELEMENTAL_DMG.buff((x.a[Key.ENEMY_WEAKNESS_BROKEN]) ? 0.20 : 0, SOURCE_TRACE)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      x.BASIC_ADDITIONAL_DMG_SCALING.buff((r.enemySlowed) ? talentScaling : 0, SOURCE_TALENT)
      x.SKILL_ADDITIONAL_DMG_SCALING.buff((r.enemySlowed) ? talentScaling : 0, SOURCE_TALENT)
      x.ULT_ADDITIONAL_DMG_SCALING.buff((r.enemySlowed) ? talentScaling : 0, SOURCE_TALENT)

      x.BASIC_ADDITIONAL_DMG_SCALING.buff((e >= 1 && r.e1EnhancedState) ? 0.50 * basicScaling : 0, SOURCE_E1)
      x.SKILL_ADDITIONAL_DMG_SCALING.buff((e >= 1 && r.e1EnhancedState) ? 0.80 * skillScaling : 0, SOURCE_E1)

      x.SKILL_ATK_SCALING.buff(r.skillExtraHits * skillScaling, SOURCE_SKILL)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(10 + 10 * r.skillExtraHits, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.VULNERABILITY.buffTeam((m.enemyDmgTakenDebuff) ? 0.12 : 0, SOURCE_TRACE)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: () => {
      return gpuStandardAdditionalDmgAtkFinalizer()
    },
  }
}
