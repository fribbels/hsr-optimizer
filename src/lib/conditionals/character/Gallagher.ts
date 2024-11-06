import { BREAK_TYPE, NONE_TYPE, SKILL_TYPE } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  gpuStandardAtkFinalizer,
  gpuStandardFlatHealFinalizer,
  standardAtkFinalizer,
  standardFlatHealFinalizer,
} from 'lib/conditionals/conditionalUtils'
import { GallagherConversionConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { buffAbilityVulnerability } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
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

  const defaults = {
    healAbility: NONE_TYPE,
    basicEnhanced: true,
    breakEffectToOhbBoost: true,
    e1ResBuff: true,
    e2ResBuff: true,
    e6BeBuff: true,
    targetBesotted: true,
  }

  const teammateDefaults = {
    targetBesotted: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    healAbility: {
      id: 'healAbility',
      formItem: 'select',
      text: tHeal('Text'),
      content: tHeal('Content'),
      options: [
        { display: tHeal('Skill'), value: SKILL_TYPE, label: tHeal('Skill') },
        { display: tHeal('Talent'), value: NONE_TYPE, label: tHeal('Talent') },
      ],
      fullWidth: true,
    },
    basicEnhanced: {
      id: 'basicEnhanced',
      formItem: 'switch',
      text: t('Content.basicEnhanced.text'),
      content: t('Content.basicEnhanced.content'),
    },
    breakEffectToOhbBoost: {
      id: 'breakEffectToOhbBoost',
      formItem: 'switch',
      text: t('Content.breakEffectToOhbBoost.text'),
      content: t('Content.breakEffectToOhbBoost.content'),
    },
    targetBesotted: {
      id: 'targetBesotted',
      formItem: 'switch',
      text: t('Content.targetBesotted.text'),
      content: t('Content.targetBesotted.content', { talentBesottedScaling: TsUtils.precisionRound(100 * talentBesottedScaling) }),
    },
    e1ResBuff: {
      id: 'e1ResBuff',
      formItem: 'switch',
      text: t('Content.e1ResBuff.text'),
      content: t('Content.e1ResBuff.content'),
      disabled: e < 1,
    },
    e2ResBuff: {
      id: 'e2ResBuff',
      formItem: 'switch',
      text: t('Content.e2ResBuff.text'),
      content: t('Content.e2ResBuff.content'),
      disabled: e < 2,
    },
    e6BeBuff: {
      id: 'e6BeBuff',
      formItem: 'switch',
      text: t('Content.e6BeBuff.text'),
      content: t('Content.e6BeBuff.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    targetBesotted: content.targetBesotted,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.characterConditionals

      x.RES.buff((e >= 1 && r.e1ResBuff) ? 0.50 : 0, Source.NONE)
      x.RES.buff((e >= 2 && r.e2ResBuff) ? 0.30 : 0, Source.NONE)
      x.BE.buff((e >= 6) ? 0.20 : 0, Source.NONE)

      x.BREAK_EFFICIENCY_BOOST.buff((e >= 6) ? 0.20 : 0, Source.NONE)

      x.BASIC_SCALING.buff((r.basicEnhanced) ? basicEnhancedScaling : basicScaling, Source.NONE)
      x.ULT_SCALING.buff(ultScaling, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff((r.basicEnhanced) ? 90 : 30, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(60, Source.NONE)

      if (r.healAbility == SKILL_TYPE) {
        x.HEAL_TYPE.set(SKILL_TYPE, Source.NONE)
        x.HEAL_FLAT.buff(skillHealFlat, Source.NONE)
      }
      if (r.healAbility == NONE_TYPE) {
        x.HEAL_TYPE.set(NONE_TYPE, Source.NONE)
        x.HEAL_FLAT.buff(talentHealFlat, Source.NONE)
      }

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m: Conditionals<typeof teammateContent> = action.characterConditionals

      buffAbilityVulnerability(x, BREAK_TYPE, (m.targetBesotted) ? talentBesottedScaling : 0, Source.NONE)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
      standardAtkFinalizer(x)
      standardFlatHealFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer() + gpuStandardFlatHealFinalizer(),
    dynamicConditionals: [GallagherConversionConditional],
  }
}
