import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { ConditionalActivation, ConditionalType } from 'lib/gpu/conditionals/setConditionals'
import { OptimizerParams } from 'lib/optimizer/calculateParams'
import { buffStat, conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (e: Eidolon): CharacterConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Characters.Sparkle')
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

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'skillCdBuff',
    name: 'skillCdBuff',
    text: t('Content.skillCdBuff.text'),
    title: t('Content.skillCdBuff.title'),
    content: t('Content.skillCdBuff.content', { skillCdBuffScaling: TsUtils.precisionRound(100 * skillCdBuffScaling), skillCdBuffBase: TsUtils.precisionRound(100 * skillCdBuffBase) }),
  }, {
    formItem: 'switch',
    id: 'cipherBuff',
    name: 'cipherBuff',
    text: t('Content.cipherBuff.text'),
    title: t('Content.cipherBuff.title'),
    content: t('Content.cipherBuff.content', { cipherTalentStackBoost: TsUtils.precisionRound(100 * cipherTalentStackBoost) }),
  }, {
    formItem: 'slider',
    id: 'talentStacks',
    name: 'talentStacks',
    text: t('Content.talentStacks.text'),
    title: t('Content.talentStacks.title'),
    content: t('Content.talentStacks.content', { talentBaseStackBoost: TsUtils.precisionRound(100 * talentBaseStackBoost) }),
    min: 0,
    max: 3,
  }, {
    formItem: 'slider',
    id: 'quantumAllies',
    name: 'quantumAllies',
    text: t('Content.quantumAllies.text'),
    title: t('Content.quantumAllies.title'),
    content: t('Content.quantumAllies.content'),
    min: 0,
    max: 3,
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'skillCdBuff'),
    {
      formItem: 'slider',
      id: 'teammateCDValue',
      name: 'teammateCDValue',
      text: t('TeammateContent.teammateCDValue.text'),
      title: t('TeammateContent.teammateCDValue.title'),
      content: t('TeammateContent.teammateCDValue.content', { skillCdBuffScaling: TsUtils.precisionRound(100 * skillCdBuffScaling), skillCdBuffBase: TsUtils.precisionRound(100 * skillCdBuffBase) }),
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
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => (defaults),
    teammateDefaults: () => ({
      ...defaults,
      ...{
        skillCdBuff: true,
        teammateCDValue: 2.5,
      },
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      x.BASIC_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.ATK_P] += 0.15 + (request.PRIMARY_ELEMENTAL_DMG_TYPE == Stats.Quantum_DMG ? (atkBoostByQuantumAllies[m.quantumAllies] || 0) : 0)
      x[Stats.ATK_P] += (e >= 1 && m.cipherBuff) ? 0.40 : 0

      x.ELEMENTAL_DMG += (m.cipherBuff) ? m.talentStacks * (talentBaseStackBoost + cipherTalentStackBoost) : m.talentStacks * talentBaseStackBoost
      x.DEF_PEN += (e >= 2) ? 0.08 * m.talentStacks : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.characterConditionals

      x[Stats.CD] += (t.skillCdBuff) ? skillCdBuffBase + (skillCdBuffScaling + (e >= 6 ? 0.30 : 0)) * t.teammateCDValue : 0
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
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
        effect: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
          const r = request.characterConditionals
          if (!r.skillCdBuff) {
            return
          }

          const buffScalingValue = (skillCdBuffScaling + (e >= 6 ? 0.30 : 0))

          const stateValue = params.conditionalState[this.id] || 0
          const convertibleCdValue = x[Stats.CD] - x.RATIO_BASED_CD_BUFF

          const buffCD = buffScalingValue * convertibleCdValue + skillCdBuffBase
          const stateBuffCD = buffScalingValue * stateValue + skillCdBuffBase

          params.conditionalState[this.id] = x[Stats.CD]

          const finalBuffCd = buffCD - (stateValue ? stateBuffCD : 0)
          x.RATIO_BASED_CD_BUFF += finalBuffCd

          buffStat(x, request, params, Stats.CD, finalBuffCd)
        },
        gpu: function (request: Form, _params: OptimizerParams) {
          const r = request.characterConditionals
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
