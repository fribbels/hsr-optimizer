import { ComputedStatsObject, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardHpFinalizer, gpuStandardHpHealFinalizer, standardHpFinalizer, standardHpHealFinalizer } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants'
import { buffDynamicStat, conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { TsUtils } from 'lib/TsUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.FuXuan')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5

  const skillCrBuffValue = skill(e, 0.12, 0.132)
  const skillHpBuffValue = skill(e, 0.06, 0.066)
  const talentDmgReductionValue = talent(e, 0.18, 0.196)

  const basicScaling = basic(e, 0.50, 0.55)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 1.00, 1.08)

  const ultHealScaling = 0.05
  const ultHealFlat = 133

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'talentActive',
      text: t('Content.talentActive.text'),
      content: t('Content.talentActive.content', { talentDmgReductionValue: TsUtils.precisionRound(100 * talentDmgReductionValue) }),
    },
    {
      formItem: 'switch',
      id: 'skillActive',
      text: t('Content.skillActive.text'),
      content: t('Content.skillActive.content', {
        skillHpBuffValue: TsUtils.precisionRound(100 * skillHpBuffValue),
        skillCrBuffValue: TsUtils.precisionRound(100 * skillCrBuffValue),
      }),
    },
    {
      formItem: 'slider',
      id: 'e6TeamHpLostPercent',
      text: t('Content.e6TeamHpLostPercent.text'),
      content: t('Content.e6TeamHpLostPercent.content'),
      min: 0,
      max: 1.2,
      percent: true,
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'talentActive'),
    findContentId(content, 'skillActive'),
    {
      formItem: 'slider',
      id: 'teammateHPValue',
      text: t('TeammateContent.teammateHPValue.text'),
      content: t('TeammateContent.teammateHPValue.content', { skillHpBuffValue: TsUtils.precisionRound(100 * skillHpBuffValue) }),
      min: 0,
      max: 10000,
    },
  ]

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => ({
      skillActive: true,
      talentActive: true,
      e6TeamHpLostPercent: 1.2,
    }),
    teammateDefaults: () => ({
      skillActive: true,
      talentActive: true,
      teammateHPValue: 8000,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling + ((e >= 6) ? 2.00 * r.e6TeamHpLostPercent : 0)

      x.BASIC_TOUGHNESS_DMG += 30
      x.ULT_TOUGHNESS_DMG += 60

      x.HEAL_TYPE = ULT_TYPE
      x.HEAL_SCALING += ultHealScaling
      x.HEAL_FLAT += ultHealFlat

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      x[Stats.CR] += (m.skillActive) ? skillCrBuffValue : 0
      x[Stats.CD] += (e >= 1 && m.skillActive) ? 0.30 : 0

      // Talent ehp buff is shared
      x.DMG_RED_MULTI *= (m.talentActive) ? (1 - talentDmgReductionValue) : 1
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals

      x[Stats.HP] += (t.skillActive) ? skillHpBuffValue * t.teammateHPValue : 0

      // Skill ehp buff only applies to teammates
      x.DMG_RED_MULTI *= (t.skillActive) ? (1 - 0.65) : 1
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      standardHpFinalizer(x)
      standardHpHealFinalizer(x)
    },
    gpuFinalizeCalculations: () => {
      return gpuStandardHpFinalizer() + gpuStandardHpHealFinalizer()
    },
    dynamicConditionals: [
      {
        id: 'FuXuanHpConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.HP],
        ratioConversion: true,
        condition: function () {
          return true
        },
        effect: function (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals
          if (!r.skillActive) {
            return
          }

          const stateValue = action.conditionalState[this.id] || 0
          const convertibleHpValue = x[Stats.HP] - x.RATIO_BASED_HP_BUFF

          const buffHP = skillHpBuffValue * convertibleHpValue
          const stateBuffHP = skillHpBuffValue * stateValue

          action.conditionalState[this.id] = x[Stats.HP]

          const finalBuffHp = buffHP - (stateValue ? stateBuffHP : 0)
          x.RATIO_BASED_HP_BUFF += finalBuffHp

          buffDynamicStat(x, Stats.HP, finalBuffHp, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals

          return conditionalWgslWrapper(this, `
if (${wgslFalse(r.skillActive)}) {
  return;
}

let stateValue: f32 = (*p_state).FuXuanHpConditional;
let convertibleHpValue: f32 = (*p_x).HP - (*p_x).RATIO_BASED_HP_BUFF;

var buffHP: f32 = ${skillHpBuffValue} * convertibleHpValue;
var stateBuffHP: f32 = ${skillHpBuffValue} * stateValue;

(*p_state).FuXuanHpConditional = (*p_x).HP;

let finalBuffHp = buffHP - select(0, stateBuffHP, stateValue > 0);
(*p_x).RATIO_BASED_HP_BUFF += finalBuffHp;

buffNonRatioDynamicHP(finalBuffHp, p_x, p_state);
    `)
        },
      },
    ],
  }
}
