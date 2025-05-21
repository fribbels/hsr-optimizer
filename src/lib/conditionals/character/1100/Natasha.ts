import { AbilityType, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardHpHealFinalizer, standardHpHealFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Behind the Kindness

Basic ATK+1+20

Deals Physical DMG equal to 100% of Natasha's ATK to a single enemy.

 Single 10

Lv6

Love, Heal, and Choose

Skill-1+30

Restores a single ally for 10.5% of Natasha's Max HP plus 280. Restores the ally for another 7.2% of Natasha's Max HP plus 192 at the beginning of each turn for 2 turn(s).

Lv10

Gift of Rebirth

Ultimate90+5

Heals all allies for 13.8% of Natasha's Max HP plus 368.

Lv10

Innervation

Talent

When healing allies with HP percentage at 30% or lower, increases Natasha's Outgoing Healing by 50%. This effect also works on continuous healing.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Hypnosis Research

Technique

Immediately attacks the enemy. After entering battle, deals Physical DMG equal to 80% of Natasha's ATK to a random enemy, with a 100% base chance to Weaken all enemies.
While Weakened, enemies deal 30% less DMG to allies for 1 turn(s).

 Single 20


Stat Boosts

 +28.0% HP
 +18.0% Effect RES
 +12.5% DEF

Soothe

When using Skill, dispels 1 debuff(s) from one designated ally.


Healer

Natasha's Outgoing Healing increases by 10%.


Recuperation

Increases the duration of Skill's continuous healing effect for 1 turn(s).



1 Pharmacology Expertise

After being attacked, if the current HP percentage is 30% or lower, heals self for 1 time to restore HP by an amount equal to 15% of Max HP plus 400. This effect can only be triggered 1 time per battle.



2 Clinical Research

When Natasha uses her Ultimate, grant continuous healing for 1 turn(s) to allies whose HP percentage is at 30% or lower. And at the beginning of their turn, their HP is restored by an amount equal to 6% of Natasha's Max HP plus 160.



3 The Right Cure

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Miracle Cure

After being attacked, regenerates 5 extra Energy.



5 Preventive Treatment

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Doctor's Grace

Natasha's Basic ATK additionally deals Physical DMG equal to 40% of her Max HP.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Natasha')
  const tHeal = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealAbility')
  const { basic, skill, ult } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
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
  } = Source.character('1105')

  const basicScaling = basic(e, 1.00, 1.10)

  const ultHealScaling = ult(e, 0.138, 0.1472)
  const ultHealFlat = ult(e, 368, 409.4)

  const skillHealScaling = skill(e, 0.105, 0.112)
  const skillHealFlat = skill(e, 280, 311.5)

  const content: ContentDefinition<typeof defaults> = {
    healAbility: {
      id: 'healAbility',
      formItem: 'select',
      text: tHeal('Text'),
      content: tHeal('Content'),
      options: [
        { display: tHeal('Skill'), value: SKILL_DMG_TYPE, label: tHeal('Skill') },
        { display: tHeal('Ult'), value: ULT_DMG_TYPE, label: tHeal('Ult') },
      ],
      fullWidth: true,
    },
  }

  const defaults = {
    healAbility: ULT_DMG_TYPE,
  }

  return {
    activeAbilities: [AbilityType.BASIC],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.OHB.buff(0.10, SOURCE_TRACE)

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.BASIC_HP_SCALING.buff((e >= 6) ? 0.40 : 0, SOURCE_E6)

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

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardHpHealFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardHpHealFinalizer(),
  }
}
