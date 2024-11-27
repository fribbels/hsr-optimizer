import { gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { ComputedStatsArray, Key, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sparkle')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const skillCdBuffScaling = skill(e, 0.24, 0.264)
  const skillCdBuffBase = skill(e, 0.45, 0.486)
  const cipherTalentStackBoost = ult(e, 0.10, 0.108)
  const talentBaseStackBoost = talent(e, 0.06, 0.066)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 0, 0)

  const atkBoostByQuantumAllies: Record<number, number> = {
    0: 0,
    1: 0.05,
    2: 0.15,
    3: 0.30,
  }

  const defaults = {
    skillCdBuff: false,
    cipherBuff: true,
    talentStacks: 3,
    quantumAllies: 3,
  }

  const teammateDefaults = {
    ...defaults,
    ...{
      skillCdBuff: true,
      teammateCDValue: 2.5,
    },
  }

  const content: ContentDefinition<typeof defaults> = {
    skillCdBuff: {
      id: 'skillCdBuff',
      formItem: 'switch',
      text: t('Content.skillCdBuff.text'),
      content: t('Content.skillCdBuff.content', {
        skillCdBuffScaling: TsUtils.precisionRound(100 * skillCdBuffScaling),
        skillCdBuffBase: TsUtils.precisionRound(100 * skillCdBuffBase),
      }),
    },
    cipherBuff: {
      id: 'cipherBuff',
      formItem: 'switch',
      text: t('Content.cipherBuff.text'),
      content: t('Content.cipherBuff.content', { cipherTalentStackBoost: TsUtils.precisionRound(100 * cipherTalentStackBoost) }),
    },
    talentStacks: {
      id: 'talentStacks',
      formItem: 'slider',
      text: t('Content.talentStacks.text'),
      content: t('Content.talentStacks.content', { talentBaseStackBoost: TsUtils.precisionRound(100 * talentBaseStackBoost) }),
      min: 0,
      max: 3,
    },
    quantumAllies: {
      id: 'quantumAllies',
      formItem: 'slider',
      text: t('Content.quantumAllies.text'),
      content: t('Content.quantumAllies.content'),
      min: 0,
      max: 3,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillCdBuff: content.skillCdBuff,
    teammateCDValue: {
      id: 'teammateCDValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateCDValue.text'),
      content: t('TeammateContent.teammateCDValue.content', {
        skillCdBuffScaling: TsUtils.precisionRound(100 * skillCdBuffScaling),
        skillCdBuffBase: TsUtils.precisionRound(100 * skillCdBuffBase),
      }),
      min: 0,
      max: 3.50,
      percent: true,
    },
    cipherBuff: content.cipherBuff,
    talentStacks: content.talentStacks,
    quantumAllies: content.quantumAllies,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)
      x.ULT_SCALING.buff(ultScaling, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Main damage type
      x.ATK_P.buff(
        0.15 + (context.elementalDamageType == Stats.Quantum_DMG
          ? (atkBoostByQuantumAllies[m.quantumAllies] || 0)
          : 0),
        Source.NONE)
      x.ATK_P.buff((e >= 1 && m.cipherBuff) ? 0.40 : 0, Source.NONE)

      x.ELEMENTAL_DMG.buff(
        (m.cipherBuff)
          ? m.talentStacks * (talentBaseStackBoost + cipherTalentStackBoost)
          : m.talentStacks * talentBaseStackBoost,
        Source.NONE)
      x.DEF_PEN.buff((e >= 2) ? 0.08 * m.talentStacks : 0, Source.NONE)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.CD.buff(
        (t.skillCdBuff)
          ? skillCdBuffBase + (skillCdBuffScaling + (e >= 6 ? 0.30 : 0)) * t.teammateCDValue
          : 0,
        Source.NONE)
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
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          if (!r.skillCdBuff) {
            return
          }

          const buffScalingValue = (skillCdBuffScaling + (e >= 6 ? 0.30 : 0))

          const stateValue = action.conditionalState[this.id] || 0
          const convertibleCdValue = x.a[Key.CD] - x.a[Key.RATIO_BASED_CD_BUFF]

          const buffCD = buffScalingValue * convertibleCdValue + skillCdBuffBase
          const stateBuffCD = buffScalingValue * stateValue + skillCdBuffBase

          action.conditionalState[this.id] = x.a[Key.CD]

          const finalBuffCd = buffCD - (stateValue ? stateBuffCD : 0)
          x.RATIO_BASED_CD_BUFF.buff(finalBuffCd, Source.NONE)

          x.CD.buffDynamic(finalBuffCd, Source.NONE, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
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
