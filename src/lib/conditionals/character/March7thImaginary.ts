import { ASHBLAZING_ATK_STACK, BASIC_TYPE, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { buffAbilityCd, buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.March7thImaginary')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 0.80, 0.88)
  const basicExtraScalingMasterBuff = basic(e, 0.20, 0.22)
  const ultScaling = ult(e, 2.40, 2.592)
  const talentDmgBuff = talent(e, 0.80, 0.88)
  const skillSpdScaling = skill(e, 0.10, 0.108)

  // 0.06
  const fuaHitCountMulti = ASHBLAZING_ATK_STACK * (1 * 0.40 + 2 * 0.60)

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'enhancedBasic',
      name: 'enhancedBasic',
      text: t('Content.enhancedBasic.text'),
      title: t('Content.enhancedBasic.title'),
      content: t('Content.enhancedBasic.content', { BasicEnhancedScaling: TsUtils.precisionRound(100 * basicEnhancedScaling) }),
    },
    {
      formItem: 'slider',
      id: 'basicAttackHits',
      name: 'basicAttackHits',
      text: t('Content.basicAttackHits.text'),
      title: t('Content.basicAttackHits.title'),
      content: t('Content.basicAttackHits.content', { BasicEnhancedScaling: TsUtils.precisionRound(100 * basicEnhancedScaling) }),
      min: 3,
      max: 6,
    },
    {
      formItem: 'switch',
      id: 'masterAdditionalDmgBuff',
      name: 'masterAdditionalDmgBuff',
      text: t('Content.masterAdditionalDmgBuff.text'),
      title: t('Content.masterAdditionalDmgBuff.title'),
      content: t('Content.masterAdditionalDmgBuff.content', { ShifuDmgBuff: TsUtils.precisionRound(100 * basicExtraScalingMasterBuff) }),
    },
    {
      formItem: 'switch',
      id: 'masterToughnessRedBuff',
      name: 'masterToughnessRedBuff',
      text: t('Content.masterToughnessRedBuff.text'),
      title: t('Content.masterToughnessRedBuff.title'),
      content: t('Content.masterToughnessRedBuff.content'),
    },
    {
      formItem: 'switch',
      id: 'talentDmgBuff',
      name: 'talentDmgBuff',
      text: t('Content.talentDmgBuff.text'),
      title: t('Content.talentDmgBuff.title'),
      content: t('Content.talentDmgBuff.content', { TalentDmgBuff: TsUtils.precisionRound(100 * talentDmgBuff) }),
    },
    {
      formItem: 'switch',
      id: 'selfSpdBuff',
      name: 'selfSpdBuff',
      text: t('Content.selfSpdBuff.text'),
      title: t('Content.selfSpdBuff.title'),
      content: t('Content.selfSpdBuff.content'),
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e6CdBuff',
      name: 'e6CdBuff',
      text: t('Content.e6CdBuff.text'),
      title: t('Content.e6CdBuff.title'),
      content: t('Content.e6CdBuff.content'),
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'masterBuff',
      name: 'masterBuff',
      text: t('TeammateContent.masterBuff.text'),
      title: t('TeammateContent.masterBuff.title'),
      content: t('TeammateContent.masterBuff.content', { ShifuSpeedBuff: TsUtils.precisionRound(100 * skillSpdScaling) }),
    },
    {
      formItem: 'switch',
      id: 'masterCdBeBuffs',
      name: 'masterCdBeBuffs',
      text: t('TeammateContent.masterCdBeBuffs.text'),
      title: t('TeammateContent.masterCdBeBuffs.title'),
      content: t('TeammateContent.masterCdBeBuffs.content'),
    },
  ]

  const defaults = {
    enhancedBasic: true,
    basicAttackHits: 6,
    talentDmgBuff: true,
    selfSpdBuff: true,
    masterAdditionalDmgBuff: true,
    masterToughnessRedBuff: true,
    e6CdBuff: true,
  }

  const teammateDefaults = {
    masterBuff: true,
    masterCdBeBuffs: true,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => (defaults),
    teammateDefaults: () => (teammateDefaults),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      x[Stats.SPD_P] += (e >= 1 && r.selfSpdBuff) ? 0.10 : 0
      buffAbilityDmg(x, BASIC_TYPE, talentDmgBuff, (r.talentDmgBuff))

      buffAbilityCd(x, BASIC_TYPE, 0.50, (e >= 6 && r.e6CdBuff && r.enhancedBasic))

      const additionalMasterBuffScaling = (r.masterAdditionalDmgBuff) ? basicExtraScalingMasterBuff * r.basicAttackHits : 0
      x.BASIC_SCALING += (r.enhancedBasic) ? basicEnhancedScaling * r.basicAttackHits : basicScaling
      x.BASIC_SCALING += (r.enhancedBasic) ? additionalMasterBuffScaling : basicExtraScalingMasterBuff
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += (e >= 2) ? 0.60 : 0

      const toughnessDmgBoost = (r.masterToughnessRedBuff) ? 2.0 : 1.0
      x.BASIC_TOUGHNESS_DMG += toughnessDmgBoost * ((r.enhancedBasic) ? 15 * r.basicAttackHits : 30)
      x.ULT_TOUGHNESS_DMG += 90
      x.FUA_TOUGHNESS_DMG += (e >= 2) ? 30 : 0

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals

      x[Stats.SPD_P] += (t.masterBuff) ? skillSpdScaling : 0

      x[Stats.CD] += (t.masterBuff && t.masterCdBeBuffs) ? 0.60 : 0
      x[Stats.BE] += (t.masterBuff && t.masterCdBeBuffs) ? 0.36 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      standardFuaAtkFinalizer(x, action, context, fuaHitCountMulti)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardFuaAtkFinalizer(fuaHitCountMulti)
    },
  }
}
