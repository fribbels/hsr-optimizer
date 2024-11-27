import { ASHBLAZING_ATK_STACK, BASIC_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { buffAbilityCr } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Key, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Bronya')
  const { basic, skill, ult } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const skillDmgBoostValue = skill(e, 0.66, 0.726)
  const ultAtkBoostValue = ult(e, 0.55, 0.594)
  const ultCdBoostValue = ult(e, 0.16, 0.168)
  const ultCdBoostBaseValue = ult(e, 0.20, 0.216)

  const basicScaling = basic(e, 1.0, 1.1)
  const fuaScaling = basicScaling * 0.80

  const hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  const defaults = {
    teamDmgBuff: true,
    skillBuff: true,
    ultBuff: true,
    battleStartDefBuff: false,
    techniqueBuff: false,
    e2SkillSpdBuff: false,
  }

  const teammateDefaults = {
    ...defaults,
    ...{
      teammateCDValue: 2.50,
    },
  }

  const content: ContentDefinition<typeof defaults> = {
    teamDmgBuff: {
      id: 'teamDmgBuff',
      formItem: 'switch',
      text: t('Content.teamDmgBuff.text'),
      content: t('Content.teamDmgBuff.content'),
    },
    skillBuff: {
      id: 'skillBuff',
      formItem: 'switch',
      text: t('Content.skillBuff.text'),
      content: t('Content.skillBuff.content', { skillDmgBoostValue: TsUtils.precisionRound(100 * skillDmgBoostValue) }),
    },
    ultBuff: {
      id: 'ultBuff',
      formItem: 'switch',
      text: t('Content.ultBuff.text'),
      content: t('Content.ultBuff.content', {
        ultAtkBoostValue: TsUtils.precisionRound(100 * ultAtkBoostValue),
        ultCdBoostValue: TsUtils.precisionRound(100 * ultCdBoostValue),
        ultCdBoostBaseValue: TsUtils.precisionRound(100 * ultCdBoostBaseValue),
      }),
    },
    battleStartDefBuff: {
      id: 'battleStartDefBuff',
      formItem: 'switch',
      text: t('Content.battleStartDefBuff.text'),
      content: t('Content.battleStartDefBuff.content'),
    },
    techniqueBuff: {
      id: 'techniqueBuff',
      formItem: 'switch',
      text: t('Content.techniqueBuff.text'),
      content: t('Content.techniqueBuff.content'),
    },
    e2SkillSpdBuff: {
      id: 'e2SkillSpdBuff',
      formItem: 'switch',
      text: t('Content.e2SkillSpdBuff.text'),
      content: t('Content.e2SkillSpdBuff.content'),
      disabled: e < 2,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    teamDmgBuff: content.teamDmgBuff,
    skillBuff: content.skillBuff,
    ultBuff: content.ultBuff,
    battleStartDefBuff: content.battleStartDefBuff,
    techniqueBuff: content.techniqueBuff,
    teammateCDValue: {
      id: 'teammateCDValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateCDValue.text'),
      content: t('TeammateContent.teammateCDValue.content', {
        ultAtkBoostValue: TsUtils.precisionRound(100 * ultAtkBoostValue),
        ultCdBoostValue: TsUtils.precisionRound(100 * ultCdBoostValue),
        ultCdBoostBaseValue: TsUtils.precisionRound(100 * ultCdBoostBaseValue),
      }),
      min: 0,
      max: 3.00,
      percent: true,
    },
    e2SkillSpdBuff: content.e2SkillSpdBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      buffAbilityCr(x, BASIC_TYPE, 1.00, Source.NONE)

      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.FUA_SCALING.buff((e >= 4) ? fuaScaling : 0, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.FUA_TOUGHNESS_DMG.buff((e >= 4) ? 30 : 0, Source.NONE)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.DEF_P.buff((m.battleStartDefBuff) ? 0.20 : 0, Source.NONE)
      x.SPD_P.buff((m.e2SkillSpdBuff) ? 0.30 : 0, Source.NONE)
      x.ATK_P.buff((m.techniqueBuff) ? 0.15 : 0, Source.NONE)
      x.ATK_P.buff((m.ultBuff) ? ultAtkBoostValue : 0, Source.NONE)

      x.ELEMENTAL_DMG.buff((m.teamDmgBuff) ? 0.10 : 0, Source.NONE)
      x.ELEMENTAL_DMG.buff((m.skillBuff) ? skillDmgBoostValue : 0, Source.NONE)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.CD.buff((t.ultBuff) ? ultCdBoostValue * t.teammateCDValue : 0, Source.NONE)
      x.CD.buff((t.ultBuff) ? ultCdBoostBaseValue : 0, Source.NONE)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
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
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          return true
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          if (!r.ultBuff) {
            return
          }

          const stateValue = action.conditionalState[this.id] || 0
          const convertibleCdValue = x.a[Key.CD] - x.a[Key.RATIO_BASED_CD_BUFF]

          const buffCD = ultCdBoostValue * convertibleCdValue + ultCdBoostBaseValue
          const stateBuffCD = ultCdBoostValue * stateValue + ultCdBoostBaseValue

          action.conditionalState[this.id] = x.a[Key.CD]

          const finalBuffCd = buffCD - (stateValue ? stateBuffCD : 0)
          x.RATIO_BASED_CD_BUFF.buff(finalBuffCd, Source.NONE)

          x.CD.buffDynamic(finalBuffCd, Source.NONE, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

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
