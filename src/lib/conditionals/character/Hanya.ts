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

export default (e: Eidolon, withoutContent: boolean): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const ultSpdBuffValue = ult(e, 0.20, 0.21)
  const ultAtkBuffValue = ult(e, 0.60, 0.648)
  let talentDmgBoostValue = talent(e, 0.30, 0.33)

  talentDmgBoostValue += (e >= 6) ? 0.10 : 0

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.40, 2.64)
  const ultScaling = ult(e, 0, 0)

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Characters.Hanya.Content')
    return [{
      formItem: 'switch',
      id: 'ultBuff',
      name: 'ultBuff',
      text: t('ultBuff.text'),
      title: t('ultBuff.title'),
      content: t('ultBuff.content', { ultSpdBuffValue: TsUtils.precisionRound(100 * ultSpdBuffValue), ultAtkBuffValue: TsUtils.precisionRound(100 * ultAtkBuffValue) }),
    }, {
      formItem: 'switch',
      id: 'targetBurdenActive',
      name: 'targetBurdenActive',
      text: t('targetBurdenActive.text'),
      title: t('targetBurdenActive.title'),
      content: t('targetBurdenActive.content', { talentDmgBoostValue: TsUtils.precisionRound(100 * talentDmgBoostValue) }),
    }, {
      formItem: 'switch',
      id: 'burdenAtkBuff',
      name: 'burdenAtkBuff',
      text: t('burdenAtkBuff.text'),
      title: t('burdenAtkBuff.title'),
      content: t('burdenAtkBuff.content'),
    }, {
      formItem: 'switch',
      id: 'e2SkillSpdBuff',
      name: 'e2SkillSpdBuff',
      text: t('e2SkillSpdBuff.text'),
      title: t('e2SkillSpdBuff.title'),
      content: t('e2SkillSpdBuff.content'),
      disabled: e < 2,
    }]
  })()

  const teammateContent: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Characters.Hanya.TeammateContent')
    return [
      findContentId(content, 'ultBuff'),
      {
        formItem: 'slider',
        id: 'teammateSPDValue',
        name: 'teammateSPDValue',
        text: t('teammateSPDValue.text'),
        title: t('teammateSPDValue.title'),
        content: t('teammateSPDValue.content', { ultSpdBuffValue: TsUtils.precisionRound(100 * ultSpdBuffValue), ultAtkBuffValue: TsUtils.precisionRound(100 * ultAtkBuffValue) }),
        min: 0,
        max: 200,
      },
      findContentId(content, 'targetBurdenActive'),
      findContentId(content, 'burdenAtkBuff'),
    ]
  })()

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
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

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
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.ATK_P] += (m.ultBuff) ? ultAtkBuffValue : 0
      x[Stats.ATK_P] += (m.burdenAtkBuff) ? 0.10 : 0

      x.ELEMENTAL_DMG += (m.targetBurdenActive) ? talentDmgBoostValue : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.characterConditionals

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
        effect: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
          const r = request.characterConditionals
          if (!r.ultBuff) {
            return
          }

          const stateValue = params.conditionalState[this.id] || 0
          const convertibleSpdValue = x[Stats.SPD] - x.RATIO_BASED_SPD_BUFF

          const buffSPD = ultSpdBuffValue * convertibleSpdValue
          const stateBuffSPD = ultSpdBuffValue * stateValue

          params.conditionalState[this.id] = x[Stats.SPD]

          const finalBuffSpd = buffSPD - (stateValue ? stateBuffSPD : 0)
          x.RATIO_BASED_SPD_BUFF += finalBuffSpd

          buffStat(x, request, params, Stats.SPD, finalBuffSpd)
        },
        gpu: function (request: Form, _params: OptimizerParams) {
          const r = request.characterConditionals

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
