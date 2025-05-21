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

Thwack

Basic ATK+1+20

Deals Quantum DMG equal to 100% of Seele's ATK to a single enemy.

 Single 10

Lv6

Sheathed Blade

Skill-1+30

Increases Seele's SPD by 25% for 2 turn(s) and deals Quantum DMG equal to 220% of Seele's ATK to a single enemy.

 Single 20

Lv10

Butterfly Flurry

Ultimate120+5

Seele enters the Amplification state and deals Quantum DMG equal to 425% of her ATK to a single enemy.

 Single 30

Lv10

Resurgence

Talent

Enters the Amplification state upon defeating an enemy with Basic ATK, Skill, or Ultimate, and receives an extra turn. While in the Amplification state, the DMG of Seele's attacks increases by 80% for 1 turn(s).
Enemies defeated in the extra turn provided by "Resurgence" will not trigger another "Resurgence."

Extra Turn
Gain 1 extra turn that won't expend your remaining turns when taking action. During this extra turn, no Ultimate can be used.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Phantom Illusion

Technique

After using her Technique, Seele gains Stealth for 20 second(s). While Stealth is active, Seele cannot be detected by enemies. And when entering battle by attacking enemies, Seele will immediately enter the Amplification state.


Stat Boosts

 +28.0% ATK
 +24.0% CRIT DMG
 +12.5% DEF

Nightshade

When current HP percentage is 50% or lower, reduces the chance of being attacked by enemies.
Hidden Stat: 0.5


Lacerate

While Seele is in the Amplification state, her Quantum RES PEN increases by 20%.


Rippling Waves

After using a Basic ATK, Seele's next action advances by 20%.



1 Extirpating Slash

When dealing DMG to an enemy whose HP percentage is 80% or lower, CRIT Rate increases by 15%.



2 Dancing Butterfly

The SPD Boost effect of Seele's Skill can stack up to 2 time(s).



3 Dazzling Tumult

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Flitting Phantasm

Seele regenerates 15 Energy when she defeats an enemy.



5 Piercing Shards

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Shattering Shambles

After Seele uses Ultimate, inflict the attacked enemy with "Butterfly Flurry" for 1 turn(s). Enemies in "Butterfly Flurry" will additionally take 1 instance of Quantum Additional DMG equal to 15% of Seele's Ultimate DMG every time they are attacked. If the target is defeated by the "Butterfly Flurry" state's Additional DMG triggered by other allies' attacks, Seele's Talent will not be triggered.
When Seele is knocked down, the "Butterfly Flurry" inflicted on the enemies will be removed.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Seele')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('1102')

  const buffedStateDmgBuff = talent(e, 0.80, 0.88)
  const speedBoostStacksMax = (e >= 2 ? 2 : 1)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.20, 2.42)
  const ultScaling = ult(e, 4.25, 4.59)

  const defaults = {
    buffedState: true,
    speedBoostStacks: speedBoostStacksMax,
    e1EnemyHp80CrBoost: false,
    e6UltTargetDebuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    buffedState: {
      id: 'buffedState',
      formItem: 'switch',
      text: t('Content.buffedState.text'),
      content: t('Content.buffedState.content', { buffedStateDmgBuff: TsUtils.precisionRound(100 * buffedStateDmgBuff) }),
    },
    speedBoostStacks: {
      id: 'speedBoostStacks',
      formItem: 'slider',
      text: t('Content.speedBoostStacks.text'),
      content: t('Content.speedBoostStacks.content'),
      min: 0,
      max: speedBoostStacksMax,
    },
    e1EnemyHp80CrBoost: {
      id: 'e1EnemyHp80CrBoost',
      formItem: 'switch',
      text: t('Content.e1EnemyHp80CrBoost.text'),
      content: t('Content.e1EnemyHp80CrBoost.content'),
      disabled: e < 1,
    },
    e6UltTargetDebuff: {
      id: 'e6UltTargetDebuff',
      formItem: 'switch',
      text: t('Content.e6UltTargetDebuff.text'),
      content: t('Content.e6UltTargetDebuff.content'),
      disabled: e < 6,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.CR.buff((e >= 1 && r.e1EnemyHp80CrBoost) ? 0.15 : 0, SOURCE_E1)
      x.SPD_P.buff(0.25 * r.speedBoostStacks, SOURCE_SKILL)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      x.BASIC_ADDITIONAL_DMG_SCALING.buff((e >= 6 && r.e6UltTargetDebuff) ? 0.15 * x.a[Key.ULT_ATK_SCALING] : 0, Source.NONE)
      x.SKILL_ADDITIONAL_DMG_SCALING.buff((e >= 6 && r.e6UltTargetDebuff) ? 0.15 * x.a[Key.ULT_ATK_SCALING] : 0, Source.NONE)
      x.ULT_ADDITIONAL_DMG_SCALING.buff((e >= 6 && r.e6UltTargetDebuff) ? 0.15 * x.a[Key.ULT_ATK_SCALING] : 0, Source.NONE)

      // Boost
      x.ELEMENTAL_DMG.buff((r.buffedState) ? buffedStateDmgBuff : 0, SOURCE_TALENT)
      x.RES_PEN.buff((r.buffedState) ? 0.20 : 0, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      // TODO: Seele's E6 should have a teammate effect but its kinda hard to calc
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => gpuStandardAdditionalDmgAtkFinalizer(),
  }
}
