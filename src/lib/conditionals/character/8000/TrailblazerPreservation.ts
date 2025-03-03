import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { gpuStandardDefShieldFinalizer, standardDefShieldFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.TrailblazerPreservation')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('8004')

  const skillDamageReductionValue = skill(e, 0.50, 0.52)

  const basicAtkScaling = basic(e, 1.00, 1.10)
  const basicDefScaling = (e >= 1) ? 0.25 : 0
  const basicEnhancedAtkScaling = basic(e, 1.35, 1.463)
  const basicEnhancedDefScaling = (e >= 1) ? 0.50 : 0
  const ultAtkScaling = ult(e, 1.00, 1.10)
  const ultDefScaling = ult(e, 1.50, 1.65)

  const talentShieldScaling = talent(e, 0.06, 0.064)
  const talentShieldFlat = talent(e, 80, 89)

  const defaults = {
    enhancedBasic: true,
    skillActive: true,
    shieldActive: true,
    e6DefStacks: 3,
  }

  const teammateDefaults = {
    skillActive: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedBasic: {
      id: 'enhancedBasic',
      formItem: 'switch',
      text: t('Content.enhancedBasic.text'),
      content: t('Content.enhancedBasic.content', { basicEnhancedAtkScaling: TsUtils.precisionRound(100 * basicEnhancedAtkScaling) }),
    },
    skillActive: {
      id: 'skillActive',
      formItem: 'switch',
      text: t('Content.skillActive.text'),
      content: t('Content.skillActive.content', { skillDamageReductionValue: TsUtils.precisionRound(100 * skillDamageReductionValue) }),
    },
    shieldActive: {
      id: 'shieldActive',
      formItem: 'switch',
      text: t('Content.shieldActive.text'),
      content: t('Content.shieldActive.content'),
    },
    e6DefStacks: {
      id: 'e6DefStacks',
      formItem: 'slider',
      text: t('Content.e6DefStacks.text'),
      content: t('Content.e6DefStacks.content'),
      min: 0,
      max: 3,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillActive: content.skillActive,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.DEF_P.buff((e >= 6) ? r.e6DefStacks * 0.10 : 0, SOURCE_E6)
      x.ATK_P.buff((r.shieldActive) ? 0.15 : 0, SOURCE_TRACE)

      if (r.enhancedBasic) {
        x.BASIC_ATK_SCALING.buff(basicEnhancedAtkScaling, SOURCE_BASIC)
        x.BASIC_DEF_SCALING.buff(basicEnhancedDefScaling, SOURCE_BASIC)
      } else {
        x.BASIC_ATK_SCALING.buff(basicAtkScaling, SOURCE_BASIC)
        x.BASIC_DEF_SCALING.buff(basicDefScaling, SOURCE_BASIC)
      }

      x.ULT_ATK_SCALING.buff(ultAtkScaling, Source.NONE)
      x.ULT_DEF_SCALING.buff(ultDefScaling, Source.NONE)

      // Boost
      // This EHP buff only applies to self
      x.DMG_RED_MULTI.multiply((r.skillActive) ? (1 - skillDamageReductionValue) : 1, SOURCE_SKILL)

      x.BASIC_TOUGHNESS_DMG.buff((r.enhancedBasic) ? 20 : 10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      x.SHIELD_SCALING.buff(talentShieldScaling, SOURCE_TALENT)
      x.SHIELD_FLAT.buff(talentShieldFlat, SOURCE_TALENT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // This EHP buff applies to all
      x.DMG_RED_MULTI.multiplyTeam((m.skillActive) ? (1 - 0.15) : 1, SOURCE_TRACE)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardDefShieldFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => gpuStandardDefShieldFinalizer(),
  }
}
