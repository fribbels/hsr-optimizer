import { ASHBLAZING_ATK_STACK, BASIC_TYPE, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { buffAbilityCd, buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (e: Eidolon, withoutContent: boolean): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 0.80, 0.88)
  const basicExtraScalingMasterBuff = basic(e, 0.20, 0.22)
  const ultScaling = ult(e, 2.40, 2.592)
  const talentDmgBuff = talent(e, 0.80, 0.88)
  const skillSpdScaling = skill(e, 0.10, 0.108)

  // 0.06
  const fuaHitCountMulti = ASHBLAZING_ATK_STACK * (1 * 0.40 + 2 * 0.60)

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Characters.March7thImaginary.Content')
    return [
      {
        formItem: 'switch',
        id: 'enhancedBasic',
        name: 'enhancedBasic',
        text: t('enhancedBasic.text'),
        title: t('enhancedBasic.title'),
        content: t('enhancedBasic.content', { BasicEnhancedScaling: TsUtils.precisionRound(100 * basicEnhancedScaling) }),
      },
      {
        formItem: 'slider',
        id: 'basicAttackHits',
        name: 'basicAttackHits',
        text: t('basicAttackHits.text'),
        title: t('basicAttackHits.title'),
        content: t('basicAttackHits.content', { BasicEnhancedScaling: TsUtils.precisionRound(100 * basicEnhancedScaling) }),
        min: 3,
        max: 6,
      },
      {
        formItem: 'switch',
        id: 'masterAdditionalDmgBuff',
        name: 'masterAdditionalDmgBuff',
        text: t('masterAdditionalDmgBuff.text'),
        title: t('masterAdditionalDmgBuff.title'),
        content: t('masterAdditionalDmgBuff.content', { ShifuDmgBuff: TsUtils.precisionRound(100 * basicExtraScalingMasterBuff) }),
      },
      {
        formItem: 'switch',
        id: 'masterToughnessRedBuff',
        name: 'masterToughnessRedBuff',
        text: t('masterToughnessRedBuff.text'),
        title: t('masterToughnessRedBuff.title'),
        content: t('masterToughnessRedBuff.content'),
      },
      {
        formItem: 'switch',
        id: 'talentDmgBuff',
        name: 'talentDmgBuff',
        text: t('talentDmgBuff.text'),
        title: t('talentDmgBuff.title'),
        content: t('talentDmgBuff.content', { TalentDmgBuff: TsUtils.precisionRound(100 * talentDmgBuff) }),
      },
      {
        formItem: 'switch',
        id: 'selfSpdBuff',
        name: 'selfSpdBuff',
        text: t('selfSpdBuff.text'),
        title: t('selfSpdBuff.title'),
        content: t('selfSpdBuff.content'),
        disabled: e < 1,
      },
      {
        formItem: 'switch',
        id: 'e6CdBuff',
        name: 'e6CdBuff',
        text: t('e6CdBuff.text'),
        title: t('e6CdBuff.title'),
        content: t('e6CdBuff.content'),
        disabled: e < 6,
      },
    ]
  })()

  const teammateContent: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Characters.March7thImaginary.TeammateContent')
    return [
      {
        formItem: 'switch',
        id: 'masterBuff',
        name: 'masterBuff',
        text: t('masterBuff.text'),
        title: t('masterBuff.title'),
        content: t('masterBuff.content', { ShifuSpeedBuff: TsUtils.precisionRound(100 * skillSpdScaling) }),
      },
      {
        formItem: 'switch',
        id: 'masterCdBeBuffs',
        name: 'masterCdBeBuffs',
        text: t('masterCdBeBuffs.text'),
        title: t('masterCdBeBuffs.title'),
        content: t('masterCdBeBuffs.content'),
      },
    ]
  })()

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
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

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
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.characterConditionals

      x[Stats.SPD_P] += (t.masterBuff) ? skillSpdScaling : 0

      x[Stats.CD] += (t.masterBuff && t.masterCdBeBuffs) ? 0.60 : 0
      x[Stats.BE] += (t.masterBuff && t.masterCdBeBuffs) ? 0.36 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject, request: Form) => {
      standardFuaAtkFinalizer(x, request, fuaHitCountMulti)
    },
    gpuFinalizeCalculations: (request: Form) => {
      return gpuStandardFuaAtkFinalizer(fuaHitCountMulti)
    },
  }
}
