import { BREAK_TYPE, ComputedStatsObject, NONE_TYPE, SKILL_TYPE } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  findContentId,
  gpuStandardAtkFinalizer,
  gpuStandardFlatHealFinalizer,
  standardAtkFinalizer,
  standardFlatHealFinalizer,
} from 'lib/conditionals/conditionalUtils'
import { Stats } from 'lib/constants'
import { GallagherConversionConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { buffAbilityVulnerability } from 'lib/optimizer/calculateBuffs'
import { TsUtils } from 'lib/TsUtils'
import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Gallagher')
  const tHeal = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealAbility')
  const { basic, skill, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 2.50, 2.75)
  const ultScaling = basic(e, 1.50, 1.65)
  const talentBesottedScaling = talent(e, 0.12, 0.132)

  const skillHealFlat = skill(e, 1600, 1768)
  const talentHealFlat = talent(e, 640, 707.2)

  const content: ContentItem[] = [
    {
      formItem: 'select',
      id: 'healAbility',
      text: tHeal('Text'),
      content: tHeal('Content'),
      options: [
        { display: tHeal('Skill'), value: SKILL_TYPE, label: tHeal('Skill') },
        { display: tHeal('Talent'), value: NONE_TYPE, label: tHeal('Talent') },
      ],
      fullWidth: true,
    },
    {
      formItem: 'switch',
      id: 'basicEnhanced',
      text: t('Content.basicEnhanced.text'),
      content: t('Content.basicEnhanced.content'),
    },
    {
      formItem: 'switch',
      id: 'breakEffectToOhbBoost',
      text: t('Content.breakEffectToOhbBoost.text'),
      content: t('Content.breakEffectToOhbBoost.content'),
    },
    {
      formItem: 'switch',
      id: 'targetBesotted',
      text: t('Content.targetBesotted.text'),
      content: t('Content.targetBesotted.content', { talentBesottedScaling: TsUtils.precisionRound(100 * talentBesottedScaling) }),
    },
    {
      formItem: 'switch',
      id: 'e1ResBuff',
      text: t('Content.e1ResBuff.text'),
      content: t('Content.e1ResBuff.content'),
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e2ResBuff',
      text: t('Content.e2ResBuff.text'),
      content: t('Content.e2ResBuff.content'),
      disabled: e < 2,
    },
    {
      formItem: 'switch',
      id: 'e6BeBuff',
      text: t('Content.e6BeBuff.text'),
      content: t('Content.e6BeBuff.content'),
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'targetBesotted'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      healAbility: NONE_TYPE,
      basicEnhanced: true,
      breakEffectToOhbBoost: true,
      e1ResBuff: true,
      e2ResBuff: true,
      e6BeBuff: true,
      targetBesotted: true,
    }),
    teammateDefaults: () => ({
      targetBesotted: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      x[Stats.RES] += (e >= 1 && r.e1ResBuff) ? 0.50 : 0
      x[Stats.RES] += (e >= 2 && r.e2ResBuff) ? 0.30 : 0
      x[Stats.BE] += (e >= 6) ? 0.20 : 0

      x.BREAK_EFFICIENCY_BOOST += (e >= 6) ? 0.20 : 0

      x.BASIC_SCALING += (r.basicEnhanced) ? basicEnhancedScaling : basicScaling
      x.ULT_SCALING += ultScaling

      x.BASIC_TOUGHNESS_DMG += (r.basicEnhanced) ? 90 : 30
      x.ULT_TOUGHNESS_DMG += 60

      if (r.healAbility == SKILL_TYPE) {
        x.HEAL_TYPE = SKILL_TYPE
        x.HEAL_FLAT += skillHealFlat
      }
      if (r.healAbility == NONE_TYPE) {
        x.HEAL_TYPE = NONE_TYPE
        x.HEAL_FLAT += talentHealFlat
      }

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      buffAbilityVulnerability(x, BREAK_TYPE, talentBesottedScaling, (m.targetBesotted))
    },
    finalizeCalculations: (x: ComputedStatsObject) => {
      standardAtkFinalizer(x)
      standardFlatHealFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer() + gpuStandardFlatHealFinalizer(),
    dynamicConditionals: [GallagherConversionConditional],
  }
}
