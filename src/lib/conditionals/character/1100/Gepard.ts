import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { gpuStandardDefShieldFinalizer, standardDefShieldFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Fist of Conviction

Basic ATK+1+20

Deals Ice DMG equal to 100% of Gepard's ATK to a single enemy.

 Single 10

Lv6

Daunting Smite

Skill-1+30

Deals Ice DMG equal to 200% of Gepard's ATK to a single enemy, with a 65% base chance to Freeze the enemy for 1 turn(s).
While Frozen, the enemy cannot take action and will take Ice Additional DMG equal to 60% of Gepard's ATK at the beginning of each turn.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

 Single 20

Lv10

Enduring Bulwark

Ultimate100+5

Applies a Shield to all allies, absorbing DMG equal to 45% of Gepard's DEF plus 600 for 3 turn(s).

Lv10

Unyielding Will

Talent

When struck with a killing blow, instead of becoming knocked down, Gepard's HP immediately restores to 50% of his Max HP. This effect can only trigger once per battle.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Comradery

Technique

After Gepard uses his Technique, when the next battle begins, a Shield will be applied to all allies, absorbing DMG equal to 24% of Gepard's DEF plus 150 for 2 turn(s).


Stat Boosts

 +22.4% Ice DMG Boost
 +18.0% Effect RES
 +12.5% DEF

Integrity

Gepard has a higher chance to be attacked by enemies.
Hidden Stat: 3.0


Commander

When "Unyielding Will" is triggered, Gepard's Energy will be restored to 100%.


Grit

Gepard's ATK increases by 35% of his current DEF. This effect will refresh at the start of each turn.



1 Due Diligence

When using Skill, increases the base chance to Freeze the attacked target enemy by 35%.



2 Lingering Cold

After an enemy Frozen by Skill is unfrozen, their SPD is reduced by 20% for 1 turn(s).



3 Never Surrender

Ultimate Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Faith Moves Mountains

When Gepard is in battle, all allies' Effect RES increases by 20%.



5 Cold Iron Fist

Skill Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Unyielding Resolve

When his Talent is triggered, Gepard immediately takes action and restores extra HP equal to 50% of his Max HP.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Gepard')
  const { basic, skill, ult } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5
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
  } = Source.character('1104')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)

  const ultShieldScaling = ult(e, 0.45, 0.48)
  const ultShieldFlat = ult(e, 600, 667.5)

  const defaults = {
    e4TeamResBuff: true,
  }

  const teammateDefaults = {
    e4TeamResBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    e4TeamResBuff: {
      id: 'e4TeamResBuff',
      formItem: 'switch',
      text: t('Content.e4TeamResBuff.text'),
      content: t('Content.e4TeamResBuff.content'),
      disabled: e < 4,
    },
  }
  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    e4TeamResBuff: content.e4TeamResBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)

      x.SHIELD_SCALING.buff(ultShieldScaling, SOURCE_ULT)
      x.SHIELD_FLAT.buff(ultShieldFlat, SOURCE_ULT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.RES.buffTeam((e >= 4 && m.e4TeamResBuff) ? 0.20 : 0, SOURCE_E4)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
      standardDefShieldFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardDefShieldFinalizer(),
    dynamicConditionals: [
      {
        id: 'GepardConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.DEF],
        chainsTo: [Stats.ATK],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          return true
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.DEF, Stats.ATK, this, x, action, context, SOURCE_TRACE,
            (convertibleValue) => convertibleValue * 0.35,
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          return gpuDynamicStatConversion(Stats.DEF, Stats.ATK, this, action, context,
            `0.35 * convertibleValue`,
            `true`,
          )
        },
      },
    ],
  }
}
