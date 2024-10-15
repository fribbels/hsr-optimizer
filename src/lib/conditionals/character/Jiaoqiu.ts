import { ComputedStatsObject, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityVulnerability } from 'lib/optimizer/calculateBuffs'
import { JiaoqiuConversionConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { TsUtils } from 'lib/TsUtils'
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

  const content: ContentItem[] = [
    {
      formItem: 'slider',
      id: 'ashenRoastStacks',
      name: 'ashenRoastStacks',
      text: t('Content.ashenRoastStacks.text'),
      title: t('Content.ashenRoastStacks.title'),
      content: t('Content.ashenRoastStacks.content', { AshenRoastInitialVulnerability: TsUtils.precisionRound(100 * talentVulnerabilityBase), AshenRoastAdditionalVulnerability: TsUtils.precisionRound(100 * talentVulnerabilityScaling), AshenRoastDotMultiplier: TsUtils.precisionRound(100 * talentDotScaling) }),
      min: 0,
      max: maxAshenRoastStacks,
    },
    {
      formItem: 'switch',
      id: 'ultFieldActive',
      name: 'ultFieldActive',
      text: t('Content.ultFieldActive.text'),
      title: t('Content.ultFieldActive.title'),
      content: t('Content.ultFieldActive.content', { UltScaling: TsUtils.precisionRound(100 * ultScaling), UltVulnerability: TsUtils.precisionRound(100 * ultVulnerabilityScaling), ZoneDebuffChance: TsUtils.precisionRound(100 * ult(e, 0.6, 0.62)) }),
    },
    {
      formItem: 'switch',
      id: 'ehrToAtkBoost',
      name: 'ehrToAtkBoost',
      text: t('Content.ehrToAtkBoost.text'),
      title: t('Content.ehrToAtkBoost.title'),
      content: t('Content.ehrToAtkBoost.content'),
    },
    {
      formItem: 'switch',
      id: 'e1DmgBoost',
      name: 'e1DmgBoost',
      text: t('Content.e1DmgBoost.text'),
      title: t('Content.e1DmgBoost.title'),
      content: t('Content.e1DmgBoost.content'),
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e2Dot',
      name: 'e2Dot',
      text: t('Content.e2Dot.text'),
      title: t('Content.e2Dot.title'),
      content: t('Content.e2Dot.content'),
      disabled: e < 2,
    },
    {
      formItem: 'switch',
      id: 'e6ResShred',
      name: 'e6ResShred',
      text: t('Content.e6ResShred.text'),
      title: t('Content.e6ResShred.title'),
      content: t('Content.e6ResShred.content'),
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'ashenRoastStacks'),
    findContentId(content, 'ultFieldActive'),
    findContentId(content, 'e1DmgBoost'),
    findContentId(content, 'e6ResShred'),
  ]

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

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => (defaults),
    teammateDefaults: () => (teammateDefaults),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.DOT_SCALING += (r.ashenRoastStacks > 0) ? talentDotScaling : 0
      x.DOT_SCALING += (e >= 2 && r.e2Dot && r.ashenRoastStacks > 0) ? 3.00 : 0
      x.DOT_CHANCE = 100

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 60

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      buffAbilityVulnerability(x, ULT_TYPE, ultVulnerabilityScaling, (m.ultFieldActive))

      x.VULNERABILITY += (m.ashenRoastStacks > 0) ? talentVulnerabilityBase : 0
      x.VULNERABILITY += Math.max(0, m.ashenRoastStacks - 1) * talentVulnerabilityScaling

      x.ELEMENTAL_DMG += (e >= 1 && m.e1DmgBoost && m.ashenRoastStacks > 0) ? 0.40 : 0

      x.RES_PEN += (e >= 6 && m.e6ResShred) ? m.ashenRoastStacks * 0.03 : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
    dynamicConditionals: [JiaoqiuConversionConditional],
  }
}
