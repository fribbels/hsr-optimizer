import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { buffStat, conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Hanya')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const ultSpdBuffValue = ult(e, 0.20, 0.21)
  const ultAtkBuffValue = ult(e, 0.60, 0.648)
  let talentDmgBoostValue = talent(e, 0.30, 0.33)

  talentDmgBoostValue += (e >= 6) ? 0.10 : 0

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.40, 2.64)
  const ultScaling = ult(e, 0, 0)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'ultBuff',
    name: 'ultBuff',
    text: t('Content.ultBuff.text'),
    title: t('Content.ultBuff.title'),
    content: t('Content.ultBuff.content', { ultSpdBuffValue: TsUtils.precisionRound(100 * ultSpdBuffValue), ultAtkBuffValue: TsUtils.precisionRound(100 * ultAtkBuffValue) }),
  }, {
    formItem: 'switch',
    id: 'targetBurdenActive',
    name: 'targetBurdenActive',
    text: t('Content.targetBurdenActive.text'),
    title: t('Content.targetBurdenActive.title'),
    content: t('Content.targetBurdenActive.content', { talentDmgBoostValue: TsUtils.precisionRound(100 * talentDmgBoostValue) }),
  }, {
    formItem: 'switch',
    id: 'burdenAtkBuff',
    name: 'burdenAtkBuff',
    text: t('Content.burdenAtkBuff.text'),
    title: t('Content.burdenAtkBuff.title'),
    content: t('Content.burdenAtkBuff.content'),
  }, {
    formItem: 'switch',
    id: 'e2SkillSpdBuff',
    name: 'e2SkillSpdBuff',
    text: t('Content.e2SkillSpdBuff.text'),
    title: t('Content.e2SkillSpdBuff.title'),
    content: t('Content.e2SkillSpdBuff.content'),
    disabled: e < 2,
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'ultBuff'),
    {
      formItem: 'slider',
      id: 'teammateSPDValue',
      name: 'teammateSPDValue',
      text: t('TeammateContent.teammateSPDValue.text'),
      title: t('TeammateContent.teammateSPDValue.title'),
      content: t('TeammateContent.teammateSPDValue.content', { ultSpdBuffValue: TsUtils.precisionRound(100 * ultSpdBuffValue), ultAtkBuffValue: TsUtils.precisionRound(100 * ultAtkBuffValue) }),
      min: 0,
      max: 200,
    },
    findContentId(content, 'targetBurdenActive'),
    findContentId(content, 'burdenAtkBuff'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      ultBuff: true,
      targetBurdenActive: true,
      burdenAtkBuff: true,
      e2SkillSpdBuff: false,
    }),
    teammateDefaults: () => ({
      ultBuff: true,
      targetBurdenActive: true,
      burdenAtkBuff: true,
      teammateSPDValue: 160,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      x[Stats.SPD_P] += (e >= 2 && r.e2SkillSpdBuff) ? 0.20 : 0

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      x[Stats.ATK_P] += (m.ultBuff) ? ultAtkBuffValue : 0
      x[Stats.ATK_P] += (m.burdenAtkBuff) ? 0.10 : 0

      x.ELEMENTAL_DMG += (m.targetBurdenActive) ? talentDmgBoostValue : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals

      x[Stats.SPD] += (t.ultBuff) ? ultSpdBuffValue * t.teammateSPDValue : 0
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
    dynamicConditionals: [
      {
        id: 'HanyaSpdConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.SPD],
        ratioConversion: true,
        condition: function () {
          return true
        },
        effect: function (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals
          if (!r.ultBuff) {
            return
          }

          const stateValue = action.conditionalState[this.id] || 0
          const convertibleSpdValue = x[Stats.SPD] - x.RATIO_BASED_SPD_BUFF

          const buffSPD = ultSpdBuffValue * convertibleSpdValue
          const stateBuffSPD = ultSpdBuffValue * stateValue

          action.conditionalState[this.id] = x[Stats.SPD]

          const finalBuffSpd = buffSPD - (stateValue ? stateBuffSPD : 0)
          x.RATIO_BASED_SPD_BUFF += finalBuffSpd

          buffStat(x, Stats.SPD, finalBuffSpd, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals

          return conditionalWgslWrapper(this, `
if (${wgslFalse(r.ultBuff)}) {
  return;
}

let stateValue: f32 = (*p_state).HanyaSpdConditional;
let convertibleSpdValue: f32 = (*p_x).SPD - (*p_x).RATIO_BASED_SPD_BUFF;

var buffSPD: f32 = ${ultSpdBuffValue} * convertibleSpdValue;
var stateBuffSPD: f32 = ${ultSpdBuffValue} * stateValue;

(*p_state).HanyaSpdConditional = (*p_x).SPD;

let finalBuffSpd = buffSPD - select(0, stateBuffSPD, stateValue > 0);
(*p_x).RATIO_BASED_SPD_BUFF += finalBuffSpd;

buffNonRatioDynamicSPD(finalBuffSpd, p_x, p_state);
    `)
        },
      },
    ],
  }
}
