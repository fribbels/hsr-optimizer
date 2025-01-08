import { ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardHpFinalizer, gpuStandardHpHealFinalizer, standardHpFinalizer, standardHpHealFinalizer } from 'lib/conditionals/conditionalFinalizers'
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

  const defaults = {
    skillActive: true,
    talentActive: true,
    e6TeamHpLostPercent: 1.2,
  }

  const teammateDefaults = {
    skillActive: true,
    talentActive: true,
    teammateHPValue: 8000,
  }

  const content: ContentDefinition<typeof defaults> = {
    talentActive: {
      id: 'talentActive',
      formItem: 'switch',
      text: t('Content.talentActive.text'),
      content: t('Content.talentActive.content', { talentDmgReductionValue: TsUtils.precisionRound(100 * talentDmgReductionValue) }),
    },
    skillActive: {
      id: 'skillActive',
      formItem: 'switch',
      text: t('Content.skillActive.text'),
      content: t('Content.skillActive.content', {
        skillHpBuffValue: TsUtils.precisionRound(100 * skillHpBuffValue),
        skillCrBuffValue: TsUtils.precisionRound(100 * skillCrBuffValue),
      }),
    },
    e6TeamHpLostPercent: {
      id: 'e6TeamHpLostPercent',
      formItem: 'slider',
      text: t('Content.e6TeamHpLostPercent.text'),
      content: t('Content.e6TeamHpLostPercent.content'),
      min: 0,
      max: 1.2,
      percent: true,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    talentActive: content.talentActive,
    skillActive: content.skillActive,
    teammateHPValue: {
      id: 'teammateHPValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateHPValue.text'),
      content: t('TeammateContent.teammateHPValue.content', { skillHpBuffValue: TsUtils.precisionRound(100 * skillHpBuffValue) }),
      min: 0,
      max: 10000,
    },
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Scaling
      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)
      x.ULT_SCALING.buff(ultScaling + ((e >= 6) ? 2.00 * r.e6TeamHpLostPercent : 0), Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(60, Source.NONE)

      x.HEAL_TYPE.set(ULT_DMG_TYPE, Source.NONE)
      x.HEAL_SCALING.buff(ultHealScaling, Source.NONE)
      x.HEAL_FLAT.buff(ultHealFlat, Source.NONE)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.CR.buffTeam((m.skillActive) ? skillCrBuffValue : 0, Source.NONE)
      x.CD.buffTeam((e >= 1 && m.skillActive) ? 0.30 : 0, Source.NONE)

      // Talent ehp buff is shared
      x.DMG_RED_MULTI.multiplyTeam((m.talentActive) ? (1 - talentDmgReductionValue) : 1, Source.NONE)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.HP.buffTeam((t.skillActive) ? skillHpBuffValue * t.teammateHPValue : 0, Source.NONE)
      x.RATIO_BASED_HP_BUFF.buffTeam((t.skillActive) ? skillHpBuffValue * t.teammateHPValue : 0, Source.NONE)

      // Skill ehp buff only applies to teammates
      x.DMG_RED_MULTI.multiplyTeam((t.skillActive) ? (1 - 0.65) : 1, Source.NONE)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
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
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          if (!r.skillActive) {
            return
          }

          const stateValue = action.conditionalState[this.id] || 0
          const convertibleHpValue = x.a[Key.HP] - x.a[Key.RATIO_BASED_HP_BUFF]

          const buffHP = skillHpBuffValue * convertibleHpValue
          const stateBuffHP = skillHpBuffValue * stateValue

          action.conditionalState[this.id] = x.a[Key.HP]

          const finalBuffHp = buffHP - (stateValue ? stateBuffHP : 0)
          x.a[Key.RATIO_BASED_HP_BUFF] += finalBuffHp

          x.HP.buffDynamic(finalBuffHp, Source.NONE, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

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

buffNonRatioDynamicHP(finalBuffHp, p_x, p_m, p_state);
    `)
        },
      },
    ],
  }
}
