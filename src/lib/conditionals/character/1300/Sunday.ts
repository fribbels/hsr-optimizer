import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/*

Gleaming Admonition

Basic ATK+1+20

Deals Imaginary DMG equal to 100% of Sunday's ATK to one designated enemy.

 Single 10

Lv6

Benison of Paper and Rites

Skill-1+30

Enables one designated ally character and their summon to immediately take action, and increases their DMG dealt by 30%. If the target has a summon, then the dealt DMG increase is further boosted by an additional 50%, lasting for 2 turn(s).
After using Skill on The Beatified, recovers 1 Skill Point.
When Sunday uses this ability on characters following the Path of Harmony, cannot trigger the "immediate action" effect.
Hidden Stat: 1

Lv10

Ode to Caress and Cicatrix

Ultimate130+5

Regenerates Energy by 20% of Max Energy for one designated ally character, and turns the target and their summon into "The Beatified." "The Beatified" have their CRIT DMG increased by an amount equal to 30% of Sunday's CRIT DMG plus 12%.
At the start of Sunday's each turn, the duration of "The Beatified" decreases by 1 turn, lasting for a total of 3 turn(s). And it only takes effect on the most recent target of the Ultimate (excluding Sunday himself). When Sunday is knocked down, "The Beatified" will also be dispelled.

Lv10

The Sorrowing Body

Talent

When using Skill, increases the target's CRIT Rate by 20%, lasting for 3 turn(s).

Lv10

Attack

Attacks an enemy, and when the battle starts, reduces their Toughness of the corresponding Type.

 Single 10


The Glorious Mysteries

Technique

After this Technique is used, the first time Sunday uses an ability on an ally target in the next battle, the target's DMG dealt increases by 50%, lasting for 2 turn(s).


Stat Boosts

 +37.3% CRIT DMG
 +18.0% Effect RES
 +12.5% DEF

Rest Day's Longing

When using Ultimate, if the Energy regenerated for the target is less than 40, increases the regenerated Energy to 40.


Exalted Sweep

When battle starts, Sunday regenerates 25 Energy.


Haven in Palm

When using Skill, dispels 1 debuff(s) from the target.



1 Millennium's Quietus

When Sunday uses Skill, the target character can ignore 16% of enemy target's DEF to deal DMG and their summon can ignore 40% of enemy target's DEF to deal DMG, lasting for 2 turn(s).



2 Faith Outstrips Frailty

After the first use of Ultimate, recovers 2 Skill Point(s). The DMG dealt by "The Beatified" increases by 30%.



3 Hermitage of Thorns

Ultimate Lv. +2, up to a maximum of Lv. 15.
Basic ATK Lv. +1, up to a maximum of Lv. 10.



4 Sculpture's Preamble

When the turn starts, regenerates 8 Energy.



5 Paper Raft in Silver Bay

Skill Lv. +2, up to a maximum of Lv. 15.
Talent Lv. +2, up to a maximum of Lv. 15.



6 Dawn of Sidereal Cacophony

The Talent's CRIT Rate boost effect becomes stackable up to 3 time(s), and the Talent's duration increases by 1 turn(s). When Sunday uses Ultimate, can also apply the Talent's CRIT Rate boost effect to the target. When the Talent's CRIT Rate boost takes effect and the target's CRIT Rate exceeds 100%, every 1% of excess CRIT Rate increases CRIT DMG by 2%.
 */
