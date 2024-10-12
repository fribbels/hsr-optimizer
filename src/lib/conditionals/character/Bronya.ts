import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants'
import { ASHBLAZING_ATK_STACK, BASIC_TYPE, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityCr } from 'lib/optimizer/calculateBuffs'
import { buffStat, conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Bronya')
  const { basic, skill, ult } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const skillDmgBoostValue = skill(e, 0.66, 0.726)
  const ultAtkBoostValue = ult(e, 0.55, 0.594)
  const ultCdBoostValue = ult(e, 0.16, 0.168)
  const ultCdBoostBaseValue = ult(e, 0.20, 0.216)

  const basicScaling = basic(e, 1.0, 1.1)
  const fuaScaling = basicScaling * 0.80

  const hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'teamDmgBuff',
    name: 'teamDmgBuff',
    text: t('Content.teamDmgBuff.text'),
    title: t('Content.teamDmgBuff.title'),
    content: t('Content.teamDmgBuff.content'),
  }, {
    formItem: 'switch',
    id: 'skillBuff',
    name: 'skillBuff',
    text: t('Content.skillBuff.text'),
    title: t('Content.skillBuff.title'),
    content: t('Content.skillBuff.content', { skillDmgBoostValue: TsUtils.precisionRound(100 * skillDmgBoostValue) }),
  }, {
    formItem: 'switch',
    id: 'ultBuff',
    name: 'ultBuff',
    text: t('Content.ultBuff.text'),
    title: t('Content.ultBuff.title'),
    content: t('Content.ultBuff.content', { ultAtkBoostValue: TsUtils.precisionRound(100 * ultAtkBoostValue), ultCdBoostValue: TsUtils.precisionRound(100 * ultCdBoostValue), ultCdBoostBaseValue: TsUtils.precisionRound(100 * ultCdBoostBaseValue) }),
  }, {
    formItem: 'switch',
    id: 'battleStartDefBuff',
    name: 'battleStartDefBuff',
    text: t('Content.battleStartDefBuff.text'),
    title: t('Content.battleStartDefBuff.title'),
    content: t('Content.battleStartDefBuff.content'),
  }, {
    formItem: 'switch',
    id: 'techniqueBuff',
    name: 'techniqueBuff',
    text: t('Content.techniqueBuff.text'),
    title: t('Content.techniqueBuff.title'),
    content: t('Content.techniqueBuff.content'),
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
    findContentId(content, 'teamDmgBuff'),
    findContentId(content, 'skillBuff'),
    findContentId(content, 'ultBuff'),
    findContentId(content, 'battleStartDefBuff'),
    findContentId(content, 'techniqueBuff'),
    {
      formItem: 'slider',
      id: 'teammateCDValue',
      name: 'teammateCDValue',
      text: t('TeammateContent.teammateCDValue.text'),
      title: t('TeammateContent.teammateCDValue.title'),
      content: t('TeammateContent.teammateCDValue.content', { ultAtkBoostValue: TsUtils.precisionRound(100 * ultAtkBoostValue), ultCdBoostValue: TsUtils.precisionRound(100 * ultCdBoostValue), ultCdBoostBaseValue: TsUtils.precisionRound(100 * ultCdBoostBaseValue) }),
      min: 0,
      max: 3.00,
      percent: true,
    },
    findContentId(content, 'e2SkillSpdBuff'),
  ]

  const defaults = {
    teamDmgBuff: true,
    skillBuff: true,
    ultBuff: true,
    battleStartDefBuff: false,
    techniqueBuff: false,
    e2SkillSpdBuff: false,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => (defaults),
    teammateDefaults: () => ({
      ...defaults,
      ...{
        teammateCDValue: 2.50,
      },
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      // Stats
      buffAbilityCr(x, BASIC_TYPE, 1.00)

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.FUA_SCALING += (e >= 4) ? fuaScaling : 0

      x.BASIC_TOUGHNESS_DMG += 30
      x.FUA_TOUGHNESS_DMG += (e >= 4) ? 30 : 0
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      x[Stats.DEF_P] += (m.battleStartDefBuff) ? 0.20 : 0
      x[Stats.SPD_P] += (m.e2SkillSpdBuff) ? 0.30 : 0
      x[Stats.ATK_P] += (m.techniqueBuff) ? 0.15 : 0
      x[Stats.ATK_P] += (m.ultBuff) ? ultAtkBoostValue : 0

      x.ELEMENTAL_DMG += (m.teamDmgBuff) ? 0.10 : 0
      x.ELEMENTAL_DMG += (m.skillBuff) ? skillDmgBoostValue : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals

      x[Stats.CD] += (t.ultBuff) ? ultCdBoostValue * t.teammateCDValue : 0
      x[Stats.CD] += (t.ultBuff) ? ultCdBoostBaseValue : 0
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      standardFuaAtkFinalizer(x, action, context, hitMulti)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardFuaAtkFinalizer(hitMulti)
    },
    dynamicConditionals: [
      {
        id: 'BronyaCdConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CD],
        ratioConversion: true,
        condition: function (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) {
          return true
        },
        effect: function (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals
          if (!r.ultBuff) {
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
if (${wgslFalse(r.ultBuff)}) {
  return;
}

let stateValue: f32 = (*p_state).BronyaCdConditional;
let convertibleCdValue: f32 = (*p_x).CD - (*p_x).RATIO_BASED_CD_BUFF;

var buffCD: f32 = ${ultCdBoostValue} * convertibleCdValue + ${ultCdBoostBaseValue};
var stateBuffCD: f32 = ${ultCdBoostValue} * stateValue + ${ultCdBoostBaseValue};

(*p_state).BronyaCdConditional = (*p_x).CD;

let finalBuffCd = buffCD - select(0, stateBuffCD, stateValue > 0);
(*p_x).RATIO_BASED_CD_BUFF += finalBuffCd;

buffNonRatioDynamicCD(finalBuffCd, p_x, p_state);
    `)
        },
      },
    ],
  }
}
