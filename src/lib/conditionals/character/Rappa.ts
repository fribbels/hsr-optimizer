import { AbilityEidolon, Conditionals, ContentDefinition, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { RappaConversionConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
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

  const teammateDefaults = {
    teammateBreakVulnerability: 0.10,
    e4SpdBuff: true,
  }

  const defaults = {
    sealformActive: true,
    atkToBreakVulnerability: true,
    chargeStacks: e >= 6 ? 10 : 5,
    e1DefPen: true,
    e2Buffs: true,
    e4SpdBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    sealformActive: {
      id: 'sealformActive',
      formItem: 'switch',
      text: t('Content.sealformActive.text'),
      content: t('Content.sealformActive.content', { ultBeBuff: TsUtils.precisionRound(100 * ultBeBuff) }),
    },
    atkToBreakVulnerability: {
      id: 'atkToBreakVulnerability',
      formItem: 'switch',
      text: t('Content.atkToBreakVulnerability.text'),
      content: t('Content.atkToBreakVulnerability.content'),
    },
    chargeStacks: {
      id: 'chargeStacks',
      formItem: 'slider',
      text: t('Content.chargeStacks.text'),
      content: t('Content.chargeStacks.content', { talentChargeMultiplier: TsUtils.precisionRound(100 * talentChargeMultiplier) }),
      min: 0,
      max: maxChargeStacks,
    },
    e1DefPen: {
      id: 'e1DefPen',
      formItem: 'switch',
      text: t('Content.e1DefPen.text'),
      content: t('Content.e1DefPen.content'),
      disabled: e < 1,
    },
    e2Buffs: {
      id: 'e2Buffs',
      formItem: 'switch',
      text: t('Content.e2Buffs.text'),
      content: t('Content.e2Buffs.content'),
      disabled: e < 2,
    },
    e4SpdBuff: {
      id: 'e4SpdBuff',
      formItem: 'switch',
      text: t('Content.e4SpdBuff.text'),
      content: t('Content.e4SpdBuff.content'),
      disabled: e < 4,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    teammateBreakVulnerability: {
      id: 'teammateBreakVulnerability',
      formItem: 'slider',
      text: t('TeammateContent.teammateBreakVulnerability.text'),
      content: t('TeammateContent.teammateBreakVulnerability.content'),
      min: 0,
      max: 0.10,
      percent: true,
    },
    e4SpdBuff: {
      id: 'e4SpdBuff',
      formItem: 'switch',
      text: t('TeammateContent.e4SpdBuff.text'),
      content: t('TeammateContent.e4SpdBuff.content'),
      disabled: e < 4,
    },
  }
  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.characterConditionals

      if (r.sealformActive) {
        x.ENEMY_WEAKNESS_BROKEN.set(1, Source.NONE)
      }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.characterConditionals

      x.BE.buff((r.sealformActive) ? ultBeBuff : 0, Source.NONE)
      x.BREAK_EFFICIENCY_BOOST.buff((r.sealformActive) ? 0.50 : 0, Source.NONE)

      x.DEF_PEN.buff((e >= 1 && r.sealformActive && r.e1DefPen) ? 0.15 : 0, Source.NONE)

      x.SPD_P.buff((e >= 4 && r.sealformActive && r.e4SpdBuff) ? 0.12 : 0, Source.NONE)

      x.BASIC_SUPER_BREAK_MODIFIER.buff((r.sealformActive) ? 0.60 : 0, Source.NONE)

      x.BASIC_BREAK_DMG_MODIFIER.set(talentBreakDmgModifier + r.chargeStacks * talentChargeMultiplier, Source.NONE)

      x.BASIC_SCALING.buff((r.sealformActive) ? basicEnhancedScaling : basicScaling, Source.NONE)
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff((r.sealformActive) ? 75 + (2 + r.chargeStacks) * 3 : 30, Source.NONE)
      x.SKILL_TOUGHNESS_DMG.buff(30, Source.NONE)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t: Conditionals<typeof teammateContent> = action.characterConditionals

      x.BREAK_VULNERABILITY.buff(t.teammateBreakVulnerability, Source.NONE)

      x.SPD_P.buff((e >= 4 && t.e4SpdBuff) ? 0.12 : 0, Source.NONE)
    },
    finalizeCalculations: (x: ComputedStatsArray) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
    dynamicConditionals: [RappaConversionConditional],
  }
}