export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sunday')
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
  } = Source.character('1313')

  const skillDmgBoostValue = skill(e, 0.30, 0.33)
  const skillDmgBoostSummonValue = skill(e, 0.50, 0.55)
  const ultCdBoostValue = ult(e, 0.30, 0.336)
  const ultCdBoostBaseValue = ult(e, 0.12, 0.128)
  const talentCrBuffValue = talent(e, 0.20, 0.22)

  const basicScaling = basic(e, 1.00, 1.10)

  const defaults = {
    skillDmgBuff: false,
    talentCrBuffStacks: 0,
    techniqueDmgBuff: false,
    e1DefPen: false,
    e2DmgBuff: false,
  }

  const teammateDefaults = {
    skillDmgBuff: true,
    talentCrBuffStacks: e < 6 ? 1 : 3,
    beatified: true,
    teammateCDValue: 2.50,
    techniqueDmgBuff: false,
    e1DefPen: true,
    e2DmgBuff: true,
    e6CrToCdConversion: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillDmgBuff: {
      id: 'skillDmgBuff',
      formItem: 'switch',
      text: t('Content.skillDmgBuff.text'),
      content: t(
        'Content.skillDmgBuff.content',
        {
          DmgBoost: TsUtils.precisionRound(100 * skillDmgBoostValue),
          SummonDmgBoost: TsUtils.precisionRound(100 * skillDmgBoostSummonValue),
        }),
    },
    talentCrBuffStacks: {
      id: 'talentCrBuffStacks',
      formItem: 'slider',
      text: t('Content.talentCrBuffStacks.text'),
      content: t('Content.talentCrBuffStacks.content', { CritRateBoost: TsUtils.precisionRound(100 * talentCrBuffValue) }),
      min: 0,
      max: e < 6 ? 1 : 3,
    },
    techniqueDmgBuff: {
      id: 'techniqueDmgBuff',
      formItem: 'switch',
      text: t('Content.techniqueDmgBuff.text'),
      content: t('Content.techniqueDmgBuff.content'),
    },
    e1DefPen: {
      id: 'e1DefPen',
      formItem: 'switch',
      text: t('Content.e1DefPen.text'),
      content: t('Content.e1DefPen.content'),
      disabled: e < 1,
    },
    e2DmgBuff: {
      id: 'e2DmgBuff',
      formItem: 'switch',
      text: t('Content.e2DmgBuff.text'),
      content: t('Content.e2DmgBuff.content'),
      disabled: e < 2,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillDmgBuff: content.skillDmgBuff,
    talentCrBuffStacks: content.talentCrBuffStacks,
    beatified: {
      id: 'beatified',
      formItem: 'switch',
      text: t('TeammateContent.beatified.text'),
      content: t(
        'TeammateContent.beatified.content',
        {
          CritBuffScaling: TsUtils.precisionRound(100 * ultCdBoostValue),
          CritBuffFlat: TsUtils.precisionRound(100 * ultCdBoostBaseValue),
        }),
    },
    teammateCDValue: {
      id: 'teammateCDValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateCDValue.text'),
      content: t(
        'TeammateContent.teammateCDValue.content',
        {
          CritBuffScaling: TsUtils.precisionRound(100 * ultCdBoostValue),
          CritBuffFlat: TsUtils.precisionRound(100 * ultCdBoostBaseValue),
        }),
      min: 0,
      max: 4.00,
      percent: true,
    },
    techniqueDmgBuff: content.techniqueDmgBuff,
    e1DefPen: content.e1DefPen,
    e2DmgBuff: content.e2DmgBuff,
    e6CrToCdConversion: {
      id: 'e6CrToCdConversion',
      formItem: 'switch',
      text: t('TeammateContent.e6CrToCdConversion.text'),
      content: t('TeammateContent.e6CrToCdConversion.content'),
      disabled: e < 6,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)

      x.BASIC_TOUGHNESS_DMG.set(10, SOURCE_BASIC)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.CR.buffDual(m.talentCrBuffStacks * talentCrBuffValue, SOURCE_TALENT)
      x.ELEMENTAL_DMG.buffDual((m.skillDmgBuff) ? skillDmgBoostValue : 0, SOURCE_SKILL)
      x.ELEMENTAL_DMG.buffDual((m.skillDmgBuff && x.a[Key.SUMMONS] > 0) ? skillDmgBoostSummonValue : 0, SOURCE_SKILL)
      x.ELEMENTAL_DMG.buffDual((m.techniqueDmgBuff) ? 0.50 : 0, SOURCE_TECHNIQUE)

      x.DEF_PEN.buffDual((e >= 1 && m.e1DefPen && m.skillDmgBuff) ? 0.16 : 0, SOURCE_E1)
      x.DEF_PEN.buffDual((e >= 1 && m.e1DefPen && m.skillDmgBuff && x.a[Key.SUMMONS] > 0) ? 0.24 : 0, SOURCE_E1)

      x.ELEMENTAL_DMG.buffDual((e >= 2 && m.e2DmgBuff) ? 0.30 : 0, SOURCE_E2)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const cdBuff = (t.beatified) ? ultCdBoostValue * t.teammateCDValue + ultCdBoostBaseValue : 0
      x.CD.buffDual(cdBuff, SOURCE_ULT)
      x.UNCONVERTIBLE_CD_BUFF.buffDual(cdBuff, SOURCE_ULT)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
    teammateDynamicConditionals: [
      {
        id: 'SundayMemoCrConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CR],
        chainsTo: [Stats.CD],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          return x.m.a[Key.CR] > 1.00
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.teammateCharacterConditionals as Conditionals<typeof teammateContent>
          if (!(e >= 6 && r.e6CrToCdConversion && !x.a[Key.DEPRIORITIZE_BUFFS])) {
            return
          }

          const stateValue = action.conditionalState[this.id] || 0
          const buffValue = Math.floor((x.m.a[Key.CR] - x.m.a[Key.UNCONVERTIBLE_CR_BUFF] - 1.00) / 0.01) * 2.00 * 0.01

          action.conditionalState[this.id] = buffValue
          x.m.CD.buffDynamic(buffValue - stateValue, SOURCE_E6, action, context)
          x.m.UNCONVERTIBLE_CD_BUFF.buffDynamic(buffValue - stateValue, SOURCE_E6, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.teammateCharacterConditionals as Conditionals<typeof teammateContent>

          return conditionalWgslWrapper(this, `
if (${wgslFalse(e >= 6 && r.e6CrToCdConversion)}) {
  return;
}

if (x.DEPRIORITIZE_BUFFS > 0) {
  return;
}

let cr = (*p_m).CR;
let unconvertibleCr = (*p_m).UNCONVERTIBLE_CR_BUFF;

if (cr > 1.00) {
  let buffValue: f32 = floor((cr - unconvertibleCr - 1.00) / 0.01) * 2.00 * 0.01;
  let stateValue: f32 = (*p_state).${this.id};

  (*p_state).${this.id} = buffValue;
  (*p_m).CD += buffValue - stateValue;
  (*p_m).UNCONVERTIBLE_CD_BUFF += buffValue - stateValue;
}
          `)
        },
      },
      {
        id: 'SundayCrConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CR],
        chainsTo: [Stats.CD],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          return x.a[Key.CR] > 1.00
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.teammateCharacterConditionals as Conditionals<typeof teammateContent>
          if (!(e >= 6 && r.e6CrToCdConversion && !x.a[Key.DEPRIORITIZE_BUFFS])) {
            return
          }

          const stateValue = action.conditionalState[this.id] || 0
          const buffValue = Math.floor(((x.a[Key.CR] - x.a[Key.UNCONVERTIBLE_CR_BUFF]) - 1.00) / 0.01) * 2.00 * 0.01

          action.conditionalState[this.id] = buffValue
          x.CD.buffDynamic(buffValue - stateValue, SOURCE_E6, action, context)
          x.UNCONVERTIBLE_CD_BUFF.buffDynamic(buffValue - stateValue, SOURCE_E6, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.teammateCharacterConditionals as Conditionals<typeof teammateContent>

          return conditionalWgslWrapper(this, `
if (${wgslFalse(e >= 6 && r.e6CrToCdConversion)}) {
  return;
}

if (x.DEPRIORITIZE_BUFFS > 0) {
  return;
}

if (x.CR > 1.00) {
  let buffValue: f32 = floor((x.CR - x.UNCONVERTIBLE_CR_BUFF - 1.00) / 0.01) * 2.00 * 0.01;
  let stateValue: f32 = (*p_state).${this.id};

  (*p_state).${this.id} = buffValue;
  (*p_x).CD += buffValue - stateValue;
  (*p_x).UNCONVERTIBLE_CD_BUFF += buffValue - stateValue;
}
    `)
        },
      },
    ],
  }
}
