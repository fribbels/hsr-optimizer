import { AbilityEidolon, Conditionals, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { Stats } from 'lib/constants'
import { RappaConversionConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { ComputedStatsArray } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Rappa')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 2.00, 2.32)

  const skillScaling = skill(e, 1.20, 1.32)

  const ultBeBuff = ult(e, 0.30, 0.34)

  const talentBreakDmgModifier = talent(e, 0.60, 0.66)
  const talentChargeMultiplier = talent(e, 0.50, 0.55)

  const maxChargeStacks = e >= 6 ? 15 : 10

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'sealformActive',
      text: t('Content.sealformActive.text'),
      content: t('Content.sealformActive.content', { ultBeBuff: TsUtils.precisionRound(100 * ultBeBuff) }),
    },
    {
      formItem: 'switch',
      id: 'atkToBreakVulnerability',
      text: t('Content.atkToBreakVulnerability.text'),
      content: t('Content.atkToBreakVulnerability.content'),
    },
    {
      id: 'chargeStacks',
      formItem: 'slider',
      text: t('Content.chargeStacks.text'),
      content: t('Content.chargeStacks.content', { talentChargeMultiplier: TsUtils.precisionRound(100 * talentChargeMultiplier) }),
      min: 0,
      max: maxChargeStacks,
    },
    {
      formItem: 'switch',
      id: 'e1DefPen',
      text: t('Content.e1DefPen.text'),
      content: t('Content.e1DefPen.content'),
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e2Buffs',
      text: t('Content.e2Buffs.text'),
      content: t('Content.e2Buffs.content'),
      disabled: e < 2,
    },
    {
      formItem: 'switch',
      id: 'e4SpdBuff',
      text: t('Content.e4SpdBuff.text'),
      content: t('Content.e4SpdBuff.content'),
      disabled: e < 4,
    },
  ]

  const teammateContent: ContentItem[] = [
    {
      formItem: 'slider',
      id: 'teammateBreakVulnerability',
      text: t('TeammateContent.teammateBreakVulnerability.text'),
      content: t('TeammateContent.teammateBreakVulnerability.content'),
      min: 0,
      max: 0.10,
      percent: true,
    },
    {
      formItem: 'switch',
      id: 'e4SpdBuff',
      text: t('TeammateContent.e4SpdBuff.text'),
      content: t('TeammateContent.e4SpdBuff.content'),
      disabled: e < 4,
    },
  ]

  const defaults = {
    sealformActive: true,
    atkToBreakVulnerability: true,
    chargeStacks: e >= 6 ? 10 : 5,
    e1DefPen: true,
    e2Buffs: true,
    e4SpdBuff: true,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => (defaults),
    teammateDefaults: () => ({
      teammateBreakVulnerability: 0.10,
      e4SpdBuff: true,
    }),
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.characterConditionals

      if (r.sealformActive) {
        x.ENEMY_WEAKNESS_BROKEN = 1
      }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.characterConditionals

      x[Stats.BE] += (r.sealformActive) ? ultBeBuff : 0
      x.BREAK_EFFICIENCY_BOOST += (r.sealformActive) ? 0.50 : 0

      x.DEF_PEN += (e >= 1 && r.sealformActive && r.e1DefPen) ? 0.15 : 0

      x[Stats.SPD_P] += (e >= 4 && r.sealformActive && r.e4SpdBuff) ? 0.12 : 0

      x.BASIC_SUPER_BREAK_MODIFIER += (r.sealformActive) ? 0.60 : 0

      x.BASIC_BREAK_DMG_MODIFIER = talentBreakDmgModifier + r.chargeStacks * talentChargeMultiplier

      x.BASIC_SCALING += (r.sealformActive) ? basicEnhancedScaling : basicScaling
      x.SKILL_SCALING += skillScaling

      x.BASIC_TOUGHNESS_DMG += (r.sealformActive) ? 75 + (2 + r.chargeStacks) * 3 : 30
      x.SKILL_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t: Conditionals<typeof teammateContent> = action.characterConditionals

      x.BREAK_VULNERABILITY += t.teammateBreakVulnerability

      x[Stats.SPD_P] += (e >= 4 && t.e4SpdBuff) ? 0.12 : 0
    },
    finalizeCalculations: (x: ComputedStatsArray) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
    dynamicConditionals: [RappaConversionConditional],
  }
}
