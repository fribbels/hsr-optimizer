import i18next from 'i18next'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, CURRENT_DATA_VERSION, Stats } from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslFalse, wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { ComputedStatsArray, Key, Source } from 'lib/optimization/computedStatsArray'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.x')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const basicScaling = basic(e, 0.50, 0.55)

  const skillScaling = skill(e, 0.90, 0.99)
  const skillEnhanced1Scaling = skill(e, 1.10, 1.21)
  const skillEnhanced2Scaling = skill(e, 2.80, 3.08)

  const ultScaling = ult(e, 1.60, 1.728)

  const defaults = {
    skillEnhances: 2,
    vendettaState: true,
    hpToCrConversion: true,
    e1DefPen: true,
  }

  const teammateDefaults = {}

  const content: ContentDefinition<typeof defaults> = {
    skillEnhances: {
      id: 'skillEnhances',
      formItem: 'slider',
      text: 'Skill Enhances',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 2,
    },
    vendettaState: {
      id: 'vendettaState',
      formItem: 'switch',
      text: 'Vendetta state',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    hpToCrConversion: {
      id: 'hpToCrConversion',
      formItem: 'switch',
      text: 'HP to CR conversion',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    e1DefPen: {
      id: 'e1DefPen',
      formItem: 'switch',
      text: 'E1 DEF PEN',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 1,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {}

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_SCALING.buff(basicScaling, Source.NONE)

      x.SKILL_SCALING.buff((r.skillEnhances == 0) ? skillScaling : 0, Source.NONE)
      x.SKILL_SCALING.buff((r.skillEnhances == 1) ? skillEnhanced1Scaling : 0, Source.NONE)
      x.SKILL_SCALING.buff((r.skillEnhances == 2) ? skillEnhanced2Scaling : 0, Source.NONE)

      x.ULT_SCALING.buff(ultScaling, Source.NONE)

      x.DEF_PEN.buff((e >= 1 && r.e1DefPen && r.vendettaState) ? 0.15 : 0, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.SKILL_TOUGHNESS_DMG.buff((r.skillEnhances > 1) ? 90 : 60, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(60, Source.NONE)
    },
    calculateBasicEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.CR.buff((r.hpToCrConversion) ? Math.max(0, Math.min(0.48, 0.016 * Math.floor((x.c[Stats.HP] - 5000) / 100))) : 0, Source.NONE)
    },
    gpuCalculateBasicEffects: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(r.hpToCrConversion)}) {
  let buffValue: f32 = max(0, min(0.48, 0.016 * floor((c.HP - 5000) / 100)));
  x.CR += buffValue;
}
`
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.vendettaState) {
        x.DEF.set(0, Source.NONE)
      }

      x.BASIC_DMG.buff(x.a[Key.BASIC_SCALING] * x.a[Key.HP], Source.NONE)
      x.SKILL_DMG.buff(x.a[Key.SKILL_SCALING] * x.a[Key.HP], Source.NONE)
      x.ULT_DMG.buff(x.a[Key.ULT_SCALING] * x.a[Key.HP], Source.NONE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(r.vendettaState)}) {
  x.DEF = 0;
}

x.BASIC_DMG += x.BASIC_SCALING * x.HP;
x.SKILL_DMG += x.SKILL_SCALING * x.HP;
x.ULT_DMG += x.ULT_SCALING * x.HP;
`
    },
    dynamicConditionals: [
      {
        id: 'MydeiHpConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.HP],
        ratioConversion: true,
        condition: function () {
          return true
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          if (!r.vendettaState) {
            return
          }

          const stateValue = action.conditionalState[this.id] || 0
          const convertibleHpValue = x.a[Key.HP] - x.a[Key.RATIO_BASED_HP_BUFF]

          const buffHP = 0.50 * convertibleHpValue
          const stateBuffHP = 0.50 * stateValue

          action.conditionalState[this.id] = x.a[Key.HP]

          const finalBuffHp = buffHP - (stateValue ? stateBuffHP : 0)
          x.a[Key.RATIO_BASED_HP_BUFF] += finalBuffHp

          x.HP.buffDynamic(finalBuffHp, Source.NONE, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return conditionalWgslWrapper(this, `
if (${wgslFalse(r.vendettaState)}) {
  return;
}

let stateValue: f32 = (*p_state).MydeiHpConditional;
let convertibleHpValue: f32 = (*p_x).HP - (*p_x).RATIO_BASED_HP_BUFF;

var buffHP: f32 = ${0.50} * convertibleHpValue;
var stateBuffHP: f32 = ${0.50} * stateValue;

(*p_state).MydeiHpConditional = (*p_x).HP;

let finalBuffHp = buffHP - select(0, stateBuffHP, stateValue > 0);
(*p_x).RATIO_BASED_HP_BUFF += finalBuffHp;

buffNonRatioDynamicHP(finalBuffHp, p_x, p_m, p_state);
    `)
        },
      },
    ],
  }
}
