import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants'
import { buffDynamicStat, conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { ComputedStatsArray } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sparkle')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const skillCdBuffScaling = skill(e, 0.24, 0.264)
  const skillCdBuffBase = skill(e, 0.45, 0.486)
  const cipherTalentStackBoost = ult(e, 0.10, 0.108)
  const talentBaseStackBoost = talent(e, 0.06, 0.066)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 0, 0)

  const atkBoostByQuantumAllies = {
    0: 0,
    1: 0.05,
    2: 0.15,
    3: 0.30,
  }

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'skillCdBuff',
      text: t('Content.skillCdBuff.text'),
      content: t('Content.skillCdBuff.content', {
        skillCdBuffScaling: TsUtils.precisionRound(100 * skillCdBuffScaling),
        skillCdBuffBase: TsUtils.precisionRound(100 * skillCdBuffBase),
      }),
    },
    {
      formItem: 'switch',
      id: 'cipherBuff',
      text: t('Content.cipherBuff.text'),
      content: t('Content.cipherBuff.content', { cipherTalentStackBoost: TsUtils.precisionRound(100 * cipherTalentStackBoost) }),
    },
    {
      formItem: 'slider',
      id: 'talentStacks',
      text: t('Content.talentStacks.text'),
      content: t('Content.talentStacks.content', { talentBaseStackBoost: TsUtils.precisionRound(100 * talentBaseStackBoost) }),
      min: 0,
      max: 3,
    },
    {
      formItem: 'slider',
      id: 'quantumAllies',
      text: t('Content.quantumAllies.text'),
      content: t('Content.quantumAllies.content'),
      min: 0,
      max: 3,
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'skillCdBuff'),
    {
      formItem: 'slider',
      id: 'teammateCDValue',
      text: t('TeammateContent.teammateCDValue.text'),
      content: t('TeammateContent.teammateCDValue.content', {
        skillCdBuffScaling: TsUtils.precisionRound(100 * skillCdBuffScaling),
        skillCdBuffBase: TsUtils.precisionRound(100 * skillCdBuffBase),
      }),
      min: 0,
      max: 3.50,
      percent: true,
    },
    findContentId(content, 'cipherBuff'),
    findContentId(content, 'talentStacks'),
    findContentId(content, 'quantumAllies'),
  ]

  const defaults = {
    skillCdBuff: false,
    cipherBuff: true,
    talentStacks: 3,
    quantumAllies: 3,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => (defaults),
    teammateDefaults: () => ({
      ...defaults,
      ...{
        skillCdBuff: true,
        teammateCDValue: 2.5,
      },
    }),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      x.BASIC_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m: Conditionals<typeof teammateContent> = action.characterConditionals

      // Main damage type
      x[Stats.ATK_P] += 0.15 + (context.elementalDamageType == Stats.Quantum_DMG
        ? (atkBoostByQuantumAllies[m.quantumAllies] || 0)
        : 0)
      x[Stats.ATK_P] += (e >= 1 && m.cipherBuff) ? 0.40 : 0

      x.ELEMENTAL_DMG += (m.cipherBuff)
        ? m.talentStacks * (talentBaseStackBoost + cipherTalentStackBoost)
        : m.talentStacks * talentBaseStackBoost
      x.DEF_PEN += (e >= 2) ? 0.08 * m.talentStacks : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t: Conditionals<typeof teammateContent> = action.characterConditionals

      x[Stats.CD] += (t.skillCdBuff)
        ? skillCdBuffBase + (skillCdBuffScaling + (e >= 6 ? 0.30 : 0)) * t.teammateCDValue
        : 0
    },
    finalizeCalculations: (x: ComputedStatsArray) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
    dynamicConditionals: [
      {
        id: 'SparkleCdConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CD],
        ratioConversion: true,
        condition: function () {
          return true
        },
        effect: function (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) {
          const r: Conditionals<typeof content> = action.characterConditionals
          if (!r.skillCdBuff) {
            return
          }

          const buffScalingValue = (skillCdBuffScaling + (e >= 6 ? 0.30 : 0))

          const stateValue = action.conditionalState[this.id] || 0
          const convertibleCdValue = x[Stats.CD] - x.RATIO_BASED_CD_BUFF

          const buffCD = buffScalingValue * convertibleCdValue + skillCdBuffBase
          const stateBuffCD = buffScalingValue * stateValue + skillCdBuffBase

          action.conditionalState[this.id] = x[Stats.CD]

          const finalBuffCd = buffCD - (stateValue ? stateBuffCD : 0)
          x.RATIO_BASED_CD_BUFF += finalBuffCd

          buffDynamicStat(x, Stats.CD, finalBuffCd, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r: Conditionals<typeof content> = action.characterConditionals
          const buffScalingValue = (skillCdBuffScaling + (e >= 6 ? 0.30 : 0))

          return conditionalWgslWrapper(this, `
if (${wgslFalse(r.skillCdBuff)}) {
  return;
}

let stateValue: f32 = (*p_state).SparkleCdConditional;
let convertibleCdValue: f32 = (*p_x).CD - (*p_x).RATIO_BASED_CD_BUFF;

var buffCD: f32 = ${buffScalingValue} * convertibleCdValue + ${skillCdBuffBase};
var stateBuffCD: f32 = ${buffScalingValue} * stateValue + ${skillCdBuffBase};

(*p_state).SparkleCdConditional = (*p_x).CD;

let finalBuffCd = buffCD - select(0, stateBuffCD, stateValue > 0);
(*p_x).RATIO_BASED_CD_BUFF += finalBuffCd;

buffNonRatioDynamicCD(finalBuffCd, p_x, p_state);
    `)
        },
      },
    ],
  }
}
