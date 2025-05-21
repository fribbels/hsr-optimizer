import { AbilityType, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardHpHealFinalizer, standardHpHealFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Novaburst

Basic ATK+1+20

Deals Quantum DMG equal to 50% of Fu Xuan's Max HP to a single enemy.

 Single 10

Lv6

Known by Stars, Shown by Hearts

Skill-1+30

Activates Matrix of Prescience, via which Fu Xuan's teammates will Distribute 65% of the DMG they receive (before this DMG is mitigated by any Shields) to Fu Xuan for 3 turn(s).
While affected by Matrix of Prescience, all ally targets gain the Knowledge effect, which increases their respective Max HP by 6% of Fu Xuan's Max HP, and increases CRIT Rate by 12%.
When Fu Xuan is knocked down, the Matrix of Prescience will be dispelled.
Hidden Stat: 0

Distribute
Before DMG is calculated, distribute a part of the attacking unit's DMG to another target (or multiple other targets), with the target hit by the attack taking the rest of the DMG. DMG distributed to other targets cannot be distributed again.

Lv10

Woes of Many Morphed to One

Ultimate135+5

Deals Quantum DMG equal to 100% of Fu Xuan's Max HP to all enemies and obtains 1 trigger count for the HP Restore effect granted by Fu Xuan's Talent.

 All 20

Lv10

Bleak Breeds Bliss

Talent

While Fu Xuan is still active in battle, Misfortune Avoidance is applied to the entire team. With Misfortune Avoidance, allies take 18% less DMG.
When Fu Xuan's current HP percentage falls to 50% of her Max HP or less, HP Restore will be triggered for Fu Xuan, restoring her HP by 90% of the amount of HP she is currently missing. This effect cannot be triggered if she receives a killing blow. This effect has 1 trigger count by default and can hold up to a maximum of 2 trigger counts.

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


Of Fortune Comes Fate

Technique

After the Technique is used, all team members receive a Barrier, lasting for 20 seconds. This Barrier can block all enemy attacks, and the team will not enter battle when attacked. Entering battle while the Barrier is active will have Fu Xuan automatically activate Matrix of Prescience at the start of the battle, lasting for 2 turn(s).


Stat Boosts

 +18.7% CRIT Rate
 +18.0% HP
 +10.0% Effect RES

Taiyi, the Macrocosmic

When Matrix of Prescience is active, Fu Xuan will regenerate 20 extra Energy when she uses her Skill.


Dunjia, the Metamystic

When Fu Xuan's Ultimate is used, heals all other allies by an amount equal to 5% of Fu Xuan's Max HP plus 133.


Liuren, the Sexagenary

If a target enemy applies Crowd Control debuffs to allies while the "Matrix of Prescience" is active, all allies will resist all Crowd Control debuffs applied by the enemy target during the current action. This effect can only be triggered once. When "Matrix of Prescience" is activated again, the number of times this effect can be triggered will reset.

Crowd Control debuff
Freeze, Entanglement, Imprisonment, Dominated, Outrage, Strong Reverberation, Alien Dream, Snarelock, Terrified.



1 Dominus Pacis

The Knowledge effect increases CRIT DMG by 30%.



2 Optimus Felix

If any ally target is struck by a killing blow while "Matrix of Prescience" is active, then all ally targets who were struck by a killing blow during this action will not be knocked down, and 70% of their Max HP is immediately restored. This effect can trigger 1 time per battle.



3 Apex Nexus

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



4 Fortuna Stellaris

When other allies under Matrix of Prescience are attacked, Fu Xuan regenerates 5 Energy.



5 Arbiter Primus

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



6 Omnia Vita

Once Matrix of Prescience is activated, it will keep a tally of the total HP lost by all team members in the current battle. The DMG dealt by Fu Xuan's Ultimate will increase by 200% of this tally of HP loss.
This tally is also capped at 120% of Fu Xuan's Max HP and the tally value will reset and re-accumulate after Fu Xuan's Ultimate is used.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.FuXuan')
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
  } = Source.character('1208')

  const skillCrBuffValue = skill(e, 0.12, 0.132)
  const skillHpBuffValue = skill(e, 0.06, 0.066)
  const talentDmgReductionValue = talent(e, 0.18, 0.196)

  const basicScaling = basic(e, 0.50, 0.55)
  const ultScaling = ult(e, 1.00, 1.08)

  const ultHealScaling = 0.05
  const ultHealFlat = 133

  const defaults = {
    skillActive: true,
    talentActive: true,
    e6TeamHpLostPercent: 1.2,
  }

  const teammateDefaults = {
    skillActive: true,
    talentActive: true,
    teammateHPValue: 8000,
  }

  const content: ContentDefinition<typeof defaults> = {
    talentActive: {
      id: 'talentActive',
      formItem: 'switch',
      text: t('Content.talentActive.text'),
      content: t('Content.talentActive.content', { talentDmgReductionValue: TsUtils.precisionRound(100 * talentDmgReductionValue) }),
    },
    skillActive: {
      id: 'skillActive',
      formItem: 'switch',
      text: t('Content.skillActive.text'),
      content: t('Content.skillActive.content', {
        skillHpBuffValue: TsUtils.precisionRound(100 * skillHpBuffValue),
        skillCrBuffValue: TsUtils.precisionRound(100 * skillCrBuffValue),
      }),
    },
    e6TeamHpLostPercent: {
      id: 'e6TeamHpLostPercent',
      formItem: 'slider',
      text: t('Content.e6TeamHpLostPercent.text'),
      content: t('Content.e6TeamHpLostPercent.content'),
      min: 0,
      max: 1.2,
      percent: true,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    talentActive: content.talentActive,
    skillActive: content.skillActive,
    teammateHPValue: {
      id: 'teammateHPValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateHPValue.text'),
      content: t('TeammateContent.teammateHPValue.content', { skillHpBuffValue: TsUtils.precisionRound(100 * skillHpBuffValue) }),
      min: 0,
      max: 10000,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Scaling
      x.BASIC_HP_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.ULT_HP_SCALING.buff(ultScaling, SOURCE_ULT)
      x.ULT_HP_SCALING.buff((e >= 6) ? 2.00 * r.e6TeamHpLostPercent : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      x.HEAL_TYPE.set(ULT_DMG_TYPE, SOURCE_TRACE)
      x.HEAL_SCALING.buff(ultHealScaling, SOURCE_TRACE)
      x.HEAL_FLAT.buff(ultHealFlat, SOURCE_TRACE)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.CR.buffTeam((m.skillActive) ? skillCrBuffValue : 0, SOURCE_SKILL)
      x.CD.buffTeam((e >= 1 && m.skillActive) ? 0.30 : 0, SOURCE_E1)

      // Talent ehp buff is shared
      x.DMG_RED_MULTI.multiplyTeam((m.talentActive) ? (1 - talentDmgReductionValue) : 1, SOURCE_TALENT)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const hpBuff = (t.skillActive) ? skillHpBuffValue * t.teammateHPValue : 0
      x.HP.buffTeam(hpBuff, SOURCE_SKILL)
      x.UNCONVERTIBLE_HP_BUFF.buffTeam(hpBuff, SOURCE_SKILL)

      // Skill ehp buff only applies to teammates
      x.DMG_RED_MULTI.multiplyTeam((t.skillActive) ? (1 - 0.65) : 1, SOURCE_SKILL)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardHpHealFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardHpHealFinalizer(),
    dynamicConditionals: [
      {
        id: 'FuXuanHpConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.HP],
        chainsTo: [Stats.HP],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.skillActive
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.HP, Stats.HP, this, x, action, context, SOURCE_SKILL,
            (convertibleValue) => convertibleValue * skillHpBuffValue,
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.HP, Stats.HP, this, action, context,
            `${skillHpBuffValue} * convertibleValue`,
            `${wgslTrue(r.skillActive)}`,
          )
        },
      },
    ],
  }
}
