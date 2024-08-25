import { Stats } from 'lib/constants'
import { BASIC_TYPE, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, precisionRound } from 'lib/conditionals/conditionalUtils'
import { Eidolon } from 'types/Character'

import { Form } from 'types/Form'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ConditionalActivation, ConditionalType } from 'lib/gpu/conditionals/setConditionals'
import { OptimizerParams } from 'lib/optimizer/calculateParams'
import { buffStat, conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse, wgslTrue } from 'lib/gpu/injection/wgslUtils'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const skillAtkBoostMax = skill(e, 0.25, 0.27)
  const ultDmgBoost = ult(e, 0.50, 0.56)
  const skillAtkBoostScaling = skill(e, 0.50, 0.55)
  const skillLightningDmgBoostScaling = skill(e, 0.40, 0.44) + ((e >= 4) ? 0.20 : 0)
  const talentScaling = talent(e, 0.60, 0.66) + ((e >= 4) ? 0.20 : 0)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 0, 0)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'benedictionBuff',
    name: 'benedictionBuff',
    text: 'Benediction buff',
    title: 'Benediction buff',
    content: `Grants a single ally with Benediction to increase their ATK by ${precisionRound(skillAtkBoostScaling * 100)}%, up to ${precisionRound(skillAtkBoostMax * 100)}% of Tingyun's current ATK. When the ally with Benediction attacks, it deals lightning damage equal to ${precisionRound(skillLightningDmgBoostScaling * 100)}% of that ally's ATK. This effect lasts for 3 turns.`,
  }, {
    formItem: 'switch',
    id: 'skillSpdBuff',
    name: 'skillSpdBuff',
    text: 'Skill SPD buff',
    title: 'Skill SPD buff',
    content: `Tingyun's SPD increases by 20% for 1 turn after using Skill.`,
  }, {
    formItem: 'switch',
    id: 'ultDmgBuff',
    name: 'ultDmgBuff',
    text: 'Ult DMG buff',
    title: 'Ult DMG buff',
    content: `Regenerates 50 Energy for a single ally and increases the target's DMG by ${precisionRound(ultDmgBoost * 100)}% for 2 turn(s).`,
  }, {
    formItem: 'switch',
    id: 'ultSpdBuff',
    name: 'ultSpdBuff',
    text: 'E1 ult SPD buff',
    title: 'E1 ult SPD buff',
    content: `E1: After using their Ultimate, the ally with Benediction gains a 20% increase in SPD for 1 turn.`,
    disabled: e < 1,
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'benedictionBuff'),
    {
      formItem: 'slider',
      id: 'teammateAtkBuffValue',
      name: 'teammateAtkBuffValue',
      text: `Skill ATK buff value`,
      title: 'Benediction buff',
      content: `Grants a single ally with Benediction to increase their ATK by ${precisionRound(skillAtkBoostScaling * 100)}%, up to ${precisionRound(skillAtkBoostMax * 100)}% of Tingyun's current ATK. When the ally with Benediction attacks, it deals lightning damage equal to ${precisionRound(skillLightningDmgBoostScaling * 100)}% of that ally's ATK. This effect lasts for 3 turns.`,
      min: 0,
      max: skillAtkBoostScaling,
      percent: true,
    },
    findContentId(content, 'ultDmgBuff'),
    findContentId(content, 'ultSpdBuff'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      benedictionBuff: false,
      skillSpdBuff: false,
      ultSpdBuff: false,
      ultDmgBuff: false,
    }),
    teammateDefaults: () => ({
      benedictionBuff: true,
      ultSpdBuff: false,
      ultDmgBuff: true,
      teammateAtkBuffValue: skillAtkBoostScaling,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      // Stats
      x[Stats.SPD_P] += (r.skillSpdBuff) ? 0.20 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      buffAbilityDmg(x, BASIC_TYPE, 0.40)

      x.BASIC_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.SPD_P] += (e >= 1 && m.ultSpdBuff) ? 0.20 : 0

      x.ELEMENTAL_DMG += (m.ultDmgBuff) ? ultDmgBoost : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.characterConditionals

      x[Stats.ATK_P] += (t.benedictionBuff) ? t.teammateAtkBuffValue : 0
    },
    finalizeCalculations: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      // x[Stats.ATK] += (r.benedictionBuff) ? x[Stats.ATK] * skillAtkBoostMax : 0

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK] + ((r.benedictionBuff) ? skillLightningDmgBoostScaling + talentScaling : 0) * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    },
    gpuFinalizeCalculations: (request: Form) => {
      const r = request.characterConditionals
      return `
x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
if (${wgslTrue(r.benedictionBuff)}) {
  x.BASIC_DMG += (${skillLightningDmgBoostScaling + talentScaling}) * x.ATK;
}

x.SKILL_DMG += x.SKILL_SCALING * x.ATK;
x.ULT_DMG += x.ULT_SCALING * x.ATK;
    `
    },
    dynamicConditionals: [
      {
        id: 'TingyunAtkConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.ATK],
        ratioConversion: true,
        condition: function () {
          return true
        },
        effect: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
          const r = request.characterConditionals
          if (!r.benedictionBuff) {
            return
          }

          const stateValue = params.conditionalState[this.id] || 0
          const convertibleAtkValue = x[Stats.ATK] - x.RATIO_BASED_ATK_BUFF

          const buffATK = skillAtkBoostMax * convertibleAtkValue
          const stateBuffATK = skillAtkBoostMax * stateValue

          params.conditionalState[this.id] = x[Stats.ATK]

          const finalBuffAtk = buffATK - (stateValue ? stateBuffATK : 0)
          x.RATIO_BASED_ATK_BUFF += finalBuffAtk

          buffStat(x, request, params, Stats.ATK, finalBuffAtk)
        },
        gpu: function (request: Form, _params: OptimizerParams) {
          const r = request.characterConditionals

          return conditionalWgslWrapper(this, `
if (${wgslFalse(r.benedictionBuff)}) {
  return;
}

let stateValue: f32 = (*p_state).TingyunAtkConditional;
let convertibleAtkValue: f32 = (*p_x).ATK - (*p_x).RATIO_BASED_ATK_BUFF;

var buffATK: f32 = ${skillAtkBoostMax} * convertibleAtkValue;
var stateBuffATK: f32 = ${skillAtkBoostMax} * stateValue;

(*p_state).TingyunAtkConditional = (*p_x).ATK;

let finalBuffAtk = buffATK - select(0, stateBuffATK, stateValue > 0);
(*p_x).RATIO_BASED_ATK_BUFF += finalBuffAtk;

buffNonRatioDynamicATK(finalBuffAtk, p_x, p_state);
    `)
        },
      },
    ],
  }
}
