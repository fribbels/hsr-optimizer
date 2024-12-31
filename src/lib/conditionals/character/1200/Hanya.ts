import { BASIC_DMG_TYPE, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { buffAbilityDmg, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Key, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Hanya')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const ultSpdBuffValue = ult(e, 0.20, 0.21)
  const ultAtkBuffValue = ult(e, 0.60, 0.648)
  let talentDmgBoostValue = talent(e, 0.30, 0.33)

  talentDmgBoostValue += (e >= 6) ? 0.10 : 0

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.40, 2.64)
  const ultScaling = ult(e, 0, 0)

  const defaults = {
    ultBuff: true,
    targetBurdenActive: true,
    burdenAtkBuff: true,
    e2SkillSpdBuff: false,
  }

  const teammateDefaults = {
    ultBuff: true,
    targetBurdenActive: true,
    burdenAtkBuff: true,
    teammateSPDValue: 160,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultBuff: {
      id: 'ultBuff',
      formItem: 'switch',
      text: t('Content.ultBuff.text'),
      content: t('Content.ultBuff.content', {
        ultSpdBuffValue: TsUtils.precisionRound(100 * ultSpdBuffValue),
        ultAtkBuffValue: TsUtils.precisionRound(100 * ultAtkBuffValue),
      }),
    },
    targetBurdenActive: {
      id: 'targetBurdenActive',
      formItem: 'switch',
      text: t('Content.targetBurdenActive.text'),
      content: t('Content.targetBurdenActive.content', { talentDmgBoostValue: TsUtils.precisionRound(100 * talentDmgBoostValue) }),
    },
    burdenAtkBuff: {
      id: 'burdenAtkBuff',
      formItem: 'switch',
      text: t('Content.burdenAtkBuff.text'),
      content: t('Content.burdenAtkBuff.content'),
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
    ultBuff: content.ultBuff,
    teammateSPDValue: {
      id: 'teammateSPDValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateSPDValue.text'),
      content: t('TeammateContent.teammateSPDValue.content', {
        ultSpdBuffValue: TsUtils.precisionRound(100 * ultSpdBuffValue),
        ultAtkBuffValue: TsUtils.precisionRound(100 * ultAtkBuffValue),
      }),
      min: 0,
      max: 200,
    },
    targetBurdenActive: content.targetBurdenActive,
    burdenAtkBuff: content.burdenAtkBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats

      // Scaling
      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)
      x.ULT_SCALING.buff(ultScaling, Source.NONE)

      x.SPD_P.buff((e >= 2 && r.e2SkillSpdBuff) ? 0.20 : 0, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.SKILL_TOUGHNESS_DMG.buff(60, Source.NONE)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.ATK_P.buff((m.burdenAtkBuff) ? 0.10 : 0, Source.NONE) // TODO: MEMO

      buffAbilityDmg(x, BASIC_DMG_TYPE | SKILL_DMG_TYPE | ULT_DMG_TYPE, (m.targetBurdenActive) ? talentDmgBoostValue : 0, Source.NONE, Target.MAIN)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.SPD.buff((t.ultBuff) ? ultSpdBuffValue * t.teammateSPDValue : 0, Source.NONE) // TODO: MEMO
      x.RATIO_BASED_SPD_BUFF.buff((t.ultBuff) ? ultSpdBuffValue * t.teammateSPDValue : 0, Source.NONE) // TODO: MEMO
      x.ATK_P.buff((t.ultBuff) ? ultAtkBuffValue : 0, Source.NONE) // TODO: MEMO
    },
    finalizeCalculations: (x: ComputedStatsArray) => standardAtkFinalizer(x),
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
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          if (!r.ultBuff) {
            return
          }

          const stateValue = action.conditionalState[this.id] || 0
          const convertibleSpdValue = x.a[Key.SPD] - x.a[Key.RATIO_BASED_SPD_BUFF]

          const buffSPD = ultSpdBuffValue * convertibleSpdValue
          const stateBuffSPD = ultSpdBuffValue * stateValue

          action.conditionalState[this.id] = x.a[Key.SPD]

          const finalBuffSpd = buffSPD - (stateValue ? stateBuffSPD : 0)
          x.RATIO_BASED_SPD_BUFF.buff(finalBuffSpd, Source.NONE)

          x.SPD.buffDynamic(finalBuffSpd, Source.NONE, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

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

buffNonRatioDynamicSPD(finalBuffSpd, p_x, p_m, p_state);
    `)
        },
      },
    ],
  }
}
