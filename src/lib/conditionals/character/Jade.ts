import { ASHBLAZING_ATK_STACK, ComputedStatsObject, FUA_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { NumberToNumberMap } from 'types/Common'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (e: Eidolon, withoutContent: boolean): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5

  const basicScaling = basic(e, 0.90, 0.99)
  const skillScaling = skill(e, 0.25, 0.27)
  const ultScaling = ult(e, 2.40, 2.64)
  const ultFuaScalingBuff = ult(e, 0.80, 0.88)
  const fuaScaling = talent(e, 1.20, 1.32)
  const pawnedAssetCdScaling = talent(e, 0.024, 0.0264)

  const unenhancedHitMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.25 + 2 * 0.25 + 3 * 0.25 + 4 * 0.25), // 0.15
    3: ASHBLAZING_ATK_STACK * (2 * 0.25 + 5 * 0.25 + 8 * 0.25 + 8 * 0.25), // 0.345
    5: ASHBLAZING_ATK_STACK * (3 * 0.25 + 8 * 0.25 + 8 * 0.25 + 8 * 0.25), // 0.405
  }

  const enhancedHitMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.10 + 2 * 0.10 + 3 * 0.10 + 4 * 0.10 + 5 * 0.60), // 0.24
    3: ASHBLAZING_ATK_STACK * (2 * 0.10 + 5 * 0.10 + 8 * 0.10 + 8 * 0.10 + 8 * 0.60), // 0.426
    5: ASHBLAZING_ATK_STACK * (3 * 0.10 + 8 * 0.10 + 8 * 0.10 + 8 * 0.10 + 8 * 0.60), // 0.45
  }

  function getHitMulti(request: Form) {
    const r = request.characterConditionals
    return r.enhancedFollowUp
      ? enhancedHitMultiByTargets[request.enemyCount]
      : unenhancedHitMultiByTargets[request.enemyCount]
  }

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Characters.Jade.Content')
    return [
      {
        formItem: 'switch',
        id: 'enhancedFollowUp',
        name: 'enhancedFollowUp',
        text: t('enhancedFollowUp.text'),
        title: t('enhancedFollowUp.title'),
        content: t('enhancedFollowUp.content', { ultFuaScalingBuff: TsUtils.precisionRound(100 * ultFuaScalingBuff) }),
      },
      {
        formItem: 'slider',
        id: 'pawnedAssetStacks',
        name: 'pawnedAssetStacks',
        text: t('pawnedAssetStacks.text'),
        title: t('pawnedAssetStacks.title'),
        content: t('pawnedAssetStacks.content', { pawnedAssetCdScaling: TsUtils.precisionRound(100 * pawnedAssetCdScaling) }),
        min: 0,
        max: 50,
      },
      {
        formItem: 'switch',
        id: 'e1FuaDmgBoost',
        name: 'e1FuaDmgBoost',
        text: t('e1FuaDmgBoost.text'),
        title: t('e1FuaDmgBoost.title'),
        content: t('e1FuaDmgBoost.content'),
        disabled: e < 1,
      },
      {

        formItem: 'switch',
        id: 'e2CrBuff',
        name: 'e2CrBuff',
        text: t('e2CrBuff.text'),
        title: t('e2CrBuff.title'),
        content: t('e2CrBuff.content'),
        disabled: e < 2,
      },
      {

        formItem: 'switch',
        id: 'e4DefShredBuff',
        name: 'e4DefShredBuff',
        text: t('e4DefShredBuff.text'),
        title: t('e4DefShredBuff.title'),
        content: t('e4DefShredBuff.content'),
        disabled: e < 4,
      },
      {
        formItem: 'switch',
        id: 'e6ResShredBuff',
        name: 'e6ResShredBuff',
        text: t('e6ResShredBuff.text'),
        title: t('e6ResShredBuff.title'),
        content: t('e6ResShredBuff.content'),
        disabled: e < 6,
      },
    ]
  })()

  const teammateContent: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Characters.Jade.TeammateContent')
    return [
      {
        formItem: 'switch',
        id: 'debtCollectorSpdBuff',
        name: 'debtCollectorSpdBuff',
        text: t('debtCollectorSpdBuff.text'),
        title: t('debtCollectorSpdBuff.title'),
        content: t('debtCollectorSpdBuff.content'),
      },
    ]
  })()

  const defaults = {
    enhancedFollowUp: true,
    pawnedAssetStacks: 50,
    e1FuaDmgBoost: true,
    e2CrBuff: true,
    e4DefShredBuff: true,
    e6ResShredBuff: true,
  }

  const teammateDefaults = {
    debtCollectorSpdBuff: true,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => (defaults),
    teammateDefaults: () => (teammateDefaults),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      x[Stats.CD] += r.pawnedAssetStacks * pawnedAssetCdScaling
      x[Stats.ATK_P] += r.pawnedAssetStacks * 0.005
      x[Stats.CR] += (e >= 2 && r.e2CrBuff && r.pawnedAssetStacks >= 15) ? 0.18 : 0

      x.BASIC_SCALING += basicScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling
      x.FUA_SCALING += (r.enhancedFollowUp) ? ultFuaScalingBuff : 0

      buffAbilityDmg(x, FUA_TYPE, 0.32, (e >= 1 && r.e1FuaDmgBoost))
      x.DEF_PEN += (e >= 4 && r.e4DefShredBuff) ? 0.12 : 0
      x.QUANTUM_RES_PEN += (e >= 6 && r.e6ResShredBuff) ? 0.20 : 0

      x.BASIC_TOUGHNESS_DMG += 30
      x.ULT_TOUGHNESS_DMG += 60
      x.FUA_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.characterConditionals

      x[Stats.SPD] += (t.debtCollectorSpdBuff) ? 30 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject, request: Form) => {
      standardFuaAtkFinalizer(x, request, getHitMulti(request))
    },
    gpuFinalizeCalculations: (request: Form) => {
      return gpuStandardFuaAtkFinalizer(getHitMulti(request))
    },
  }
}
