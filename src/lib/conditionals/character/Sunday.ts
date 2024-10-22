import { ConditionalActivation, ConditionalType, CURRENT_DATA_VERSION, Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { buffStat, conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'
import i18next from 'i18next'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sunday')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5 // TODO

  const skillDmgBoostValue = skill(e, 0.50, 0.50)
  const ultCdBoostValue = ult(e, 0.325, 0.325)
  const ultCdBoostBaseValue = ult(e, 0.088, 0.088)
  const talentCrBuffValue = talent(e, 0.25, 0.25)

  const basicScaling = basic(e, 1.0, 1.1)

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'skillDmgBuff',
      name: 'skillDmgBuff',
      text: 'Skill DMG buff',
      title: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    {
      formItem: 'switch',
      id: 'skillDmgBuffSummon',
      name: 'skillDmgBuffSummon',
      text: 'Skill DMG buff summon',
      title: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    {
      name: 'talentCrBuffStacks',
      id: 'talentCrBuffStacks',
      formItem: 'slider',
      text: 'Talent CR buff stacks',
      title: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: e < 6 ? 1 : 3,
    },
    {
      formItem: 'switch',
      id: 'e1ResPen',
      name: 'e1ResPen',
      text: 'E1 RES PEN',
      title: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e2SpdBuff',
      name: 'e2SpdBuff',
      text: 'E2 SPD buff',
      title: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 2,
    },
    { // TODO
      formItem: 'switch',
      id: 'e6CrToCdConversion',
      name: 'e6CrToCdConversion',
      text: 'E6 CR to CD conversion',
      title: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = [
    // TODO
    findContentId(content, 'skillDmgBuff'),
    findContentId(content, 'skillDmgBuffSummon'),
    findContentId(content, 'talentCrBuffStacks'),
    {
      formItem: 'switch',
      id: 'beatified',
      name: 'beatified',
      text: 'The Beatified',
      title: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    findContentId(content, 'e1ResPen'),
    findContentId(content, 'e2SpdBuff'),
    findContentId(content, 'e6CrToCdConversion'),
  ]

  const defaults = {
    skillDmgBuff: false,
    skillDmgBuffSummon: false,
    talentCrBuffStacks: 0,
    e1ResPen: false,
    e2SpdBuff: true,
    e6CrToCdConversion: false,
  }

  const teammateDefaults = {
    skillDmgBuff: true,
    skillDmgBuffSummon: false,
    talentCrBuffStacks: e < 6 ? 1 : 3,
    beatified: true,
    e1ResPen: true,
    e2SpdBuff: true,
    e6CrToCdConversion: true,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => (defaults),
    teammateDefaults: () => (teammateDefaults),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      // Stats

      x.BASIC_SCALING += basicScaling

      // TODO: toughness
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      x[Stats.CR] += m.talentCrBuffStacks * talentCrBuffValue
      x.ELEMENTAL_DMG += (m.skillDmgBuff) ? skillDmgBoostValue : 0
      x.ELEMENTAL_DMG += (m.skillDmgBuff && m.skillDmgBuffSummon) ? skillDmgBoostValue : 0

      x.RES_PEN += (e >= 1 && m.e1ResPen && m.skillDmgBuff) ? 0.20 : 0

      x[Stats.SPD] += (e >= 2 && m.e2SpdBuff) ? 20 : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      standardAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardAtkFinalizer()
    },
    teammateDynamicConditionals: [
      {
        id: 'SundayCrConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CR],
        ratioConversion: true,
        condition: function (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) {
          return x[Stats.CR] > 1.00
        },
        effect: function (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals
          if (!(e >= 6 && r.e6CrToCdConversion)) {
            return
          }

          const stateValue = action.conditionalState[this.id] || 0
          const buffValue = Math.floor((x[Stats.CR] - 1.00) / 0.01) * 2.00 * 0.01

          action.conditionalState[this.id] = buffValue
          buffStat(x, Stats.CD, buffValue - stateValue, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals

          return conditionalWgslWrapper(this, `
if (${wgslFalse(e >= 6 && r.e6CrToCdConversion)}) {
  return;
}

let cr = (*p_x).CR;
let stateValue: f32 = (*p_state).SundayCrConditional;

if (cr > 1.00) {
  let buffValue: f32 = floor((cr - 1.00) / 0.01) * 2.00 * 0.01;

  (*p_state).SundayCrConditional = buffValue;
  buffDynamicCD(buffValue - stateValue, p_x, p_state);
}
    `)
        },
      },
    ],
    dynamicConditionals: [
      {
        id: 'SundayCdConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CD],
        ratioConversion: true,
        condition: function (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) {
          return true
        },
        effect: function (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals
          if (!r.beatified) {
            return
          }

          const stateValue = action.conditionalState[this.id] || 0
          const convertibleCdValue = x[Stats.CD] - x.RATIO_BASED_CD_BUFF

          const buffCD = ultCdBoostValue * convertibleCdValue + ultCdBoostBaseValue
          const stateBuffCD = ultCdBoostValue * stateValue + ultCdBoostBaseValue

          action.conditionalState[this.id] = x[Stats.CD]

          const finalBuffCd = buffCD - (stateValue ? stateBuffCD : 0)
          x.RATIO_BASED_CD_BUFF += finalBuffCd

          buffStat(x, Stats.CD, finalBuffCd, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals

          return conditionalWgslWrapper(this, `
if (${wgslFalse(r.beatified)}) {
  return;
}

let stateValue: f32 = (*p_state).SundayCdConditional;
let convertibleCdValue: f32 = (*p_x).CD - (*p_x).RATIO_BASED_CD_BUFF;

var buffCD: f32 = ${ultCdBoostValue} * convertibleCdValue + ${ultCdBoostBaseValue};
var stateBuffCD: f32 = ${ultCdBoostValue} * stateValue + ${ultCdBoostBaseValue};

(*p_state).SundayCdConditional = (*p_x).CD;

let finalBuffCd = buffCD - select(0, stateBuffCD, stateValue > 0);
(*p_x).RATIO_BASED_CD_BUFF += finalBuffCd;

buffNonRatioDynamicCD(finalBuffCd, p_x, p_state);
    `)
        },
      },
    ],
  }
}
