import { gpuStandardAtkFinalizer, gpuStandardDefShieldFinalizer, standardAtkFinalizer, standardDefShieldFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { ComputedStatsArray, Key, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Gepard')
  const { basic, skill, ult } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)

  const ultShieldScaling = ult(e, 0.45, 0.48)
  const ultShieldFlat = ult(e, 600, 667.5)

  const defaults = {
    e4TeamResBuff: true,
  }

  const teammateDefaults = {
    e4TeamResBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    e4TeamResBuff: {
      id: 'e4TeamResBuff',
      formItem: 'switch',
      text: t('Content.e4TeamResBuff.text'),
      content: t('Content.e4TeamResBuff.content'),
      disabled: e < 4,
    },
  }
  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    e4TeamResBuff: content.e4TeamResBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.SKILL_TOUGHNESS_DMG.buff(60, Source.NONE)

      x.SHIELD_SCALING.buff(ultShieldScaling, Source.NONE)
      x.SHIELD_FLAT.buff(ultShieldFlat, Source.NONE)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.RES.buffTeam((e >= 4 && m.e4TeamResBuff) ? 0.20 : 0, Source.NONE)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
      standardAtkFinalizer(x)
      standardDefShieldFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer() + gpuStandardDefShieldFinalizer(),
    dynamicConditionals: [
      {
        id: 'GepardConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.DEF],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          return true
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const stateValue = action.conditionalState[this.id] || 0
          const buffValue = 0.35 * x.a[Key.DEF]

          action.conditionalState[this.id] = buffValue
          x.ATK.buffDynamic(buffValue - stateValue, Source.NONE, action, context)
        },
        gpu: function () {
          return conditionalWgslWrapper(this, `
let def = (*p_x).DEF;
let stateValue: f32 = (*p_state).GepardConversionConditional;
let buffValue: f32 = 0.35 * def;

(*p_state).GepardConversionConditional = buffValue;
buffDynamicATK(buffValue - stateValue, p_x, p_m, p_state);
    `)
        },
      },
    ],
  }
}
