import { ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { JiaoqiuConversionConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { buffAbilityVulnerability } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Jiaoqiu')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.50, 1.65)
  const ultScaling = ult(e, 1.00, 1.08)

  const ultVulnerabilityScaling = ult(e, 0.15, 0.162)

  const talentVulnerabilityBase = talent(e, 0.15, 0.165)
  const talentVulnerabilityScaling = talent(e, 0.05, 0.055)

  const talentDotScaling = talent(e, 1.80, 1.98)

  const maxAshenRoastStacks = e >= 6 ? 9 : 5

  const defaults = {
    ashenRoastStacks: maxAshenRoastStacks,
    ultFieldActive: true,
    ehrToAtkBoost: true,
    e1DmgBoost: true,
    e2Dot: true,
    e6ResShred: true,
  }

  const teammateDefaults = {
    ashenRoastStacks: maxAshenRoastStacks,
    ultFieldActive: true,
    e1DmgBoost: true,
    e6ResShred: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ashenRoastStacks: {
      id: 'ashenRoastStacks',
      formItem: 'slider',
      text: t('Content.ashenRoastStacks.text'),
      content: t('Content.ashenRoastStacks.content', {
        AshenRoastInitialVulnerability: TsUtils.precisionRound(100 * talentVulnerabilityBase),
        AshenRoastAdditionalVulnerability: TsUtils.precisionRound(100 * talentVulnerabilityScaling),
        AshenRoastDotMultiplier: TsUtils.precisionRound(100 * talentDotScaling),
      }),
      min: 0,
      max: maxAshenRoastStacks,
    },
    ultFieldActive: {
      id: 'ultFieldActive',
      formItem: 'switch',
      text: t('Content.ultFieldActive.text'),
      content: t('Content.ultFieldActive.content', {
        UltScaling: TsUtils.precisionRound(100 * ultScaling),
        UltVulnerability: TsUtils.precisionRound(100 * ultVulnerabilityScaling),
        ZoneDebuffChance: TsUtils.precisionRound(100 * ult(e, 0.6, 0.62)),
      }),
    },
    ehrToAtkBoost: {
      id: 'ehrToAtkBoost',
      formItem: 'switch',
      text: t('Content.ehrToAtkBoost.text'),
      content: t('Content.ehrToAtkBoost.content'),
    },
    e1DmgBoost: {
      id: 'e1DmgBoost',
      formItem: 'switch',
      text: t('Content.e1DmgBoost.text'),
      content: t('Content.e1DmgBoost.content'),
      disabled: e < 1,
    },
    e2Dot: {
      id: 'e2Dot',
      formItem: 'switch',
      text: t('Content.e2Dot.text'),
      content: t('Content.e2Dot.content'),
      disabled: e < 2,
    },
    e6ResShred: {
      id: 'e6ResShred',
      formItem: 'switch',
      text: t('Content.e6ResShred.text'),
      content: t('Content.e6ResShred.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    ashenRoastStacks: content.ashenRoastStacks,
    ultFieldActive: content.ultFieldActive,
    e1DmgBoost: content.e1DmgBoost,
    e6ResShred: content.e6ResShred,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.characterConditionals

      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)
      x.ULT_SCALING.buff(ultScaling, Source.NONE)
      x.DOT_SCALING.buff((r.ashenRoastStacks > 0) ? talentDotScaling : 0, Source.NONE)
      x.DOT_SCALING.buff((e >= 2 && r.e2Dot && r.ashenRoastStacks > 0) ? 3.00 : 0, Source.NONE)
      x.DOT_CHANCE.set(100, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.SKILL_TOUGHNESS_DMG.buff(60, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(60, Source.NONE)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m: Conditionals<typeof teammateContent> = action.characterConditionals

      buffAbilityVulnerability(x, ULT_TYPE, (m.ultFieldActive) ? ultVulnerabilityScaling : 0, Source.NONE)

      x.VULNERABILITY.buff((m.ashenRoastStacks > 0) ? talentVulnerabilityBase : 0, Source.NONE)
      x.VULNERABILITY.buff(Math.max(0, m.ashenRoastStacks - 1) * talentVulnerabilityScaling, Source.NONE)

      x.ELEMENTAL_DMG.buff((e >= 1 && m.e1DmgBoost && m.ashenRoastStacks > 0) ? 0.40 : 0, Source.NONE)

      x.RES_PEN.buff((e >= 6 && m.e6ResShred) ? m.ashenRoastStacks * 0.03 : 0, Source.NONE)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
    dynamicConditionals: [JiaoqiuConversionConditional],
  }
}
