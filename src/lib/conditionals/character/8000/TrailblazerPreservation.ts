import { gpuStandardDefShieldFinalizer, standardDefShieldFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { ComputedStatsArray, Key, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.TrailblazerPreservation')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5

  const skillDamageReductionValue = skill(e, 0.50, 0.52)

  const basicAtkScaling = basic(e, 1.00, 1.10)
  const basicDefScaling = (e >= 1) ? 0.25 : 0
  const basicEnhancedAtkScaling = basic(e, 1.35, 1.463)
  const basicEnhancedDefScaling = (e >= 1) ? 0.50 : 0
  const skillScaling = skill(e, 0, 0)
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
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.DEF_P.buff((e >= 6) ? r.e6DefStacks * 0.10 : 0, Source.NONE)
      x.ATK_P.buff((r.shieldActive) ? 0.15 : 0, Source.NONE)

      // Scaling
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)

      // Boost
      // This EHP buff only applies to self
      x.DMG_RED_MULTI.multiply((r.skillActive) ? (1 - skillDamageReductionValue) : 1, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff((r.enhancedBasic) ? 60 : 30, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(60, Source.NONE)

      x.SHIELD_SCALING.buff(talentShieldScaling, Source.NONE)
      x.SHIELD_FLAT.buff(talentShieldFlat, Source.NONE)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // This EHP buff applies to all
      x.DMG_RED_MULTI.multiplyTeam((m.skillActive) ? (1 - 0.15) : 1, Source.NONE)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.enhancedBasic) {
        x.BASIC_DMG.buff(basicEnhancedAtkScaling * x.a[Key.ATK], Source.NONE)
        x.BASIC_DMG.buff(basicEnhancedDefScaling * x.a[Key.DEF], Source.NONE)
      } else {
        x.BASIC_DMG.buff(basicAtkScaling * x.a[Key.ATK], Source.NONE)
        x.BASIC_DMG.buff(basicDefScaling * x.a[Key.DEF], Source.NONE)
      }

      x.SKILL_DMG.buff(x.a[Key.SKILL_SCALING] * x.a[Key.ATK], Source.NONE)

      x.ULT_DMG.buff(ultAtkScaling * x.a[Key.ATK], Source.NONE)
      x.ULT_DMG.buff(ultDefScaling * x.a[Key.DEF], Source.NONE)

      standardDefShieldFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(r.enhancedBasic)}) {
  x.BASIC_DMG += ${basicEnhancedAtkScaling} * x.ATK;
  x.BASIC_DMG += ${basicEnhancedDefScaling} * x.DEF;
} else {
  x.BASIC_DMG += ${basicAtkScaling} * x.ATK;
  x.BASIC_DMG += ${basicDefScaling} * x.DEF;
}      

x.SKILL_DMG += x.SKILL_SCALING * x.ATK;

x.ULT_DMG += ${ultAtkScaling} * x.ATK;
x.ULT_DMG += ${ultDefScaling} * x.DEF;
` + gpuStandardDefShieldFinalizer()
    },
  }
}
