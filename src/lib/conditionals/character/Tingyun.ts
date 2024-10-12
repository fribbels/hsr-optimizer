import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants'
import { BASIC_TYPE, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId } from 'lib/conditionals/conditionalUtils'
import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { buffStat, conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse, wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Tingyun')
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
    text: t('Content.benedictionBuff.text'),
    title: t('Content.benedictionBuff.title'),
    content: t('Content.benedictionBuff.content', { skillAtkBoostScaling: TsUtils.precisionRound(100 * skillAtkBoostScaling), skillAtkBoostMax: TsUtils.precisionRound(100 * skillAtkBoostMax), skillLightningDmgBoostScaling: TsUtils.precisionRound(100 * skillLightningDmgBoostScaling) }),
  }, {
    formItem: 'switch',
    id: 'skillSpdBuff',
    name: 'skillSpdBuff',
    text: t('Content.skillSpdBuff.text'),
    title: t('Content.skillSpdBuff.title'),
    content: t('Content.skillSpdBuff.content'),
  }, {
    formItem: 'switch',
    id: 'ultDmgBuff',
    name: 'ultDmgBuff',
    text: t('Content.ultDmgBuff.text'),
    title: t('Content.ultDmgBuff.title'),
    content: t('Content.ultDmgBuff.content', { ultDmgBoost: TsUtils.precisionRound(100 * ultDmgBoost) }),
  }, {
    formItem: 'switch',
    id: 'ultSpdBuff',
    name: 'ultSpdBuff',
    text: t('Content.ultSpdBuff.text'),
    title: t('Content.ultSpdBuff.title'),
    content: t('Content.ultSpdBuff.content'),
    disabled: e < 1,
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'benedictionBuff'),
    {
      formItem: 'slider',
      id: 'teammateAtkBuffValue',
      name: 'teammateAtkBuffValue',
      text: t('TeammateContent.teammateAtkBuffValue.text'),
      title: t('TeammateContent.teammateAtkBuffValue.title'),
      content: t('TeammateContent.teammateAtkBuffValue.content', { skillAtkBoostScaling: TsUtils.precisionRound(100 * skillAtkBoostScaling), skillAtkBoostMax: TsUtils.precisionRound(100 * skillAtkBoostMax), skillLightningDmgBoostScaling: TsUtils.precisionRound(100 * skillLightningDmgBoostScaling) }),
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
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

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
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      x[Stats.SPD_P] += (e >= 1 && m.ultSpdBuff) ? 0.20 : 0

      x.ELEMENTAL_DMG += (m.ultDmgBuff) ? ultDmgBoost : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals

      x[Stats.ATK_P] += (t.benedictionBuff) ? t.teammateAtkBuffValue : 0
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      // x[Stats.ATK] += (r.benedictionBuff) ? x[Stats.ATK] * skillAtkBoostMax : 0

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK] + ((r.benedictionBuff) ? skillLightningDmgBoostScaling + talentScaling : 0) * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals
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
        effect: function (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals
          if (!r.benedictionBuff) {
            return
          }

          const stateValue = action.conditionalState[this.id] || 0
          const convertibleAtkValue = x[Stats.ATK] - x.RATIO_BASED_ATK_BUFF

          const buffATK = skillAtkBoostMax * convertibleAtkValue
          const stateBuffATK = skillAtkBoostMax * stateValue

          action.conditionalState[this.id] = x[Stats.ATK]

          const finalBuffAtk = buffATK - (stateValue ? stateBuffATK : 0)
          x.RATIO_BASED_ATK_BUFF += finalBuffAtk

          buffStat(x, Stats.ATK, finalBuffAtk, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals

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
