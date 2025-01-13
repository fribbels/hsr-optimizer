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
  const skillEnhancedScaling = skill(e, 1.00, 1.10)
  const skillEnhancedLostHpScaling = skill(e, 1.00, 1.10)

  const ultScaling = ult(e, 1.60, 1.728)

  const defaults = {
    skillEnhances: 2,
    vendettaState: true,
    hpToCrConversion: true,
    hpLossTally: 1.80,
    e1DefPen: true,
    e4CdBuff: true,
    e6Buffs: true,
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
    hpLossTally: {
      id: 'hpLossTally',
      formItem: 'slider',
      text: 'HP loss tally',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      percent: true,
      min: 0,
      max: 1.80,
    },
    e1DefPen: {
      id: 'e1DefPen',
      formItem: 'switch',
      text: 'E1 DEF PEN',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 1,
    },
    e4CdBuff: {
      id: 'e4CdBuff',
      formItem: 'switch',
      text: 'E4 CD buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 4,
    },
    e6Buffs: {
      id: 'e6Buffs',
      formItem: 'switch',
      text: 'E6 buffs',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 6,
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

      x.SKILL_SCALING.buff((r.skillEnhances > 0) ? skillEnhancedScaling : skillScaling, Source.NONE)
      x.ULT_SCALING.buff(ultScaling, Source.NONE)

      x.DEF_PEN.buff((e >= 1 && r.e1DefPen && r.vendettaState) ? 0.12 : 0, Source.NONE)

      x.CD.buff((e >= 4 && r.e4CdBuff) ? 0.30 : 0, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.SKILL_TOUGHNESS_DMG.buff((r.skillEnhances > 1) ? 90 : 60, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(60, Source.NONE)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.vendettaState) {
        x.DEF.set(0, Source.NONE)
      }

      x.BASIC_DMG.buff(x.a[Key.BASIC_SCALING] * x.a[Key.HP], Source.NONE)
      x.SKILL_DMG.buff(x.a[Key.SKILL_SCALING] * x.a[Key.HP], Source.NONE)
      x.SKILL_DMG.buff((r.skillEnhances == 2) ? r.hpLossTally * x.a[Key.HP] * skillEnhancedLostHpScaling : 0, Source.NONE)
      x.ULT_DMG.buff(x.a[Key.ULT_SCALING] * x.a[Key.HP], Source.NONE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(r.vendettaState)}) {
  x.DEF = 0;
}
if (${wgslTrue(r.skillEnhances == 2)}) {
  x.SKILL_DMG += ${r.hpLossTally * skillEnhancedLostHpScaling} * x.HP;
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

          const maxHpConversion = 0.50 + ((e >= 6 && r.e6Buffs) ? 1.00 : 0)

          const stateValue = action.conditionalState[this.id] || 0
          const convertibleHpValue = x.a[Key.HP] - x.a[Key.RATIO_BASED_HP_BUFF]

          const buffHP = maxHpConversion * convertibleHpValue
          const stateBuffHP = maxHpConversion * stateValue

          action.conditionalState[this.id] = x.a[Key.HP]

          const finalBuffHp = buffHP - (stateValue ? stateBuffHP : 0)
          x.a[Key.RATIO_BASED_HP_BUFF] += finalBuffHp

          x.HP.buffDynamic(finalBuffHp, Source.NONE, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          const maxHpConversion = 0.50 + ((e >= 6 && r.e6Buffs) ? 1.00 : 0)

          return conditionalWgslWrapper(this, `
if (${wgslFalse(r.vendettaState)}) {
  return;
}

let stateValue: f32 = (*p_state).MydeiHpConditional;
let convertibleHpValue: f32 = (*p_x).HP - (*p_x).RATIO_BASED_HP_BUFF;

var buffHP: f32 = ${maxHpConversion} * convertibleHpValue;
var stateBuffHP: f32 = ${maxHpConversion} * stateValue;

(*p_state).MydeiHpConditional = (*p_x).HP;

let finalBuffHp = buffHP - select(0, stateBuffHP, stateValue > 0);
(*p_x).RATIO_BASED_HP_BUFF += finalBuffHp;

buffNonRatioDynamicHP(finalBuffHp, p_x, p_m, p_state);
    `)
        },
      },
      {
        id: 'MydeiConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.HP],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return r.hpToCrConversion && x.a[Key.HP] > 5000
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const stateValue = action.conditionalState[this.id] || 0
          const buffValue = Math.min(0.48, 0.016 * Math.floor((x.a[Key.HP] - 5000) / 100))

          action.conditionalState[this.id] = buffValue
          x.CR.buffDynamic(buffValue - stateValue, Source.NONE, action, context)

          return buffValue
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return conditionalWgslWrapper(this, `
if (${wgslFalse(r.hpToCrConversion)}) {
  return;
}
let hp = (*p_x).HP;
let stateValue: f32 = (*p_state).MydeiConversionConditional;

if (hp > 5000) {
  let buffValue: f32 = min(0.48, 0.016 * floor((hp - 5000) / 100));

  (*p_state).MydeiConversionConditional = buffValue;
  buffDynamicCR(buffValue - stateValue, p_x, p_m, p_state);
}
    `)
        },
      },
    ],
  }
}
