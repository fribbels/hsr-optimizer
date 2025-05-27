import { AbilityType, ADDITIONAL_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
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

Cloudfencer Art: Starshine

Basic ATK+1+20

Deals Physical DMG equal to 100% of Sushang's ATK to a single enemy.

 Single 10

Lv6

Cloudfencer Art: Mountainfall

Skill-1+30

Deals Physical DMG equal to 210% of Sushang's ATK to a single enemy. In addition, there is a 33% chance to trigger Sword Stance on the final hit, dealing Physical Additional DMG equal to 100% of Sushang's ATK to the enemy.
If the enemy is inflicted with Weakness Break, Sword Stance is guaranteed to trigger.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

 Single 20

Lv10

Shape of Taixu: Dawn Herald

Ultimate120+5

Deals Physical DMG equal to 320% of Sushang's ATK to a single enemy target, and she immediately takes action. In addition, Sushang's ATK increases by 30% and using her Skill has 2 extra chances to trigger Sword Stance for 2 turn(s).
Sword Stance triggered from the extra chances deals 50% of the original DMG.

 Single 30

Lv10

Dancing Blade

Talent

When an enemy has their Weakness Broken on the field, Sushang's SPD increases by 20% for 2 turn(s).

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Cloudfencer Art: Warcry

Technique

Immediately attacks the enemy. Upon entering battle, Sushang deals Physical DMG equal to 80% of her ATK to all enemies.

 Single 20


Stat Boosts

 +28.0% ATK
 +18.0% HP
 +12.5% DEF

Guileless

When current HP percentage is 50% or lower, reduces the chance of being attacked by enemies.
Hidden Stat: 0.5


Riposte

For every Sword Stance triggered, the DMG dealt by Sword Stance increases by 2.5%. Stacks up to 10 time(s).


Vanquisher

After using Basic ATK or Skill, if there are enemies on the field that are Weakness Broken, Sushang's action advances by 15%.



1 Cut With Ease

After using Skill against a Weakness Broken enemy, regenerates 1 Skill Point.



2 Refine in Toil

After Sword Stance is triggered, the DMG taken by Sushang is reduced by 20% for 1 turn.



3 Rise From Fame

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Cleave With Heart

Sushang's Break Effect increases by 40%.



5 Prevail via Taixu

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Dwell Like Water

Talent's SPD Boost is stackable and can stack up to 2 times. Additionally, after entering battle, Sushang immediately gains 1 stack of her Talent's SPD Boost.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sushang')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5
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
  } = Source.character('1206')

  const talentSpdBuffValue = talent(e, 0.20, 0.21)
  const ultBuffedAtk = ult(e, 0.30, 0.324)
  const talentSpdBuffStacksMax = (e >= 6) ? 2 : 1

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.10, 2.31)
  const skillExtraHitScaling = skill(e, 1.00, 1.10)
  const ultScaling = ult(e, 3.20, 3.456)

  const defaults = {
    ultBuffedState: true,
    e2DmgReductionBuff: true,
    skillExtraHits: 3,
    skillTriggerStacks: 10,
    talentSpdBuffStacks: talentSpdBuffStacksMax,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultBuffedState: {
      id: 'ultBuffedState',
      formItem: 'switch',
      text: t('Content.ultBuffedState.text'),
      content: t('Content.ultBuffedState.content', { ultBuffedAtk: TsUtils.precisionRound(100 * ultBuffedAtk) }),
    },
    skillExtraHits: {
      id: 'skillExtraHits',
      formItem: 'slider',
      text: t('Content.skillExtraHits.text'),
      content: t('Content.skillExtraHits.content'),
      min: 0,
      max: 3,
    },
    skillTriggerStacks: {
      id: 'skillTriggerStacks',
      formItem: 'slider',
      text: t('Content.skillTriggerStacks.text'),
      content: t('Content.skillTriggerStacks.content'),
      min: 0,
      max: 10,
    },
    talentSpdBuffStacks: {
      id: 'talentSpdBuffStacks',
      formItem: 'slider',
      text: t('Content.talentSpdBuffStacks.text'),
      content: t('Content.talentSpdBuffStacks.content', { talentSpdBuffValue: TsUtils.precisionRound(100 * talentSpdBuffValue) }),
      min: 0,
      max: talentSpdBuffStacksMax,
    },
    e2DmgReductionBuff: {
      id: 'e2DmgReductionBuff',
      formItem: 'switch',
      text: t('Content.e2DmgReductionBuff.text'),
      content: t('Content.e2DmgReductionBuff.content'),
      disabled: e < 2,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.BE.buff((e >= 4) ? 0.40 : 0, SOURCE_E4)
      x.ATK_P.buff((r.ultBuffedState) ? ultBuffedAtk : 0, SOURCE_ULT)
      x.SPD_P.buff((r.talentSpdBuffStacks) * talentSpdBuffValue, SOURCE_TALENT)

      /*
       * Scaling
       * Trace only affects stance damage not skill damage - boost this based on proportion of stance : total skill dmg
       */
      const originalSkillScaling = skillScaling
      let stanceSkillScaling = 0
      stanceSkillScaling += (r.skillExtraHits >= 1) ? skillExtraHitScaling : 0
      stanceSkillScaling += (r.ultBuffedState && r.skillExtraHits >= 2) ? skillExtraHitScaling * 0.5 : 0
      stanceSkillScaling += (r.ultBuffedState && r.skillExtraHits >= 3) ? skillExtraHitScaling * 0.5 : 0

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(originalSkillScaling, SOURCE_SKILL)
      x.SKILL_ADDITIONAL_DMG_SCALING.buff(stanceSkillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      // Boost
      buffAbilityDmg(x, ADDITIONAL_DMG_TYPE, r.skillTriggerStacks * 0.025, SOURCE_SKILL)
      x.DMG_RED_MULTI.multiply((e >= 2 && r.e2DmgReductionBuff) ? (1 - 0.20) : 1, SOURCE_E2)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardAdditionalDmgAtkFinalizer(),
  }
}
