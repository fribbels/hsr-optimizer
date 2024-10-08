import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, precisionRound, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { ConditionalActivation, ConditionalType } from 'lib/gpu/conditionals/setConditionals'
import { OptimizerParams } from 'lib/optimizer/calculateParams'
import { buffStat, conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'

export default (e: Eidolon): CharacterConditional => {
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
    text: 'Ult SPD/ATK buff',
    title: 'Ultimate: Ten-Lords\' Decree, All Shall Obey',
    content: `Increases the SPD of a target ally by ${precisionRound(ultSpdBuffValue * 100)}% of Hanya's SPD and increases the same target ally's ATK by ${precisionRound(ultAtkBuffValue * 100)}%.`,
  }, {
    formItem: 'switch',
    id: 'targetBurdenActive',
    name: 'targetBurdenActive',
    text: 'Target Burden debuff',
    title: 'Talent: Sanction',
    content: `When an ally uses a Basic ATK, Skill, or Ultimate on an enemy inflicted with Burden, the DMG dealt increases by ${precisionRound(talentDmgBoostValue * 100)}% for 2 turn(s).`,
  }, {
    formItem: 'switch',
    id: 'burdenAtkBuff',
    name: 'burdenAtkBuff',
    text: 'Burden ATK buff',
    title: 'Trace: Scrivener',
    content: `Allies triggering Burden's Skill Point recovery effect have their ATK increased by 10% for 1 turn(s).`,
  }, {
    formItem: 'switch',
    id: 'e2SkillSpdBuff',
    name: 'e2SkillSpdBuff',
    text: 'E2 skill SPD buff',
    title: 'E2: Two Views',
    content: `E2: After Skill, increases SPD by ${precisionRound(0.20 * 100)}% for 1 turn.`,
    disabled: e < 2,
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'ultBuff'),
    {
      formItem: 'slider',
      id: 'teammateSPDValue',
      name: 'teammateSPDValue',
      text: `Hanya's SPD`,
      title: 'Ultimate: Ten-Lords\' Decree, All Shall Obey',
      content: `Increases the SPD of a target ally by ${precisionRound(ultSpdBuffValue * 100)}% of Hanya's SPD and increases the same target ally's ATK by ${precisionRound(ultAtkBuffValue * 100)}%.`,
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
