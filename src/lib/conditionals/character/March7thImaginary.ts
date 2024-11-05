import { ASHBLAZING_ATK_STACK, BASIC_TYPE, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { Stats } from 'lib/constants'
import { buffAbilityCd, buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { TsUtils } from 'lib/TsUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
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
      text: t('Content.enhancedBasic.text'),
      content: t('Content.enhancedBasic.content', { BasicEnhancedScaling: TsUtils.precisionRound(100 * basicEnhancedScaling) }),
    },
    {
      formItem: 'slider',
      id: 'basicAttackHits',
      text: t('Content.basicAttackHits.text'),
      content: t('Content.basicAttackHits.content', { BasicEnhancedScaling: TsUtils.precisionRound(100 * basicEnhancedScaling) }),
      min: 3,
      max: 6,
    },
    {
      formItem: 'switch',
      id: 'masterAdditionalDmgBuff',
      text: t('Content.masterAdditionalDmgBuff.text'),
      content: t('Content.masterAdditionalDmgBuff.content', { ShifuDmgBuff: TsUtils.precisionRound(100 * basicExtraScalingMasterBuff) }),
    },
    {
      formItem: 'switch',
      id: 'masterToughnessRedBuff',
      text: t('Content.masterToughnessRedBuff.text'),
      content: t('Content.masterToughnessRedBuff.content'),
    },
    {
      formItem: 'switch',
      id: 'talentDmgBuff',
      text: t('Content.talentDmgBuff.text'),
      content: t('Content.talentDmgBuff.content', { TalentDmgBuff: TsUtils.precisionRound(100 * talentDmgBuff) }),
    },
    {
      formItem: 'switch',
      id: 'selfSpdBuff',
      text: t('Content.selfSpdBuff.text'),
      content: t('Content.selfSpdBuff.content'),
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e6CdBuff',
      text: t('Content.e6CdBuff.text'),
      content: t('Content.e6CdBuff.content'),
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'masterBuff',
      text: t('TeammateContent.masterBuff.text'),
      content: t('TeammateContent.masterBuff.content', { ShifuSpeedBuff: TsUtils.precisionRound(100 * skillSpdScaling) }),
    },
    {
      formItem: 'switch',
      id: 'masterCdBeBuffs',
      text: t('TeammateContent.masterCdBeBuffs.text'),
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
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => (defaults),
    teammateDefaults: () => (teammateDefaults),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.characterConditionals

      x[Stats.SPD_P] += (e >= 1 && r.selfSpdBuff) ? 0.10 : 0
      buffAbilityDmg(x, BASIC_TYPE, talentDmgBuff, (r.talentDmgBuff))

      buffAbilityCd(x, BASIC_TYPE, 0.50, (e >= 6 && r.e6CdBuff && r.enhancedBasic))

      const additionalMasterBuffScaling = (r.masterAdditionalDmgBuff)
        ? basicExtraScalingMasterBuff * r.basicAttackHits
        : 0
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
      const t: Conditionals<typeof teammateContent> = action.characterConditionals

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
