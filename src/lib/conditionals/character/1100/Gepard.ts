import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { gpuStandardDefShieldFinalizer, standardDefShieldFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Gepard')
  const { basic, skill, ult } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_ULT,
    SOURCE_TALENT,
    SOURCE_TECHNIQUE,
    SOURCE_TRACE,
    SOURCE_MEMO,
    SOURCE_E1,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
  } = Source.character('1104')

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
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)

      x.SHIELD_SCALING.buff(ultShieldScaling, SOURCE_ULT)
      x.SHIELD_FLAT.buff(ultShieldFlat, SOURCE_ULT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.RES.buffTeam((e >= 4 && m.e4TeamResBuff) ? 0.20 : 0, SOURCE_E4)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
      standardDefShieldFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardDefShieldFinalizer(),
    dynamicConditionals: [
      {
        id: 'GepardConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.DEF],
        chainsTo: [Stats.ATK],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          return true
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.DEF, Stats.ATK, this, x, action, context, SOURCE_TRACE,
            (convertibleValue) => convertibleValue * 0.35,
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          return gpuDynamicStatConversion(Stats.DEF, Stats.ATK, this, action, context,
            `0.35 * convertibleValue`,
            `true`,
          )
        },
      },
    ],
  }
}
