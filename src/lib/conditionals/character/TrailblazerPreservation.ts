import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  findContentId,
  gpuStandardDefShieldFinalizer,
  standardDefShieldFinalizer,
} from 'lib/conditionals/conditionalUtils'
import { Stats } from 'lib/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { TsUtils } from 'lib/TsUtils'
import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
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

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'enhancedBasic',
      text: t('Content.enhancedBasic.text'),
      content: t('Content.enhancedBasic.content', { basicEnhancedAtkScaling: TsUtils.precisionRound(100 * basicEnhancedAtkScaling) }),
    },
    {
      formItem: 'switch',
      id: 'skillActive',
      text: t('Content.skillActive.text'),
      content: t('Content.skillActive.content', { skillDamageReductionValue: TsUtils.precisionRound(100 * skillDamageReductionValue) }),
    },
    {
      formItem: 'switch',
      id: 'shieldActive',
      text: t('Content.shieldActive.text'),
      content: t('Content.shieldActive.content'),
    },
    {
      formItem: 'slider',
      id: 'e6DefStacks',
      text: t('Content.e6DefStacks.text'),
      content: t('Content.e6DefStacks.content'),
      min: 0,
      max: 3,
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'skillActive'),
  ]

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => ({
      enhancedBasic: true,
      skillActive: true,
      shieldActive: true,
      e6DefStacks: 3,
    }),
    teammateDefaults: () => ({
      skillActive: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      // Stats
      x[Stats.DEF_P] += (e >= 6) ? r.e6DefStacks * 0.10 : 0
      x[Stats.ATK_P] += (r.shieldActive) ? 0.15 : 0

      // Scaling
      x.SKILL_SCALING += skillScaling

      // Boost
      // This EHR buff only applies to self
      x.DMG_RED_MULTI *= (r.skillActive) ? (1 - skillDamageReductionValue) : 1

      x.BASIC_TOUGHNESS_DMG += (r.basicEnhanced) ? 60 : 30
      x.ULT_TOUGHNESS_DMG += 60

      x.SHIELD_SCALING += talentShieldScaling
      x.SHIELD_FLAT += talentShieldFlat

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      // This EHR buff applies to all
      x.DMG_RED_MULTI *= (m.skillActive) ? (1 - 0.15) : 1
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      if (r.enhancedBasic) {
        x.BASIC_DMG += basicEnhancedAtkScaling * x[Stats.ATK]
        x.BASIC_DMG += basicEnhancedDefScaling * x[Stats.DEF]
      } else {
        x.BASIC_DMG += basicAtkScaling * x[Stats.ATK]
        x.BASIC_DMG += basicDefScaling * x[Stats.DEF]
      }

      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]

      x.ULT_DMG += ultAtkScaling * x[Stats.ATK]
      x.ULT_DMG += ultDefScaling * x[Stats.DEF]

      standardDefShieldFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

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
