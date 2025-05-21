import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { gpuStandardAdditionalDmgAtkFinalizer, standardAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Roaring Thunderclap

Basic ATK+1+20

Deals Lightning DMG equal to 100% of Serval's ATK to a single enemy.

 Single 10

Lv6

Lightning Flash

Skill-1+30

Deals Lightning DMG equal to 140% of Serval's ATK to a single enemy and Lightning DMG equal to 60% of Serval's ATK to enemies adjacent to it, with a 80% base chance for enemies hit to become Shocked for 2 turn(s).
While Shocked, enemies take Lightning DoT equal to 104% of Serval's ATK at the beginning of each turn.

 Single 20 | Other 10

Lv10

Here Comes the Mechanical Fever

Ultimate100+5

Deals Lightning DMG equal to 180% of Serval's ATK to all enemies. Enemies already Shocked will extend the duration of their Shock state by 2 turn(s).

 All 20

Lv10
Galvanic Chords

Talent

After Serval attacks, deals Lightning Additional DMG equal to 72% of Serval's ATK to all Shocked enemies.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Good Night, Belobog

Technique

Immediately attacks the enemy. After entering battle, deals Lightning DMG equal to 50% of Serval's ATK to a random enemy, with a 100% base chance for all enemies to become Shocked for 3 turn(s).
While Shocked, enemies will take Lightning DoT equal to 50% of Serval's ATK at the beginning of each turn.

 Single 20


Stat Boosts

 +18.7% CRIT Rate
 +18.0% Effect Hit Rate
 +10.0% Effect RES

Rock 'n' Roll

When using skill, increases the base chance for the attacked enemy target to become Shocked by 20%.


String Vibration

At the start of the battle, immediately regenerates 15 Energy.


Mania

Upon defeating an enemy, ATK is increased by 20% for 2 turn(s).



1 Echo Chamber

Basic ATK deals Lightning DMG equal to 60% of Basic ATK DMG to a random target adjacent to the target enemy.



2 Encore!

Every time Serval's Talent is triggered to deal Additional DMG, she regenerates 4 Energy.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.



3 Listen, the Heartbeat of the Gears

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Make Some Noise!

Ultimate has a 100% base chance to apply Shock to any enemies not currently Shocked. This Shock has the same effects as the one applied by Skill.



5 Belobog's Loudest Roar!

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 This Song Rocks to Heaven!

Serval deals 30% more DMG to Shocked enemies.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Serval')
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
  } = Source.character('1103')

  const talentExtraDmgScaling = talent(e, 0.72, 0.792)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.40, 1.54)
  const ultScaling = ult(e, 1.80, 1.944)
  const dotScaling = skill(e, 1.04, 1.144)

  const defaults = {
    targetShocked: true,
    enemyDefeatedBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    targetShocked: {
      id: 'targetShocked',
      formItem: 'switch',
      text: t('Content.targetShocked.text'),
      content: t('Content.targetShocked.content', { talentExtraDmgScaling: TsUtils.precisionRound(100 * talentExtraDmgScaling) }),
    },
    enemyDefeatedBuff: {
      id: 'enemyDefeatedBuff',
      formItem: 'switch',
      text: t('Content.enemyDefeatedBuff.text'),
      content: t('Content.enemyDefeatedBuff.content'),
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.ATK_P.buff((r.enemyDefeatedBuff) ? 0.20 : 0, SOURCE_TRACE)

      // Scaling;
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.DOT_ATK_SCALING.buff(dotScaling, SOURCE_SKILL)

      x.BASIC_ADDITIONAL_DMG_SCALING.buff((r.targetShocked) ? talentExtraDmgScaling : 0, SOURCE_TALENT)
      x.SKILL_ADDITIONAL_DMG_SCALING.buff((r.targetShocked) ? talentExtraDmgScaling : 0, SOURCE_TALENT)
      x.ULT_ADDITIONAL_DMG_SCALING.buff((r.targetShocked) ? talentExtraDmgScaling : 0, SOURCE_TALENT)

      // Boost
      x.ELEMENTAL_DMG.buff((e >= 6 && r.targetShocked) ? 0.30 : 0, SOURCE_ULT)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      x.DOT_CHANCE.set(1.00, SOURCE_SKILL)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardAdditionalDmgAtkFinalizer(),
  }
}
