import { AbilityType, ASHBLAZING_ATK_STACK, SKILL_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { boostAshblazingAtkP, gpuBoostAshblazingAtkP } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Sawblade Tuning

Basic ATK+1+20

Deals Fire DMG equal to 100% of Himeko's ATK to a single enemy.

 Single 10

Lv6

Molten Detonation

Skill-1+30

Deals Fire DMG equal to 200% of Himeko's ATK to a single enemy and Fire DMG equal to 80% of Himeko's ATK to enemies adjacent to it.

 Single 20 | Other 10

Lv10

Heavenly Flare

Ultimate120+5

Deals Fire DMG equal to 230% of Himeko's ATK to all enemies. Himeko regenerates 5 extra Energy for each enemy defeated.

 All 20

Lv10

Victory Rush

Talent+10

When an enemy is inflicted with Weakness Break, Himeko gains 1 point of Charge (max 3 points).
If Himeko is fully Charged when an ally performs an attack, Himeko immediately performs 1 Follow-up ATK and deals Fire DMG equal to 140% of her ATK to all enemies, consuming all Charge points.
At the start of the battle, Himeko gains 1 point of Charge.

 All 10

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Incomplete Combustion

Technique

After using Technique, creates a Special Dimension that lasts for 15 second(s). After entering battle with enemies in the Special Dimension, there is a 100% base chance to increase Fire DMG taken by enemies by 10% for 2 turn(s). Only 1 Dimension Effect created by allies can exist at the same time.


Stat Boosts

 +22.4% Fire DMG Boost
 +18.0% ATK
 +10.0% Effect RES

Starfire

After using an attack, there is a 50% base chance to inflict Burn on enemies, lasting for 2 turn(s).
When afflicted with Burn, enemies take Fire DoT equal to 30% of Himeko's ATK at the start of each turn.


Magma

Skill deals 20% more DMG to enemies currently afflicted with Burn.


Benchmark

When current HP percentage is 80% or higher, CRIT Rate increases by 15%.



1 Childhood

After "Victory Rush" is triggered, Himeko's SPD increases by 20% for 2 turn(s).



2 Convergence

Deals 15% more DMG to enemies whose HP percentage is 50% or less.



3 Poised

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Dedication

When Himeko's Skill inflicts Weakness Break on an enemy, she gains 1 extra point(s) of Charge.



5 Aspiration

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Trailblaze!

Ultimate deals 2 extra instances of Fire DMG equal to 40% of the original DMG to one random enemy.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Himeko')
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
  } = Source.character('1003')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)
  const ultScaling = ult(e, 2.30, 2.484)
  const fuaScaling = talent(e, 1.40, 1.54)
  const dotScaling = 0.30

  const hitMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.20 + 2 * 0.20 + 3 * 0.20 + 4 * 0.40), // 0.168
    3: ASHBLAZING_ATK_STACK * (2 * 0.20 + 5 * 0.20 + 8 * 0.20 + 8 * 0.40), // 0.372
    5: ASHBLAZING_ATK_STACK * (3 * 0.20 + 8 * 0.20 + 8 * 0.20 + 8 * 0.40), // 0.42
  }

  const defaults = {
    targetBurned: true,
    selfCurrentHp80Percent: true,
    e1TalentSpdBuff: false,
    e2EnemyHp50DmgBoost: true,
    e6UltExtraHits: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    targetBurned: {
      id: 'targetBurned',
      formItem: 'switch',
      text: t('Content.targetBurned.text'),
      content: t('Content.targetBurned.content'),
    },
    selfCurrentHp80Percent: {
      id: 'selfCurrentHp80Percent',
      formItem: 'switch',
      text: t('Content.selfCurrentHp80Percent.text'),
      content: t('Content.selfCurrentHp80Percent.content'),
    },
    e1TalentSpdBuff: {
      id: 'e1TalentSpdBuff',
      formItem: 'switch',
      text: t('Content.e1TalentSpdBuff.text'),
      content: t('Content.e1TalentSpdBuff.content'),
      disabled: e < 1,
    },
    e2EnemyHp50DmgBoost: {
      id: 'e2EnemyHp50DmgBoost',
      formItem: 'switch',
      text: t('Content.e2EnemyHp50DmgBoost.text'),
      content: t('Content.e2EnemyHp50DmgBoost.content'),
      disabled: e < 2,
    },
    e6UltExtraHits: {
      id: 'e6UltExtraHits',
      formItem: 'slider',
      text: t('Content.e6UltExtraHits.text'),
      content: t('Content.e6UltExtraHits.content'),
      min: 0,
      max: 2,
      disabled: e < 6,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA, AbilityType.DOT],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.CR.buff((r.selfCurrentHp80Percent) ? 0.15 : 0, SOURCE_TRACE)
      x.SPD_P.buff((e >= 1 && r.e1TalentSpdBuff) ? 0.20 : 0, SOURCE_E1)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.ULT_ATK_SCALING.buff((e >= 6) ? r.e6UltExtraHits * ultScaling * 0.40 : 0, SOURCE_E6)
      x.FUA_ATK_SCALING.buff(fuaScaling, SOURCE_TALENT)
      x.DOT_ATK_SCALING.buff(dotScaling, SOURCE_TRACE)

      // Boost
      buffAbilityDmg(x, SKILL_DMG_TYPE, (r.targetBurned) ? 0.20 : 0, SOURCE_TRACE)
      x.ELEMENTAL_DMG.buff((e >= 2 && r.e2EnemyHp50DmgBoost) ? 0.15 : 0, SOURCE_E2)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(10, SOURCE_TALENT)

      x.DOT_CHANCE.set(0.50, SOURCE_TRACE)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkP(x, action, context, hitMultiByTargets[context.enemyCount])
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => gpuBoostAshblazingAtkP(hitMultiByTargets[context.enemyCount]),
  }
}
