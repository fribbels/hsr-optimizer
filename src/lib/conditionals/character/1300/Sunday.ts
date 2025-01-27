import { gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { ComputedStatsArray, Key, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sunday')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

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
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      x.BASIC_SCALING.buff(basicScaling, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.set(30, Source.NONE)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.CR.buffDual(m.talentCrBuffStacks * talentCrBuffValue, Source.NONE)
      x.ELEMENTAL_DMG.buffDual((m.skillDmgBuff) ? skillDmgBoostValue : 0, Source.NONE)
      x.ELEMENTAL_DMG.buffDual((m.skillDmgBuff && x.a[Key.SUMMONS] > 0) ? skillDmgBoostSummonValue : 0, Source.NONE)
      x.ELEMENTAL_DMG.buffDual((m.techniqueDmgBuff) ? 0.50 : 0, Source.NONE)

      x.DEF_PEN.buffDual((e >= 1 && m.e1DefPen && m.skillDmgBuff) ? 0.16 : 0, Source.NONE)
      x.DEF_PEN.buffDual((e >= 1 && m.e1DefPen && m.skillDmgBuff && x.a[Key.SUMMONS] > 0) ? 0.24 : 0, Source.NONE)

      x.ELEMENTAL_DMG.buffDual((e >= 2 && m.e2DmgBuff) ? 0.30 : 0, Source.NONE)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.CD.buffDual((t.beatified) ? ultCdBoostValue * t.teammateCDValue : 0, Source.NONE)
      x.CD.buffDual((t.beatified) ? ultCdBoostBaseValue : 0, Source.NONE)
      x.RATIO_BASED_CD_BUFF.buffDual((t.beatified) ? ultCdBoostValue * t.teammateCDValue : 0, Source.NONE)
      x.RATIO_BASED_CD_BUFF.buffDual((t.beatified) ? ultCdBoostBaseValue : 0, Source.NONE)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardAtkFinalizer()
    },
    teammateDynamicConditionals: [
      {
        id: 'SundayMemoCrConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CR],
        ratioConversion: true,
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          return x.m.a[Key.CR] > 1.00
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.teammateCharacterConditionals as Conditionals<typeof teammateContent>
          if (!(e >= 6 && r.e6CrToCdConversion && !x.a[Key.DEPRIORITIZE_BUFFS])) {
            return
          }

          const stateValue = action.conditionalState[this.id] || 0
          const buffValue = Math.floor((x.m.a[Key.CR] - 1.00) / 0.01) * 2.00 * 0.01

          action.conditionalState[this.id] = buffValue
          x.m.CD.buffDynamic(buffValue - stateValue, Source.NONE, action, context)
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

if (cr > 1.00) {
  let buffValue: f32 = floor((cr - 1.00) / 0.01) * 2.00 * 0.01;
  let stateValue: f32 = (*p_state).${this.id};

  (*p_state).${this.id} = buffValue;
  buffMemoDynamicCD(buffValue - stateValue, p_x, p_m, p_state);
}
          `)
        },
      },
      {
        id: 'SundayCrConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CR],
        ratioConversion: true,
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          return x.a[Key.CR] > 1.00
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.teammateCharacterConditionals as Conditionals<typeof teammateContent>
          if (!(e >= 6 && r.e6CrToCdConversion && !x.a[Key.DEPRIORITIZE_BUFFS])) {
            return
          }

          const stateValue = action.conditionalState[this.id] || 0
          const buffValue = Math.floor((x.a[Key.CR] - 1.00) / 0.01) * 2.00 * 0.01

          action.conditionalState[this.id] = buffValue
          x.CD.buffDynamic(buffValue - stateValue, Source.NONE, action, context)
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

let cr = (*p_x).CR;

if (cr > 1.00) {
  let buffValue: f32 = floor((cr - 1.00) / 0.01) * 2.00 * 0.01;
  let stateValue: f32 = (*p_state).${this.id};

  (*p_state).${this.id} = buffValue;
  buffDynamicCD(buffValue - stateValue, p_x, p_m, p_state);
}
    `)
        },
      },
    ],
  }
}
