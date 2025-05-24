import { AbilityType, BASIC_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardAdditionalDmgAtkFinalizer, standardAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Dislodged

Basic ATK+1+20

Tingyun deals Lightning DMG equal to 100% of her ATK to a single enemy.

 Single 10

Lv6

Soothing Melody

Skill-1+30

Grants a single ally with Benediction to increase their ATK by 50%, up to 25% of Tingyun's current ATK.
When the ally with Benediction attacks, they will deal Lightning Additional DMG equal to 40% of that ally's ATK for 1 time.
Benediction lasts for 3 turn(s) and is only effective on the most recent receiver of Tingyun's Skill.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

Lv10

Amidst the Rejoicing Clouds

Ultimate130+5

Regenerates 50 Energy for a single ally and increases the target's DMG by 50% for 2 turn(s).

Lv10

Violet Sparknado

Talent

When an enemy is attacked by Tingyun, the ally with Benediction immediately deals Lightning Additional DMG equal to 60% of that ally's ATK to the same enemy.

Additional DMG
Causes the target being hit to take extra DMG, which is not considered an attack.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Gentle Breeze

Technique

Tingyun immediately regenerates 50 Energy upon using her Technique.


Stat Boosts

 +28.0% ATK
 +22.5% DEF
 +8.0% Lightning DMG Boost

Nourished Joviality

Tingyun's SPD increases by 20% for 1 turn after using Skill.


Knell Subdual

DMG dealt by Basic ATK increases by 40%.


Jubilant Passage

Tingyun immediately regenerates 5 Energy at the start of her turn.



1 Windfall of Lucky Springs

After using their Ultimate, the ally with Benediction gains a 20% increase in SPD for 1 turn.



2 Gainfully Gives, Givingly Gains

The ally with Benediction regenerates 5 Energy after defeating an enemy. This effect can only be triggered once per turn.



3 Halcyon Bequest

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Jovial Versatility

The DMG multiplier provided by Benediction increases by 20%.



5 Sauntering Coquette

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Peace Brings Wealth to All

Ultimate regenerates 10 more Energy for the target ally.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Tingyun')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
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
  } = Source.character('1202')

  const skillAtkBoostMax = skill(e, 0.25, 0.27)
  const ultDmgBoost = ult(e, 0.50, 0.56)
  const skillAtkBoostScaling = skill(e, 0.50, 0.55)
  const skillLightningDmgBoostScaling = skill(e, 0.40, 0.44) + ((e >= 4) ? 0.20 : 0)
  const talentScaling = talent(e, 0.60, 0.66) + ((e >= 4) ? 0.20 : 0)

  const basicScaling = basic(e, 1.00, 1.10)

  const defaults = {
    benedictionBuff: false,
    skillSpdBuff: false,
    ultSpdBuff: false,
    ultDmgBuff: false,
  }

  const teammateDefaults = {
    benedictionBuff: true,
    ultSpdBuff: false,
    ultDmgBuff: true,
    teammateAtkBuffValue: skillAtkBoostScaling,
  }

  const content: ContentDefinition<typeof defaults> = {
    benedictionBuff: {
      id: 'benedictionBuff',
      formItem: 'switch',
      text: t('Content.benedictionBuff.text'),
      content: t('Content.benedictionBuff.content', {
        skillAtkBoostScaling: TsUtils.precisionRound(100 * skillAtkBoostScaling),
        skillAtkBoostMax: TsUtils.precisionRound(100 * skillAtkBoostMax),
        skillLightningDmgBoostScaling: TsUtils.precisionRound(100 * skillLightningDmgBoostScaling),
      }),
    },
    skillSpdBuff: {
      id: 'skillSpdBuff',
      formItem: 'switch',
      text: t('Content.skillSpdBuff.text'),
      content: t('Content.skillSpdBuff.content'),
    },
    ultDmgBuff: {
      id: 'ultDmgBuff',
      formItem: 'switch',
      text: t('Content.ultDmgBuff.text'),
      content: t('Content.ultDmgBuff.content', { ultDmgBoost: TsUtils.precisionRound(100 * ultDmgBoost) }),
    },
    ultSpdBuff: {
      id: 'ultSpdBuff',
      formItem: 'switch',
      text: t('Content.ultSpdBuff.text'),
      content: t('Content.ultSpdBuff.content'),
      disabled: e < 1,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    benedictionBuff: content.benedictionBuff,
    teammateAtkBuffValue: {
      id: 'teammateAtkBuffValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateAtkBuffValue.text'),
      content: t('TeammateContent.teammateAtkBuffValue.content', {
        skillAtkBoostScaling: TsUtils.precisionRound(100 * skillAtkBoostScaling),
        skillAtkBoostMax: TsUtils.precisionRound(100 * skillAtkBoostMax),
        skillLightningDmgBoostScaling: TsUtils.precisionRound(100 * skillLightningDmgBoostScaling),
      }),
      min: 0,
      max: skillAtkBoostScaling,
      percent: true,
    },
    ultDmgBuff: content.ultDmgBuff,
    ultSpdBuff: content.ultSpdBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.SPD_P.buff((r.skillSpdBuff) ? 0.20 : 0, SOURCE_TRACE)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)

      x.BASIC_ADDITIONAL_DMG_SCALING.buff((r.benedictionBuff) ? skillLightningDmgBoostScaling + talentScaling : 0, SOURCE_SKILL)

      // Boost
      buffAbilityDmg(x, BASIC_DMG_TYPE, 0.40, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.SPD_P.buffSingle((e >= 1 && m.ultSpdBuff) ? 0.20 : 0, SOURCE_E1)

      x.ELEMENTAL_DMG.buffSingle((m.ultDmgBuff) ? ultDmgBoost : 0, SOURCE_ULT)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.ATK_P.buffSingle((t.benedictionBuff) ? t.teammateAtkBuffValue : 0, SOURCE_SKILL)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => gpuStandardAdditionalDmgAtkFinalizer(),
    dynamicConditionals: [
      {
        id: 'TingyunAtkConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.ATK],
        chainsTo: [Stats.ATK],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.benedictionBuff
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.ATK, Stats.ATK, this, x, action, context, SOURCE_TRACE,
            (convertibleValue) => convertibleValue * skillAtkBoostMax,
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.ATK, Stats.ATK, this, action, context,
            `${skillAtkBoostMax} * convertibleValue`,
            `${wgslTrue(r.benedictionBuff)}`,
          )
        },
      },
    ],
  }
}
